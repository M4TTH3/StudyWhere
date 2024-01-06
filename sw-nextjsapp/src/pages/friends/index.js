import NavBar from 'comp/navbar';
import { useIsAuthenticated } from '@azure/msal-react';
import { FriendsList, AddFriend } from 'comp/friendlist'
import { useSelector, useDispatch } from 'react-redux';
import { setFriendLists } from "@/reducers/friendSlice"
import { ReloadIcon } from 'comp/uifeatures'
import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { useSWAPI } from 'comp/fetchToken';

export const PopupContext = createContext();

const FriendsContext = createContext(null);

const FriendsContextProvider = ({ children }) => {
    const { callSWAPI: callSWFriendAPI, apiCallContent, isLoading } = useSWAPI();
    const allFriendLists = useSelector(state => state.friendLists) // The reducer state of all friend lists
    const [popup, setPopup] = useState(null); // Stores any popup components
    const [mode, setMode] = useState('friendsMode'); // mode: 'friendsMode' 'requestsMode' 'sentRequestsMode'

    const dispatch = useDispatch();
    useEffect(() => {
        if (apiCallContent) dispatch(setFriendLists(apiCallContent));
    }, [apiCallContent, dispatch])

    return (
        <FriendsContext.Provider value={{ callSWFriendAPI, isLoading, popup, setPopup, mode, setMode, allFriendLists }}>
            {children}
        </FriendsContext.Provider>
    )
}

export const useFriendsContext = () => {
    const friendProps = useContext(FriendsContext);
    if (!friendProps) throw new Error('Item not wrapped in friend context');

    return friendProps;
}

// The friends container
function FriendsContainer() {
    const modeButtonCSS = 'w-full h-full outline rounded text-center overflow-hidden hover:drop-shadow-xl flex items-center justify-center'

    const { popup, setPopup, callSWFriendAPI, mode, setMode, isLoading, allFriendLists } = useFriendsContext()

    const [friendList, setFriendList] = useState(null)

    const updateFriends = useCallback((updateLoading=false) => {
        callSWFriendAPI('GET', 'me/friends', {}, updateLoading).catch((err) => {
            console.log(err)
        })
    }, [callSWFriendAPI])

    // Updates the css for the mode panel
    // Sets the friend list depending on the mode
    const modeClicked = (buttonName = mode) => {
        setMode(buttonName)

        const modes = ['friendsMode', 'requestsMode', 'sentRequestsMode']
        modes.forEach(name => {
            const doc = document.getElementById(name)
            doc.className = doc.className.replace(' outline-lime-600 text-lime-600', '')
        })

        document.getElementById(buttonName).className += ' outline-lime-600 text-lime-600'


        if (buttonName === 'friendsMode') setFriendList(allFriendLists?.friends);
        else if (buttonName === 'requestsMode') setFriendList(allFriendLists?.friends_in);
        else if (buttonName === 'sentRequestsMode') setFriendList(allFriendLists?.friends_out);
    }

    // Loop the friend list 
    useEffect(() => {
        modeClicked()
        if (!allFriendLists) updateFriends(true);

        const timer = setTimeout(() => updateFriends(), 20000); // Refresh the list
        return () => clearTimeout(timer);
        
    }, [allFriendLists, updateFriends])

    return (
            <div id='FriendContainer'>
                <div id="modePanel" className="relative mt-5 grid grid-cols-3 flex-nowrap gap-5 text-[2vw] md:text-[1.3vw] font-medium w-[80%] md:w-[45%] h-[30px] md:h-[40px] left-[50%] translate-x-[-50%]">
                    <button id='friendsMode' className={modeButtonCSS} onClick={() => modeClicked('friendsMode')}>Friends</button>
                    <button id='requestsMode' className={modeButtonCSS} onClick={() => modeClicked('requestsMode')}>
                        Requests
                    </button>
                    <button id='sentRequestsMode' className={modeButtonCSS} onClick={() => modeClicked('sentRequestsMode')}>Sent Requests</button>
                </div>

                <FriendsList friendList={friendList} />
                <AddFriend />

                {isLoading > 0 && <ReloadIcon />}
                {popup && <popup.PopupComponent disableModal={() => setPopup(null)} />}
            </div>
    );
};


export default function FriendsPage() {

    const isAuth = useIsAuthenticated()

    return (
        <div className="FriendsPage">
            <NavBar />
            {isAuth ?
                <FriendsContextProvider>
                    <FriendsContainer />
                </FriendsContextProvider>
                :
                <span style={{ position: 'relative', top: '50%' }}>Please Login to View Friends</span>
            }
        </div>
    )
}
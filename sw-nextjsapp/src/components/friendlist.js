import { ConfirmAction } from "./uifeatures"
import { useState } from 'react';
import { useFriendsContext } from '@/pages/friends';

// Render a modal when you click add friend.
// This is where you can type in an email address to add
const UserAddPopup = ({ disableModal }) => {
    const [email, setEmail] = useState('');
    const { callSWFriendAPI } = useFriendsContext()

    // Exit the popup when clicked outside
    window.onclick = (event) => {
        var modal = document.getElementById('userAdd')
        if (event.target === modal) {
            disableModal()
        }
    }

    // Sends the friend request when entered
    const postAddFriend = (event) => {
        event.preventDefault()
        disableModal();

        if (email !== '') {
            callSWFriendAPI('POST', 'me/friends', { optional_args: { body: JSON.stringify({ 'to_email': email }) } })
                .catch((err) => {
                    console.log(err);
                });
        }
    }

    return (
        <>
            <div id='userAdd' className="userAddModal">
                <div className="userAddModalContent">
                    <span className="close" onClick={disableModal}></span>
                    <form id="userAddComponents" className="flex flex-col items-center sm:flex-row gap-5 sm:gap-2" onSubmit={(e) => postAddFriend(e)}>
                        <input id='userAddTextbox'
                            type="text"
                            className="flex-1 w-[100%] outline px-2 py-1 sm:p-2"
                            autoFocus={true}
                            placeholder="Type a username..."
                            onChange={(e) => setEmail(e.target.value)}></input>
                        <input
                            type="submit"
                            value="Send"
                            className="flex-initial rounded bg-lime-500 text-white px-2 sm:p-2 w-[50px] cursor-pointer"
                        ></input>
                    </form>
                </div>
            </div>
        </>
    )
}


// The add friend button
const AddFriend = () => {
    const { setPopup } = useFriendsContext()
    const PopupComponent = ({ disableModal }) => {
        return (
            <UserAddPopup disableModal={disableModal}></UserAddPopup>
        )
    }

    const enablePopup = () => {
        setPopup({ PopupComponent: PopupComponent })
    }

    return (
        <>
            <button id='addFriendBtn' className="AddFriend" onClick={enablePopup}>
                Add Friend
            </button>
        </>
    )
}


// Friend element in the Friends list
const FriendElement = ({ user, status }) => {
    // Name, Status: Str
    const [displayName, setDisplayName] = useState(user.displayName)

    const { callSWFriendAPI, mode, setPopup } = useFriendsContext()

    const Confirm = ({ disableModal }) => {
        return (
            <ConfirmAction action={rejectFriend} disableModal={disableModal} />
        )
    }
    const enablePopup = () => {
        setPopup({ PopupComponent: Confirm })
    }

    const buttonWrapper = (e, func) => {
        e.stopPropagation()
        func()
    }

    const acceptFriend = () => {
        // Sends a request to the API db to add or accept a friend
        callSWFriendAPI('POST', 'me/friends/', { optional_args: { body: JSON.stringify({ 'to_email': user.email }) } })
            .catch((err) => {
                console.log(err)
            })
    }

    const rejectFriend = () => {
        // Delete a friend or any request.
        const route = 'me/friends/' + user.email
        callSWFriendAPI('DELETE', route)
            .catch((err) => {
                console.log(err)
            })
    }

    const FriendElementContent = () => {
        if (mode === 'friendsMode') {
            if (displayName === user.displayName) {
                return (
                    <div className='Status mt-2 align-left pr-[5%] text-gray-700 text-[8px] sm:text-[12px]'>{status}</div>
                )
            }
            return (
                <button className="pr-[5%] mt-2 text-red-500 text-[12px] sm:text-[20px] font-medium" onClick={e => buttonWrapper(e, enablePopup)}>
                    Delete
                </button>
            )
        } else if (mode === 'requestsMode') {
            return (
                <div className="flex-1 mt-2 flex justify-end pr-[5%] gap-5 flex-wrap sm:flex-nowrap text-center">
                    <button className="text-lime-500 text-[12px] sm:text-[20px] font-medium" onClick={e => buttonWrapper(e, acceptFriend)}>Accept</button>
                    <button className="text-red-500 text-[12px] sm:text-[20px] font-medium" onClick={e => buttonWrapper(e, rejectFriend)}>Reject</button>
                </div>
            )
        } else if (mode === 'sentRequestsMode') {
            return (
                <button className="pr-[5%] mt-2 text-red-500 text-[12px] sm:text-[20px] font-medium" onClick={e => buttonWrapper(e, rejectFriend)}>
                    Cancel
                </button>
            )
        }
    }

    return (
        <>
            <div onClick={() => {
                setDisplayName((prev) => {
                    if (prev === user.displayName) {
                        return user.email;
                    } else {
                        return user.displayName;
                    }
                })
            }} className="FriendElement mx-auto mb-4 mt-4 shadow-lg bg-white max-w-[820px] min-w-[150px] w-[60vw] md:w-[45vw] h-[10vh] items-center flex overflow-hidden hover:drop-shadow-xl py-4 border border-gray-400 rounded-xl cursor-pointer">
                <img src={'/profile.png'} className="h-[25px] w-[25px] sm:h-[50px] sm:w-[50px] rounded-full ml-2 sm:ml-6 " alt="Profile" />
                <span className="flex-1 ml-4 mr-2 sm:ml-5 sm:mr-5 mt-2 align-left font-bold text-[10px] sm:text-[1.6vw] text-left">{displayName}</span>
                <FriendElementContent />
            </div>
        </>
    )
}

const FriendsList = (props) => {
    const friendList = props.friendList

    return (
        <>
            <div id="FriendList">
                <ul>
                    {friendList && friendList.map(user => {
                        return (
                            <li key={user.email}>
                                <FriendElement user={user} status={'Looking to Study'} />
                            </li>
                        )
                    })}
                </ul>
            </div>
        </>
    )
}

export { FriendsList, AddFriend }
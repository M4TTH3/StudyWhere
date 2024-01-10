import NavBar from 'comp/navbar';
import Map from 'comp/map';
import { useDispatch, useSelector } from 'react-redux';
import { ReloadIcon } from '@/components/uifeatures';
import { useSWAPI } from '@/components/fetchToken';
import { useCallback, useEffect, useState } from 'react';
import { setFriendLists } from '@/reducers/friendSlice';


export default function MapPage() {

    const allFriendLists = useSelector(state => state.friendLists);
    const { callSWAPI, isLoading } = useSWAPI();
    const dispatch = useDispatch();

    const updateFriends = useCallback((updateLoading) => {

        callSWAPI('GET', 'me/friends', {}, updateLoading)
        .then((response) => {
            if (response) dispatch(setFriendLists(response?.data));
        }).catch((e) => console.log(e))

    }, [dispatch, callSWAPI])

    useEffect(() => {
        if (!allFriendLists) updateFriends(true);

        const timer = setTimeout(() => updateFriends(), 20000); // Refresh the list
        return () => clearTimeout(timer);
    }, [allFriendLists, updateFriends]);

    return (
        <div className="MapPage">
            {isLoading > 0 && <ReloadIcon />}
            <NavBar />
            <div id='map-page-container'>
                <Map allFriendLists={allFriendLists}/>
            </div>
        </div>
    )
}

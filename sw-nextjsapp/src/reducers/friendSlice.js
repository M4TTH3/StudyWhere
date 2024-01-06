import { createSlice } from "@reduxjs/toolkit";

const friendListsSlice = createSlice({
    name: "friendLists",
    initialState: null,
    reducers: {

        // Used to set the state
        setFriendLists: {
            reducer: (state, action) => {
                return action.payload
            }
        }
    }
})

export const setFriendLists = friendListsSlice.actions.setFriendLists

export default friendListsSlice
import { sessionDetailsSlice } from './sessionSlice'
import friendListsSlice from './friendSlice'
import { combineReducers } from 'redux'
import { configureStore } from '@reduxjs/toolkit'

const rootReducer = combineReducers({
    sessionDetails: sessionDetailsSlice.reducer,
    friendLists: friendListsSlice.reducer
})

const store = configureStore({
    reducer: rootReducer,
}) 

export default store;
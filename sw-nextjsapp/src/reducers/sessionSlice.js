import { createSlice } from "@reduxjs/toolkit"
import { createAsyncThunk } from "@reduxjs/toolkit";

// Sessions will follow this format

// JSON format:

// str :param email: The user that is posting 
// list :param times: The times in epoch
// str :param title: The title of the session
// str :param buildingName: The name of the building
// str :param roomName: The name of the room in the building
// float :param latitude: the latitude
// float :param longitude: the longitude  
// str :param tasks: The tasks being completed in the session
// int (1-10) :param capacity: How full a location is currently 

export const sessionObject = {
    title: '',
    times: [],
    buildingName: '',
    roomName: '',
    latitude: 0.0,
    longitude: 0.0,
    tasks: [],
    capacity: 0
}

const SESSIONSKEYS = Object.keys(sessionObject)

const prepareData = (value) => {
    const payload = {};
    for (const key of SESSIONSKEYS) {
        if (value[key]) {
            const insert = value[key];
            payload[key] = insert;
        }
    }

    return { payload: payload }
}

export const initializeSession = createAsyncThunk(
    'sessionDetails/initialize',
    async (payload, { getState }) => {
        const details = getState().sessionDetails;
        const data = prepareData(payload)?.payload;
        const times = [Date.now()];
        return { ...details, ...data, times: times };
    }
)

export const updateSession = createAsyncThunk(
    'sessionDetails/update',
    async (payload, { getState }) => {
        const currentDetails = getState().sessionDetails;
        const data = prepareData(payload)?.payload;
        const times = [...currentDetails.times, Date.now()];
        return { ...currentDetails, ...data, times: times };
    }
)

export const sessionDetailsSlice = createSlice({
    name: 'sessionDetails',
    initialState: sessionObject,
    reducers: {
        reset: {
            reducer: (state) => {
                return sessionObject;
            }
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(initializeSession.fulfilled, (state, action) => {
                return action.payload;
            })
            .addCase(updateSession.fulfilled, (state, action) => {
                return action.payload;
            });
    }
});

export const sessionActions = sessionDetailsSlice.actions;

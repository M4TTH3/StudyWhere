import React, { useEffect, useState, createContext, useContext } from 'react';
import NavBar from 'comp/navbar';
import Timer from 'comp/timer';
import TimerButton from 'comp/timerbutton';
import { useDispatch, useSelector } from 'react-redux';
import SessionFormModal from 'comp/sessionform';
import { initializeSession, updateSession, sessionActions, patchSession } from '@/reducers/sessionSlice';
import { useSWAPI } from 'comp/fetchToken';
import { useIsAuthenticated } from '@azure/msal-react';

const SessionContext = createContext(null);

const SessionContextProvider = ({ children, value }) => {
    return (
        <SessionContext.Provider value={value}>
            {children}
        </SessionContext.Provider>
    )
};

export const useSessionContext = () => {
    const sessionProps = useContext(SessionContext);
    if (sessionProps) {
        return sessionProps;
    } else {
        throw new Error('Object not wrapped in context');
    }
};

export default function SessionPage() {
    const sessionDetails = useSelector(state => state.sessionDetails);
    const dispatch = useDispatch();
    const [time, setTime] = useState(0); // epoch - milliseconds
    const [status, setStatus] = useState(null);
    const [isFormEnabled, setIsFormEnabled] = useState(false);
    const { callSWAPI } = useSWAPI();
    const isAuth = useIsAuthenticated();

    const initialize = (details) => {
        // Used for initializing a session
        dispatch(initializeSession(details)).unwrap().then((response) => {
            callSWAPI('POST', 'me/session', { optional_args: { body: JSON.stringify(response) } })
                .catch((error) => console.log(error));
        });
    };

    const patch = (details={}) => {
        // Used for patching a session through session form. Doesn't modify time.
        dispatch(patchSession(details)).unwrap().then((response) => {
            callSWAPI('PATCH', 'me/session', { optional_args: { body: JSON.stringify(response) } })
                .catch((error) => console.log(error));
        });
    };

    const update = (details={}) => {
        // Modify the data, including time.
        dispatch(updateSession(details)).unwrap().then((response) => {
            callSWAPI('PATCH', 'me/session', { optional_args: { body: JSON.stringify(response) } })
                .catch((error) => console.log(error));
        });
    };

    const reset = () => {
        dispatch(sessionActions.reset());
        callSWAPI('DELETE', 'me/session')
            .catch((error) => console.log(error));
    };

    const getCurrentTime = (times) => {
        // Returns the current duration of the timer.
        // even = starts; odd = stops;
        let activeDuration = times.length % 2 === 1 ? Date.now() : 0;
        times.forEach((epoch, index) => {
            activeDuration += (index % 2 === 1) ? epoch : epoch * -1;
        });

        return activeDuration;
    };

    useEffect(() => {
        // Runs once to set the time and status on page load  
        // Initialize the session state
        const getSession = async () => {
            const response = await callSWAPI('GET', 'me/session');
            const data = response?.data;

            if (!data) return;

            const times = data?.times;
            const length = times?.length;
            setTime(getCurrentTime(times));
            length > 0 && setStatus(length % 2 === 1 ? 'RUNNING' : 'PAUSED');

            dispatch(sessionActions.setSession(data))
        }
        
        getSession();
    }, [isAuth]);

    useEffect(() => {
        // Set the timer counting or reset the time when status changed
        if (status === 'RUNNING') {
            const interval = setInterval(() => setTime(prev => prev + 1000), 1000);
            return () => clearInterval(interval);
        } else if (status === 'RESET') {
            setTime(0);
        }
    }, [status]);

    return (
        <>
            <SessionContextProvider value={{ setIsFormEnabled, status, setStatus, sessionDetails, initialize, update, reset, patch }}>
                <div className="SessionPage">
                    <NavBar />
                    <div className='page-container'>
                        <div className='h-[80%]'>
                            <Timer time={time} />
                            <TimerButton />
                        </div>
                    </div>
                </div>
                {isFormEnabled && <SessionFormModal />}
            </SessionContextProvider>
        </>
    );
};

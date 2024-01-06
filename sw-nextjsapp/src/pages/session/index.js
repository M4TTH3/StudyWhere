import React, { useEffect, useState, createContext, useContext } from 'react';
import NavBar from 'comp/navbar';
import Timer from 'comp/timer';
import TimerButton from 'comp/timerbutton';
import { useDispatch, useSelector } from 'react-redux';
import SessionFormModal from 'comp/sessionform';
import { initializeSession, updateSession, sessionActions } from '@/reducers/sessionSlice';
import { useSWAPI } from 'comp/fetchToken';

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

    const initialize = (details) => {
        dispatch(initializeSession(details)).unwrap().then((response) => {
            callSWAPI('POST', 'me/session', { optional_args: { body: JSON.stringify(response) } })
                .catch((error) => console.log(error));
        });
    };

    const update = (details={}) => {
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
        const times = sessionDetails?.times;
        const length = times?.length;
        setTime(getCurrentTime(times));
        // Check if it was last running
        length > 0 && setStatus(length % 2 === 1 ? 'RUNNING' : 'PAUSED');
    }, []);

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
            <SessionContextProvider value={{ setIsFormEnabled, status, setStatus, sessionDetails, initialize, update, reset }}>
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

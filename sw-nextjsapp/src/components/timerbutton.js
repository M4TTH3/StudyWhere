import React, { useState, useCallback } from 'react';
import { ConfirmAction } from 'comp/uifeatures';
import { useSessionContext } from '@/pages/session';

function TimerButton() {
    const [confirmReset, setConfirmReset] = useState(null);
    const disableModal = useCallback(() => setConfirmReset(false), []);
    const {setIsFormEnabled, status, setStatus, update, reset} = useSessionContext();
    
    const continueClicked = () => {
        setStatus('RUNNING');
        update();
    }

    const stopClicked = () => {
        setStatus('PAUSED');
        update();
    }

    const resetClicked = () => {
        setStatus('RESET');
        reset();
    }

    return (
        <>
            <div id='timer-button-container' className='flex flex-row justify-center mt-[60px] gap-5 md:gap-10'>
                {!status || status === 'RESET' ?
                    <button onClick={() => setIsFormEnabled(true)} className="timer-button start-session-button text-[1em] md:text-[32px] font-semibold">
                        Start My Session
                    </button>
                    :
                    <>
                        <button onClick={() => {status === 'RUNNING' ? stopClicked() : continueClicked() }} className="timer-button text-[1.5rem] md:text-[32px] font-semibold shadow">
                            {status === 'RUNNING' ? 'Stop' : 'Continue'}
                        </button>
                        <button onClick={() => setConfirmReset(true)} className="timer-button text-[1.5em] md:text-[32px] font-semibold shadow">
                            Reset
                        </button>
                    </>
                }
            </div>

            {confirmReset && <ConfirmAction action={resetClicked} disableModal={disableModal} />}
        </>
    );
}

export default TimerButton;
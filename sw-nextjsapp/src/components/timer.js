import React, { useEffect, useRef, useState } from 'react';
import { useSessionContext } from '@/pages/session';

function Timer({ time }) {
    const [clockTime, setClockTime] = useState({ s: 0, m: 0, h: 0 });

    const title = useRef('');

    const { setIsFormEnabled, status } = useSessionContext();

    const formatTime = (difference) => {
        //Arrange the difference of date in days, hours, minutes, and seconds format
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        setClockTime({ s: seconds, m: minutes, h: hours });
    }

    useEffect(() => {
        formatTime(time);
        title.current = time;
    }, [time]);

    return (
        <div className='contents-container m-auto rounded-xl shadow-lg'>
            <input id='session-title' placeholder='Title' onChange={(e) => (title.current = e.target.value)} maxLength={16}></input>
            <ul id='timer-container'>
                <li className='timer-element-container'>
                    <div className='timer-element drop-shadow-lg box-border rounded-xl py-1'>
                        <span>{(clockTime.h >= 10) ? clockTime.h : "0" + clockTime.h}</span>
                    </div>
                    <span>Hour(s)</span>
                </li>
                <li className='timer-element-container'>
                    <div className='timer-element drop-shadow-lg box-border rounded-xl py-1'>
                        <span>{(clockTime.m >= 10) ? clockTime.m : "0" + clockTime.m}</span>
                    </div>
                    <span>Minute(s)</span>
                </li>
                <li className='timer-element-container'>
                    <div className='timer-element drop-shadow-lg box-border rounded-xl py-1'>
                        <span>{(clockTime.s >= 10) ? clockTime.s : "0" + clockTime.s}</span>
                    </div>
                    <span>Second(s)</span>
                </li>
            </ul>
            {status && status !== 'RESET' &&
                <button className='w-[40%] bg-slate-200 hover:bg-slate-300 m-auto mt-0 text-center border-2 rounded-xl font-bold text-[.5em] text-slate-700' onClick={() => (setIsFormEnabled(true))}>
                    Options
                </button>
            }
        </div>
    );
}

export default Timer;
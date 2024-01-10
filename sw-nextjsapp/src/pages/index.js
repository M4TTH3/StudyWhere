import React from 'react';
import NavBar from 'comp/navbar';
import Image from 'next/image';

export default function HomePage () {
    
    return (
        <div className="HomePage scrollpage">
            <NavBar/>
            <div className='mt-10 grid-rows-2 text-64'>
                <div className='ml-5 text-left text-[1.2rem]'>
                    <span className='font-bold'>Created By: </span>
                    <span>Matthew Au-Yeung</span>
                </div>
                <a href="https://github.com/M4TTH3/StudyWhere">
                    <Image className='' src="/github-mark.png" alt="Github Repo" width={10} height={10}/> 
                    <span>Github Repo</span>
                </a>
            </div>
       
        </div>
    )
}

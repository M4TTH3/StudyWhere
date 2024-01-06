import React from 'react';
import NavBar from 'comp/navbar';

export default function HomePage () {
    
    return (
        <div className="HomePage scrollpage">
            <NavBar/>
            <div className='mt-12'>
                <h3>Matthew, Becky, & Shawn</h3>
                <p>We have to change our logo cus its too long up and down</p>
                <p>I'll try to draw out our logo so it would look better</p>
                <img src={'/kangaroo.png'} className='w-[250px] h-auto flex justify-center mx-auto mt-12 drop-shadow-xl'></img>
            </div>
       
        </div>
    )
}

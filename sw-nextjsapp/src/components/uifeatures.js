function ConfirmAction ({action, disableModal}) {

    // Exit the popup when clicked outside
    window.onclick = (event) => {
        var modal = document.getElementById('pageModal')
        if (event.target === modal) {
            disableModal()
        }
    }

    const submitForm = (text='cancel') => {
        if (text === 'confirm') {
            action()
        }

        disableModal()
    }

    return (
        <>
            <div id='pageModal'>
                <div className='pageModalContent'>
                    <div className='flex gap-[10px] justify-center'>
                        <button className='border border-black rounded-md py-1 px-3 md:px-5 lg:px-7 bg-gray-400  text-white font-bold md:text-[1em] lg:text-[1.5em] cursor-pointer' onClick={() => submitForm('cancel')}>Cancel</button>
                        <button className='border border-black rounded-md py-1 px-3 md:px-5 lg:px-7 bg-red-500 text-white font-bold md:text-[1em] lg:text-[1.5em] cursor-pointer' onClick={() => submitForm('confirm')}>Confirm</button>
                    </div>
                </div>
            </div>
        </>
    )
}

const ScrollIndicator = () => {
    return (
        <>
            <div id='scrollindicator'>
                <span></span>
                <span></span>
                <span></span>
            </div>
        </>
    )
}

const ReloadIcon = () => {
    return (
        <>
            <div className='lds-ring'>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
            </div>
        </>
    )
}

export {ConfirmAction, ReloadIcon}
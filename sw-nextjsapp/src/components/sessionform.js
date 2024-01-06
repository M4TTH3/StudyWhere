import { useRef, useState } from "react"
import CreateableSelect from 'react-select/creatable'
import { useSessionContext } from "@/pages/session";

export const useCreateTask = () => {
    // Default format for any option in CreateableSelect
    const createTask = (task) => {
        return { label: task, value: task };
    }
    return createTask;
};

export const useSelectInput = (name, defaultValue, settings) => {
    // Controls the states of a CreateableSelect object to be used in a form
    const [inputValue, setInputValue] = useState('');
    const [currentValue, setCurrentValue] = useState(defaultValue);
    const elementProps = {
        name: name,
        isClearable: true,
        value: currentValue,
        inputValue: inputValue,
        onInputChange: (change) => setInputValue(change),
        onChange: (change) => setCurrentValue(change),
        styles: selectStyle,
        ...settings
    };

    return { inputValue, setInputValue, currentValue, setCurrentValue, elementProps };
};

const selectStyle = {
    // The styles for CreateableSelect
    control: (base, state) => ({
        ...base,
        border: state.isFocused ? '2px solid black' : '2px solid gainsboro',
        boxShadow: 'none',
        cursor: "text",
        '&:hover': {
            border: !state.isFocused && '2px solid gray',
        },
        "&:not [value='']": {
            border: '2px solid black'
        }
    }),
    valueContainer: (base, state) => ({
        ...base,
        width: "0",
        flexWrap: "nowrap",
        textAlign: "left",
        overflowX: "auto",
        "::-webkit-scrollbar": {
            width: "0px",
            height: "0px",
        }
    }),
    dropdownIndicator: (base, state) => ({
        ...base,
        cursor: "pointer"
    }),
    clearIndicator: (base, state) => ({
        ...base,
        cursor: "pointer"
    }),
    multiValue: (base, state) => ({
        ...base,
        backgroundColor: "rgba(249, 185, 242, 0.5)",
        flexShrink: 0
    })
}


const SelectBuilding = ({ selectNext, buildingName }) => {
    // Input for selecting a building
    const createTask = useCreateTask()
    const [options, setOptions] = useState([{ label: "DC", value: "hello" }]);
    const settings = { options: options, onKeyDown: (e) => handleKeyDown(e) };
    const { inputValue, setInputValue, currentValue, elementProps }
        = useSelectInput('buildingName', createTask(buildingName), settings);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === 'Tab') {
            if (inputValue === '') {
                e.preventDefault();
                selectNext(e);
            } else if (currentValue.value.toLowerCase() === inputValue.toLowerCase()) {
                e.preventDefault();
            }
            setInputValue('');
        }
    }

    return (
        <CreateableSelect {...elementProps} />
    )
}


const SelectTasks = ({ selectNext, tasks }) => {
    // Input for multiple tasks
    const createTask = useCreateTask()
    const settings = {
        onKeyDown: (e) => handleKeyDown(e),
        components: { DropdownIndicator: null },
        isMulti: true,
        menuIsOpen: false,
        placeholder: "Type a task and press enter...",
    }
    const { inputValue, setInputValue, currentValue, setCurrentValue, elementProps }
        = useSelectInput('tasks', tasks.length > 0 ? tasks.map((task) => createTask(task)) : [], settings);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === 'Tab') {
            if (inputValue !== '') {
                // Check if the new item is unique
                let inValue = false;
                for (const option of currentValue) {
                    if (option.value.toLowerCase() === inputValue.toLowerCase()) {
                        inValue = true;
                        break;
                    }
                }

                if (!inValue) setCurrentValue((prev) => [...prev, createTask(inputValue)]);
                setInputValue('');
            } else {
                selectNext(e)
            };

            e.preventDefault(); // Prevent form submit
        }
    }

    return (
        <CreateableSelect {...elementProps} />
    )
}


export default function SessionFormModal() {
    // The main wrapper of the session form
    const modalRef = useRef(null)
    const formRef = useRef(null)
    const { setIsFormEnabled, status, setStatus, sessionDetails, initialize, update } = useSessionContext()
    const { buildingName, capacity, roomName, tasks, title } = sessionDetails

    const submitSessionForm = (event) => {
        event.preventDefault(); // Prevent page reload

        const details = {};
        new FormData(formRef.current).forEach((value, key) => {
            if (key === 'capacity') details[key] = parseInt(value)
            else if (key === 'tasks') {
                if (value !== '') details[key] = key in details ? [...details[key], value] : [value]
                else details[key] = [];
            } else details[key] = value;
        })

        if (!status || status === 'RESET') {
            // If it's the first launch, initialize the timer and update the session info
            initialize(details);
            setStatus('RUNNING');
        } else {
            update(details); // Updating the information
        };

        setIsFormEnabled(false);
    }

    const selectNext = (event) => {
        // Selects the next input in the form
        const cssSelector = "input:not([name='tasks']):not([name='buildingName']), CreateableSelect"
        const focusInputs = formRef.current.querySelectorAll(cssSelector);
        let foundElement = false, nextInput = null;
        for (const input of focusInputs) {
            if (foundElement) { nextInput = input; break; }
            else if (event.target === input) foundElement = true;
        }
        if (nextInput) nextInput.focus()
    }

    const cancelEnterClicked = (event) => {
        // Cancels form submission on enter or tab
        if (event.key === 'Enter' || event.key === 'Tab') {
            event.preventDefault();
            selectNext(event)
        }
    }

    window.onclick = (event) => {
        // Exit the popup when clicked outside
        if (event.target === modalRef.current) {
            setIsFormEnabled(false)
        }
    }

    return (
        <div className='page-modal text-[12px] md:text-[16px]' ref={modalRef}>
            <div id='session-form'>
                <div className='flex place-content-end w-[95%] h-[100%] mx-auto'>
                    <button className='text-[3em] hover:text-gray-500 cursor-pointer leading-none' onClick={() => setIsFormEnabled(false)}>
                        &times;
                    </button>
                </div>
                <form onSubmit={e => submitSessionForm(e)} ref={formRef} >
                    <ul>
                        <li>
                            <label>Title</label>
                            <input name="title" maxLength={16} type='text' onKeyDown={cancelEnterClicked} defaultValue={title} />
                        </li>
                        <li>
                            <label>Building</label>
                            <SelectBuilding selectNext={selectNext} buildingName={buildingName} />
                        </li>
                        <li>
                            <label>Room</label>
                            <input name="roomName" type='text' className='room-textbox' onKeyDown={cancelEnterClicked} defaultValue={roomName} />
                        </li>
                        <li className='form-description'>
                            <label>Tasks</label>
                            <SelectTasks selectNext={selectNext} tasks={tasks} />
                        </li>
                        <li className='input-row'>
                            <label>How Full is the Place?</label>
                            <input name="capacity" id='capacitySlider' type='range' min="0" max="10" step="1" onKeyDown={cancelEnterClicked} defaultValue={capacity ? capacity : "5"} />
                        </li>
                    </ul>

                    <input type='submit' value='SUBMIT' className='submit-button' />
                </form>
            </div>
        </div>
    )
}
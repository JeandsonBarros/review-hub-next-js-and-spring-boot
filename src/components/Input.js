import PropTypes from 'prop-types';
import { createRef, useEffect, useState } from 'react';
import { MdOutlineVisibility, MdOutlineVisibilityOff } from 'react-icons/md';

import inputStyles from '../styles/components_styles/input.module.css';

export default function Input({ type, required, placeholder, icon, value, setValue, css }) {

    const inputRef = createRef();
    const labelRef = createRef();
    const divRef = createRef();
    const [typeInput, setTypeInput] = useState()

    useEffect(() => {
        setTypeInput(type)
    }, [type])

    useEffect(() => {
        if (value) {
            inputRef.current.style.display = 'block'
            divRef.current.style.borderBottom = '1px solid var(--color)'
            labelRef.current.style.color = 'var(--color)'
        }
    }, [value])

    return (
        <div
            ref={divRef}
            style={css}
            className={`${inputStyles.input_component}`}
            onClick={event => {
                inputRef.current.style.display = 'block'
                inputRef.current.focus()
                event.currentTarget.style.borderBottom = '1px solid var(--color)'
                labelRef.current.style.color = 'var(--color)'
            }}
            onBlur={event => {

                if (required && !inputRef.current.value) {
                    event.currentTarget.style.borderBottom = '1px solid var(--error)'
                    labelRef.current.style.color = 'var(--error)'
                } else if (required && inputRef.current.value) {
                    event.currentTarget.style.borderBottom = '1px solid var(--success)'
                    labelRef.current.style.color = 'var(--success)'
                } else if (!required && inputRef.current.value) {
                    event.currentTarget.style.borderBottom = '1px solid var(--color)'
                    labelRef.current.style.color = 'var(--color)'
                } else {
                    event.currentTarget.style.borderBottom = '1px solid gray'
                    labelRef.current.style.color = 'gray'
                }

                if (!inputRef.current.value)
                    inputRef.current.style.display = 'none'

                inputRef.current.blur()

            }}
        >

            <div style={{ width: '100%' }}>

                <label ref={labelRef} className={`${inputStyles.label_input} flex_row`}>
                    {icon && <span>{icon}</span>} {placeholder}
                </label>

                <input
                    min="1" 
                    step="any"
                    ref={inputRef}
                    type={typeInput}
                    value={value && value}
                    onChange={event => setValue && setValue(event.target.value)}
                />

            </div>

            {
                type === 'password' &&
                <button className='icon_button' type='button' onClick={() => setTypeInput(typeInput == 'password' ? 'text' : 'password')}>
                    {typeInput == 'password' ? <MdOutlineVisibilityOff /> : <MdOutlineVisibility />}
                </button>
            }

        </div>
    );
}

Input.propTypes = {
    setValue: PropTypes.func,
    css: PropTypes.object
};

Input.defaultProps = {
    type: 'text',
    required: false
};


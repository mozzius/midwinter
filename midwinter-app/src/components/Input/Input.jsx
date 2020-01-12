import React, { useState, useRef, useEffect } from 'react'

import styles from './Input.module.css'

const Input = ({ onSubmit, placeholder, button, grey, monospace, uppercase }) => {
    const [value, setValue] = useState('')

    const submit = evt => {
        evt.preventDefault()
        if (value !== '') {
            onSubmit(value)
            setValue('')
        }
    }

    return (
        <div className={styles.container}>
            <form className={styles.form} onSubmit={submit}>
                <input
                    type="text"
                    ref={input => input && input.focus()}
                    placeholder={placeholder || "Say something..."}
                    className={styles.input}
                    value={value}
                    style={monospace && { fontFamily: "Consolas, monospace" }}
                    onChange={evt => setValue(uppercase ? evt.target.value.replace(/\W/g, '').toUpperCase() : evt.target.value)}
                />
                <input
                    type="submit"
                    value={button || "Send"}
                    className={grey ? styles.submitGrey : styles.submit}
                />
            </form>
        </div>
    )
}

export const Text = ({ value, onChange, placeholder, label, monospace, password, autoFocus }) => {
    const focusRef = useRef()

    useEffect(() => {
        if (focusRef.current) focusRef.current.focus()
    }, [focusRef])

    // generate random string
    const genId = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)

    const [id] = useState(genId)

    return (
        <div className={styles.inputContainer}>
            <label htmlFor={id}>{label}</label>
            <div className={styles.text}>
                <input
                    type={password ? 'password' : 'text'}
                    ref={autoFocus && focusRef}
                    id={id}
                    value={value}
                    onChange={onChange}
                    style={monospace && { fontFamily: "Consolas, monospace" }}
                    className={styles.input}
                    placeholder={placeholder}
                />
            </div>
        </div>
    )
}

export const Submit = ({ text }) => {
    return (
        <input
            type="submit"
            value={text}
            className={styles.submitBtn}
        />
    )
}

export const Checkbox = ({ label, value, onChange }) => {
    // generate random string
    const genId = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)

    const [id] = useState(genId)

    return (
        <div className={styles.checkboxContainer}>
            <input
                id={id}
                type="checkbox"
                value={value}
                onChange={onChange}
            />
            <label htmlFor={id}>{label}</label>
        </div>
    )
}

export default Input;
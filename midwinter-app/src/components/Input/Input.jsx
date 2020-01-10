import React, { useState } from 'react'

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
            <form className={styles.text} onSubmit={submit}>
                <input
                    type="text"
                    placeholder={placeholder || "Say something..."}
                    className={styles.input}
                    value={value}
                    style={monospace && { fontFamily: "Consolas, monospace" }}
                    onChange={evt => setValue(uppercase ? evt.target.value.toUpperCase() : evt.target.value)}
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

export default Input;
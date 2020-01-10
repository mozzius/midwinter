import React, { useState, useContext } from 'react'

import styles from './Input.module.css'
import UserContext from '../../contexts/user'

const Input = ({ channel, sendMessage }) => {
    const user = useContext(UserContext)
    const [value, setValue] = useState('')

    const submit = evt => {
        evt.preventDefault()
        if (value !== '') {
            sendMessage({ message: value, user_id: user.id, channel_id: channel })
            setValue('')
        }
    }

    return (
        <div className={styles.container}>
            <form className={styles.text} onSubmit={submit}>
                <input
                    type="text"
                    placeholder="Say something..."
                    className={styles.input}
                    value={value}
                    onChange={evt => setValue(evt.target.value)}
                />
                <input
                    type="submit"
                    value="Send"
                    className={styles.submit}
                />
            </form>
        </div>
    )
}

export default Input;
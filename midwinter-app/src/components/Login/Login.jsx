import React, { useState, useContext } from 'react'
import { Redirect } from 'react-router-dom'

import UserContext from '../../contexts/user'
import { Text, Submit } from '../Input'
import './Login.module.css'

const Login = ({ setUser }) => {
    const [error, setError] = useState({ exists: false })
    const [form, setForm] = useState({ username: '', password: '' })
    const user = useContext(UserContext)

    const login = async () => {
        setError({ exists: false })
        const res = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(form)
        })
        const { success, message } = await res.json()
        if (success) {
            setUser({ loggedIn: true, expiry: Date.now(), ...message })
        } else {
            setError({ exists: true, message })
        }
    }

    if (user.loggedIn) return <Redirect to="/" />

    return (
        <form onSubmit={e => {
            e.preventDefault()
            login(form)
        }}>
            {error.exists && <p>Error logging in: {error.message}</p>}
            <Text
                label="Username:"
                placeholder="Username"
                autoFocus
                value={form.username}
                onChange={e => setForm({ ...form, username: e.target.value })}
            />
            <Text
                label="Password:"
                password
                placeholder="Password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
            />
            <Submit text="Login" />
        </form>
    )
}

export default Login
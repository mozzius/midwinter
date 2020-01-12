import React, { useState, useContext } from 'react'
import { Redirect } from 'react-router-dom'

import UserContext from '../../contexts/user'
import './Signup.module.css'
import { Text, Submit } from '../Input'

const Signup = ({ setUser }) => {
    const [error, setError] = useState({ exists: false })
    const [form, setForm] = useState({ username: '', password: '', email: '' })
    const user = useContext(UserContext)

    const signup = async () => {
        setError({ exists: false })
        const res = await fetch('/signup', {
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
            signup(form)
        }}>
            {error.exists && <p>Error signing up: {error.message}</p>}
            <Text
                label="Username:"
                placeholder="Username"
                autoFocus
                value={form.username}
                onChange={e => setForm({ ...form, username: e.target.value })}
            />
            <Text
                label="Email:"
                placeholder="Email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
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

export default Signup
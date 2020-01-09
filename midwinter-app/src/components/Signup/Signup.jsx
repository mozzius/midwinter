import React, { useState, useContext } from 'react'
import { Redirect } from 'react-router-dom'

import UserContext from '../../contexts/user'
import './Signup.module.css'

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
            <p>Username</p>
            <input type="text" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} />
            <p>Email</p>
            <input type="text" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            <p>Password</p>
            <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
            <input type="submit" value="Signup" />
        </form>
    )
}

export default Signup
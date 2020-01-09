import React, { useState, useContext } from 'react'
import { Redirect } from 'react-router-dom'

import UserContext from '../../contexts/user'
import './Login.module.css'

const Login = ({ setUser }) => {
    const [error, setError] = useState({ exists: false })
    const [form, setForm] = useState({ username: 'Mozzius', password: 'test' })
    const user = useContext(UserContext)

    const login = async () => {
        setError({ exists: false })
        const res = await fetch('http://localhost:5000/login', {
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
            <p>Username</p>
            <input type="text" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} />
            <p>Password</p>
            <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
            <input type="submit" value="Login" />
        </form>
    )
}

export default Login
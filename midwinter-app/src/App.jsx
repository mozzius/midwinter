import React, { useState, useEffect } from 'react'
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link
} from 'react-router-dom'

import { UserProvider } from './contexts/user'
import Midwinter from './components/Midwinter'
import Signup from './components/Signup'
import Login from './components/Login'
import styles from './App.module.css'
import { useCheck } from './hooks/network'

const App = () => {
    const [user, setUser] = useState({ loggedIn: false })
    const { type: check } = useCheck()

    const logout = () => {
        window.localStorage.removeItem('server')
        window.localStorage.removeItem('currentChannel')
        setUser({ loggedIn: false })
    }

    // runs once
    useEffect(() => {
        const userStorage = JSON.parse(window.localStorage.getItem('user'))

        if (userStorage && userStorage.loggedIn && userStorage.expiry + (userStorage.expiresIn / 1000) < Date.now()) {
            setUser(userStorage)
        } else {
            localStorage.removeItem('user')
        }
    }, [])

    // save user on change
    useEffect(() => {
        window.localStorage.setItem('user', JSON.stringify(user))
    }, [user])

    // see if JWT is valid
    useEffect(() => {
        if (check === 'JWT invalid') logout()
    }, [check])

    return (
        <UserProvider value={user}>
            <Router>
                {user.loggedIn ? <Midwinter logout={logout} /> : (

                    <div className={styles.app}>
                        <div className={styles.content}>
                            <h2>Midwinter</h2>
                            <Link to="/login">Login</Link>
                            <Link to="/signup">Signup</Link>
                            <Switch>
                                <Route path="/login">
                                    <Login setUser={setUser} />
                                </Route>
                                <Route path="/signup">
                                    <Signup setUser={setUser} />
                                </Route>
                                <Route path="/">
                                    <p>Not logged in</p>
                                </Route>
                            </Switch>
                        </div>
                    </div>

                )}
            </Router>
        </UserProvider >
    )
}

export default App

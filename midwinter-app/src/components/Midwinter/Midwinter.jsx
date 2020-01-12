import React, { useState, useEffect } from 'react'
import { Switch, Route, Redirect, Link } from 'react-router-dom'

import Sidebar from '../Sidebar'
import Messages from '../Messages'
import Bar from '../Bar'
import SelectServer from '../SelectServer'
import Pill from '../Pill'
import styles from './Midwinter.module.css'
import useChat from '../../hooks/socket'
import { useChannels } from '../../hooks/network'
import CreateServer from '../CreateServer'

const Logout = ({ logout }) => {
    // log them out
    useEffect(logout, [])

    return <Redirect to="/" />
}

const MidwinterContent = () => {
    const [mode, setMode] = useState('chat')
    const [server, setServer] = useState(JSON.parse(window.localStorage.getItem('server')) || { selected: false, data: null })
    const [chat, setChat] = useState(JSON.parse(window.localStorage.getItem('currentChannel')) || null)
    const channels = useChannels(server)
    const [rooms, setRooms] = useState([])
    const socket = useChat(JSON.stringify(rooms))

    const strData = JSON.stringify(channels.data)

    useEffect(() => {
        const data = JSON.parse(strData)
        if (channels.type === 'success') {
            setRooms(data.results.map(channel => channel.id))
        }
    }, [channels.type, strData])

    const changeServer = server => {
        window.localStorage.removeItem('currentChannel')
        setChat(null)
        setServer({ selected: true, data: server })
        setMode('chat')
    }

    // runs when server changes
    useEffect(() => {
        if (server.selected) {
            window.localStorage.setItem('server', JSON.stringify(server))
        } else {
            setMode('select server')
        }
    }, [server])

    switch (mode) {
        case 'select server':
            return <SelectServer setServer={changeServer} setMode={setMode} />
        case 'create server':
            return <CreateServer setServer={changeServer} setMode={setMode} />
        default:
            return (
                <div className={styles.main}>
                    <Sidebar
                        currentChat={chat?.id}
                        setChat={setChat}
                        channels={channels}
                        server={server}
                    />
                    <div className={styles.right}>
                        <Bar text={server.data?.name}>
                            <Pill onClick={() => setMode('select server')}>
                                Change
                            </Pill>
                            <Pill right>
                                <Link to="/logout">Log out</Link>
                            </Pill>
                        </Bar>
                        {chat ? <Messages chat={chat} socket={socket} /> : <p>Select a channel</p>}
                    </div>
                </div>
            )
    }

}

const Midwinter = ({ logout }) => {
    return (
        <Switch>
            <Route path={['/login', '/signup']}>
                <Redirect to="/" />
            </Route>
            <Route path="/logout">
                <Logout logout={logout} />
            </Route>
            <Route path="/">
                <MidwinterContent />
            </Route>
        </Switch>
    )
}

export default Midwinter
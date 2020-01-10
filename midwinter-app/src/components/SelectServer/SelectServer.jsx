import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

import { useJoinServer, useServers } from '../../hooks/network'
import Input from '../Input'
import Pill from '../Pill'
import styles from './SelectServer.module.css'

const Servers = ({ setServer }) => {
    const { type, data } = useServers()

    switch (type) {
        case 'loading':
            return <p>Loading</p>
        case 'success':
            const { servers } = data
            if (servers.length > 0) {
                return servers.map(server => {
                    return (
                        <div
                            key={server.id}
                            className={styles.server}
                            onClick={() => setServer(server)}
                        >
                            <p className={styles.name}>{server.name}</p>
                            <p className={styles.code}>
                                Code: <span>{server.code}</span>
                            </p>
                        </div>
                    )
                })
            } else {
                return <p>No servers found</p>
            }
        default:
            return <p>An error occured</p>
    }
}

const SelectServer = ({ setServer }) => {
    const [code, setCode] = useState(null)
    const [error, setError] = useState(false)
    const { type, data } = useJoinServer(code)

    const strData = JSON.stringify(data)

    useEffect(() => console.log(code), [code])

    useEffect(() => {
        setError(false)
        const res = JSON.parse(strData)
        console.log(type)

        if (type === 'success') {
            if (res.success) {
                setServer(res.server)
            } else {
                setError(true)
            }
        } else if (type === 'error' && res !== 'no message') {
            setError(true)
        }
    }, [type, strData, setServer])


    const onSubmit = value => {
        setCode(value.replace(/\W/g, '').toUpperCase())
    }

    return (
        <div className={styles.container}>
            <div className={styles.inner}>
                <div className={styles.title}>
                    <h2>Midwinter</h2>
                    <Pill right white>
                        <Link to="/logout">Logout</Link>
                    </Pill>
                </div>
                <p>Join a Server</p>
                {error && <p>Could not find any servers with code <span className={styles.code}>{code}</span></p>}
                <div className={styles.join}>
                    <Input
                        onSubmit={onSubmit}
                        placeholder="MIDWINTER"
                        button="Join"
                        grey
                        monospace
                        uppercase
                    />
                    <p>or</p>
                    <button
                        className={styles.button}
                        onClick={() => alert('Sorry, not quite yet!')}
                    >
                        Create
                    </button>
                </div>
                <p>Your Servers</p>
                <div className={styles.servers}>
                    <Servers setServer={setServer} />
                </div>
            </div>
        </div>
    )
}

export default SelectServer
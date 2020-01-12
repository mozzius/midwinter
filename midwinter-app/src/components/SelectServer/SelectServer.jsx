import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

import { useJoinServer, useServers } from '../../hooks/network'
import Input from '../Input'
import Pill from '../Pill'
import styles from './SelectServer.module.css'
import FormContainer from '../FormContainer'

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

const SelectServer = ({ setServer, setMode }) => {
    const [code, setCode] = useState(null)
    const [error, setError] = useState(false)
    const { type, data } = useJoinServer(code)

    const strData = JSON.stringify(data)

    useEffect(() => {
        setError(false)
        const res = JSON.parse(strData)

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

    return (
        <FormContainer logout={(
            <Pill right white>
                <Link to="/logout">Log out</Link>
            </Pill>
        )}>
            <div className={styles.title}>
                <p>Join a Server</p>
            </div>
            {error && <p>Could not find any servers with code <span className={styles.code}>{code}</span></p>}
            <div className={styles.join}>
                <Input
                    onSubmit={setCode}
                    placeholder="MIDWINTER"
                    button="Join"
                    grey
                    monospace
                    uppercase
                />
                <p>or</p>
                <button
                    className={styles.button}
                    onClick={() => setMode('create server')}
                >
                    Create
                    </button>
            </div>
            <div className={styles.title}>
                <p>Your Servers</p>
            </div>
            <div className={styles.servers}>
                <Servers setServer={setServer} />
            </div>
        </FormContainer>
    )
}

export default SelectServer
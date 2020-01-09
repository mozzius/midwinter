import React from 'react'
import { useServers } from '../../hooks/network'

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
                            {server.name}
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

    return (
        <div className={styles.container}>
            <div className={styles.inner}>
                <h2>select server</h2>
                <Servers setServer={setServer} />
            </div>
        </div>
    )
}

export default SelectServer
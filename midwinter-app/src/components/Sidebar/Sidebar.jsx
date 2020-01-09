import React, { useState, useContext } from 'react'

import UserContext from '../../contexts/user'
import { useSearch } from '../../hooks/network'
import Search from '../Search'
import styles from './Sidebar.module.css'

const SearchResults = ({ results, setChat }) => {
    const user = useContext(UserContext)
    const { type, data } = results
    switch (type) {
        case 'loading':
            return <p>Loading...</p>
        case 'success':
            if (data.results.length === 0) return <p>No results found</p>

            return (
                <>
                    <div className={styles.separator}>Results</div>
                    {data.results.map(channel => {
                        if (!channel.title) channel.title = channel.users.filter(x => x.id !== user.id).map(x => x.username).join(', ')
                        return <div className={styles.channel} key={channel.id} onClick={() => setChat(channel)}>{channel.title}</div>
                    })}
                </>
            )
        default:
            return <p>An error occured</p>
    }
}

const ChannelResults = ({ results, setChat }) => {
    const user = useContext(UserContext)
    const { type, data } = results
    switch (type) {
        case 'loading':
            return <p>Loading...</p>
        case 'success':
            if (data.results.length === 0) return <p>No channels</p>

            return (
                <>
                    <div className={styles.separator}>Channels</div>
                    {data.results.map(channel => {
                        if (!channel.title) channel.title = channel.users.filter(x => x.id !== user.id).map(x => x.username).join(', ')
                        return <div className={styles.channel} key={channel.id} onClick={() => setChat(channel)}>{channel.title}</div>
                    })}
                    <div className={styles.conversation}><b>+</b> New Conversation</div>
                </>
            )
        default:
            return <p>An error occured</p>
    }
}

const Sidebar = ({ setChat, channels }) => {
    const user = useContext(UserContext)
    const [search, setSearch] = useState('')
    const results = useSearch(search)

    return (
        <div className={styles.sidebar}>
            <div className={styles.title}>
                <h2>Midwinter</h2>
                {/*<p>•••</p>*/}
            </div>
            <Search onChange={setSearch} />
            <div className={styles.content}>
                {search ? <SearchResults results={results} setChat={setChat} /> : <ChannelResults results={channels} setChat={setChat} />}
            </div>
            <div className={styles.user}>
                <div className={styles.profilePic} />
                <div className={styles.info}>
                    <p>{user.username}</p>
                    <p><span className={styles.dot} /> Online</p>
                </div>
            </div>
        </div >
    )
}

export default Sidebar
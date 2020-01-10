import React, { useEffect, useState } from 'react'
import ScrollableFeed from 'react-scrollable-feed'

import { useMessages } from '../../hooks/network'
import Input from '../Input'
import Bar from '../Bar'
import styles from './Messages.module.css'

const Message = ({ msg, users }) => {
    const { user_id, message } = msg

    const user = users.reduce((curr, next) => { return next.id === user_id ? next.username : curr }, '')

    return (
        <div className={styles.message}>
            <div className={styles.profilePic} />
            <div className={styles.content}>
                <p className={styles.username}>{user}</p>
                <p className={styles.text}>{message}</p>
            </div>
        </div>
    )
}

const Messages = ({ chat, socket }) => {
    const { messages, sendMessage } = socket
    const [prevMessages, setPrevMessages] = useState([])
    //const [offset, setOffset] = useState(0)
    const { type, data } = useMessages(chat.id, 0)

    // for comparison in useEffect
    // this is dumb 
    const strData = JSON.stringify(data)
    const strChat = JSON.stringify(chat)

    const allMessages = [...prevMessages, ...messages.filter(msg => msg.channel_id === chat.id)]

    useEffect(() => {
        const data = JSON.parse(strData)
        if (type === 'success' && data.success) {
            setPrevMessages(data.messages)
        }
    }, [type, strData])

    useEffect(() => {
        if (JSON.parse(strChat)) window.localStorage.setItem('currentChannel', strChat)
    }, [strChat])

    if (!chat) return <p>Select a channel</p>

    return (
        <div className={styles.main}>
            <Bar text={chat.title} />
            <ScrollableFeed className={styles.messages}>
                {allMessages.map(msg => {
                    return (
                        <Message key={msg.id} msg={msg} users={chat.users} />
                    )
                })}
            </ScrollableFeed>
            <Input sendMessage={sendMessage} channel={chat.id} />
        </div>
    )
}

export default Messages
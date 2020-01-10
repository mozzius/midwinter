import { useEffect, useRef, useState } from 'react'
import io from 'socket.io-client'

const useChat = (channels) => {
    const [messages, setMessages] = useState(JSON.parse(channels))
    const socketRef = useRef()

    useEffect(() => {
        socketRef.current = io.connect()

        socketRef.current.emit('join-rooms', JSON.parse(channels))

        socketRef.current.on('message', message => {
            setMessages(msgs => [...msgs, message])
        })

        return () => {
            socketRef.current.disconnect()
        }
    }, [channels])

    const sendMessage = (message) => {
        //const timer = setTimeout(() => alert('Message timed out'), 5000)

        if (socketRef.current && message !== '') {
            socketRef.current.emit('message', message)

            // TODO: get timeout working
            //() => {
            //    clearTimeout(timer)
            //}
        }
    }

    return { messages, sendMessage }
}

export default useChat
import { useState, useEffect } from 'react'


export const useFetch = (url, method, message) => {
    const [state, setState] = useState({ type: 'loading', data: null })

    // get jwt
    let jwt = null
    const user = window.localStorage.getItem('user')
    if (user !== null && JSON.parse(user).loggedIn) {
        jwt = JSON.parse(user).jwt
    }

    useEffect(() => {

        const getMessages = async () => {
            if (method === 'POST' && (!message || message === null)) {
                setState({ type: 'error', data: 'no message' })
            } else if (!jwt) {
                setState({ type: 'loading', data: 'jwt not yet available' })
            } else {
                try {
                    const res = await fetch(url, {
                        method,
                        headers: new Headers({
                            'Authorization': `Bearer ${jwt}`,
                            'Content-Type': 'application/json'
                        }),
                        body: message || undefined
                    })
                    // catch serverside errors
                    if (res.status === 500) {
                        // often not JSON
                        setState({ type: 'error', data: `${res.status} error` })
                    } else if (res.status === 401) {
                        // catch JWT errors
                        try {
                            const data = await res.json()
                            if (data.message === 'UnauthorizedError') {
                                setState({ type: 'JWT invalid', data: `${res.status} error` })
                            } else {
                                throw new Error('Not JWT Error')
                            }
                        } catch {
                            setState({ type: 'error', data: `${res.status} error` })
                        }
                    } else {
                        // success!
                        const data = await res.json()
                        setState({ type: 'success', data })
                    }
                } catch (e) {
                    console.error('Fetch error')
                    console.error(e)
                    setState({ type: 'error', data: e.message })
                }
            }
        }

        getMessages()
    }, [url, method, message, jwt])

    return state
}

// wrappers

export const useMessages = (channel, offset) => {
    return useFetch('/api/messages/get', 'POST', JSON.stringify({ channel, offset }))
}

export const useServers = () => {
    return useFetch('/api/servers/get', 'GET')
}

export const useJoinServer = server => {
    return useFetch('/api/servers/join', 'POST', server ? JSON.stringify({ server }) : null)
}

export const useCreateServer = server => {
    return useFetch('/api/servers/create', 'POST', server ? JSON.stringify({ server }) : null)
}

export const useSearch = (server, search) => {
    return useFetch('/api/search', 'POST', server.selected ? JSON.stringify({ server: server.data.id, search }) : null)
}

export const useChannels = server => {
    return useFetch('/api/channels/get', 'POST', server.selected ? JSON.stringify({ server: server.data.id }) : null)
}

export const useCheck = () => {
    return useFetch('/api/checkJWT', 'GET')
}
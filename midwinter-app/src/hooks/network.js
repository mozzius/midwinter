import { useState, useEffect } from 'react'


export const useFetch = (url, method, message) => {
    const [state, setState] = useState({ type: 'loading', data: null })


    useEffect(() => {

        const getMessages = async () => {
            // get jwt
            let jwt
            const user = window.localStorage.getItem('user')
            if (user && JSON.parse(user).loggedIn) {
                jwt = JSON.parse(user).jwt
            } else {
                jwt = null
            }

            if (method === 'POST' && !message) {
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
                        setState({ type: 'error', data: `${res.status} error` })
                        // catch JWT errors
                    } else if (res.status === 401) {
                        const data = await res.json()
                        if (data.message === 'UnauthorizedError') {
                            setState({ type: 'JWT invalid', data: `${res.status} error` })
                        }
                    } else {
                        const data = await res.json()
                        setState({ type: 'success', data })
                    }
                } catch (e) {
                    console.error(e)
                    setState({ type: 'error', data: e })
                }
            }
        }

        getMessages()
    }, [url, method, message])

    return state
}

// wrappers

export const useMessages = (channel, offset) => {
    return useFetch('/api/messages/get', 'POST', JSON.stringify({ channel, offset }))
}

export const useServers = () => {
    return useFetch('/api/servers/get', 'GET')
}

export const useSearch = (search) => {
    return useFetch('/api/search', 'POST', JSON.stringify({ search }))
}

export const useChannels = user => {
    return useFetch('/api/channels/get', 'GET')
}

export const useCheck = () => {
    return useFetch('/api/checkJWT', 'GET')
}
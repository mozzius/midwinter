import React from 'react'

const ServerContext = React.createContext({selected: false})

export const ServerProvider = ServerContext.Provider
export default ServerContext
import React from 'react'

const UserContext = React.createContext({loggedIn: false})

export const UserProvider = UserContext.Provider
export default UserContext
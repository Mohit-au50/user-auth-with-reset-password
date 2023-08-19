import { createContext, useState } from "react"

export const UserContext = createContext()

export const UserContextProvider = ({ children }) => {
    const [loggedInUser, setLoggedInUser] = useState(null)

    return (
        <UserContext.Provider value={{ loggedInUser, setLoggedInUser }}>
            {children}
        </UserContext.Provider>
    )
}
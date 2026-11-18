import {createContext, useEffect, useState} from 'react'
import {jwtDecode} from "jwt-decode";
import {api} from "../api.js";


export const UserContext = createContext(null)



export function UserProvider({children}) {

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const token = localStorage.getItem("access") || null
    const user_id  = null
    async function fetchUser() {
        setLoading(true);
        try{
            api.get("users/" + user_id).then((response) => {
                setUser(response.data);
            })

        }catch(err){
            console.log(err);
        }finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if(token){
            fetchUser();
        }
    }, [])


    return (
        <UserContext.Provider value={{user: user}}>
            {children}
        </UserContext.Provider>
    );
}

export default UserContext;
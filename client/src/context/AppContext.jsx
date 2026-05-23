import React,{ createContext, useContext, useState } from "react";
const Ctx = createContext(null);
export function AppProvider({children}){
  const [user,setUser] = useState(null);
  const login = ({username,avatar}) => setUser({username:username.trim(),avatar});
  return <Ctx.Provider value={{user,login}}>{children}</Ctx.Provider>;
}
export const useApp = () => useContext(Ctx);

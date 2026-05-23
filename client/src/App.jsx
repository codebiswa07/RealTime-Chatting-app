import React from "react";
import { AppProvider, useApp } from "./context/AppContext.jsx";
import LoginScreen from "./components/LoginScreen.jsx";
import ChatShell   from "./components/ChatShell.jsx";
function Inner(){ const{user}=useApp(); return user?<ChatShell/>:<LoginScreen/>; }
export default function App(){ return <AppProvider><Inner/></AppProvider>; }

import { useEffect, useRef, useCallback, useReducer } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:4000";

const initState = {
  connected:false, me:null,
  rooms:[], channelMessages:{}, channelMembers:{},
  onlineUsers:[], dmConversations:{}, dmMessages:{},
  activeView:null,
  typingMap:{},
  notifications:[],
  unreadDMs:{},
};

function reducer(state, action) {
  switch(action.type) {
    case "CONNECTED":       return { ...state, connected:true };
    case "DISCONNECTED":    return { ...state, connected:false };
    case "INIT":            return { ...state, ...action.payload, connected:true };
    case "ROOMS_UPDATED":   return { ...state, rooms:action.payload };
    case "SET_VIEW":        return { ...state, activeView:action.payload };
    case "CHANNEL_HISTORY": return { ...state,
      channelMessages:{ ...state.channelMessages, [action.roomId]:action.messages },
      channelMembers:{ ...state.channelMembers, [action.roomId]:action.members } };
    case "CHANNEL_MEMBERS": return { ...state,
      channelMembers:{ ...state.channelMembers, [action.roomId]:action.members } };
    case "CHANNEL_MSG": {
      const prev = state.channelMessages[action.roomId] || [];
      return { ...state, channelMessages:{ ...state.channelMessages, [action.roomId]:[...prev,action.message] } };
    }
    case "DM_HISTORY":
      return { ...state,
        dmMessages:{ ...state.dmMessages, [action.targetId]:action.messages },
        dmConversations:{ ...state.dmConversations, [action.targetId]:action.target },
        unreadDMs:{ ...state.unreadDMs, [action.targetId]:0 } };
    case "DM_MSG_NEW": {
      const prev = state.dmMessages[action.targetId] || [];
      const isActive = state.activeView?.type==="dm" && state.activeView?.id===action.targetId;
      const unread = action.isMine || isActive ? 0 : (state.unreadDMs[action.targetId]||0)+1;
      return { ...state,
        dmMessages:{ ...state.dmMessages, [action.targetId]:[...prev,action.message] },
        unreadDMs:{ ...state.unreadDMs, [action.targetId]:action.isMine?0:unread } };
    }
    case "DM_READ": {
      const msgs = (state.dmMessages[action.targetId]||[]).map(m =>
        m.id===action.messageId ? { ...m, readBy:[...new Set([...m.readBy,action.by])] } : m);
      return { ...state, dmMessages:{ ...state.dmMessages, [action.targetId]:msgs } };
    }
    case "USER_ONLINE": {
      const exists = state.onlineUsers.find(u=>u.id===action.user.id);
      return { ...state, onlineUsers:exists?state.onlineUsers:[...state.onlineUsers,action.user] };
    }
    case "USER_OFFLINE":  return { ...state, onlineUsers:state.onlineUsers.filter(u=>u.id!==action.id) };
    case "USER_STATUS":   return { ...state, onlineUsers:state.onlineUsers.map(u=>u.id===action.id?{...u,status:action.status}:u) };
    case "TYPING": {
      const key = action.context.type==="channel"?`ch:${action.context.id}`:`dm:${action.context.id}`;
      const current = state.typingMap[key] || [];
      const next = action.isTyping
        ? [...new Set([...current,action.username])]
        : current.filter(u=>u!==action.username);
      return { ...state, typingMap:{ ...state.typingMap, [key]:next } };
    }
    case "ADD_NOTIF":    return { ...state, notifications:[...state.notifications,action.notif] };
    case "DEL_NOTIF":    return { ...state, notifications:state.notifications.filter(n=>n.id!==action.id) };
    case "CLEAR_UNREAD": return { ...state, unreadDMs:{ ...state.unreadDMs, [action.targetId]:0 } };
    case "DM_CONV_ADD":  return { ...state, dmConversations:{ ...state.dmConversations, [action.targetId]:action.user } };
    default: return state;
  }
}

export function useSocket(user) {
  const [state, dispatch] = useReducer(reducer, initState);
  const socketRef = useRef(null);
  const typingTimers = useRef({});

  useEffect(() => {
    if (!user) return;
    const socket = io(SOCKET_URL, { transports:["websocket"] });
    socketRef.current = socket;

    socket.on("connect",    ()=>dispatch({type:"CONNECTED"}));
    socket.on("disconnect", ()=>dispatch({type:"DISCONNECTED"}));

    socket.on("init", payload => dispatch({type:"INIT",payload:{
      me:payload.me, rooms:payload.rooms, onlineUsers:payload.onlineUsers
    }}));

    socket.on("rooms:updated",       rooms  => dispatch({type:"ROOMS_UPDATED",payload:rooms}));
    socket.on("user:online",         user   => dispatch({type:"USER_ONLINE",user}));
    socket.on("user:offline",        ({id}) => dispatch({type:"USER_OFFLINE",id}));
    socket.on("user:status:update",  ({id,status}) => dispatch({type:"USER_STATUS",id,status}));

    socket.on("channel:history", ({roomId,messages,members}) =>
      dispatch({type:"CHANNEL_HISTORY",roomId,messages,members}));
    socket.on("channel:members", ({roomId,members}) =>
      dispatch({type:"CHANNEL_MEMBERS",roomId,members}));
    socket.on("message:new", ({roomId,message}) =>
      dispatch({type:"CHANNEL_MSG",roomId,message}));

    socket.on("dm:history", ({targetId,messages,target}) =>
      dispatch({type:"DM_HISTORY",targetId,messages,target}));
    socket.on("dm:message:new", ({targetId,message}) => {
      const isMine = message.userId===socket.id;
      dispatch({type:"DM_MSG_NEW",targetId,message,isMine});
    });
    socket.on("dm:read", ({by,targetId,messageId}) =>
      dispatch({type:"DM_READ",targetId,by,messageId}));

    socket.on("dm:notification", ({from,preview,timestamp}) => {
      const id = Date.now().toString();
      dispatch({type:"ADD_NOTIF",notif:{id,from,preview,timestamp}});
      setTimeout(()=>dispatch({type:"DEL_NOTIF",id}),5000);
    });

    socket.on("typing:update", ({context,userId,username,isTyping}) => {
      const key = context.type==="channel"?`ch:${context.id}`:`dm:${context.id}`;
      clearTimeout(typingTimers.current[key+userId]);
      dispatch({type:"TYPING",context,username,isTyping});
      if (isTyping) {
        typingTimers.current[key+userId] = setTimeout(()=>
          dispatch({type:"TYPING",context,username,isTyping:false}), 3000);
      }
    });

    socket.emit("user:register", {username:user.username, avatar:user.avatar});
    return () => { socket.disconnect(); socketRef.current=null; };
  }, [user]);

  const joinChannel    = useCallback(roomId => {
    dispatch({type:"SET_VIEW",payload:{type:"channel",id:roomId}});
    socketRef.current?.emit("channel:join",roomId);
  },[]);

  const openDM = useCallback(targetUser => {
    dispatch({type:"SET_VIEW",payload:{type:"dm",id:targetUser.id}});
    dispatch({type:"DM_CONV_ADD",targetId:targetUser.id,user:targetUser});
    dispatch({type:"CLEAR_UNREAD",targetId:targetUser.id});
    socketRef.current?.emit("dm:open",{targetId:targetUser.id});
  },[]);

  const sendChannelMsg = useCallback((roomId,text) => {
    socketRef.current?.emit("channel:message",{roomId,text});
  },[]);

  const sendDM = useCallback((targetId,text) => {
    socketRef.current?.emit("dm:message",{targetId,text});
  },[]);

  const markDMRead = useCallback(targetId => {
    socketRef.current?.emit("dm:markread",{targetId});
    dispatch({type:"CLEAR_UNREAD",targetId});
  },[]);

  const sendTypingStart = useCallback(context => {
    socketRef.current?.emit("typing:start",{context});
  },[]);
  const sendTypingStop  = useCallback(context => {
    socketRef.current?.emit("typing:stop",{context});
  },[]);

  const setStatus = useCallback(status => {
    socketRef.current?.emit("user:status",{status});
  },[]);

  return { state, joinChannel, openDM, sendChannelMsg, sendDM, markDMRead, sendTypingStart, sendTypingStop, setStatus };
}

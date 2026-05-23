require("dotenv").config();
const express        = require("express");
const http           = require("http");
const cors           = require("cors");
const { Server }     = require("socket.io");
const { v4: uuidv4 } = require("uuid");

const app    = express();
const server = http.createServer(app);
const io     = new Server(server, {
  cors: { origin: process.env.CLIENT_ORIGIN || "http://localhost:5173", methods: ["GET","POST"] }
});

app.use(cors({ origin: process.env.CLIENT_ORIGIN }));
app.use(express.json());

const CHANNELS = [
  { id:"general",  name:"# general",  description:"Main chat for everyone" },
  { id:"random",   name:"# random",   description:"Anything goes" },
  { id:"dev-talk", name:"# dev-talk", description:"Code & tech discussions" },
  { id:"design",   name:"# design",   description:"UI/UX & product design" },
];

const rooms = new Map();
const users = new Map();
const dms   = new Map();

CHANNELS.forEach(c => rooms.set(c.id, { ...c, messages:[], members: new Set() }));

const dmKey    = (a, b) => [a,b].sort().join(":");
const buildMsg = (user, text, type="text", extra={}) => ({
  id: uuidv4(), userId: user.id, username: user.username,
  avatar: user.avatar, text, type,
  timestamp: new Date().toISOString(), readBy: [], ...extra
});
const roomSummary  = () => [...rooms.values()].map(r => ({
  id: r.id, name: r.name, description: r.description, memberCount: r.members.size
}));
const onlineUsers  = () => [...users.values()].map(u => ({
  id: u.id, socketId: u.socketId, username: u.username, avatar: u.avatar, status: u.status
}));

app.get("/api/health", (_, res) => res.json({ ok: true }));
app.get("/api/rooms",  (_, res) => res.json(roomSummary()));

io.on("connection", socket => {
  console.log(`[+] ${socket.id}`);

  socket.on("user:register", ({ username, avatar }) => {
    const user = {
      id: socket.id, socketId: socket.id,
      username: (username||"Anon").trim().slice(0,20),
      avatar: avatar || `https://api.dicebear.com/8.x/bottts/svg?seed=${socket.id}`,
      status: "online", activeConversation: null
    };
    users.set(socket.id, user);
    socket.emit("init", { me: user, rooms: roomSummary(), onlineUsers: onlineUsers() });
    socket.broadcast.emit("user:online", {
      id: user.id, socketId: socket.id,
      username: user.username, avatar: user.avatar, status: "online"
    });
    console.log(`  registered: ${user.username}`);
  });

  socket.on("channel:join", roomId => {
    const user = users.get(socket.id);
    if (!user) return;
    [...rooms.values()].forEach(r => {
      if (r.members.has(socket.id)) {
        socket.leave(r.id);
        r.members.delete(socket.id);
        const sys = buildMsg({ id:"system", username:"System", avatar:"" }, `${user.username} left.`, "system");
        r.messages.push(sys);
        socket.to(r.id).emit("message:new", { roomId: r.id, message: sys });
      }
    });
    const room = rooms.get(roomId);
    if (!room) return socket.emit("error", "Room not found");
    socket.join(roomId);
    room.members.add(socket.id);
    user.activeConversation = { type:"channel", id: roomId };
    socket.emit("channel:history", {
      roomId, messages: room.messages.slice(-100),
      members: [...room.members].map(id => users.get(id)).filter(Boolean)
    });
    const sys = buildMsg({ id:"system", username:"System", avatar:"" }, `${user.username} joined.`, "system");
    room.messages.push(sys);
    socket.to(roomId).emit("message:new", { roomId, message: sys });
    io.to(roomId).emit("channel:members", { roomId, members: [...room.members].map(id => users.get(id)).filter(Boolean) });
    io.emit("rooms:updated", roomSummary());
  });

  socket.on("channel:message", ({ roomId, text }) => {
    const user = users.get(socket.id);
    if (!user || !text?.trim()) return;
    const room = rooms.get(roomId);
    if (!room || !room.members.has(socket.id)) return;
    const msg = buildMsg(user, text.trim());
    room.messages.push(msg);
    io.to(roomId).emit("message:new", { roomId, message: msg });
  });

  socket.on("dm:open", ({ targetId }) => {
    const user   = users.get(socket.id);
    const target = users.get(targetId);
    if (!user || !target || targetId === socket.id) return;
    const key  = dmKey(socket.id, targetId);
    if (!dms.has(key)) dms.set(key, { messages:[], readBy:{} });
    const conv = dms.get(key);
    user.activeConversation = { type:"dm", id: targetId };
    conv.messages.forEach(m => { if (!m.readBy.includes(socket.id)) m.readBy.push(socket.id); });
    socket.emit("dm:history", {
      targetId, messages: conv.messages.slice(-100),
      target: { id: target.id, username: target.username, avatar: target.avatar, status: target.status }
    });
    const lastMsg = conv.messages[conv.messages.length - 1];
    if (lastMsg && lastMsg.userId === targetId) {
      io.to(targetId).emit("dm:read", { by: socket.id, targetId: socket.id, messageId: lastMsg.id });
    }
  });

  socket.on("dm:message", ({ targetId, text }) => {
    const user   = users.get(socket.id);
    const target = users.get(targetId);
    if (!user || !text?.trim()) return;
    const key  = dmKey(socket.id, targetId);
    if (!dms.has(key)) dms.set(key, { messages:[], readBy:{} });
    const conv = dms.get(key);
    const msg = buildMsg(user, text.trim(), "text", { readBy: [socket.id] });
    conv.messages.push(msg);
    socket.emit("dm:message:new", { targetId, message: msg });
    if (target) {
      io.to(targetId).emit("dm:message:new", { targetId: socket.id, message: msg });
      if (target.activeConversation?.type === "dm" && target.activeConversation?.id === socket.id) {
        msg.readBy.push(targetId);
        socket.emit("dm:read", { by: targetId, targetId, messageId: msg.id });
      } else {
        io.to(targetId).emit("dm:notification", {
          from: { id: user.id, username: user.username, avatar: user.avatar },
          preview: text.trim().slice(0,60),
          timestamp: msg.timestamp
        });
      }
    }
  });

  socket.on("dm:markread", ({ targetId }) => {
    const key  = dmKey(socket.id, targetId);
    const conv = dms.get(key);
    if (!conv) return;
    conv.messages.forEach(m => { if (!m.readBy.includes(socket.id)) m.readBy.push(socket.id); });
    const last = conv.messages[conv.messages.length - 1];
    if (last) io.to(targetId).emit("dm:read", { by: socket.id, targetId: socket.id, messageId: last.id });
  });

  socket.on("typing:start", ({ context }) => {
    const user = users.get(socket.id);
    if (!user) return;
    if (context.type === "channel") {
      socket.to(context.id).emit("typing:update", { context, userId: socket.id, username: user.username, isTyping: true });
    } else {
      io.to(context.id).emit("typing:update", { context: { type:"dm", id: socket.id }, userId: socket.id, username: user.username, isTyping: true });
    }
  });

  socket.on("typing:stop", ({ context }) => {
    const user = users.get(socket.id);
    if (!user) return;
    if (context.type === "channel") {
      socket.to(context.id).emit("typing:update", { context, userId: socket.id, username: user.username, isTyping: false });
    } else {
      io.to(context.id).emit("typing:update", { context: { type:"dm", id: socket.id }, userId: socket.id, username: user.username, isTyping: false });
    }
  });

  socket.on("user:status", ({ status }) => {
    const user = users.get(socket.id);
    if (!user) return;
    user.status = status;
    io.emit("user:status:update", { id: socket.id, status });
  });

  socket.on("disconnect", () => {
    const user = users.get(socket.id);
    if (user) {
      [...rooms.values()].forEach(r => {
        if (r.members.has(socket.id)) {
          r.members.delete(socket.id);
          const sys = buildMsg({ id:"system", username:"System", avatar:"" }, `${user.username} disconnected.`, "system");
          r.messages.push(sys);
          socket.to(r.id).emit("message:new", { roomId: r.id, message: sys });
          io.to(r.id).emit("channel:members", { roomId: r.id, members: [...r.members].map(id => users.get(id)).filter(Boolean) });
        }
      });
      io.emit("user:offline", { id: socket.id });
      users.delete(socket.id);
      io.emit("rooms:updated", roomSummary());
    }
    console.log(`[-] ${socket.id}`);
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`\n🚀  Server → http://localhost:${PORT}\n`));

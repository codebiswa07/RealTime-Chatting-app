# RealChat — Real-Time Messaging App

> > Full-featured, fully-responsive chat with **channels**, **1-to-1 DMs**, read receipts, live presence, typing indicators, toast notifications, and mobile sidebar support.

---

**COMPANY**: *CODTECH IT SOLUTION*

**NAME**: *Biswaprakash Sahoo*

**INTERN ID**: *CTIS9533*

**DOMAIN**: *Mern Stack Web Development*

**DURATION**: *6 Weeks*

**MENTOR**: *Neela Santhosh Kumar*

<img width="946" height="473" alt="Image" src="https://github.com/user-attachments/assets/3a3fb6f6-d0e9-408e-9f55-ccebbc743ad5" />


## ✨ Features

| Feature | Detail |
|---|---|
| Group Channels | #general, #random, #dev-talk, #design |
| 1-to-1 Direct Messages | Click any online user in sidebar to start private chat |
| Read Receipts | "✓ Sent" → "✓✓ Read" in DMs |
| Live Presence | Online / Away / Busy / Invisible with colour-coded dots |
| Typing Indicators | Per-channel and per-DM animated dots with names |
| Unread Badges | Red badge count on DM sidebar entries |
| Toast Notifications | Pop-up alerts when a DM arrives and chat isn't active |
| Message History | Last 100 messages loaded on room/DM open |
| Avatar Picker | 10 DiceBear styles with random seed |
| Responsive Design | Full Tailwind CSS — works on mobile, tablet, desktop |
| Mobile Sidebar | Hamburger menu with overlay drawer on small screens |
| Status Picker | Click your avatar row to change status |
| System Messages | Join/leave/disconnect events as chat notices |
| Date Grouping | Messages grouped by date with dividers |
| Dark Theme | Deep dark UI with CSS variable design tokens |
| Font Stack | Plus Jakarta Sans + JetBrains Mono |
| Live / Offline Badge | Green LIVE or red OFF indicator in sidebar |

---

## 🗂 Project Structure

```
realtime-chat/
├── package.json                ← root (concurrently dev script)
├── Procfile                    ← for Railway / Render deployment
├── .gitignore
├── README.md
├── server/
│   ├── package.json
│   ├── .env
│   └── src/
│       └── index.js            ← Express + Socket.IO
└── client/
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js      ← design tokens
    ├── postcss.config.js
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── index.css
        ├── context/
        │   └── AppContext.jsx
        ├── hooks/
        │   └── useSocket.js    ← all socket logic + useReducer state
        ├── utils/
        │   └── time.js
        └── components/
            ├── LoginScreen.jsx    ← avatar picker + username form
            ├── ChatShell.jsx      ← layout + mobile sidebar toggle
            ├── Sidebar.jsx        ← channels + DM list + status picker
            ├── ChannelView.jsx
            ├── DMView.jsx         ← private 1-to-1 chat
            ├── MessageList.jsx    ← date grouping, read receipts, typing
            ├── MessageInput.jsx   ← textarea, typing events, send button
            ├── NotifToast.jsx     ← DM notification pop-up
            └── EmptyState.jsx     ← welcome / no-selection screen```

---

## 🚀 Quick Start

### Prerequisites
- Node.js ≥ 18
- npm ≥ 9

### 1 · Install & run (both servers)

```bash
# From the project root
npm run dev
```

This starts:
- **Server** → http://localhost:4000
- **Client** → http://localhost:5173

### 2 · Open in browser

Navigate to **http://localhost:5173**, pick a username and avatar, then select a channel.

---

## ⚙️ Configuration

Edit `server/.env`:

```env
PORT=4000
CLIENT_ORIGIN=http://localhost:5173
```

---

## 🔌 Socket.IO Event Reference

### Client → Server

| Event | Payload | Description |
|---|---|---|
| `user:join` | `{ username, avatar }` | Register on connect |
| `room:join` | `roomId: string` | Join a room |
| `message:send` | `{ text }` | Send a message |
| `typing:start` | — | Notify typing started |
| `typing:stop` | — | Notify typing stopped |

### Server → Client

| Event | Payload | Description |
|---|---|---|
| `rooms:list` | `Room[]` | Full list on connect |
| `rooms:updated` | `Room[]` | Broadcast on membership change |
| `room:history` | `Message[]` | Last 100 msgs on join |
| `message:new` | `Message` | Broadcast new message |
| `room:members` | `User[]` | Member list update |
| `typing:update` | `{ userId, username, isTyping }` | Typing state update |

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite |
| Backend | Node.js, Express 4 |
| Real-time | Socket.IO 4 |
| Styling | Pure CSS-in-JS, CSS variables |
| Fonts | Syne (Google Fonts), DM Mono |
| Avatars | DiceBear API |

---

## 📝 License

MIT
#

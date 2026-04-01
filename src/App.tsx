import { HashRouter, Route, Routes } from 'react-router-dom'
import { Landing } from './pages/Landing'
import { CreateRoom } from './pages/CreateRoom'
import { JoinRoom } from './pages/JoinRoom'
import { ShareCode } from './pages/ShareCode'
import { ChatRoom } from './pages/ChatRoom'
import { RoomStats } from './pages/RoomStats'
import { WallOfFame } from './pages/WallOfFame'

export function App() {
  return (
    <HashRouter>
      <div className="app-bg" style={{ minHeight: '100dvh' }}>
        <div className="phone-container">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/create" element={<CreateRoom />} />
            <Route path="/join" element={<JoinRoom />} />
            <Route path="/join/:code" element={<JoinRoom />} />
            <Route path="/room/:code/share" element={<ShareCode />} />
            <Route path="/room/:code/stats" element={<RoomStats />} />
            <Route path="/room/:code/wall-of-fame" element={<WallOfFame />} />
            <Route path="/room/:code" element={<ChatRoom />} />
          </Routes>
        </div>
      </div>
    </HashRouter>
  )
}

export default App

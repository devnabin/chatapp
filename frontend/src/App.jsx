import {
  Routes,
  Route
} from 'react-router-dom'


import Home from './components/Home'
import Register from './components/Register'
import Login from './components/Login'
import Chat from './components/Chat/Chat'
import ProtectedRoute from './components/ProtecterdRoute'


function App() {
  return (
    <div>
   <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/chat/:username" element={<Chat />} />
        {/* <Route element={<ProtectedRoute />}>
                <Route path="/chat/:username" element={<Chat />} />
        </Route> */}
    </Routes>
    </div>
  )
}

export default App

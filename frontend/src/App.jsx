import {
  Routes,
  Route
} from 'react-router-dom'


import Home from './components/Home'
import Register from './components/Register'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import ProtectedRoute from './components/ProtecterdRoute'


function App() {
  return (
    <div>
   <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home/:username" element={<Dashboard />} />
        {/* <Route element={<ProtectedRoute />}>
                <Route path="/home/:username" element={<Dashboard />} />
        </Route> */}
    </Routes>
    </div>
  )
}

export default App

//router
import {
  Routes,
  Route
} from 'react-router-dom'


import Home from './components/Home'
import Register from './components/Register'
import Login from './components/Login'
import Dashboard from './components/Dashboard'


function App() {
  return (
    <div>
   <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home/:username" element={<Dashboard />} />
    </Routes>
    </div>
  )
}

export default App

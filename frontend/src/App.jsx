//router
import {
  Routes,
  Route
} from 'react-router-dom'


import Home from './components/Home'
import Register from './components/Register'


function App() {
  return (
    <div>
   <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
    </Routes>
    </div>
  )
}

export default App

import './App.css'
import { AuthProvider } from './contexts/AuthContext'
import Authentication from './pages/Authentication'
import Landing from './pages/Landing'
import { Route, BrowserRouter as Router, Routes } from "react-router-dom"
import VideoMeet from './pages/VideoMeet'
import HomeComponent from './pages/home'
import History from './pages/history'


function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path='/' element={<Landing />} />
          <Route path='/auth' element={<Authentication />} />
          <Route path='/:url' element={<VideoMeet/>}></Route>
          <Route path='/home' element={<HomeComponent/>}></Route>
          <Route path='/history' element={<History/>}></Route>
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App


import './App.css'
import {BrowserRouter, Routes, Route} from 'react-router-dom'
import Homepage from './pages/Homepage'
import VideoCall from './pages/VideoCall'
import JoinCall from './pages/JoinCall'
import StartCall from './pages/StartCall'


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Homepage/>}/>
        <Route path='/video-call' element = {<VideoCall/>}/>
        <Route path='/join-call' element = {<JoinCall/>}/>
        <Route path='/start-call' element = {<StartCall/>}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App

import { useNavigate } from 'react-router-dom'
const VideoCall = () => {

  const navigate = useNavigate()

  const handleCallerClick = () => {
    navigate('/start-call')
  }

  const handleReceiverClick = () => {
    navigate('/join-call')
  }

  return (
    <>
      <div className='mb-10'>
        <h1 className='mb-3'>Welcome to the Video Call Demo</h1>
        <p>Choose what you want to do</p>
      </div>

      <div className='flex flex-col space-y-2'>
        <button onClick={()=>handleCallerClick()}>CREATE MEETING ROOM</button>
        <button onClick={()=>handleReceiverClick()}>JOIN CALL</button>
      </div>
    </>
    
  )
}

export default VideoCall
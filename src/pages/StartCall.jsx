import {useState} from 'react'
import Caller from '../components/Caller'

const StartCall = () => {
  const [isActiveCall, setIsActiveCall] = useState(false)

  return (
    <>
      {isActiveCall ? (
        <>
          <Caller/>
          <button onClick={()=>{setIsActiveCall(false)}}>End Call</button>
        </>
        
        ):(
        
        <div className='flex flex-col min-w-80' >
          <h2 className='my-3 text-xl'>YOU&apos;RE THE MEETING HOST</h2>
          <input className='border-2 rounded-lg mb-3 font-medium p-3' placeholder='Input your Name'/>
          <input className='border-2 rounded-lg mb-3 font-medium p-3' placeholder='Input Call Code'/>
          <button onClick={()=>{setIsActiveCall(true)}}>Start Call</button>
        </div> 
  
      )}
    </>
    

  )
}

export default StartCall
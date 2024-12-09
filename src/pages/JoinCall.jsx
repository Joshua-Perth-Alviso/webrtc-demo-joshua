import {useState} from 'react'
import Receiver from '../components/Receiver'
const JoinCall = () => {

  const [isActiveCall, setIsActiveCall] = useState(false)


  return (

    <>

    {isActiveCall ? (
      <>
        <Receiver/>
        <button onClick={()=>{setIsActiveCall(false)}}>End Call</button>
      </>
      
    ):(
      <div className='flex flex-col min-w-80' >
      <h2 className='my-3 text-xl'>YOU&apos;RE JOINING A CALL</h2>
      <input className='border-2 rounded-lg mb-3 font-medium p-3' placeholder='Input your Name'/>
      <input className='border-2 rounded-lg mb-3 font-medium p-3' placeholder='Input Call Code'/>
      <button onClick={()=>{setIsActiveCall(true)}}>Join Call</button>
    </div>
    )}
    
    </>

  )
}

export default JoinCall
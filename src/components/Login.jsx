import { useNavigate } from 'react-router-dom'

const Login = () => {

  const navigate = useNavigate()

  const handleClick = () => {
    let path = '/video-call'
    navigate(path)
  }

  
  return (
    <div className='mt-9 p-10 border-2 rounded-lg'>
    <form>
      <div className='mb-3'>
        <label className='mx-2'>Email: </label>
        <input placeholder='Enter your email'/>
      </div>

      <div>
        <label className='mx-2'>Password: </label>
        <input placeholder='Enter your Password'/>
      </div>

      <div>
        <button 
          className='mt-3'
          onClick={()=>{handleClick()}}
        >Log in</button>
      </div>
    </form>
  </div>
  )
}

export default Login
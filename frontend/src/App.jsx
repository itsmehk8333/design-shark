import React, { useEffect } from 'react'
import RouteComponent from './routes/RouteComponent'
import Navbar from './component/Navabar'
import protectedAPI, { authAPI } from './auth/auth.instance'

function App() {

  useEffect(() => {
    console.log('App.js')
    const token = localStorage.getItem('token')
    if (token) {
      protectedAPI.defaults.headers.Authorization = `Bearer ${token}`;
      protectedAPI.post("/auth/verify-token").then((response) => {
        if(response.isValid == false){
          localStorage.clear();
          window.location.href = '/login';
        }
      }).catch((error) => {
        console.log(error)
      }
      )
    }

  }, [])

  return (
    <div>
      {/* <SignUp /> */}
      {/* <Login /> */}
      <Navbar />
      <RouteComponent />
    </div>
  )
}

export default App
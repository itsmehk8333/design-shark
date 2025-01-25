import React, { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import RouteComponent from './routes/RouteComponent'
import Navbar from './component/Navabar'
import protectedAPI from './auth/auth.instance'

function App() {
  const location = useLocation();
  
  // Define public routes where navbar should be hidden
  const publicRoutes = ['/login', '/register'];
  const showNavbar = !publicRoutes.includes(location.pathname);

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
      })
    }
  }, [])

  return (
    <div>
      {showNavbar && <Navbar />}
      <RouteComponent />
    </div>
  )
}

export default App
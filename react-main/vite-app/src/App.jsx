import heroImg from './assets/hero.png'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import './App.css'
import Home from "./pages/Home"
import About from "./pages/About"
import Users from "./pages/Users"

import { Link, Routes, Route } from 'react-router';
import { Lottie } from 'lottie-react';
import codingAnimation from './assets/laptop-code.json';

function App() {
  return (
    <>
      <section id="center">
        <Lottie src={codingAnimation}
          autoplay
          loop
          style={{ width: 300, height: 190}}/>
        
        <div>
          <nav style={{display:'flex', gap:'15px', justifyContent:'center'}}>
            <Link to="/">Home</Link>
            <Link to="/About">About</Link>
            <Link to="/Users">Users</Link>
          </nav>

          <div>
            <h1>Gotten Started!</h1>
            <br></br>
          </div>

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/users" element={<Users />} />
          </Routes>
        </div>


      </section>

    </>
  )
}

export default App

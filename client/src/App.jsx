import React from 'react';
import { BrowserRouter as Router,Route,Routes } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage/>}/>
        <Route path="/register" element={<Register/>}/>
        <Route path="/login" element={<Login/>}/>
        <Route path="/dashboard/:userId/*" element={<Dashboard/>} />
      </Routes>
    </Router>
  )
}

export default App

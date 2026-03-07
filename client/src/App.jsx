import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import PostError from './pages/PostError';
import QuestionDetail from './pages/QuestionDetail';

// Placeholder Pages
const Profile = () => <div className="container mt-8 animate-fade-in"><h2>Profile</h2></div>;

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/post-error" element={<PostError />} />
            <Route path="/error/:id" element={<QuestionDetail />} />
            <Route path="/question/:id" element={<QuestionDetail />} />
            <Route path="/profile/:id" element={<Profile />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;

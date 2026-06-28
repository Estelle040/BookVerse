import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Books from './pages/Books';
import Clubs from './pages/Clubs';
import Votes from './pages/Votes';
import Meetings from './pages/Meetings';
import Discussions from './pages/Discussions';
import Progress from './pages/Progress';

const App: React.FC = () => {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/books" element={<Books />} />
                <Route path="/clubs" element={<Clubs />} />
                <Route path="/votes" element={<Votes />} />
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/meetings" element={<Meetings />} />
                <Route path="/discussions" element={<Discussions />} />
                <Route path="/progress" element={<Progress />} />
            </Routes>
        </Router>
    );
};

export default App;
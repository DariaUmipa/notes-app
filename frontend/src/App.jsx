import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import API from './services/api';
import './App.css';

import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import HomePage from './components/HomePage';
import NotesListPage from './components/NotesListPage';
import NoteFormPage from './components/NoteFormPage';
import NoteDetailPage from './components/NoteDetailPage';
import StatisticsPage from './components/StatisticsPage';
import NoteConfirmDeletePage from './components/NoteConfirmDeletePage';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [username, setUsername] = useState('');
    const [message, setMessage] = useState({ text: '', type: '' });

    const showMessage = (text, type) => {
        setMessage({ text, type });
        setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    };

    const checkAuth = async () => {
        try {
            const response = await API.get('check-auth/');
            setIsAuthenticated(response.data.authenticated);
            setUsername(response.data.username || '');
        } catch {
            setIsAuthenticated(false);
            setUsername('');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    const handleLogout = async () => {
        await API.get('logout/');
        setIsAuthenticated(false);
        setUsername('');
        showMessage('Вы вышли из системы', 'info');
    };

    if (loading) return <div className="loading">Загрузка...</div>;

    return (
        <Router>
            <div className="app-wrapper">
                <nav className="navbar">
                    <div className="container">
                        <Link to="/" className="logo">📝 Мои Заметки</Link>
                        {isAuthenticated ? (
                            <ul className="nav-menu">
                                <li><Link to="/notes">Мои заметки</Link></li>
                                <li><Link to="/notes/new">Новая заметка</Link></li>
                                <li><Link to="/statistics">Статистика</Link></li>
                                <li className="user-info">
                                    <span> {username}</span>
                                    <button onClick={handleLogout} className="logout-btn">Выйти</button>
                                </li>
                            </ul>
                        ) : (
                            <ul className="nav-menu">
                                <li><Link to="/login">Войти</Link></li>
                                <li><Link to="/register">Регистрация</Link></li>
                            </ul>
                        )}
                    </div>
                </nav>
                
                <main className="main-content">
                    <div className="container">
                        {message.text && (
                            <div className={`alert alert-${message.type}`}>
                                {message.text}
                            </div>
                        )}
                        
                        <Routes>
                            <Route path="/" element={<HomePage isAuthenticated={isAuthenticated} />} />
                            <Route path="/login" element={
                                isAuthenticated ? <Navigate to="/notes" /> : <LoginPage onLogin={checkAuth} showMessage={showMessage} />
                            } />
                            <Route path="/register" element={
                                isAuthenticated ? <Navigate to="/notes" /> : <RegisterPage onLogin={checkAuth} showMessage={showMessage} />
                            } />
                            <Route path="/notes" element={
                                isAuthenticated ? <NotesListPage showMessage={showMessage} /> : <Navigate to="/login" />
                            } />
                            <Route path="/notes/new" element={
                                isAuthenticated ? <NoteFormPage showMessage={showMessage} /> : <Navigate to="/login" />
                            } />
                            <Route path="/notes/:id" element={
                                isAuthenticated ? <NoteDetailPage /> : <Navigate to="/login" />
                            } />
                            <Route path="/notes/:id/edit" element={
                                isAuthenticated ? <NoteFormPage showMessage={showMessage} /> : <Navigate to="/login" />
                            } />
                            <Route path="/notes/:id/delete" element={
                                isAuthenticated ? <NoteConfirmDeletePage showMessage={showMessage} /> : <Navigate to="/login" />
                            } />
                            <Route path="/statistics" element={
                                isAuthenticated ? <StatisticsPage /> : <Navigate to="/login" />
                            } />
                        </Routes>
                    </div>
                </main>
                
                <footer className="footer">
                    <div className="container">
                        <p>&copy; {new Date().getFullYear()} Приложение для заметок.</p>
                    </div>
                </footer>
            </div>
        </Router>
    );
}

export default App;
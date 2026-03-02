import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import SportPage from './pages/SportPage';
import MatchPage from './pages/MatchPage';
import LeaderboardPage from './pages/LeaderboardPage';
import AboutPage from './pages/AboutPage';
import GalleryPage from './pages/GalleryPage';
import RegistrationsPage from './pages/RegistrationsPage';
import ScoreboardPage from './pages/ScoreboardPage';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import PhysicsBackground from './components/PhysicsBackground';
import { AlertProvider } from './context/AlertContext';
import { useEffect, useState } from 'react';

function App() {
    useEffect(() => {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
        document.body.style.backgroundColor = '#0a0a0a';
    }, []);

    const toggleDarkMode = () => { }; // Disabled for strict dark elite theme

    return (
        <AlertProvider>
            <Router>
                <div className="min-h-screen flex flex-col pt-16">
                    <PhysicsBackground />
                    <Header darkMode={true} toggleDarkMode={toggleDarkMode} />
                    <main className="flex-grow container mx-auto px-4 py-8">
                        <Routes>
                            <Route path="/" element={<HomePage />} />
                            <Route path="/about" element={<AboutPage />} />
                            <Route path="/gallery" element={<GalleryPage />} />
                            <Route path="/register" element={<RegistrationsPage />} />
                            <Route path="/scoreboard" element={<ScoreboardPage />} />
                            <Route path="/leaderboard" element={<LeaderboardPage />} />
                            <Route path="/sport/:sportId" element={<SportPage />} />
                            <Route path="/match/:matchId" element={<MatchPage />} />
                            <Route path="/admin/login" element={<AdminLogin />} />
                            <Route path="/admin/dashboard/*" element={<AdminDashboard />} />
                        </Routes>
                    </main>
                    <Footer />
                </div>
            </Router>
        </AlertProvider>
    );
}

export default App;

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Suspense, lazy, useEffect, useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import PhysicsBackground from './components/PhysicsBackground';
import { AlertProvider } from './context/AlertContext';

const HomePage = lazy(() => import('./pages/HomePage'));
const SportPage = lazy(() => import('./pages/SportPage'));
const MatchPage = lazy(() => import('./pages/MatchPage'));
const LeaderboardPage = lazy(() => import('./pages/LeaderboardPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const GalleryPage = lazy(() => import('./pages/GalleryPage'));
const RegistrationsPage = lazy(() => import('./pages/RegistrationsPage'));
const ScoreboardPage = lazy(() => import('./pages/ScoreboardPage'));
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));

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
                        <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div></div>}>
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
                        </Suspense>
                    </main>
                    <Footer />
                </div>
            </Router>
        </AlertProvider>
    );
}

export default App;

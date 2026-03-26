import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Users, Trophy, ChevronRight, Activity, ArrowLeft } from 'lucide-react';
import SEO from '../components/SEO';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ScoreboardPage = () => {
    const [sports, setSports] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSports = async () => {
            try {
                const { data } = await axios.get(`${API_URL}/sports/stats`);
                setSports(data);
            } catch (error) {
                console.error('Error fetching sports:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchSports();
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.15 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[80vh]">
                <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="relative pt-8 pb-24 overflow-hidden min-h-[80vh]">
            <SEO 
                title="Live Scoreboards | SANKALP Sports Club" 
                description="View live scoreboards, match brackets, and action across all SANKALP sports events in real-time." 
            />
            {/* Background Animations */}
            <div className="fixed inset-0 pointer-events-none -z-10 bg-grid-pattern opacity-30"></div>
            <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-500/10 rounded-full blur-[120px] mix-blend-screen animate-blob"></div>
            <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent-blue/10 rounded-full blur-[120px] mix-blend-screen animate-blob animation-delay-2000"></div>

            <div className="container mx-auto px-4">
                <Link to="/" className="inline-flex items-center text-gray-500 hover:text-primary-600 dark:text-gray-400 font-medium transition mb-8">
                    <ArrowLeft size={20} className="mr-1" /> Back to Home
                </Link>

                <div className="flex justify-between items-end mb-10">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-display font-black uppercase tracking-tight flex items-center text-white">
                            <Activity className="text-accent-blue mr-4" size={40} /> Scoreboard
                        </h1>
                        <p className="text-gray-400 mt-3 tracking-wide text-lg">Select a sport to view live scorecards and match brackets</p>
                    </div>
                </div>

                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                >
                    {sports.map((sport) => (
                        <motion.div key={sport._id} variants={itemVariants}>
                            <Link
                                to={`/sport/${sport._id}`}
                                className="glass-card block group h-full cursor-pointer relative transition-all"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"></div>

                                <div className="p-6 relative z-10">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="p-4 bg-dark-900 rounded-xl border border-white/5 group-hover:border-primary-500/50 group-hover:shadow-[0_0_20px_rgba(250,204,21,0.2)] transition-all duration-300">
                                            <Trophy size={28} className="text-gray-400 group-hover:text-primary-400 transition-colors" />
                                        </div>
                                        {sport.liveCount > 0 && (
                                            <div className="flex items-center space-x-2 bg-red-500/10 border border-red-500/20 px-3 py-1 rounded-full shadow-[0_0_10px_rgba(255,0,0,0.2)]">
                                                <span className="flex h-2 w-2 relative">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                                </span>
                                                <span className="text-xs font-bold tracking-widest text-red-400 uppercase">Live</span>
                                            </div>
                                        )}
                                    </div>
                                    <h2 className="text-2xl font-display font-bold text-white mb-2 group-hover:text-primary-400 transition-colors">
                                        {sport.name}
                                    </h2>
                                    <div className="flex items-center text-xs font-bold tracking-widest uppercase text-gray-500 mb-6 bg-dark-900/50 w-max px-3 py-1.5 rounded-md border border-white/5">
                                        <Users size={14} className="mr-2" /> {sport.category}
                                    </div>

                                    <div className="pt-4 border-t border-white/10 flex justify-between items-center text-sm font-semibold transition-colors group-hover:border-white/20">
                                        <span className="text-gray-400">View Action</span>
                                        <ChevronRight size={18} className="text-gray-600 group-hover:text-primary-500 transform group-hover:translate-x-1 transition-all" />
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </div>
    );
};

export default ScoreboardPage;

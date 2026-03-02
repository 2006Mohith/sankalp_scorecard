import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { ArrowLeft, Trophy, Medal } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const LeaderboardPage = () => {
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const { data } = await axios.get(`${API_URL}/leaderboard`);
                setLeaderboard(data);
            } catch (error) {
                console.error("Error fetching leaderboard:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchLeaderboard();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    // Separate champions (defined winners) and TBD (ongoing/upcoming)
    const champions = leaderboard.filter(item => item.champion);
    const ongoing = leaderboard.filter(item => !item.champion);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div className="space-y-8 max-w-5xl mx-auto px-4 mt-8">
            <Link to="/" className="inline-flex items-center text-gray-500 hover:text-primary-600 dark:text-gray-400 font-medium transition">
                <ArrowLeft size={20} className="mr-1" /> Back to Home
            </Link>

            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-display font-black uppercase tracking-widest text-white drop-shadow-md">
                    Global <span className="text-primary-500">Leaderboard</span>
                </h1>
                <p className="text-gray-400 mt-4 uppercase tracking-[0.2em] text-sm">Official Sports Club Champions</p>
                <div className="w-24 h-1 bg-primary-500 mx-auto mt-6 rounded-full shadow-[0_0_15px_rgba(250,204,21,0.5)]"></div>
            </div>

            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="space-y-12"
            >
                {/* Champions Section */}
                <div>
                    <h2 className="text-2xl font-bold uppercase tracking-widest text-white mb-6 flex items-center">
                        <Trophy className="mr-3 text-primary-500" /> Crowned Champions
                    </h2>

                    {champions.length === 0 ? (
                        <div className="glass-panel p-8 text-center border-white/5">
                            <p className="text-gray-500 italic">No champions have been crowned yet.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {champions.map((record, idx) => (
                                <motion.div key={idx} variants={itemVariants} className="glass-panel p-6 border-primary-500/30 relative overflow-hidden group">
                                    <div className="absolute top-[-20px] right-[-20px] opacity-10 group-hover:opacity-20 transition-opacity">
                                        <Trophy size={100} className="text-primary-500" />
                                    </div>
                                    <div className="relative z-10">
                                        <p className="text-xs uppercase tracking-widest text-primary-400 font-bold mb-1">{record.category}</p>
                                        <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-4">{record.sportName}</h3>

                                        <div className="bg-dark-900/60 rounded-lg p-4 border border-white/5 flex items-center justify-between">
                                            <div className="flex items-center">
                                                <Medal size={24} className="text-yellow-400 mr-3 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" />
                                                <span className="font-bold text-lg text-white">{record.champion}</span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>

                {/* TBD/Ongoing Section */}
                {ongoing.length > 0 && (
                    <div className="opacity-70">
                        <h2 className="text-xl font-bold uppercase tracking-widest text-gray-400 mb-6 flex items-center">
                            <div className="w-2 h-2 rounded-full bg-blue-500 mr-3 animate-pulse"></div> Active Tournaments
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {ongoing.map((record, idx) => (
                                <motion.div key={idx} variants={itemVariants} className="bg-dark-800/40 rounded-xl p-5 border border-white/5">
                                    <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1">{record.category}</p>
                                    <h3 className="text-lg font-bold text-gray-300 uppercase tracking-tight mb-3">{record.sportName}</h3>
                                    <div className="text-xs font-medium text-gray-500 bg-dark-900 rounded py-2 text-center uppercase tracking-wider">
                                        Winner TBD
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default LeaderboardPage;

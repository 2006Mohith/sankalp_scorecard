import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Users, Trophy, Play, ChevronRight, Activity, Target, Zap, ChevronDown } from 'lucide-react';
import SEO from '../components/SEO';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';



const HomePage = () => {
    const [sports, setSports] = useState([]);
    const [liveMatches, setLiveMatches] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSports = async () => {
            try {
                const { data } = await axios.get(`${API_URL}/sports/stats`);
                setSports(data);

                // Fetch live matches across all sports (mocked via sports list for now)
                // In a perfect system, there'd be a /matches/live endpoint. We'll map liveCount for UI.
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
        <div className="relative pb-24 -mt-8">
            <SEO 
                title="SANKALP Sports Club | KMCE Official Esports & Athletics" 
                description="Welcome to SANKALP. The definitive ecosystem for athletic dominance at KMCE. We are building the ultimate competitive platform for emerging student-athletes." 
            />
            {/* Background Animations */}
            <div className="fixed inset-0 pointer-events-none -z-10 bg-grid-pattern opacity-30"></div>
            <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-500/10 rounded-full blur-[120px] mix-blend-screen animate-blob"></div>
            <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent-blue/10 rounded-full blur-[120px] mix-blend-screen animate-blob animation-delay-2000"></div>

            {/* Hero Section */}
            <section className="relative min-h-[70vh] flex flex-col justify-center items-center text-center px-4 overflow-hidden mt-10">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="z-10 w-full max-w-5xl"
                >
                    <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}>
                        <h1 className="text-5xl md:text-8xl font-display font-black tracking-tighter uppercase leading-[0.9] text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                            SANKALP <br />
                            <span className="text-gradient">Sports Club</span>
                        </h1>
                    </motion.div>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                        className="mt-6 text-xl md:text-2xl font-light tracking-[0.2em] text-gray-300 uppercase"
                    >
                        Strength <span className="text-primary-500 mx-2">•</span> Unity <span className="text-primary-500 mx-2">•</span> Victory
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1 }}
                        className="mt-12 flex justify-center space-x-4"
                    >
                        <Link to="/scoreboard" className="btn-primary flex items-center shadow-[0_0_20px_rgba(250,204,21,0.4)]">
                            <Play size={18} className="mr-2 fill-black" /> Live Action
                        </Link>
                        <Link to="/leaderboard" className="btn-secondary">
                            View Leaderboard
                        </Link>
                    </motion.div>
                </motion.div>
            </section>

            {/* Immersive Intro Section - Antigravity Inspired */}
            <section className="relative z-10 container mx-auto px-4 mt-24 mb-32">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, margin: "-200px" }}
                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                    className="max-w-4xl mx-auto text-center relative mb-32"
                >
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-white/5 blur-[100px] rounded-full z-[-1] pointer-events-none"></div>

                    <h2 className="text-4xl md:text-6xl font-display font-black uppercase tracking-tighter mb-8 leading-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500">
                        Beyond the <span className="text-primary-500 line-through decoration-white/20">Classroom</span>. <br /> Into the <span className="text-accent-blue font-outline-2">Arena</span>.
                    </h2>

                    <p className="text-lg md:text-2xl text-gray-400 font-light leading-relaxed mb-12">
                        We are building the definitive ecosystem for athletic dominance at KMCE.
                        No limits. No excuses. Just pure competition driven by cutting-edge technology and relentless ambition.
                    </p>

                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: 1, duration: 1 }}
                        className="text-gray-600 animate-bounce flex justify-center mt-8"
                    >
                        <ChevronDown size={32} />
                    </motion.div>
                </motion.div>

                {/* Vision & Mission Split */}
                <div className="grid md:grid-cols-2 gap-12 mb-32 max-w-6xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8 }}
                        className="glass-panel relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-accent-blue/20 blur-[50px] rounded-full group-hover:bg-accent-blue/40 transition-all duration-700"></div>
                        <Target size={48} className="text-accent-blue mb-6 border border-accent-blue/30 p-2 rounded-xl bg-accent-blue/10" />
                        <h2 className="text-3xl font-display font-black uppercase tracking-tight text-white mb-4">Our Vision</h2>
                        <p className="text-gray-400 leading-relaxed text-lg">
                            To create an ecosystem where academics and athletic excellence coexist. We envision Sankalp Sports Club as the premier destination for KMCE students to hone their physical capabilities, forge lifelong bonds, and represent the college on the national collegiate stage.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8 }}
                        className="glass-panel relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/20 blur-[50px] rounded-full group-hover:bg-primary-500/40 transition-all duration-700"></div>
                        <Zap size={48} className="text-primary-500 mb-6 border border-primary-500/30 p-2 rounded-xl bg-primary-500/10" />
                        <h2 className="text-3xl font-display font-black uppercase tracking-tight text-white mb-4">Our Mission</h2>
                        <p className="text-gray-400 leading-relaxed text-lg">
                            We are committed to providing top-tier athletic infrastructure, expert coaching, and highly organized tournaments. Elevating the standard of sportsmanship while building the ultimate competitive platform for emerging student-athletes at KMCE.
                        </p>
                    </motion.div>
                </div>

                {/* Core Pillars */}
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={containerVariants}
                    className="text-center max-w-6xl mx-auto"
                >
                    <h2 className="text-3xl font-display font-bold uppercase tracking-widest text-white mb-16">The Pillars of <span className="text-gradient">Sankalp</span></h2>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { title: 'Discipline', desc: 'The foundation of every victory. We train with purpose and execute with precision.' },
                            { title: 'Unity', desc: 'Individual talent wins matches, but absolute teamwork wins championships.' },
                            { title: 'Legacy', desc: 'We do not just play to win today. We play to set records that inspire tomorrow.' }
                        ].map((pillar, idx) => (
                            <motion.div
                                key={idx}
                                variants={itemVariants}
                                className="bg-dark-800/30 border border-white/5 p-8 rounded-2xl hover:border-primary-500/30 hover:bg-dark-800/50 transition-all duration-300 transform hover:-translate-y-2 group"
                            >
                                <h3 className="text-2xl font-black text-white uppercase tracking-wider mb-4 group-hover:text-primary-400 transition-colors">{pillar.title}</h3>
                                <p className="text-gray-500">{pillar.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </section>


        </div>
    );
};

export default HomePage;

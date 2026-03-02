import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const RegistrationsPage = () => {
    const [sports, setSports] = useState([]);
    const [selectedSport, setSelectedSport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitStatus, setSubmitStatus] = useState(null); // 'idle', 'loading', 'success', 'error'

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        year: '1st Year',
        branch: 'CSE',
        section: '',
        hallTicket: ''
    });

    useEffect(() => {
        const fetchSports = async () => {
            try {
                const { data } = await axios.get(`${API_URL}/sports`);
                setSports(data);
            } catch (err) {
                console.error("Failed to load sports", err);
            } finally {
                setLoading(false);
            }
        };
        fetchSports();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value.toUpperCase() });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitStatus('loading');

        // Basic validation
        if (!formData.name || !formData.hallTicket || !formData.section) {
            setSubmitStatus('error');
            setTimeout(() => setSubmitStatus('idle'), 3000);
            return;
        }

        // Actual Payload Submission to MongoDB
        const payload = {
            ...formData,
            sportId: selectedSport._id,
            sportName: selectedSport.name
        };

        try {
            await axios.post(`${API_URL}/registrations`, payload);
            setSubmitStatus('success');
            setFormData({ name: '', year: '1st Year', branch: 'CSE', section: '', hallTicket: '' });
            setTimeout(() => {
                setSubmitStatus('idle');
                setSelectedSport(null);
            }, 3000);
        } catch (error) {
            console.error("Registration failed", error);
            setSubmitStatus('error');
            setTimeout(() => setSubmitStatus('idle'), 4000);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="relative pt-20 pb-24 overflow-hidden min-h-screen">
            {/* Background Animations */}
            <div className="fixed inset-0 pointer-events-none -z-10 bg-grid-pattern opacity-30"></div>
            <div className="fixed top-[-10%] left-[-10%] w-[30%] h-[30%] bg-accent-blue/10 rounded-full blur-[120px] mix-blend-screen animate-blob animation-delay-4000"></div>

            <div className="container mx-auto px-4 max-w-5xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-16"
                >
                    <h1 className="text-5xl md:text-7xl font-display font-black uppercase tracking-tight text-white mb-4 drop-shadow-lg">
                        Athlete <span className="text-primary-500">Registry</span>
                    </h1>
                    <p className="text-gray-400 uppercase tracking-widest text-sm max-w-2xl mx-auto">
                        Official Enrollment Portal for KMCE Tournaments. Select your battlefield.
                    </p>
                    <div className="w-24 h-1 bg-gradient-to-r from-primary-400 to-accent-blue mx-auto mt-8 rounded-full"></div>
                </motion.div>

                <AnimatePresence mode="wait">
                    {!selectedSport ? (
                        <motion.div
                            key="grid"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.5 }}
                        >
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {sports.map((sport) => (
                                    <motion.button
                                        key={sport._id}
                                        whileHover={{ scale: 1.05, y: -5 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setSelectedSport(sport)}
                                        className="relative group bg-dark-800/40 backdrop-blur-md border border-white/5 hover:border-primary-500/50 rounded-2xl p-6 overflow-hidden text-center shadow-lg transition-all duration-300"
                                    >
                                        <div className="absolute inset-0 bg-primary-500/0 group-hover:bg-primary-500/10 transition-colors duration-300"></div>
                                        <div className="w-16 h-16 bg-dark-900 rounded-full mx-auto mb-4 border border-white/10 group-hover:border-primary-500/30 flex items-center justify-center shadow-inner">
                                            <span className="text-2xl font-black text-white group-hover:text-primary-400 transition-colors">{sport.name.charAt(0)}</span>
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-200 group-hover:text-white uppercase tracking-wider">{sport.name}</h3>
                                        <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-2 font-semibold">{sport.category}</p>
                                    </motion.button>
                                ))}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="form"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            transition={{ duration: 0.5 }}
                            className="max-w-2xl mx-auto"
                        >
                            <button
                                onClick={() => setSelectedSport(null)}
                                className="flex items-center text-gray-500 hover:text-primary-500 transition-colors mb-8 group uppercase tracking-widest text-xs font-bold"
                            >
                                <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Categories
                            </button>

                            <div className="glass-panel relative overflow-hidden">
                                {/* Decor */}
                                <div className="absolute top-0 right-0 p-8 opacity-5 font-display font-black text-8xl rotate-12 pointer-events-none">
                                    {selectedSport.name.substring(0, 3).toUpperCase()}
                                </div>

                                <h2 className="text-3xl font-display font-black text-white uppercase tracking-tight mb-2">
                                    {selectedSport.name} <span className="text-primary-500">Draft</span>
                                </h2>
                                <p className="text-gray-400 text-sm mb-8 border-b border-white/10 pb-4">Please fill out all technical credentials to verify your KMCE student status.</p>

                                <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-xs uppercase tracking-widest text-gray-500 font-bold mb-2">Full Name</label>
                                            <input required type="text" name="name" value={formData.name} onChange={handleChange} className="input-field shadow-inner" placeholder="P. Rahul Kumar" />
                                        </div>
                                        <div>
                                            <label className="block text-xs uppercase tracking-widest text-gray-500 font-bold mb-2">Hall Ticket Number</label>
                                            <input required type="text" name="hallTicket" value={formData.hallTicket} onChange={handleChange} className="input-field shadow-inner font-mono pattern-uppercase" placeholder="22BD1A05XX" />
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-3 gap-6">
                                        <div>
                                            <label className="block text-xs uppercase tracking-widest text-gray-500 font-bold mb-2">Year</label>
                                            <select name="year" value={formData.year} onChange={handleChange} className="input-field bg-dark-900 shadow-inner appearance-none cursor-pointer">
                                                <option>1st Year</option>
                                                <option>2nd Year</option>
                                                <option>3rd Year</option>
                                                <option>4th Year</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs uppercase tracking-widest text-gray-500 font-bold mb-2">Branch</label>
                                            <select name="branch" value={formData.branch} onChange={handleChange} className="input-field bg-dark-900 shadow-inner appearance-none cursor-pointer">
                                                <option>CSE</option>
                                                <option>CSM</option>
                                                <option>CSD</option>
                                                <option>IT</option>
                                                <option>ECE</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs uppercase tracking-widest text-gray-500 font-bold mb-2">Section</label>
                                            <input required type="text" name="section" value={formData.section} onChange={handleChange} className="input-field shadow-inner text-center font-bold" placeholder="A, B, C..." maxLength="2" />
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-white/5">
                                        <motion.button
                                            whileTap={{ scale: 0.95 }}
                                            type="submit"
                                            disabled={submitStatus === 'loading' || submitStatus === 'success'}
                                            className="btn-primary w-full flex justify-center items-center py-4 text-lg"
                                        >
                                            {submitStatus === 'loading' ? (
                                                <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                                            ) : submitStatus === 'success' ? (
                                                <><CheckCircle2 className="mr-2" /> Application Confirmed</>
                                            ) : submitStatus === 'error' ? (
                                                <><AlertCircle className="mr-2 text-red-900" /> Validation Failed</>
                                            ) : (
                                                'Submit Application'
                                            )}
                                        </motion.button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default RegistrationsPage;

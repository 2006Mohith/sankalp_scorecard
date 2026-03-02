import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserCog, AlertCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AdminLogin = () => {
    const [state, setState] = useState({ username: '', password: '', error: '' });
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setState((prev) => ({ ...prev, error: '' }));
        try {
            const { data } = await axios.post(`${API_URL}/admin/login`, {
                username: state.username,
                password: state.password
            });
            localStorage.setItem('adminToken', data.token);
            localStorage.setItem('adminRole', data.admin.role);
            if (data.admin.sport_id) {
                localStorage.setItem('adminSportId', data.admin.sport_id);
            } else {
                localStorage.removeItem('adminSportId');
            }
            if (data.admin.assigned_matches && data.admin.assigned_matches.length > 0) {
                localStorage.setItem('assignedMatches', JSON.stringify(data.admin.assigned_matches));
            } else {
                localStorage.removeItem('assignedMatches');
            }
            navigate('/admin/dashboard');
        } catch (error) {
            setState(prev => ({ ...prev, error: 'Invalid credentials or unauthorized access.' }));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-[80vh] relative -mt-10">
            {/* Background Effects */}
            <div className="absolute inset-0 pointer-events-none -z-10 bg-grid-pattern opacity-20"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-500/10 blur-[100px] rounded-full pointer-events-none"></div>

            <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="glass-card w-full max-w-md p-8 md:p-10 mx-4 relative overflow-hidden group"
            >
                {/* Accent Highlight */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary-500 to-transparent"></div>

                <div className="flex flex-col items-center justify-center mb-8">
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="p-5 bg-dark-900 border border-white/5 shadow-inner rounded-full mb-4 relative"
                    >
                        <UserCog size={40} className="text-primary-500 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]" />
                        <div className="absolute inset-0 rounded-full border border-primary-500/30 scale-110 opacity-50"></div>
                    </motion.div>
                    <h2 className="text-3xl font-display font-black text-white uppercase tracking-wider mb-1">
                        System <span className="text-primary-500">Access</span>
                    </h2>
                    <p className="text-gray-500 text-sm tracking-widest font-bold uppercase">
                        Authorized Personnel Only
                    </p>
                </div>

                {state.error && (
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-red-900/20 border-l-4 border-red-500 text-red-200 p-4 rounded mb-6 flex items-start text-sm shadow-inner"
                    >
                        <AlertCircle size={18} className="mr-3 mt-0.5 text-red-400 shrink-0" />
                        <span>{state.error}</span>
                    </motion.div>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-xs uppercase tracking-widest text-gray-400 font-bold mb-2 ml-1">
                            Admin Identity
                        </label>
                        <input
                            type="text"
                            className="input-field bg-dark-900 border-white/10 focus:border-primary-500 shadow-inner"
                            value={state.username}
                            onChange={(e) => setState({ ...state, username: e.target.value })}
                            required
                            placeholder="username"
                        />
                    </div>
                    <div>
                        <label className="block text-xs uppercase tracking-widest text-gray-400 font-bold mb-2 ml-1">
                            Passkey
                        </label>
                        <input
                            type="password"
                            className="input-field bg-dark-900 border-white/10 focus:border-primary-500 shadow-inner font-mono tracking-widest"
                            value={state.password}
                            onChange={(e) => setState({ ...state, password: e.target.value })}
                            required
                            placeholder="••••••••"
                        />
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={isLoading}
                        className="btn-primary w-full flex items-center justify-center py-4 mt-8 font-bold tracking-widest uppercase text-black"
                    >
                        {isLoading ? <Loader2 size={24} className="animate-spin" /> : 'Authenticate'}
                    </motion.button>
                </form>
            </motion.div>
        </div>
    );
};

export default AdminLogin;

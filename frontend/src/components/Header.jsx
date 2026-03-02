import { Link, useLocation } from 'react-router-dom';
import { LogIn, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import collegeLogo from '../assets/kmce-logo.jpg';
import sankalpLogo from '../assets/sankalp-logo.jpg';

const Header = ({ darkMode, toggleDarkMode }) => {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const location = useLocation();

    // Close mobile menu when route changes
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [location.pathname, location.hash]);

    const getDesktopLinkClass = (path, hash = '') => {
        const isActive = hash ? location.hash === hash : location.pathname === path && !location.hash;
        return `uppercase tracking-widest text-xs font-bold transition-all duration-300 transform ${isActive
            ? 'text-primary-400 scale-105 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)] border-b-2 border-primary-500 pb-1'
            : 'text-gray-400 hover:text-primary-400 hover:scale-105'
            }`;
    };

    const getMobileLinkClass = (path, hash = '') => {
        const isActive = hash ? location.hash === hash : location.pathname === path && !location.hash;
        return `block uppercase tracking-widest text-sm font-bold pb-2 transition-all duration-300 border-b ${isActive
            ? 'text-primary-400 border-primary-500 drop-shadow-[0_0_8px_rgba(250,204,21,0.3)]'
            : 'text-gray-300 hover:text-primary-400 border-white/5'
            }`;
    };

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <motion.header
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ type: 'spring', stiffness: 100, damping: 20 }}
            className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled ? 'bg-dark-900/80 backdrop-blur-md shadow-2xl border-b border-white/10' : 'bg-transparent pt-4'} `}
        >
            <div className={`container mx-auto px-4 transition-all duration-300 flex items-center justify-between ${scrolled ? 'h-16' : 'h-20'}`}>
                {/* Left side: College Logo & Name */}
                <div className="flex items-center space-x-4">
                    <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className="w-12 h-12 flex items-center justify-center rounded-full overflow-hidden shadow-[0_0_15px_rgba(250,204,21,0.2)] border border-primary-500/30"
                    >
                        <img src={sankalpLogo} alt="Sankalp Logo" className="w-full h-full object-cover" />
                    </motion.div>
                    <Link to="/" className="flex flex-col">
                        <span className="font-display font-black text-xl text-gradient tracking-tight leading-none">SANKALP</span>
                        <span className="text-[0.65rem] text-primary-400 font-medium uppercase tracking-[0.2em] mt-1 drop-shadow-md">KMCE</span>
                    </Link>
                </div>

                {/* Center: Navigation Links */}
                <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center space-x-6 bg-dark-800/50 backdrop-blur-lg px-6 py-3 rounded-full border border-white/5 shadow-inner">
                    <Link to="/" className={getDesktopLinkClass('/')}>Home</Link>
                    <Link to="/about" className={getDesktopLinkClass('/about')}>About Us</Link>
                    <Link to="/gallery" className={getDesktopLinkClass('/gallery')}>Images</Link>
                    <Link to="/register" className={getDesktopLinkClass('/register')}>Registrations</Link>
                    <Link to="/scoreboard" className={getDesktopLinkClass('/scoreboard')}>Scoreboard</Link>
                    <Link to="/leaderboard" className={getDesktopLinkClass('/leaderboard')}>Leaderboard</Link>
                </div>

                {/* Right side: Controls */}
                <div className="flex items-center space-x-4">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Link to="/admin/login" className="flex items-center space-x-2 bg-dark-800/80 hover:bg-primary-500/20 text-gray-400 hover:text-primary-400 border border-white/5 hover:border-primary-500/50 px-4 py-2 rounded-full transition-all duration-300">
                            <span className="text-xs font-bold uppercase tracking-wider hidden sm:block">Admin</span>
                            <LogIn size={16} />
                        </Link>
                    </motion.div>

                    {/* Mobile Menu Toggle */}
                    <button
                        className="lg:hidden text-gray-400 hover:text-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 rounded-lg p-1 transition-colors"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
                    </button>
                </div>
            </div>

            {/* Mobile Navigation Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="lg:hidden bg-dark-900 border-b border-white/10 overflow-hidden"
                    >
                        <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
                            <Link to="/" className={getMobileLinkClass('/')}>Home</Link>
                            <Link to="/about" className={getMobileLinkClass('/about')}>About Us</Link>
                            <Link to="/gallery" className={getMobileLinkClass('/gallery')}>Images</Link>
                            <Link to="/register" className={getMobileLinkClass('/register')}>Registrations</Link>
                            <Link to="/scoreboard" onClick={() => setMobileMenuOpen(false)} className={getMobileLinkClass('/scoreboard')}>Scoreboard</Link>
                            <Link to="/leaderboard" className={getMobileLinkClass('/leaderboard')}>Leaderboard</Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.header>
    );
};

export default Header;

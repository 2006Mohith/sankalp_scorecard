const Footer = () => {
    return (
        <footer className="relative bg-dark-900 border-t border-white/5 py-8 mt-auto overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-primary-500/50 to-transparent"></div>
            <div className="container mx-auto px-4 text-center relative z-10">
                <p className="font-display font-medium text-gray-400 tracking-wider text-sm uppercase">
                    &copy; 2026 <span className="text-white font-bold">KMCE</span> | <span className="text-gradient font-bold drop-shadow-md">SANKALP Sports Club</span>
                </p>
                <p className="text-xs text-gray-600 mt-2 font-medium tracking-widest uppercase">
                    Official Live Tournament Platform
                </p>
            </div>
        </footer>
    );
};

export default Footer;

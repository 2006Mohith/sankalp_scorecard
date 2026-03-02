import { motion } from 'framer-motion';
import { Target, Zap, Shield, ChevronDown, User, Users } from 'lucide-react';

const AboutPage = () => {
    return (
        <div className="relative pt-20 pb-24 overflow-hidden">
            {/* Background elements */}
            <div className="fixed inset-0 pointer-events-none -z-10 bg-grid-pattern opacity-30"></div>
            <div className="fixed top-[-20%] right-[-10%] w-[50%] h-[50%] bg-primary-500/10 rounded-full blur-[150px] mix-blend-screen animate-blob"></div>

            <div className="container mx-auto px-4 max-w-6xl">
                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                    className="text-center mb-32 relative"
                >
                    <motion.h1
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.8 }}
                        className="text-6xl md:text-8xl font-black font-display uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-gray-300 to-gray-600 drop-shadow-2xl"
                    >
                        Our <span className="text-primary-500">Identity</span>
                    </motion.h1>
                    <motion.p
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                        className="mt-8 text-xl md:text-2xl font-light text-gray-400 max-w-3xl mx-auto uppercase tracking-widest leading-relaxed"
                    >
                        Forging Champions at KMCE through grit, discipline, and absolute unity.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1, duration: 1 }}
                        className="absolute -bottom-20 left-1/2 -translate-x-1/2 text-gray-500 animate-bounce"
                    >
                        <ChevronDown size={32} />
                    </motion.div>
                </motion.div>

                {/* Vision & Mission Split */}
                <div className="grid md:grid-cols-2 gap-12 mb-32">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8 }}
                        className="glass-panel relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-accent-blue/20 blur-[50px] rounded-full group-hover:bg-accent-blue/40 transition-all duration-700"></div>
                        <Target size={48} className="text-accent-blue mb-6" />
                        <h2 className="text-3xl font-display font-black uppercase tracking-tight text-white mb-4">The Vision</h2>
                        <p className="text-gray-400 leading-relaxed text-lg">
                            To create an ecosystem where athletics and engineering excellence coexist. We envision Sankalp Sports Club as the premier destination for students to hone their physical capabilities, forge lifelong bonds, and represent KMCE on the national collegiate stage.
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
                        <Zap size={48} className="text-primary-500 mb-6" />
                        <h2 className="text-3xl font-display font-black uppercase tracking-tight text-white mb-4">The Mission</h2>
                        <p className="text-gray-400 leading-relaxed text-lg">
                            We are committed to providing top-tier athletic infrastructure, expert coaching, and highly organized tournaments. Elevating the standard of sportsmanship while building the ultimate competitive platform for emerging student-athletes.
                        </p>
                    </motion.div>
                </div>

                {/* Core Pillars */}
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={{
                        hidden: {},
                        visible: { transition: { staggerChildren: 0.2 } }
                    }}
                    className="text-center"
                >
                    <h2 className="text-4xl font-display font-bold uppercase tracking-widest text-white mb-16">Three Pillars of <span className="text-gradient">Sankalp</span></h2>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { title: 'Discipline', desc: 'The foundation of every victory. We train with purpose and execute with precision.', delay: 0 },
                            { title: 'Unity', desc: 'Individual talent wins games, but absolute teamwork wins championships.', delay: 0.2 },
                            { title: 'Legacy', desc: 'We do not just play to win today. We play to set records that inspire tomorrow.', delay: 0.4 }
                        ].map((pillar, idx) => (
                            <motion.div
                                key={idx}
                                variants={{
                                    hidden: { opacity: 0, y: 50 },
                                    visible: { opacity: 1, y: 0 }
                                }}
                                className="bg-dark-800/30 border border-white/5 p-8 rounded-2xl hover:border-primary-500/30 hover:bg-dark-800/50 transition-all duration-300 transform hover:-translate-y-2"
                            >
                                <h3 className="text-2xl font-black text-white uppercase tracking-wider mb-4">{pillar.title}</h3>
                                <p className="text-gray-500">{pillar.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Representatives Section */}
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={{
                        hidden: {},
                        visible: { transition: { staggerChildren: 0.2 } }
                    }}
                    className="mt-32"
                >
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-display font-bold uppercase tracking-widest text-white mb-4">Leadership <span className="text-primary-500">&</span> Mentors</h2>
                        <p className="text-gray-400 max-w-2xl mx-auto">The driving force behind Sankalp Sports Club, dedicated to pushing boundaries and establishing excellence.</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-12">
                        {/* Club Representatives */}
                        <motion.div
                            variants={{ hidden: { opacity: 0, x: -50 }, visible: { opacity: 1, x: 0 } }}
                            className="bg-dark-800/40 p-8 rounded-3xl border border-white/5 shadow-2xl backdrop-blur-sm relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-8 opacity-10"><Users size={120} /></div>
                            <h3 className="text-2xl font-bold text-white mb-8 border-b border-white/10 pb-4 inline-block pr-12">Club Representatives</h3>
                            <div className="space-y-6 relative z-10">
                                {[
                                    { name: "Chanakya", role: "Club Representative", dept: "" },
                                    { name: "D. Mythri", role: "Club Representative", dept: "" },
                                    { name: "Unknown", role: "Club Representative", dept: "" }
                                ].map((rep, idx) => (
                                    <div key={idx} className="flex items-center space-x-4 group hover:bg-dark-700/50 p-3 rounded-xl transition-all">
                                        <div className="w-12 h-12 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center border border-primary-500/30 group-hover:scale-110 transition-transform">
                                            <User size={24} />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-bold text-gray-200">{rep.name}</h4>
                                            <p className="text-sm font-medium text-primary-400">{rep.role}</p>
                                            <p className="text-xs text-gray-500">{rep.dept}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Faculty Representatives */}
                        <motion.div
                            variants={{ hidden: { opacity: 0, x: 50 }, visible: { opacity: 1, x: 0 } }}
                            className="bg-gradient-to-br from-dark-800/60 to-dark-900/40 p-8 rounded-3xl border border-white/5 shadow-2xl backdrop-blur-sm relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-8 opacity-10 text-accent-blue"><Shield size={120} /></div>
                            <h3 className="text-2xl font-bold text-white mb-8 border-b border-white/10 pb-4 inline-block pr-12">Faculty Mentors</h3>
                            <div className="space-y-6 relative z-10">
                                {[
                                    { name: "Mr. Venkata Chary sir", role: "Faculty Representative", dept: "" },
                                    { name: "Unknown", role: "Faculty Representative", dept: "" }
                                ].map((rep, idx) => (
                                    <div key={idx} className="flex items-center space-x-4 group hover:bg-dark-700/50 p-3 rounded-xl transition-all">
                                        <div className="w-12 h-12 rounded-full bg-accent-blue/20 text-accent-blue flex items-center justify-center border border-accent-blue/30 group-hover:scale-110 transition-transform">
                                            <Shield size={20} />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-bold text-gray-200">{rep.name}</h4>
                                            <p className="text-sm font-medium text-accent-blue">{rep.role}</p>
                                            <p className="text-xs text-gray-500">{rep.dept}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default AboutPage;

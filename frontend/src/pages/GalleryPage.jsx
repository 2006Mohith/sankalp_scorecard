import { motion } from 'framer-motion';
import { Upload, Image as ImageIcon, Camera } from 'lucide-react';
import { useState, useEffect } from 'react';

const GalleryPage = () => {
    // Placeholder for when you actually connect this to a backend/Firebase storage
    const [images, setImages] = useState([]);
    const [isMasterAdmin, setIsMasterAdmin] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        const role = localStorage.getItem('adminRole');
        if (token && role === 'Master') {
            setIsMasterAdmin(true);
        }
    }, []);

    const handleUploadClick = () => {
        alert("This feature connects to your live server! You can upload images here once we connect an AWS S3 bucket or Google Firebase Storage adapter.");
    };

    return (
        <div className="relative pt-20 pb-24 min-h-screen">
            <div className="container mx-auto px-4 max-w-7xl">

                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="flex flex-col md:flex-row items-center justify-between mb-16 border-b border-white/10 pb-8"
                >
                    <div>
                        <h1 className="text-4xl md:text-5xl font-display font-black uppercase text-white mb-2 flex items-center">
                            <Camera className="mr-4 text-primary-500" size={40} />
                            Sports <span className="text-primary-500 ml-3">Gallery</span>
                        </h1>
                        <p className="text-gray-400 font-medium">Memories and highlights from previous years.</p>
                    </div>

                    {isMasterAdmin && (
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleUploadClick}
                            className="mt-6 md:mt-0 flex items-center px-6 py-3 bg-primary-600 hover:bg-primary-500 text-dark-900 font-bold uppercase tracking-widest text-sm rounded-lg shadow-[0_0_20px_rgba(250,204,21,0.3)] transition-all"
                        >
                            <Upload size={18} className="mr-2" />
                            Upload Image
                        </motion.button>
                    )}
                </motion.div>

                {/* Masonry-style Grid */}
                {images.length > 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[250px]"
                    >
                        {images.map((img, idx) => (
                            <motion.div
                                key={img.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5, delay: idx * 0.1 }}
                                // Make some items span 2 rows for the masonry look
                                className={`relative group rounded-2xl overflow-hidden cursor-pointer ${idx === 0 || idx === 3 ? 'md:row-span-2' : ''}`}
                            >
                                <img
                                    src={img.url}
                                    alt={img.title}
                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                {/* Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-dark-900/90 via-dark-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                                    <h3 className="text-white font-bold text-lg translate-y-4 group-hover:translate-y-0 transition-transform duration-300">{img.title}</h3>
                                    <p className="text-primary-400 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">Click to view</p>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-32 text-center">
                        <div className="w-24 h-24 bg-dark-800/50 rounded-full flex items-center justify-center mb-6 border border-white/5">
                            <ImageIcon size={40} className="text-gray-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-400 uppercase tracking-widest">Gallery Empty</h2>
                        <p className="text-gray-500 mt-2">No photos have been uploaded for our archives yet.</p>
                    </div>
                )}

            </div>
        </div>
    );
};

export default GalleryPage;

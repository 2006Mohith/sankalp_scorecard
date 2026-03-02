import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const CustomCursor = () => {
    const [mousePosition, setMousePosition] = useState({ x: -100, y: -100 });
    const [isHovering, setIsHovering] = useState(false);

    useEffect(() => {
        const updateMousePosition = (e) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };

        const handleMouseOver = (e) => {
            if (
                e.target.tagName.toLowerCase() === 'a' ||
                e.target.tagName.toLowerCase() === 'button' ||
                e.target.closest('a') ||
                e.target.closest('button')
            ) {
                setIsHovering(true);
            } else {
                setIsHovering(false);
            }
        };

        window.addEventListener('mousemove', updateMousePosition);
        window.addEventListener('mouseover', handleMouseOver);

        return () => {
            window.removeEventListener('mousemove', updateMousePosition);
            window.removeEventListener('mouseover', handleMouseOver);
        };
    }, []);

    return (
        <>
            {/* Main custom cursor dot */}
            <motion.div
                className="fixed top-0 left-0 w-6 h-6 rounded-full pointer-events-none z-[100] mix-blend-difference border-2 border-primary-500 hidden md:flex items-center justify-center"
                animate={{
                    x: mousePosition.x - 12,
                    y: mousePosition.y - 12,
                    scale: isHovering ? 2.5 : 1,
                    backgroundColor: isHovering ? 'rgba(250, 204, 21, 1)' : 'rgba(250, 204, 21, 0)'
                }}
                transition={{
                    type: 'spring',
                    stiffness: 800,
                    damping: 35,
                    mass: 0.1
                }}
            />

            {/* Huge glowing ambient background follower */}
            <motion.div
                className="fixed top-0 left-0 w-[400px] h-[400px] rounded-full pointer-events-none z-[-5] bg-primary-500/5 blur-[100px] hidden md:block"
                animate={{
                    x: mousePosition.x - 200,
                    y: mousePosition.y - 200,
                }}
                transition={{
                    type: 'tween',
                    ease: 'easeOut',
                    duration: 0.5
                }}
            />
        </>
    );
};

export default CustomCursor;

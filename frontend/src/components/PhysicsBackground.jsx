import { useEffect, useRef, useState } from 'react';
import Matter from 'matter-js';
import { Gamepad2 } from 'lucide-react';

const PhysicsBackground = () => {
    const sceneRef = useRef(null);
    const engineRef = useRef(null);
    const renderRef = useRef(null);

    // Default enabled, but check localStorage for user preference
    const [enabled, setEnabled] = useState(() => {
        const saved = localStorage.getItem('physics_bg');
        return saved !== 'disabled';
    });

    const togglePhysics = () => {
        const newState = !enabled;
        setEnabled(newState);
        localStorage.setItem('physics_bg', newState ? 'enabled' : 'disabled');
    };

    useEffect(() => {
        if (!enabled || !sceneRef.current) return;
        // const isMobile = window.innerWidth < 768; // Disabled to allow mobile viewing
        // if (isMobile) return;

        const { Engine, Render, Runner, World, Bodies, Events, Body } = Matter;

        const engine = Engine.create();
        engineRef.current = engine;
        engine.world.gravity.y = 0.2; // Add light gravity

        const render = Render.create({
            element: sceneRef.current,
            engine: engine,
            options: {
                width: window.innerWidth,
                height: window.innerHeight,
                background: 'transparent',
                wireframes: false,
                pixelRatio: window.devicePixelRatio, // High res displays
            }
        });
        renderRef.current = render;

        // Boundaries
        const wallOptions = {
            isStatic: true,
            render: { visible: false },
            friction: 0.05,
            restitution: 0.8
        };
        const ground = Bodies.rectangle(window.innerWidth / 2, window.innerHeight + 50, window.innerWidth * 2, 100, wallOptions);
        const leftWall = Bodies.rectangle(-50, window.innerHeight / 2, 100, window.innerHeight * 2, wallOptions);
        const rightWall = Bodies.rectangle(window.innerWidth + 50, window.innerHeight / 2, 100, window.innerHeight * 2, wallOptions);
        // Soft ceiling
        const ceiling = Bodies.rectangle(window.innerWidth / 2, -200, window.innerWidth * 2, 100, wallOptions);

        World.add(engine.world, [ground, leftWall, rightWall, ceiling]);

        // Aesthetics
        const shapes = [];
        const colors = [
            'rgba(250, 204, 21, 0.4)', // Primary yellow
            'rgba(255, 255, 255, 0.05)', // Faint white
            'rgba(59, 130, 246, 0.2)', // Accent blue
            'rgba(30, 30, 30, 0.8)'    // Dark hollow
        ];
        const numShapes = window.innerWidth > 1024 ? 40 : 20;

        for (let i = 0; i < numShapes; i++) {
            const size = Math.random() * 25 + 10;
            const x = Math.random() * window.innerWidth;
            const y = Math.random() * -window.innerHeight * 2; // Staggered falling

            const shapeType = Math.random();
            let body;
            const options = {
                restitution: 0.85, // Bouncy
                friction: 0.05,
                frictionAir: 0.01 + Math.random() * 0.02, // Slight floatiness
                render: {
                    fillStyle: colors[Math.floor(Math.random() * colors.length)],
                    lineWidth: 1,
                    strokeStyle: 'rgba(255,255,255,0.05)'
                }
            };

            if (shapeType < 0.4) {
                body = Bodies.circle(x, y, size, options);
            } else if (shapeType < 0.7) {
                body = Bodies.rectangle(x, y, size * 1.5, size * 1.5, { ...options, chamfer: { radius: 4 } });
            } else {
                body = Bodies.polygon(x, y, Math.floor(Math.random() * 3) + 3, size + 5, options);
            }
            shapes.push(body);
        }
        World.add(engine.world, shapes);

        // Repulsive Cursor Force
        let mousePosition = { x: -1000, y: -1000 };
        const onMouseMove = (e) => {
            mousePosition.x = e.clientX;
            mousePosition.y = e.clientY;
        };
        window.addEventListener('mousemove', onMouseMove);

        Events.on(engine, 'beforeUpdate', () => {
            shapes.forEach(body => {
                const distanceX = body.position.x - mousePosition.x;
                const distanceY = body.position.y - mousePosition.y;
                const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

                if (distance < 200) {
                    // Calculate smooth repulsive force
                    const forceMagnitude = (200 - distance) * 0.00003;
                    Body.applyForce(body, body.position, {
                        x: (distanceX / distance) * forceMagnitude * body.mass,
                        y: (distanceY / distance) * forceMagnitude * body.mass
                    });
                }

                // Keep objects alive if they manage to fall through the floor
                if (body.position.y > window.innerHeight + 150) {
                    Body.setPosition(body, { x: Math.random() * window.innerWidth, y: -100 });
                    Body.setVelocity(body, { x: 0, y: 0 });
                }
            });
        });

        Render.run(render);
        const runner = Runner.create();
        Runner.run(runner, engine);

        const handleResize = () => {
            if (!render.canvas) return;
            render.canvas.width = window.innerWidth;
            render.canvas.height = window.innerHeight;

            Matter.Body.setPosition(ground, { x: window.innerWidth / 2, y: window.innerHeight + 50 });
            Matter.Body.setPosition(rightWall, { x: window.innerWidth + 50, y: window.innerHeight / 2 });
            Matter.Body.setPosition(ceiling, { x: window.innerWidth / 2, y: -200 });
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('resize', handleResize);
            Render.stop(render);
            Runner.stop(runner);
            if (engine.world) {
                World.clear(engine.world);
                Engine.clear(engine);
            }
            if (render.canvas) render.canvas.remove();
        };
    }, [enabled]);

    // Mobile physics enabled
    // if (typeof window !== 'undefined' && window.innerWidth < 768) return null;

    return (
        <>
            <div
                ref={sceneRef}
                className="fixed inset-0 z-[-5] pointer-events-none transition-opacity duration-1000"
                style={{ opacity: enabled ? 1 : 0 }}
            />
            <button
                onClick={togglePhysics}
                className={`fixed bottom-4 left-4 z-50 p-3 rounded-full border transition-all duration-300 backdrop-blur-md shadow-lg group ${enabled ? 'bg-primary-500/10 border-primary-500/50 text-primary-400 hover:bg-primary-500/20' : 'bg-dark-800/50 border-white/10 text-gray-500 hover:text-white'}`}
                title={enabled ? "Disable Physics" : "Enable Physics"}
            >
                <Gamepad2 size={20} className={enabled ? 'animate-pulse' : ''} />
                <span className="absolute left-14 top-1/2 -translate-y-1/2 bg-black border border-white/10 px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {enabled ? 'Disable Gravity' : 'Enable Gravity'}
                </span>
            </button>
        </>
    );
};

export default PhysicsBackground;

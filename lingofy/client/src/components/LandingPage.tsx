import React, { Suspense, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { Html, useProgress } from '@react-three/drei';

// UI Components
import { Button } from './ui/Button';
import { Card, CardContent } from './ui/Card';
import { ThemeToggle } from './ThemeToggle';
import { SakuraTree } from './SakuraTree';

// Icons
import { ArrowRight, Bot, Image, LayoutDashboard } from 'lucide-react';

// Type Definitions
type Theme = 'light' | 'dark';

interface LandingPageProps {
    onEnter: () => void;
    theme: Theme;
    setTheme: (theme: Theme) => void;
}

// Data for features section
const features = [
    {
        icon: <LayoutDashboard className="w-8 h-8 text-primary" />,
        title: "All-in-One Studio",
        description: "Manage your products, content, and site settings from a single, beautifully designed dashboard."
    },
    {
        icon: <Bot className="w-8 h-8 text-primary" />,
        title: "AI-Powered Assistant",
        description: "Get help with product descriptions, ask questions, or brainstorm ideas with your integrated AI assistant."
    },
    {
        icon: <Image className="w-8 h-8 text-primary" />,
        title: "Instant Image Generation",
        description: "Don't have professional photos? Generate stunning product images with a single click, powered by AI."
    }
];

// FeatureCard component (re-used from original, but without its own animation)
const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => {
    return (
        <motion.div
            whileHover={{ scale: 1.05 }}
            className="h-full"
        >
            <Card className="h-full transition-shadow bg-card/80 backdrop-blur-sm">
                <CardContent className="p-6 text-center flex flex-col items-center">
                    <div className="p-3 bg-primary/10 rounded-full mb-4">
                        {icon}
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{title}</h3>
                    <p className="text-muted-foreground">{description}</p>
                </CardContent>
            </Card>
        </motion.div>
    );
}

// A simple loader component to show while the 3D model is loading.
function Loader() {
  const { progress } = useProgress();
  return <Html center>{progress.toFixed(0)}% loaded</Html>
}

// Error boundary for the 3D scene
// FIX: Refactored to use a standard constructor for state initialization to ensure `this.props` is correctly typed.
class CanvasErrorBoundary extends React.Component<{children: React.ReactNode}, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-destructive/10">
          <p className="text-destructive">3D Scene Error</p>
        </div>
      );
    }
    return this.props.children;
  }
}

export function LandingPage({ onEnter, theme, setTheme }: LandingPageProps) {
    const contentRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: contentRef,
        offset: ["start start", "end end"]
    });

    // Scrollytelling animation mappings for the Hero section
    const heroOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0]);
    const heroScale = useTransform(scrollYProgress, [0, 0.25], [1, 1.15]);
    
    // Animate features section into view as user scrolls
    const featuresOpacity = useTransform(scrollYProgress, [0.3, 0.5], [0, 1]);
    const featuresY = useTransform(scrollYProgress, [0.3, 0.5], ['100px', '0px']);

    return (
        <div className="bg-background">
            <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    zIndex: -1,
                }}>
                <CanvasErrorBoundary>
                    <Canvas
                        shadows
                        camera={{ position: [0, 1, 8], fov: 50 }}
                    >
                        <Suspense fallback={<Loader />}>
                            <ambientLight intensity={0.5} />
                            <directionalLight 
                                castShadow
                                position={[8, 15, 5]} 
                                intensity={3} 
                                shadow-mapSize-width={2048}
                                shadow-mapSize-height={2048}
                                shadow-camera-far={50}
                                shadow-camera-left={-10}
                                shadow-camera-right={10}
                                shadow-camera-top={10}
                                shadow-camera-bottom={-10}
                                color="#ffdab9"
                            />
                            
                            <SakuraTree position={[0, -2, 0]} scale={0.025} rotation={[0, -0.5, 0]} />

                            <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.01, 0]}>
                                <planeGeometry args={[100, 100]} />
                                <shadowMaterial opacity={0.5} />
                            </mesh>
                        </Suspense>
                    </Canvas>
                </CanvasErrorBoundary>
            </div>

            <div ref={contentRef} style={{ position: 'relative', zIndex: 1 }} className="font-sans text-foreground">
                <header className="fixed top-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-sm z-50">
                     <div className="max-w-7xl mx-auto flex justify-between items-center">
                        <h1 className="text-2xl font-bold text-primary">Lingofy</h1>
                        <div className="flex items-center gap-2">
                            <ThemeToggle theme={theme} setTheme={setTheme} />
                            <Button onClick={onEnter}>Enter Hub</Button>
                        </div>
                    </div>
                </header>
                
                <main>
                    <section 
                        className="h-screen flex flex-col justify-center items-center text-center px-4"
                    >
                        <motion.div style={{ opacity: heroOpacity, scale: heroScale }}>
                            <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 text-shadow-lg">Your Global Store, Simplified.</h2>
                            <p className="text-lg md:text-xl text-foreground/80 max-w-3xl mx-auto mb-8 text-shadow">
                                Lingofy is the all-in-one hub for creators to build, manage, and grow their e-commerce brand with the power of AI.
                            </p>
                            <Button size="lg" onClick={onEnter}>
                                Start Creating <ArrowRight className="w-5 h-5 ml-2" />
                            </Button>
                        </motion.div>
                    </section>

                    <section className="py-20 px-4 min-h-screen">
                        <motion.div 
                            style={{ opacity: featuresOpacity, y: featuresY }}
                            className="max-w-7xl mx-auto"
                        >
                            <div className="text-center mb-12">
                                <h3 className="text-3xl font-bold">A toolkit built for creators.</h3>
                                <p className="text-muted-foreground mt-2">Everything you need to succeed, right at your fingertips.</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {/* FIX: Switched to spreading the feature object as props to avoid a potential TypeScript issue with how `key` is handled in JSX. */}
                                {features.map((feature, index) => (
                                    <FeatureCard key={index} {...feature} />
                                ))}
                            </div>
                        </motion.div>
                    </section>
                    
                    <footer className="py-8 text-center text-muted-foreground text-sm bg-background/80 backdrop-blur-sm">
                        <p>&copy; {new Date().getFullYear()} Lingofy. All rights reserved.</p>
                    </footer>
                </main>
            </div>
        </div>
    );
}
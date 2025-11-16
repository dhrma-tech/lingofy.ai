import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Button } from './ui/Button';
import { ArrowRight, Bot, Image, LayoutDashboard } from 'lucide-react';
import { Card, CardContent } from './ui/Card';

interface LandingPageProps {
    onEnter: () => void;
}

const features = [
    {
        icon: <LayoutDashboard className="w-8 h-8 text-primary" />,
        title: "All-in-One Studio",
        description: "Manage your products, content, and site settings from a single, beautifully designed dashboard. No more juggling multiple tools."
    },
    {
        icon: <Bot className="w-8 h-8 text-primary" />,
        title: "AI-Powered Assistant",
        description: "Get help with product descriptions, ask questions about your store, or brainstorm ideas with your integrated AI assistant."
    },
    {
        icon: <Image className="w-8 h-8 text-primary" />,
        title: "Instant Image Generation",
        description: "Don't have professional photos? Generate stunning, high-quality product images with a single click, powered by AI."
    }
];

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => {
    const { ref, inView } = useInView({
        triggerOnce: true,
        threshold: 0.1,
    });

    const variants = {
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0 },
    };

    return (
        <motion.div
            ref={ref}
            variants={variants}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            transition={{ duration: 0.6, ease: 'easeOut' }}
        >
            <Card className="h-full">
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

export function LandingPage({ onEnter }: LandingPageProps) {
    return (
        <div className="min-h-screen bg-background text-foreground font-sans overflow-y-auto">
            <header className="fixed top-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-sm z-50 border-b">
                 <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-primary">Lingofy</h1>
                    <Button onClick={onEnter}>Enter Hub</Button>
                </div>
            </header>
            
            <main className="pt-24">
                {/* Hero Section */}
                <motion.section 
                    className="text-center py-20 px-4"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4">Your Global Store, Simplified.</h2>
                    <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
                        Lingofy is the all-in-one hub for creators to build, manage, and grow their e-commerce brand with the power of AI.
                    </p>
                    <Button size="lg" onClick={onEnter}>
                        Start Creating <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                </motion.section>

                {/* Features Section */}
                <section className="py-20 px-4 bg-muted/50">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-12">
                            <h3 className="text-3xl font-bold">A toolkit built for creators.</h3>
                            <p className="text-muted-foreground mt-2">Everything you need to succeed, right at your fingertips.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {features.map((feature, index) => (
                                <FeatureCard key={index} {...feature} />
                            ))}
                        </div>
                    </div>
                </section>
                
                <footer className="py-8 text-center text-muted-foreground text-sm">
                    <p>&copy; {new Date().getFullYear()} Lingofy. All rights reserved.</p>
                </footer>
            </main>
        </div>
    );
}
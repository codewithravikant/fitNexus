'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Leaf, Sparkles, Activity, Shield, ArrowRight } from 'lucide-react';

const ThreeCanvas = dynamic(
  () => import('@/components/three/three-canvas').then((m) => m.ThreeCanvas),
  { ssr: false }
);

const LandingScene = dynamic(
  () => import('@/components/three/landing-scene').then((m) => m.LandingScene),
  { ssr: false }
);

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.5, ease: 'easeOut' as const },
  }),
};

const features = [
  {
    icon: Sparkles,
    title: '3 Daily Actions',
    description: 'AI-personalized actions adapted to your stress and recovery level',
  },
  {
    icon: Activity,
    title: 'Wellness Score',
    description: 'A single number combining habits, activity, progress, and metabolic health',
  },
  {
    icon: Shield,
    title: 'Anti-Obsessive Design',
    description: 'Metrics where they matter, not on your home screen. Encouragement over anxiety.',
  },
];

const steps = [
  { num: '1', title: 'Complete onboarding', desc: '60 seconds to tell FitNexus about you' },
  { num: '2', title: 'Get your Top 3', desc: 'Personalized actions every morning' },
  { num: '3', title: 'Track & improve', desc: 'Watch your wellness score climb' },
];

export default function LandingPage() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/home');
    }
  }, [status, router]);

  if (status === 'loading') return null;
  if (status === 'authenticated') return null;

  return (
    <div className="min-h-screen bg-background bg-mesh">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-[rgba(52,211,153,0.08)] bg-[rgba(10,18,14,0.8)] backdrop-blur-2xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-[0_0_20px_rgba(52,211,153,0.3)]">
              <Leaf className="h-5 w-5" />
            </div>
            <span className="font-bold text-lg gradient-text">FitNexus</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button className="gap-2">
                Get Started <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Extra ambient glow for hero */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />

        <div className="mx-auto max-w-6xl px-6 py-24 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: text content */}
            <motion.div
              initial="hidden"
              animate="visible"
              className="space-y-8"
            >
              <motion.div variants={fadeUp} custom={0} className="flex">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-[0_0_40px_rgba(52,211,153,0.4)]">
                  <Leaf className="h-7 w-7" />
                </div>
              </motion.div>

              <motion.h1
                variants={fadeUp}
                custom={1}
                className="text-4xl font-bold font-heading tracking-tight sm:text-5xl lg:text-6xl"
              >
                Your AI{' '}
                <span className="gradient-text">
                  wellness coach
                </span>
              </motion.h1>

              <motion.p
                variants={fadeUp}
                custom={2}
                className="max-w-xl text-lg text-muted-foreground"
              >
                3 personalized wellness actions every day, adapted to your stress and recovery.
                Built for busy professionals who want results without obsession.
              </motion.p>

              <motion.div variants={fadeUp} custom={3} className="flex gap-4">
                <Link href="/signup">
                  <Button size="lg" className="gap-2">
                    Get Started <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline">
                    Sign In
                  </Button>
                </Link>
              </motion.div>
            </motion.div>

            {/* Right: 3D Orb */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="flex items-center justify-center"
            >
              <div className="relative h-80 w-80 lg:h-96 lg:w-96">
                {/* Glow behind orb */}
                <div className="absolute inset-0 rounded-full bg-primary/10 blur-3xl animate-glow" />
                <ThreeCanvas className="h-full w-full relative z-10">
                  <LandingScene />
                </ThreeCanvas>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-[rgba(52,211,153,0.08)] bg-[rgba(15,25,20,0.3)] py-20 relative z-10">
        <div className="mx-auto max-w-5xl px-6">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-12 text-center text-3xl font-bold font-heading"
          >
            Wellness, <span className="gradient-text">simplified</span>
          </motion.h2>
          <div className="grid gap-8 md:grid-cols-3">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-panel rounded-xl p-8 text-center hover:scale-[1.02] transition-transform duration-300"
              >
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 shadow-[inset_0_0_20px_rgba(52,211,153,0.1)]">
                  <feature.icon className="h-7 w-7 text-primary drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 relative z-10">
        <div className="mx-auto max-w-5xl px-6">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-12 text-center text-3xl font-bold font-heading"
          >
            How it <span className="gradient-text">works</span>
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col items-center text-center gap-3"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 text-white font-bold text-lg shadow-[0_0_30px_rgba(52,211,153,0.3)]">
                  {step.num}
                </div>
                <p className="font-semibold text-lg">{step.title}</p>
                <p className="text-muted-foreground">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-[rgba(52,211,153,0.08)] bg-gradient-to-b from-[rgba(15,25,20,0.3)] to-background py-20 relative z-10">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold font-heading mb-4">Ready to start with <span className="gradient-text">FitNexus</span>?</h2>
            <p className="text-muted-foreground mb-6">Start in 60 seconds. No credit card required.</p>
            <Link href="/signup">
              <Button size="lg" className="gap-2">
                Create Free Account <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[rgba(52,211,153,0.08)] py-6 text-center text-sm text-muted-foreground relative z-10">
        <p>FitNexus — numbers-don&apos;t-lie wellness platform</p>
      </footer>
    </div>
  );
}

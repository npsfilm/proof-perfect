import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Sparkles, Clock, Shield, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const benefits = [
  {
    icon: Clock,
    title: 'Schnelle Lieferung',
    description: 'Erhalten Sie Ihre bearbeiteten Immobilienbilder innerhalb von 24-48 Stunden.',
    stats: '24-48h'
  },
  {
    icon: Sparkles,
    title: 'Professionelle Qualität',
    description: 'HDR-Bildbearbeitung und virtuelle Möblierung auf höchstem Niveau.',
    stats: '100%'
  },
  {
    icon: Camera,
    title: 'Einfache Bestellung',
    description: 'Laden Sie Ihre Bilder hoch und erhalten Sie professionelle Ergebnisse.',
    stats: '3 Schritte'
  },
  {
    icon: Shield,
    title: 'Faire Preise',
    description: 'Transparente Preisgestaltung ohne versteckte Kosten.',
    stats: 'ab 2,90€'
  }
];

const trustBadges = [
  '500+ zufriedene Kunden',
  '10.000+ bearbeitete Bilder',
  '4.9/5 Bewertung'
];

export function BenefitsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % benefits.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const currentBenefit = benefits[currentIndex];
  const Icon = currentBenefit.icon;

  return (
    <div className="relative h-full w-full bg-gradient-to-br from-[#1a2d4d] via-[#233c63] to-[#2d4a7d] animate-gradient-shift overflow-hidden">
      {/* Pattern Overlay */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" className="text-white"/>
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-center p-12">
        {/* Logo Area */}
        <div className="mb-12">
          <span className="text-2xl font-bold text-white tracking-tight">
            Immo<span className="text-blue-300">On</span>Point
          </span>
        </div>

        {/* Benefit Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {/* Icon */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center"
            >
              <Icon className="w-8 h-8 text-white" />
            </motion.div>

            {/* Stats Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm"
            >
              <span className="text-2xl font-bold text-white">{currentBenefit.stats}</span>
            </motion.div>

            {/* Title & Description */}
            <div className="space-y-3">
              <h2 className="text-3xl font-bold text-white">
                {currentBenefit.title}
              </h2>
              <p className="text-lg text-white/80 max-w-md">
                {currentBenefit.description}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Carousel Indicators */}
        <div className="mt-12 flex items-center gap-2">
          {benefits.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                index === currentIndex 
                  ? "w-8 bg-white" 
                  : "w-2 bg-white/40 hover:bg-white/60"
              )}
            />
          ))}
        </div>

        {/* Trust Badges */}
        <div className="mt-auto pt-12 border-t border-white/10">
          <div className="flex flex-wrap gap-4">
            {trustBadges.map((badge, index) => (
              <motion.div
                key={badge}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="flex items-center gap-2 text-sm text-white/70"
              >
                <ChevronRight className="w-4 h-4" />
                {badge}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

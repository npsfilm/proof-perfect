import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Sparkles, Clock, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

const benefits = [
  {
    icon: Clock,
    title: 'Schnelle Lieferung',
    description: 'Erhalten Sie Ihre bearbeiteten Immobilienbilder innerhalb von 24-48 Stunden.',
    stat: '24-48h'
  },
  {
    icon: Sparkles,
    title: 'Professionelle Qualität',
    description: 'HDR-Bildbearbeitung und virtuelle Möblierung auf höchstem Niveau.',
    stat: '100%'
  },
  {
    icon: Camera,
    title: 'Einfache Bestellung',
    description: 'Laden Sie Ihre Bilder hoch und erhalten Sie professionelle Ergebnisse.',
    stat: '3 Schritte'
  },
  {
    icon: Shield,
    title: 'Faire Preise',
    description: 'Transparente Preisgestaltung ohne versteckte Kosten.',
    stat: 'ab 2,90€'
  }
];

const trustBadges = [
  { value: '500+', label: 'zufriedene Kunden' },
  { value: '10.000+', label: 'bearbeitete Bilder' },
  { value: '4.9/5', label: 'Bewertung' }
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
    <div className="relative h-full w-full overflow-hidden">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a2d4d] via-[#233c63] to-[#2d4a7d] animate-gradient-shift" />
      
      {/* Plus-Sign Pattern Overlay */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      />

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
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {/* Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center"
            >
              <Icon className="w-8 h-8 text-white" />
            </motion.div>

            {/* Stats Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm"
            >
              <span className="text-2xl font-bold text-white">{currentBenefit.stat}</span>
            </motion.div>

            {/* Title & Description */}
            <div className="space-y-3">
              <h3 className="text-3xl font-bold text-white">
                {currentBenefit.title}
              </h3>
              <p className="text-lg text-white/90 max-w-md">
                {currentBenefit.description}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Carousel Indicators */}
        <div className="flex gap-2 mt-12">
          {benefits.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                index === currentIndex 
                  ? "w-8 bg-white" 
                  : "w-1.5 bg-white/40 hover:bg-white/60"
              )}
            />
          ))}
        </div>

        {/* Trust Badges - 3 Column Grid */}
        <div className="mt-16 pt-8 border-t border-white/20">
          <div className="grid grid-cols-3 gap-6 text-center">
            {trustBadges.map((badge, index) => (
              <motion.div
                key={badge.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
              >
                <div className="text-2xl font-bold text-white">{badge.value}</div>
                <div className="text-sm text-white/80">{badge.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

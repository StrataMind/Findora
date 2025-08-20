'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, ArrowRight, Play, Star, TrendingUp, Users, ShoppingBag } from 'lucide-react'
import PremiumButton from '@/components/ui/premium-button'
import PremiumInput from '@/components/ui/premium-input'
import PremiumCard from '@/components/ui/premium-card'
import { pageTransitions, componentAnimations, scrollAnimations } from '@/lib/animations'

const heroStats = [
  { label: 'Active Sellers', value: '10K+', icon: Users },
  { label: 'Products Listed', value: '500K+', icon: ShoppingBag },
  { label: 'Customer Rating', value: '4.9★', icon: Star },
  { label: 'Growth Rate', value: '+127%', icon: TrendingUp }
]

const floatingElements = [
  { id: 1, x: '10%', y: '20%', delay: 0 },
  { id: 2, x: '85%', y: '15%', delay: 0.5 },
  { id: 3, x: '15%', y: '75%', delay: 1 },
  { id: 4, x: '80%', y: '70%', delay: 1.5 },
  { id: 5, x: '50%', y: '85%', delay: 2 }
]

const gradientBg = {
  morning: 'from-orange-400 via-pink-500 to-purple-600',
  day: 'from-blue-400 via-purple-500 to-pink-500',
  evening: 'from-purple-600 via-pink-500 to-red-500',
  night: 'from-gray-900 via-purple-900 to-indigo-900'
}

export default function HeroSection() {
  const [searchQuery, setSearchQuery] = useState('')
  const [currentTime, setCurrentTime] = useState<keyof typeof gradientBg>('day')
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)

  // Dynamic gradient based on time
  useEffect(() => {
    const hour = new Date().getHours()
    if (hour >= 6 && hour < 12) setCurrentTime('morning')
    else if (hour >= 12 && hour < 17) setCurrentTime('day')
    else if (hour >= 17 && hour < 21) setCurrentTime('evening')
    else setCurrentTime('night')
  }, [])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated Gradient Background */}
      <motion.div
        className={`absolute inset-0 bg-gradient-to-br ${gradientBg[currentTime]} opacity-90`}
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%', '0% 0%']
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'linear'
        }}
        style={{
          backgroundSize: '200% 200%'
        }}
      />

      {/* Glass Overlay */}
      <div className="absolute inset-0 glass" />

      {/* Floating Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {floatingElements.map((element) => (
          <motion.div
            key={element.id}
            className="absolute w-2 h-2 bg-white rounded-full opacity-30"
            style={{
              left: element.x,
              top: element.y
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.3, 0.8, 0.3]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: element.delay,
              ease: 'easeInOut'
            }}
          />
        ))}
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Main Heading */}
          <motion.div
            variants={pageTransitions.fadeInUp}
            initial="initial"
            animate="animate"
            className="mb-8"
          >
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 font-accent">
              <motion.span
                className="block"
                variants={pageTransitions.slideLeft}
                initial="initial"
                animate="animate"
                transition={{ delay: 0.2 }}
              >
                Discover
              </motion.span>
              <motion.span
                className="block bg-gradient-to-r from-gold to-coral bg-clip-text text-transparent"
                variants={pageTransitions.slideRight}
                initial="initial"
                animate="animate"
                transition={{ delay: 0.4 }}
              >
                Everything
              </motion.span>
              <motion.span
                className="block"
                variants={pageTransitions.slideLeft}
                initial="initial"
                animate="animate"
                transition={{ delay: 0.6 }}
              >
                Amazing
              </motion.span>
            </h1>
            
            <motion.p
              className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed"
              variants={pageTransitions.fadeInUp}
              initial="initial"
              animate="animate"
              transition={{ delay: 0.8 }}
            >
              India's most beautiful marketplace where quality meets convenience. 
              Shop from verified sellers, enjoy premium experiences, and discover products you'll love.
            </motion.p>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            className="max-w-2xl mx-auto mb-12"
            variants={pageTransitions.scaleIn}
            initial="initial"
            animate="animate"
            transition={{ delay: 1 }}
          >
            <div className="relative">
              <PremiumInput
                variant="glass"
                size="lg"
                placeholder="Search for products, brands, or anything..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={<Search />}
                className="text-white placeholder:text-white/70 pr-32"
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                <PremiumButton
                  variant="gradient"
                  size="md"
                  icon={<Search />}
                  className="shadow-lg"
                >
                  Search
                </PremiumButton>
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16"
            variants={pageTransitions.fadeInUp}
            initial="initial"
            animate="animate"
            transition={{ delay: 1.2 }}
          >
            <PremiumButton
              variant="primary"
              size="lg"
              icon={<ShoppingBag />}
              glow
              shimmer
              className="text-lg px-8 py-4"
            >
              Start Shopping
            </PremiumButton>
            
            <PremiumButton
              variant="glass"
              size="lg"
              icon={<Play />}
              onClick={() => setIsVideoPlaying(true)}
              className="text-white border-white/30 hover:bg-white/20"
            >
              Watch Demo
            </PremiumButton>
          </motion.div>

          {/* Stats Section */}
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
            variants={componentAnimations.list}
            initial="initial"
            animate="animate"
          >
            {heroStats.map((stat, index) => (
              <motion.div
                key={stat.label}
                variants={componentAnimations.listItem}
                custom={index}
                whileHover={{ scale: 1.05 }}
                className="group"
              >
                <PremiumCard
                  variant="glass"
                  size="sm"
                  className="text-center text-white border-white/20 hover:border-white/40 transition-all duration-300"
                  hover={false}
                >
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center group-hover:bg-white/30 transition-colors">
                      <stat.icon className="w-4 h-4" />
                    </div>
                    <div className="font-bold text-xl font-accent">
                      {stat.value}
                    </div>
                    <div className="text-sm text-white/70">
                      {stat.label}
                    </div>
                  </div>
                </PremiumCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        animate={{
          y: [0, 10, 0]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      >
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/50 rounded-full mt-2" />
        </div>
      </motion.div>

      {/* Video Modal */}
      <AnimatePresence>
        {isVideoPlaying && (
          <motion.div
            className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
            variants={componentAnimations.modalBackdrop}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={() => setIsVideoPlaying(false)}
          >
            <motion.div
              className="relative max-w-4xl w-full aspect-video bg-black rounded-2xl overflow-hidden"
              variants={componentAnimations.modal}
              initial="initial"
              animate="animate"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Video placeholder - replace with actual video */}
              <div className="w-full h-full bg-gradient-to-br from-purple-900 to-blue-900 flex items-center justify-center">
                <div className="text-center text-white">
                  <Play className="w-16 h-16 mx-auto mb-4 opacity-60" />
                  <p className="text-xl">Demo Video Coming Soon</p>
                  <p className="text-sm opacity-70 mt-2">Experience the future of online shopping</p>
                </div>
              </div>
              
              {/* Close Button */}
              <button
                onClick={() => setIsVideoPlaying(false)}
                className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors"
              >
                ×
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

export { HeroSection }
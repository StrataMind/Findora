'use client'

import React, { useState, useRef } from 'react'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { 
  TrendingUp, 
  MapPin, 
  Leaf, 
  PlayCircle, 
  Eye, 
  Heart, 
  ShoppingCart,
  Star,
  ArrowRight,
  Sparkles,
  Award,
  Users
} from 'lucide-react'
import PremiumButton from '@/components/ui/premium-button'
import PremiumCard, { StatCard } from '@/components/ui/premium-card'
import { scrollAnimations, componentAnimations, specialEffects } from '@/lib/animations'

// Mock data for demonstrations
const trendingProducts = [
  {
    id: 1,
    name: "Wireless Headphones Pro",
    price: 2999,
    originalPrice: 4999,
    image: "/api/placeholder/300/300",
    rating: 4.8,
    reviews: 1205,
    trending: "+47%"
  },
  {
    id: 2,
    name: "Smart Fitness Watch",
    price: 8999,
    originalPrice: 12999,
    image: "/api/placeholder/300/300",
    rating: 4.9,
    reviews: 856,
    trending: "+73%"
  },
  {
    id: 3,
    name: "Organic Coffee Beans",
    price: 599,
    originalPrice: 799,
    image: "/api/placeholder/300/300",
    rating: 4.7,
    reviews: 432,
    trending: "+28%"
  }
]

const localMakers = [
  {
    id: 1,
    name: "Mumbai Artisan Co.",
    specialty: "Handcrafted Jewelry",
    products: 156,
    rating: 4.9,
    image: "/api/placeholder/150/150",
    location: "Mumbai, MH",
    verified: true
  },
  {
    id: 2,
    name: "Kerala Spice House",
    specialty: "Organic Spices",
    products: 89,
    rating: 4.8,
    image: "/api/placeholder/150/150",
    location: "Kochi, KL",
    verified: true
  },
  {
    id: 3,
    name: "Rajasthan Textiles",
    specialty: "Traditional Fabrics",
    products: 234,
    rating: 4.9,
    image: "/api/placeholder/150/150",
    location: "Jaipur, RJ",
    verified: true
  }
]

const sustainableProducts = [
  {
    id: 1,
    name: "Bamboo Toothbrush Set",
    impact: "Saves 50kg CO2",
    price: 299,
    image: "/api/placeholder/200/200",
    eco_score: 95
  },
  {
    id: 2,
    name: "Solar Power Bank",
    impact: "100% Renewable",
    price: 1299,
    image: "/api/placeholder/200/200",
    eco_score: 90
  },
  {
    id: 3,
    name: "Organic Cotton Tote",
    impact: "Plastic-Free",
    price: 199,
    image: "/api/placeholder/200/200",
    eco_score: 88
  }
]

export default function DiscoveryZones() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  })

  const y = useTransform(scrollYProgress, [0, 1], [100, -100])
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 360])

  return (
    <div ref={containerRef} className="relative py-24 bg-gradient-to-br from-gray-50 to-white overflow-hidden">
      {/* Background Elements */}
      <motion.div
        className="absolute top-10 right-10 w-64 h-64 bg-gradient-coral opacity-10 rounded-full blur-3xl"
        style={{ y, rotate }}
      />
      <motion.div
        className="absolute bottom-10 left-10 w-96 h-96 bg-gradient-gold opacity-5 rounded-full blur-3xl"
        style={{ y: useTransform(y, (value) => -value) }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Trending Now Section */}
        <motion.section
          className="mb-20"
          variants={scrollAnimations.fadeInUp}
          initial="initial"
          whileInView="whileInView"
          viewport={{ once: true, margin: '-100px' }}
        >
          <div className="text-center mb-12">
            <motion.div
              className="inline-flex items-center gap-2 bg-coral/10 text-coral px-6 py-2 rounded-full text-sm font-semibold mb-4"
              variants={specialEffects.sparkle}
              animate="animate"
            >
              <TrendingUp className="w-4 h-4" />
              Trending Now
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 font-accent">
              What's Hot Right Now
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover the products everyone's talking about. Updated every hour based on real-time data.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {trendingProducts.map((product, index) => (
              <motion.div
                key={product.id}
                variants={{
                  initial: { opacity: 0, y: 50, rotateY: -30 },
                  whileInView: { 
                    opacity: 1, 
                    y: 0, 
                    rotateY: 0,
                    transition: { 
                      delay: index * 0.2,
                      duration: 0.8,
                      ease: "backOut"
                    }
                  }
                }}
                initial="initial"
                whileInView="whileInView"
                viewport={{ once: true }}
                whileHover={{ 
                  y: -10, 
                  rotateY: 5,
                  scale: 1.02,
                  transition: { duration: 0.3 }
                }}
                className="group cursor-pointer"
                style={{ transformStyle: 'preserve-3d' }}
              >
                <PremiumCard 
                  variant="premium" 
                  className="h-full overflow-hidden relative"
                  hover={false}
                >
                  {/* Trending Badge */}
                  <div className="absolute top-4 left-4 z-10">
                    <div className="bg-coral text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      {product.trending}
                    </div>
                  </div>

                  {/* Product Image */}
                  <div className="relative overflow-hidden rounded-lg mb-4">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    {/* Quick Actions */}
                    <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                      <button className="w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg">
                        <Heart className="w-4 h-4 text-gray-700" />
                      </button>
                      <button className="w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg">
                        <Eye className="w-4 h-4 text-gray-700" />
                      </button>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-2">
                    <h3 className="font-semibold text-lg text-gray-900 mb-2 group-hover:text-coral transition-colors">
                      {product.name}
                    </h3>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-medium text-gray-700">{product.rating}</span>
                      </div>
                      <span className="text-sm text-gray-500">({product.reviews} reviews)</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-gray-900">₹{product.price.toLocaleString()}</span>
                        <span className="text-sm text-gray-500 line-through">₹{product.originalPrice.toLocaleString()}</span>
                      </div>
                      <div className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold">
                        {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                      </div>
                    </div>

                    <motion.div
                      className="mt-4"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <PremiumButton
                        variant="primary"
                        size="sm"
                        fullWidth
                        icon={<ShoppingCart />}
                        className="group-hover:shadow-glow"
                      >
                        Add to Cart
                      </PremiumButton>
                    </motion.div>
                  </div>
                </PremiumCard>
              </motion.div>
            ))}
          </div>

          <motion.div
            className="text-center mt-12"
            variants={scrollAnimations.fadeInUp}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true }}
          >
            <PremiumButton
              variant="outline"
              size="lg"
              icon={<ArrowRight />}
              iconPosition="right"
            >
              View All Trending Products
            </PremiumButton>
          </motion.div>
        </motion.section>

        {/* Local Makers Section */}
        <motion.section
          className="mb-20"
          variants={scrollAnimations.fadeInUp}
          initial="initial"
          whileInView="whileInView"
          viewport={{ once: true, margin: '-100px' }}
        >
          <div className="text-center mb-12">
            <motion.div
              className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-6 py-2 rounded-full text-sm font-semibold mb-4"
              variants={componentAnimations.pulse}
              animate="animate"
            >
              <MapPin className="w-4 h-4" />
              Local Makers
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 font-accent">
              Support Local Artisans
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover authentic products from local makers across India. Every purchase supports local communities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {localMakers.map((maker, index) => (
              <motion.div
                key={maker.id}
                variants={{
                  initial: { opacity: 0, scale: 0.8, z: -100 },
                  whileInView: { 
                    opacity: 1, 
                    scale: 1, 
                    z: 0,
                    transition: { 
                      delay: index * 0.15,
                      duration: 0.6,
                      type: "spring",
                      bounce: 0.4
                    }
                  }
                }}
                initial="initial"
                whileInView="whileInView"
                viewport={{ once: true }}
                whileHover={{ 
                  y: -8,
                  rotateX: 5,
                  rotateY: 5,
                  transition: { duration: 0.3 }
                }}
                className="cursor-pointer"
                style={{ transformStyle: 'preserve-3d' }}
              >
                <PremiumCard variant="glass" className="h-full text-center relative group">
                  {/* Verified Badge */}
                  {maker.verified && (
                    <div className="absolute top-4 right-4">
                      <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center">
                        <Award className="w-4 h-4" />
                      </div>
                    </div>
                  )}

                  <div className="p-6">
                    <div className="relative mb-4">
                      <img
                        src={maker.image}
                        alt={maker.name}
                        className="w-20 h-20 rounded-full mx-auto object-cover border-4 border-white shadow-lg group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                        <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                          <div className="w-1 h-1 bg-white rounded-full animate-pulse" />
                          Online
                        </div>
                      </div>
                    </div>

                    <h3 className="font-bold text-xl text-gray-900 mb-2">{maker.name}</h3>
                    <p className="text-gray-600 mb-3">{maker.specialty}</p>
                    
                    <div className="flex items-center justify-center gap-1 mb-3">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="font-semibold">{maker.rating}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                      <div className="text-center">
                        <div className="font-semibold text-gray-900">{maker.products}</div>
                        <div className="text-gray-600">Products</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-gray-900 flex items-center justify-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {maker.location.split(', ')[0]}
                        </div>
                        <div className="text-gray-600">{maker.location.split(', ')[1]}</div>
                      </div>
                    </div>

                    <PremiumButton
                      variant="outline"
                      size="sm"
                      fullWidth
                      icon={<Eye />}
                    >
                      View Store
                    </PremiumButton>
                  </div>
                </PremiumCard>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Sustainable Choices Section */}
        <motion.section
          className="mb-20"
          variants={scrollAnimations.fadeInUp}
          initial="initial"
          whileInView="whileInView"
          viewport={{ once: true, margin: '-100px' }}
        >
          <div className="text-center mb-12">
            <motion.div
              className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-6 py-2 rounded-full text-sm font-semibold mb-4"
              variants={specialEffects.heartbeat}
              animate="animate"
            >
              <Leaf className="w-4 h-4" />
              Sustainable Choices
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 font-accent">
              Shop Responsibly
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Make a positive impact with every purchase. Discover eco-friendly products that are good for you and the planet.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {sustainableProducts.map((product, index) => (
              <motion.div
                key={product.id}
                variants={{
                  initial: { opacity: 0, y: 60, rotateX: -30 },
                  whileInView: { 
                    opacity: 1, 
                    y: 0, 
                    rotateX: 0,
                    transition: { 
                      delay: index * 0.2,
                      duration: 0.7,
                      ease: [0.25, 0.46, 0.45, 0.94]
                    }
                  }
                }}
                initial="initial"
                whileInView="whileInView"
                viewport={{ once: true }}
                whileHover={{ 
                  y: -6,
                  rotateY: 3,
                  transition: { duration: 0.3 }
                }}
                className="cursor-pointer group"
                style={{ transformStyle: 'preserve-3d' }}
              >
                <PremiumCard variant="floating" className="h-full relative overflow-hidden">
                  {/* Eco Score Badge */}
                  <div className="absolute top-4 left-4 z-10">
                    <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                      <Leaf className="w-3 h-3" />
                      {product.eco_score}
                    </div>
                  </div>

                  <div className="relative">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-green-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>

                  <div className="p-6">
                    <h3 className="font-semibold text-lg text-gray-900 mb-2">{product.name}</h3>
                    <p className="text-green-600 font-medium mb-4 flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      {product.impact}
                    </p>
                    
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl font-bold text-gray-900">₹{product.price.toLocaleString()}</span>
                      <div className="flex items-center gap-1">
                        <div className="w-12 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-green-500 rounded-full transition-all duration-1000"
                            style={{ width: `${product.eco_score}%` }}
                          />
                        </div>
                        <span className="text-sm text-green-600 font-medium">{product.eco_score}%</span>
                      </div>
                    </div>

                    <PremiumButton
                      variant="primary"
                      size="sm"
                      fullWidth
                      icon={<Leaf />}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Choose Sustainable
                    </PremiumButton>
                  </div>
                </PremiumCard>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Live Shopping Section Preview */}
        <motion.section
          variants={scrollAnimations.fadeInUp}
          initial="initial"
          whileInView="whileInView"
          viewport={{ once: true, margin: '-100px' }}
          className="text-center"
        >
          <PremiumCard variant="gradient" gradient="primary" size="lg" className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1 text-left">
                <motion.div
                  className="inline-flex items-center gap-2 bg-white/20 text-white px-4 py-2 rounded-full text-sm font-semibold mb-4"
                  variants={componentAnimations.pulse}
                  animate="animate"
                >
                  <PlayCircle className="w-4 h-4" />
                  Live Shopping
                </motion.div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4 font-accent">
                  Join Live Shopping Events
                </h2>
                <p className="text-xl text-white/90 mb-6">
                  Watch live product demonstrations, get exclusive deals, and interact with sellers in real-time.
                </p>
                <PremiumButton
                  variant="glass"
                  size="lg"
                  icon={<Users />}
                  className="text-white border-white/30 hover:bg-white/20"
                >
                  Join Next Event
                </PremiumButton>
              </div>
              
              <div className="flex-shrink-0">
                <motion.div
                  className="w-64 h-40 bg-white/10 rounded-xl flex items-center justify-center relative overflow-hidden"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                >
                  <PlayCircle className="w-16 h-16 text-white/80" />
                  <div className="absolute top-4 right-4 bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold flex items-center gap-1">
                    <div className="w-1 h-1 bg-white rounded-full animate-pulse" />
                    LIVE
                  </div>
                  <div className="absolute bottom-4 left-4 text-white text-sm">
                    <div className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      2.5K watching
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </PremiumCard>
        </motion.section>
      </div>
    </div>
  )
}

export { DiscoveryZones }
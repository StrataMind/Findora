/**
 * 🎬 Findora Animation System
 * Beautiful, performant animations using Framer Motion
 */

import { Variants, Transition } from 'framer-motion'

// 🎯 Animation Presets
export const animationPresets = {
  // Easing functions
  easing: {
    smooth: [0.4, 0, 0.2, 1],
    bounce: [0.68, -0.55, 0.265, 1.55],
    elastic: [0.25, 0.46, 0.45, 0.94],
    spring: { type: 'spring', stiffness: 300, damping: 30 }
  },
  
  // Duration presets
  duration: {
    fast: 0.15,
    normal: 0.3,
    slow: 0.5,
    slower: 0.8
  }
} as const

// 🌟 Page Transitions
export const pageTransitions: Record<string, Variants> = {
  // Slide transitions
  slideLeft: {
    initial: { x: -100, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: 100, opacity: 0 }
  },
  
  slideRight: {
    initial: { x: 100, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -100, opacity: 0 }
  },
  
  slideUp: {
    initial: { y: 100, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: -100, opacity: 0 }
  },
  
  slideDown: {
    initial: { y: -100, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: 100, opacity: 0 }
  },
  
  // Scale transitions
  scaleIn: {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.8, opacity: 0 }
  },
  
  scaleOut: {
    initial: { scale: 1.2, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.8, opacity: 0 }
  },
  
  // Fade transitions
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
  },
  
  fadeBlur: {
    initial: { opacity: 0, filter: 'blur(10px)' },
    animate: { opacity: 1, filter: 'blur(0px)' },
    exit: { opacity: 0, filter: 'blur(10px)' }
  }
}

// 🎨 Component Animations
export const componentAnimations: Record<string, Variants> = {
  // Button animations
  button: {
    rest: { scale: 1 },
    hover: { scale: 1.02, transition: { duration: 0.15 } },
    tap: { scale: 0.98, transition: { duration: 0.1 } }
  },
  
  buttonGlow: {
    rest: { boxShadow: '0 0 0 rgba(255, 107, 107, 0)' },
    hover: { 
      boxShadow: '0 0 20px rgba(255, 107, 107, 0.3)',
      transition: { duration: 0.3 }
    }
  },
  
  // Card animations
  card: {
    rest: { y: 0, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' },
    hover: { 
      y: -4, 
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
      transition: { duration: 0.3, ease: animationPresets.easing.smooth }
    }
  },
  
  cardFloat: {
    animate: {
      y: [0, -10, 0],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    }
  },
  
  // Modal animations
  modal: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        duration: 0.3,
        ease: animationPresets.easing.bounce
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.8,
      transition: { duration: 0.2 }
    }
  },
  
  modalBackdrop: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
  },
  
  // List animations
  list: {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  },
  
  listItem: {
    initial: { opacity: 0, x: -20 },
    animate: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.3 }
    }
  },
  
  // Image animations
  image: {
    initial: { opacity: 0, scale: 1.1 },
    animate: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.5 }
    }
  },
  
  imageZoom: {
    rest: { scale: 1 },
    hover: { 
      scale: 1.05,
      transition: { duration: 0.3 }
    }
  },
  
  // Text animations
  text: {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  },
  
  textReveal: {
    initial: { opacity: 0, rotateX: 90 },
    animate: { 
      opacity: 1, 
      rotateX: 0,
      transition: { duration: 0.6, ease: animationPresets.easing.bounce }
    }
  },
  
  // Loading animations
  spinner: {
    animate: {
      rotate: 360,
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: 'linear'
      }
    }
  },
  
  pulse: {
    animate: {
      scale: [1, 1.1, 1],
      opacity: [1, 0.8, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    }
  },
  
  shimmer: {
    animate: {
      backgroundPosition: ['200% 0', '-200% 0'],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'linear'
      }
    }
  }
}

// 🌊 Scroll Animations
export const scrollAnimations: Record<string, Variants> = {
  fadeInUp: {
    initial: { opacity: 0, y: 60 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-100px' },
    transition: { duration: 0.6, ease: animationPresets.easing.smooth }
  },
  
  fadeInDown: {
    initial: { opacity: 0, y: -60 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-100px' },
    transition: { duration: 0.6, ease: animationPresets.easing.smooth }
  },
  
  fadeInLeft: {
    initial: { opacity: 0, x: -60 },
    whileInView: { opacity: 1, x: 0 },
    viewport: { once: true, margin: '-100px' },
    transition: { duration: 0.6, ease: animationPresets.easing.smooth }
  },
  
  fadeInRight: {
    initial: { opacity: 0, x: 60 },
    whileInView: { opacity: 1, x: 0 },
    viewport: { once: true, margin: '-100px' },
    transition: { duration: 0.6, ease: animationPresets.easing.smooth }
  },
  
  scaleInView: {
    initial: { opacity: 0, scale: 0.8 },
    whileInView: { opacity: 1, scale: 1 },
    viewport: { once: true, margin: '-100px' },
    transition: { duration: 0.6, ease: animationPresets.easing.bounce }
  },
  
  rotateInView: {
    initial: { opacity: 0, rotate: -180 },
    whileInView: { opacity: 1, rotate: 0 },
    viewport: { once: true, margin: '-100px' },
    transition: { duration: 0.8, ease: animationPresets.easing.bounce }
  }
}

// 🎪 Special Effects
export const specialEffects: Record<string, Variants> = {
  // Confetti-like effect for celebrations
  celebrate: {
    animate: {
      scale: [0, 1, 1, 1, 0],
      rotate: [0, 0, 270, 270, 0],
      borderRadius: ['20%', '20%', '50%', '50%', '20%'],
      transition: {
        duration: 2,
        ease: 'easeInOut'
      }
    }
  },
  
  // Magical sparkle effect
  sparkle: {
    animate: {
      scale: [0, 1, 0],
      rotate: [0, 180, 360],
      opacity: [0, 1, 0],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    }
  },
  
  // Heartbeat effect for likes
  heartbeat: {
    animate: {
      scale: [1, 1.2, 1],
      transition: {
        duration: 0.6,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    }
  },
  
  // Typewriter effect
  typewriter: {
    initial: { width: 0 },
    animate: { width: 'auto' },
    transition: { duration: 2, ease: 'easeInOut' }
  },
  
  // Gradient shift effect
  gradientShift: {
    animate: {
      backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    }
  }
}

// 🎬 Animation Utilities
export const createStaggerAnimation = (staggerDelay: number = 0.1): Variants => ({
  animate: {
    transition: {
      staggerChildren: staggerDelay
    }
  }
})

export const createDelayedAnimation = (delay: number = 0): Transition => ({
  delay,
  duration: 0.5,
  ease: animationPresets.easing.smooth
})

export const createSpringAnimation = (stiffness: number = 300, damping: number = 30): Transition => ({
  type: 'spring',
  stiffness,
  damping
})

// 🎪 Hover Effects
export const hoverEffects = {
  lift: {
    rest: { y: 0 },
    hover: { y: -2, transition: { duration: 0.2 } }
  },
  
  glow: {
    rest: { boxShadow: '0 0 0 rgba(255, 107, 107, 0)' },
    hover: { boxShadow: '0 0 20px rgba(255, 107, 107, 0.4)' }
  },
  
  scale: {
    rest: { scale: 1 },
    hover: { scale: 1.02, transition: { duration: 0.2 } }
  },
  
  rotate: {
    rest: { rotate: 0 },
    hover: { rotate: 3, transition: { duration: 0.2 } }
  },
  
  shimmer: {
    hover: {
      backgroundImage: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)',
      backgroundSize: '200% 100%',
      backgroundPosition: '-200% 0',
      animate: {
        backgroundPosition: '200% 0'
      },
      transition: { duration: 0.6 }
    }
  }
}

// 🎨 Theme-based animations
export const createThemeAnimation = (theme: 'light' | 'dark'): Variants => ({
  initial: { opacity: 0 },
  animate: { 
    opacity: 1,
    backgroundColor: theme === 'dark' ? '#0B1426' : '#FFFFFF',
    color: theme === 'dark' ? '#FFFFFF' : '#2C3E50'
  },
  transition: { duration: 0.5, ease: animationPresets.easing.smooth }
})

// 🌟 Export commonly used transition presets
export const transitions: Record<string, Transition> = {
  smooth: { duration: 0.3, ease: animationPresets.easing.smooth },
  bounce: { duration: 0.5, ease: animationPresets.easing.bounce },
  spring: animationPresets.easing.spring,
  fast: { duration: 0.15, ease: animationPresets.easing.smooth },
  slow: { duration: 0.8, ease: animationPresets.easing.smooth }
}

// 🎪 Advanced Animations for Complex Components
export const advancedAnimations = {
  // Shopping cart slide-in
  cartSlideIn: {
    initial: { x: '100%', opacity: 0 },
    animate: { 
      x: 0, 
      opacity: 1,
      transition: { 
        type: 'spring',
        stiffness: 300,
        damping: 30
      }
    },
    exit: { 
      x: '100%', 
      opacity: 0,
      transition: { duration: 0.3 }
    }
  },
  
  // Product image gallery
  imageGallery: {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  },
  
  // Notification toast
  toast: {
    initial: { opacity: 0, y: 50, scale: 0.3 },
    animate: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { 
        duration: 0.4,
        ease: [0.4, 0, 0.2, 1]
      }
    },
    exit: { 
      opacity: 0, 
      y: 20, 
      scale: 0.5,
      transition: { duration: 0.2 }
    }
  }
}

export default {
  pageTransitions,
  componentAnimations,
  scrollAnimations,
  specialEffects,
  hoverEffects,
  advancedAnimations,
  transitions,
  animationPresets
}
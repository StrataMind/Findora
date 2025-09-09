'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useCart } from '@/contexts/cart-context'
import { motion } from 'framer-motion'
import {
  Search,
  ShoppingCart,
  User,
  Menu,
  X,
  Package,
  Store,
  Settings,
  LogOut,
  Heart,
  Bell,
  Tag,
  TrendingUp
} from 'lucide-react'

export default function Header() {
  const { data: session } = useSession()
  const router = useRouter()
  const { state, toggleCart } = useCart()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [notificationCount, setNotificationCount] = useState(3) // Mock notification count
  const [showNotifications, setShowNotifications] = useState(false)
  const [searchSuggestions, setSearchSuggestions] = useState<Array<{
    id: string
    title: string
    type: 'category' | 'product' | 'popular'
    category?: string
  }>>([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  // Mock search suggestions - in production, this would come from your API
  const mockSuggestions = [
    { id: '1', title: 'Smartphones', type: 'category' as const },
    { id: '2', title: 'Laptops', type: 'category' as const },
    { id: '3', title: 'Gaming Headsets', type: 'category' as const },
    { id: '4', title: 'iPhone 15 Pro', type: 'product' as const, category: 'Electronics' },
    { id: '5', title: 'MacBook Air M2', type: 'product' as const, category: 'Electronics' },
    { id: '6', title: 'Sony WH-1000XM5', type: 'product' as const, category: 'Audio' },
    { id: '7', title: 'Wireless earbuds', type: 'popular' as const },
    { id: '8', title: 'Smart watches', type: 'popular' as const },
  ]

  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      const filtered = mockSuggestions.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setSearchSuggestions(filtered)
      setShowSuggestions(true)
    } else {
      setSearchSuggestions([])
      setShowSuggestions(false)
    }
  }, [searchQuery])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
      setShowSuggestions(false)
    }
  }

  const handleSuggestionClick = (suggestion: typeof searchSuggestions[0]) => {
    setSearchQuery(suggestion.title)
    setShowSuggestions(false)
    
    if (suggestion.type === 'category') {
      router.push(`/categories?filter=${encodeURIComponent(suggestion.title)}`)
    } else {
      router.push(`/products?search=${encodeURIComponent(suggestion.title)}`)
    }
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' })
  }

  return (
    <motion.header 
      className="bg-gradient-to-r from-slate-900 to-slate-800 backdrop-blur-xl border-b border-amber-500/20 sticky top-0 z-50 shadow-lg"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div 
            className="flex items-center"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                <Store className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-amber-300 to-orange-400 bg-clip-text text-transparent">
                Findora
              </span>
            </Link>
          </motion.div>

          {/* Enhanced Search Bar with Autocomplete */}
          <div className="flex-1 max-w-2xl mx-8 hidden md:block relative">
            <form onSubmit={handleSearch} className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-amber-400" />
              </div>
              <Input
                type="text"
                placeholder="Search products, categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery && setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                className="pl-12 pr-4 py-3 w-full bg-slate-800/40 border-slate-600/50 text-slate-200 placeholder-slate-400 rounded-xl focus:border-amber-400/60 focus:ring-2 focus:ring-amber-500/20 transition-all duration-300 backdrop-blur-sm"
                autoComplete="off"
              />

              {/* Search Suggestions Dropdown */}
              {showSuggestions && searchSuggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute top-full mt-2 w-full bg-slate-800/95 backdrop-blur-xl rounded-xl shadow-2xl border border-amber-500/20 z-50 max-h-80 overflow-y-auto"
                >
                  <div className="p-3">
                    <div className="text-xs font-semibold text-amber-400 mb-3 flex items-center">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Suggestions
                    </div>
                    {searchSuggestions.map((suggestion, index) => (
                      <motion.button
                        key={suggestion.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="w-full flex items-center px-3 py-2.5 text-sm text-slate-300 hover:text-amber-400 hover:bg-slate-700/50 rounded-lg transition-all duration-200 group"
                      >
                        <div className="flex items-center flex-1">
                          {suggestion.type === 'category' && (
                            <Tag className="w-4 h-4 mr-3 text-green-400 group-hover:text-green-300" />
                          )}
                          {suggestion.type === 'product' && (
                            <Package className="w-4 h-4 mr-3 text-blue-400 group-hover:text-blue-300" />
                          )}
                          {suggestion.type === 'popular' && (
                            <TrendingUp className="w-4 h-4 mr-3 text-orange-400 group-hover:text-orange-300" />
                          )}
                          <div className="text-left">
                            <div className="font-medium">{suggestion.title}</div>
                            {suggestion.category && (
                              <div className="text-xs text-slate-500">in {suggestion.category}</div>
                            )}
                          </div>
                        </div>
                        <div className="text-xs text-slate-500 capitalize ml-2">
                          {suggestion.type}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </form>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              href="/products"
              className="text-slate-300 hover:text-amber-400 font-medium transition-colors duration-300"
            >
              Products
            </Link>

            <Link
              href="/categories"
              className="text-slate-300 hover:text-amber-400 font-medium transition-colors duration-300"
            >
              Categories
            </Link>

            <Link
              href="/sellers"
              className="text-slate-300 hover:text-amber-400 font-medium transition-colors duration-300"
            >
              Sellers
            </Link>

            {/* Notification Bell */}
            {session && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-slate-300 hover:text-amber-400 transition-colors duration-300"
                aria-label="Notifications"
              >
                <Bell className="w-6 h-6" />
                {notificationCount > 0 && (
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg"
                  >
                    {notificationCount > 99 ? '99+' : notificationCount}
                  </motion.span>
                )}
              </motion.button>
            )}

            {/* Cart Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleCart}
              className="relative p-2 text-slate-300 hover:text-amber-400 transition-colors duration-300"
              aria-label="Shopping cart"
            >
              <ShoppingCart className="w-6 h-6" />
              {state.totalItems > 0 && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg"
                >
                  {state.totalItems > 99 ? '99+' : state.totalItems}
                </motion.span>
              )}
            </motion.button>

            {/* User Menu */}
            {session ? (
              <div className="relative group">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center space-x-3 text-slate-300 hover:text-amber-400 transition-colors duration-300"
                >
                  <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-medium">{session.user?.name}</span>
                </motion.button>
                
                {/* Dropdown Menu */}
                <div className="absolute right-0 top-full mt-2 w-52 bg-slate-800/90 backdrop-blur-xl rounded-xl shadow-2xl border border-amber-500/20 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                  <div className="py-3">
                    <Link
                      href="/profile"
                      className="flex items-center px-4 py-3 text-sm text-slate-300 hover:text-amber-400 hover:bg-slate-700/50 transition-all duration-200"
                    >
                      <User className="w-4 h-4 mr-3" />
                      Profile
                    </Link>
                    <Link
                      href="/orders"
                      className="flex items-center px-4 py-3 text-sm text-slate-300 hover:text-amber-400 hover:bg-slate-700/50 transition-all duration-200"
                    >
                      <Package className="w-4 h-4 mr-3" />
                      Orders
                    </Link>
                    <Link
                      href="/wishlist"
                      className="flex items-center px-4 py-3 text-sm text-slate-300 hover:text-amber-400 hover:bg-slate-700/50 transition-all duration-200"
                    >
                      <Heart className="w-4 h-4 mr-3" />
                      Wishlist
                    </Link>
                    {session.user?.role === 'SELLER' && (
                      <>
                        <div className="border-t border-slate-600/30 my-2"></div>
                        <Link
                          href="/seller/dashboard"
                          className="flex items-center px-4 py-3 text-sm text-slate-300 hover:text-amber-400 hover:bg-slate-700/50 transition-all duration-200"
                        >
                          <Store className="w-4 h-4 mr-3" />
                          Seller Dashboard
                        </Link>
                      </>
                    )}
                    <div className="border-t border-slate-600/30 my-2"></div>
                    <Link
                      href="/settings"
                      className="flex items-center px-4 py-3 text-sm text-slate-300 hover:text-amber-400 hover:bg-slate-700/50 transition-all duration-200"
                    >
                      <Settings className="w-4 h-4 mr-3" />
                      Settings
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center w-full px-4 py-3 text-sm text-slate-300 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link href="/auth/signin">
                  <Button variant="ghost" size="sm" className="text-slate-300 hover:text-amber-400 hover:bg-slate-700/50 border-slate-600/50">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button size="sm" className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            {/* Mobile Notification Bell */}
            {session && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-slate-300 hover:text-amber-400 transition-colors"
                aria-label="Notifications"
              >
                <Bell className="w-6 h-6" />
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {notificationCount > 99 ? '99+' : notificationCount}
                  </span>
                )}
              </motion.button>
            )}

            {/* Mobile Cart Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleCart}
              className="relative p-2 text-slate-300 hover:text-amber-400 transition-colors"
              aria-label="Shopping cart"
            >
              <ShoppingCart className="w-6 h-6" />
              {state.totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {state.totalItems > 99 ? '99+' : state.totalItems}
                </span>
              )}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-slate-300 hover:text-amber-400 transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </motion.button>
          </div>
        </div>

        {/* Mobile Search Bar with Autocomplete */}
        <div className="md:hidden pb-3 relative">
          <form onSubmit={handleSearch} className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-amber-400" />
            </div>
            <Input
              type="text"
              placeholder="Search products, categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              className="pl-12 pr-4 py-3 w-full bg-slate-800/40 border-slate-600/50 text-slate-200 placeholder-slate-400 rounded-xl focus:border-amber-400/60 focus:ring-2 focus:ring-amber-500/20 transition-all duration-300"
              autoComplete="off"
            />
          </form>

          {/* Mobile Search Suggestions */}
          {showSuggestions && searchSuggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-full mt-2 left-0 right-0 bg-slate-800/95 backdrop-blur-xl rounded-xl shadow-2xl border border-amber-500/20 z-50 max-h-60 overflow-y-auto"
            >
              <div className="p-3">
                <div className="text-xs font-semibold text-amber-400 mb-3 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Suggestions
                </div>
                {searchSuggestions.slice(0, 5).map((suggestion, index) => (
                  <motion.button
                    key={suggestion.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full flex items-center px-3 py-2.5 text-sm text-slate-300 hover:text-amber-400 hover:bg-slate-700/50 rounded-lg transition-all duration-200 group"
                  >
                    <div className="flex items-center flex-1">
                      {suggestion.type === 'category' && (
                        <Tag className="w-4 h-4 mr-3 text-green-400" />
                      )}
                      {suggestion.type === 'product' && (
                        <Package className="w-4 h-4 mr-3 text-blue-400" />
                      )}
                      {suggestion.type === 'popular' && (
                        <TrendingUp className="w-4 h-4 mr-3 text-orange-400" />
                      )}
                      <div className="text-left flex-1">
                        <div className="font-medium truncate">{suggestion.title}</div>
                        {suggestion.category && (
                          <div className="text-xs text-slate-500">in {suggestion.category}</div>
                        )}
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <motion.div 
          className="md:hidden border-t border-amber-500/20 bg-slate-800/95 backdrop-blur-xl"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <div className="px-4 pt-4 pb-6 space-y-2">
            <Link
              href="/products"
              className="block px-4 py-3 text-slate-300 hover:text-amber-400 hover:bg-slate-700/50 font-medium rounded-lg transition-all duration-200"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Products
            </Link>
            <Link
              href="/categories"
              className="block px-4 py-3 text-slate-300 hover:text-amber-400 hover:bg-slate-700/50 font-medium rounded-lg transition-all duration-200"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Categories
            </Link>
            <Link
              href="/sellers"
              className="block px-4 py-3 text-slate-300 hover:text-amber-400 hover:bg-slate-700/50 font-medium rounded-lg transition-all duration-200"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Sellers
            </Link>

            {session ? (
              <div className="border-t border-slate-600/30 pt-4 mt-4">
                <div className="px-4 py-3 bg-slate-700/30 rounded-lg mb-3">
                  <div className="text-sm text-slate-400">Signed in as</div>
                  <div className="text-base font-medium text-amber-400">{session.user?.name}</div>
                </div>
                <Link
                  href="/profile"
                  className="block px-4 py-3 text-slate-300 hover:text-amber-400 hover:bg-slate-700/50 rounded-lg transition-all duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Profile
                </Link>
                <Link
                  href="/orders"
                  className="block px-4 py-3 text-slate-300 hover:text-amber-400 hover:bg-slate-700/50 rounded-lg transition-all duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Orders
                </Link>
                <Link
                  href="/wishlist"
                  className="block px-4 py-3 text-slate-300 hover:text-amber-400 hover:bg-slate-700/50 rounded-lg transition-all duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Wishlist
                </Link>
                {session.user?.role === 'SELLER' && (
                  <Link
                    href="/seller/dashboard"
                    className="block px-4 py-3 text-slate-300 hover:text-amber-400 hover:bg-slate-700/50 rounded-lg transition-all duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Seller Dashboard
                  </Link>
                )}
                <Link
                  href="/settings"
                  className="block px-4 py-3 text-slate-300 hover:text-amber-400 hover:bg-slate-700/50 rounded-lg transition-all duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Settings
                </Link>
                <button
                  onClick={() => {
                    handleSignOut()
                    setIsMobileMenuOpen(false)
                  }}
                  className="block w-full text-left px-4 py-3 text-slate-300 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="border-t border-slate-600/30 pt-4 mt-4 space-y-2">
                <Link
                  href="/auth/signin"
                  className="block px-4 py-3 text-slate-300 hover:text-amber-400 hover:bg-slate-700/50 rounded-lg transition-all duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="block px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 rounded-lg transition-all duration-200 text-center font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </motion.header>
  )
}
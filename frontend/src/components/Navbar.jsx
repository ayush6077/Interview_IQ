import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, LayoutDashboard, User, LogOut, Menu, X, ChevronDown } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'

export default function Navbar() {
  const { user, logout, token } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  const navLinks = token
    ? [
        { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/profile', label: 'Profile', icon: User },
      ]
    : []

  return (
    <header className="sticky top-0 z-40 w-full">
      <div className="bg-dark-900/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to={token ? '/dashboard' : '/'} className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-accent-purple rounded-lg flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                <Zap size={18} className="text-white" fill="currentColor" />
              </div>
              <span className="text-white font-bold text-lg tracking-tight">
                Interview<span className="text-brand-400">AI</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            {token && (
              <nav className="hidden md:flex items-center gap-1">
                {navLinks.map(({ to, label, icon: Icon }) => (
                  <Link
                    key={to}
                    to={to}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                      location.pathname === to
                        ? 'bg-white/10 text-white'
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon size={16} />
                    {label}
                  </Link>
                ))}
              </nav>
            )}

            {/* Right: Auth / Avatar */}
            <div className="flex items-center gap-3">
              {token ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen((v) => !v)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/10 transition-all"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-accent-purple rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {initials}
                    </div>
                    <span className="hidden sm:block text-white/80 text-sm font-medium">
                      {user?.name?.split(' ')[0] || 'User'}
                    </span>
                    <ChevronDown size={14} className="text-white/40" />
                  </button>
                  <AnimatePresence>
                    {dropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-44 bg-dark-800 border border-white/10 rounded-xl shadow-2xl overflow-hidden"
                      >
                        <Link
                          to="/profile"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 text-white/70 hover:text-white hover:bg-white/10 transition-colors text-sm"
                        >
                          <User size={15} /> Profile
                        </Link>
                        <button
                          onClick={() => { setDropdownOpen(false); logout() }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 transition-colors text-sm"
                        >
                          <LogOut size={15} /> Sign Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/login" className="text-white/70 hover:text-white px-4 py-2 text-sm font-medium transition-colors">
                    Sign In
                  </Link>
                  <Link to="/register" className="btn-primary text-sm px-4 py-2">
                    Get Started
                  </Link>
                </div>
              )}
              {/* Mobile hamburger */}
              {token && (
                <button
                  className="md:hidden p-2 text-white/60 hover:text-white"
                  onClick={() => setMenuOpen((v) => !v)}
                >
                  {menuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && token && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-dark-900/95 backdrop-blur-xl border-b border-white/10 overflow-hidden"
          >
            <nav className="px-4 py-3 space-y-1">
              {navLinks.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    location.pathname === to ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon size={16} /> {label}
                </Link>
              ))}
              <button
                onClick={() => { setMenuOpen(false); logout() }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <LogOut size={16} /> Sign Out
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

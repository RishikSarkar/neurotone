'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-transparent border-b border-gray-700/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <div className="w-8 h-8 bg-white/20 flex items-center justify-center rounded mr-2">
                <div className="w-4 h-4 bg-white transform rotate-45"></div>
              </div>
              <span className="text-2xl font-bold text-white">Neurotone</span>
            </Link>
          </div>
          
          {/* Desktop menu */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-8">
            <Link href="/" className="px-3 py-2 text-sm font-medium text-white hover:text-white/80">
              Home
            </Link>
            <Link href="#features" className="px-3 py-2 text-sm font-medium text-white hover:text-white/80">
              Features
            </Link>
            <Link href="#how-it-works" className="px-3 py-2 text-sm font-medium text-white hover:text-white/80">
              How It Works
            </Link>
            <Link href="/login" className="px-3 py-2 text-sm font-medium text-white hover:text-white/80">
              Log In
            </Link>
            <Link 
              href="/signup" 
              className="ml-3 px-4 py-2 text-sm font-medium text-blue-900 bg-white hover:bg-white/90 rounded-md"
            >
              Sign Up
            </Link>
          </div>
          
          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-white/80 hover:bg-white/10"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {/* Hamburger icon */}
              {!isMenuOpen ? (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="sm:hidden bg-blue-900/40 backdrop-blur-sm">
          <div className="pt-2 pb-3 space-y-1">
            <Link 
              href="/"
              className="block px-3 py-2 text-base font-medium text-white hover:text-white/80 hover:bg-white/10"
            >
              Home
            </Link>
            <Link 
              href="#features"
              className="block px-3 py-2 text-base font-medium text-white hover:text-white/80 hover:bg-white/10"
            >
              Features
            </Link>
            <Link 
              href="#how-it-works"
              className="block px-3 py-2 text-base font-medium text-white hover:text-white/80 hover:bg-white/10"
            >
              How It Works
            </Link>
            <Link 
              href="/login"
              className="block px-3 py-2 text-base font-medium text-white hover:text-white/80 hover:bg-white/10"
            >
              Log In
            </Link>
            <Link 
              href="/signup"
              className="block mx-3 mt-2 px-3 py-2 text-base font-medium text-blue-900 bg-white hover:bg-white/90 rounded-md"
            >
              Sign Up
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
} 
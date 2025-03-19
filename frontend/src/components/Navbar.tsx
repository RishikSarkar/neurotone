'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-white/50 backdrop-blur-sm border-b border-primary-teal/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center">
                <div className="w-8 h-8 bg-primary-teal/30 flex items-center justify-center rounded mr-2">
                  <div className="w-4 h-4 bg-medium-blue transform rotate-45"></div>
                </div>
                <span className="text-xl font-bold text-dark-blue">Neurotone</span>
              </Link>
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            <Link
              href="/about"
              className="text-medium-blue hover:text-dark-blue px-3 py-2 text-sm font-medium"
            >
              About
            </Link>
            <Link
              href="/pricing"
              className="text-medium-blue hover:text-dark-blue px-3 py-2 text-sm font-medium"
            >
              Pricing
            </Link>
            <Link
              href="/contact"
              className="text-medium-blue hover:text-dark-blue px-3 py-2 text-sm font-medium"
            >
              Contact
            </Link>
            <Link
              href="/login"
              className="text-medium-blue hover:text-dark-blue px-3 py-2 text-sm font-medium"
            >
              Log in
            </Link>
            <div className="group relative ml-4 inline-block">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary-teal to-medium-blue rounded-md blur opacity-30 group-hover:opacity-80 transition duration-1000 group-hover:duration-200"></div>
              <Link
                href="/signup"
                className="relative px-4 py-2 bg-white rounded-md inline-flex items-center text-sm font-medium text-medium-blue shadow-sm hover:bg-white/90"
              >
                Sign up
              </Link>
            </div>
          </div>
          
          <div className="flex items-center md:hidden">
            <button
              type="button"
              className="bg-white/10 inline-flex items-center justify-center p-2 rounded-md text-medium-blue hover:text-dark-blue hover:bg-primary-teal/10"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/90 backdrop-blur-sm">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              href="/about"
              className="text-medium-blue hover:text-dark-blue block px-3 py-2 text-base font-medium"
            >
              About
            </Link>
            <Link
              href="/pricing"
              className="text-medium-blue hover:text-dark-blue block px-3 py-2 text-base font-medium"
            >
              Pricing
            </Link>
            <Link
              href="/contact"
              className="text-medium-blue hover:text-dark-blue block px-3 py-2 text-base font-medium"
            >
              Contact
            </Link>
            <Link
              href="/login"
              className="text-medium-blue hover:text-dark-blue block px-3 py-2 text-base font-medium"
            >
              Log in
            </Link>
            <div className="p-3">
              <div className="group relative w-full">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary-teal to-medium-blue rounded-md blur opacity-30 group-hover:opacity-80 transition duration-1000 group-hover:duration-200"></div>
                <Link
                  href="/signup"
                  className="relative w-full block text-center px-4 py-2 bg-white rounded-md text-base font-medium text-medium-blue shadow-sm hover:bg-white/90"
                >
                  Sign up
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
} 
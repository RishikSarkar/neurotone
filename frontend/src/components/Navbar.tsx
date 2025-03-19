'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-[#f5f7f8]/90 backdrop-blur-sm fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold text-dark-blue">
                Neurotone
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
              <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl blur-sm opacity-25 group-hover:opacity-80 transition duration-1000 group-hover:duration-200"></div>
              <Link
                href="/signup"
                className="relative px-4 py-2 bg-white rounded-xl inline-flex items-center text-sm font-medium text-gray-800"
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
        <div className="md:hidden bg-[#f5f7f8]/90 backdrop-blur-sm">
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
                <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl blur-sm opacity-25 group-hover:opacity-80 transition duration-1000 group-hover:duration-200"></div>
                <Link
                  href="/signup"
                  className="relative w-full block text-center px-4 py-2 bg-white rounded-xl text-base font-medium text-gray-800"
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
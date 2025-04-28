'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [displayText, setDisplayText] = useState("Neurotone");
  const fullText = "Neurotone";
  const prevScrollY = useRef(0);
  const isScrollingUp = useRef(false);
  const animationActive = useRef(false);

  useEffect(() => {
    const handleScroll = () => {
      isScrollingUp.current = window.scrollY < prevScrollY.current;
      prevScrollY.current = window.scrollY;
      
      if (window.scrollY > 10) {
        if (!isScrolled && !animationActive.current) {
          animationActive.current = true;
          typeEffect(fullText.length, 0);
        }
        setIsScrolled(true);
      } else {
        if (isScrolled && !animationActive.current) {
          animationActive.current = true;
          typeEffect(0, fullText.length);
        }
        setIsScrolled(false);
      }
    };

    const typeEffect = (start: number, end: number) => {
      const isTyping = start < end;
      let currentIndex = start;
      
      const animationInterval = setInterval(() => {
        if ((isTyping && currentIndex >= end) || (!isTyping && currentIndex <= end)) {
          clearInterval(animationInterval);
          animationActive.current = false;
          return;
        }
        
        if (isTyping) {
          currentIndex++;
          setDisplayText(fullText.substring(0, currentIndex));
        } else {
          currentIndex--;
          setDisplayText(fullText.substring(0, currentIndex));
        }
      }, 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isScrolled]);

  return (
    <nav className="bg-[#f5f7f8]/90 backdrop-blur-sm fixed top-0 left-0 right-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center space-x-3">
                <Image 
                  src="/logo-black.png" 
                  alt="Neurotone Logo" 
                  width={40} 
                  height={40} 
                  className="w-auto h-10"
                />
                <span 
                  className="text-xl font-bold text-dark-blue min-w-[40px] h-[28px]"
                >
                  {displayText}
                </span>
              </Link>
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            <Link
              href="/about"
              className="text-medium-blue hover:text-dark-blue hover:bg-white px-5 py-2.5 text-base font-medium rounded-lg"
            >
              About
            </Link>
            <Link
              href="/dashboard"
              className="text-medium-blue hover:text-dark-blue hover:bg-white px-5 py-2.5 text-base font-medium rounded-lg"
            >
              Dashboard
            </Link>
            <Link
              href="/dashboard"
              className="text-medium-blue hover:text-dark-blue hover:bg-white px-5 py-2.5 text-base font-medium rounded-lg"
            >
              Contact
            </Link>
            <Link
              href="/dashboard"
              className="text-medium-blue hover:text-dark-blue hover:bg-white px-5 py-2.5 text-base font-medium rounded-lg"
            >
              Log in
            </Link>
            <Link
              href="/screening"
              className="inline-flex items-center px-5 py-2.5 bg-white text-gray-800 border-2 border-black hover:border-transparent hover:bg-gradient-to-r hover:from-[#051934] hover:to-[#98b7b3] hover:text-white rounded-lg font-medium transition-[background-color,color] duration-100 ease-linear hover:animate-gradient-wave bg-[length:200%_auto] text-sm sm:text-base"
            >
              Sign Up
            </Link>
          </div>
          
          <div className="flex items-center md:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-2xl text-gray-800 hover:bg-gray-100 focus:outline-none transition-colors duration-200 border border-transparent hover:border-none"
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
          <div className="px-2 pt-2 pb-3 space-y-2">
            <Link
              href="/about"
              className="block px-3 py-2 rounded-2xl text-base font-medium text-gray-800 hover:bg-gray-100 hover:border-none transition-colors duration-200"
            >
              About
            </Link>
            <Link
              href="/dashboard"
              className="block px-3 py-2 rounded-2xl text-base font-medium text-gray-800 hover:bg-gray-100 hover:border-none transition-colors duration-200"
            >
              Dashboard
            </Link>
            <Link
              href="/dashboard"
              className="block px-3 py-2 rounded-2xl text-base font-medium text-gray-800 hover:bg-gray-100 hover:border-none transition-colors duration-200"
            >
              Contact
            </Link>
            <Link
              href="/dashboard"
              className="block px-3 py-2 rounded-2xl text-base font-medium text-gray-800 hover:bg-gray-100 hover:border-none transition-colors duration-200"
            >
              Log in
            </Link>
            <div className="p-3">
              <Link
                href="/screening"
                className="block w-full text-center px-6 py-3 bg-white text-gray-800 border border-black hover:border-transparent hover:bg-gradient-to-r hover:from-[#051934] hover:to-[#98b7b3] hover:text-white rounded-2xl text-base font-medium transition-[background-color,color] duration-100 ease-linear hover:animate-gradient-wave bg-[length:200%_auto]"
              >
                Sign up
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
} 
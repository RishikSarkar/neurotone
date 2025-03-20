import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-gray-900">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3">
              <Image 
                src="/logo-white.png" 
                alt="Neurotone Logo" 
                width={40} 
                height={40} 
                className="w-auto h-10"
              />
              <h2 className="text-2xl font-bold text-white">Neurotone</h2>
            </div>
            <p className="mt-2 text-gray-400">
              Early detection of dementia and Parkinson&apos;s through voice analysis.
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Product</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link href="#features" className="text-base text-gray-300 hover:text-white">
                  Features
                </Link>
              </li>
              <li>
                <Link href="#how-it-works" className="text-base text-gray-300 hover:text-white">
                  How it works
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-base text-gray-300 hover:text-white">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Company</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link href="/about" className="text-base text-gray-300 hover:text-white">
                  About
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-base text-gray-300 hover:text-white">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-base text-gray-300 hover:text-white">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-base text-gray-300 hover:text-white">
                  Terms
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8">
          <p className="text-base text-gray-400 text-center">
            &copy; {new Date().getFullYear()} Neurotone. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
} 
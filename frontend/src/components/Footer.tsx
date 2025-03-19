import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-white/50 backdrop-blur-sm border-t border-primary-teal/20">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-primary-teal/30 flex items-center justify-center rounded mr-2">
                <div className="w-4 h-4 bg-medium-blue transform rotate-45"></div>
              </div>
              <h2 className="text-2xl font-bold text-dark-blue">Neurotone</h2>
            </div>
            <p className="mt-2 text-medium-blue/80">
              Early detection of dementia and Parkinson&apos;s through voice analysis.
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-medium-blue/60 tracking-wider uppercase">Product</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link href="#features" className="text-base text-medium-blue/80 hover:text-dark-blue">
                  Features
                </Link>
              </li>
              <li>
                <Link href="#how-it-works" className="text-base text-medium-blue/80 hover:text-dark-blue">
                  How it works
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-base text-medium-blue/80 hover:text-dark-blue">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-medium-blue/60 tracking-wider uppercase">Company</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link href="/about" className="text-base text-medium-blue/80 hover:text-dark-blue">
                  About
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-base text-medium-blue/80 hover:text-dark-blue">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-base text-medium-blue/80 hover:text-dark-blue">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-base text-medium-blue/80 hover:text-dark-blue">
                  Terms
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 border-t border-primary-teal/20 pt-8">
          <p className="text-base text-medium-blue/60 text-center">
            &copy; {new Date().getFullYear()} Neurotone. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
} 
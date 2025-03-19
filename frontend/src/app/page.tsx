import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <main className="min-h-screen pt-16">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight text-dark-blue sm:text-5xl md:text-6xl">
                <span className="block">Neurotone</span>
                <span className="block mt-4 text-lg font-semibold sm:text-xl md:mt-6 md:text-2xl">
                  Detect early signs of cognitive decline
                </span>
              </h1>
              <p className="mt-3 text-sm text-medium-blue/90 sm:mt-5 sm:text-base md:mt-5 md:text-lg">
                Using voice analysis to detect early-stage dementia and Parkinson&apos;s before symptoms become visibly concerning.
              </p>
              <div className="mt-8 sm:mt-10 flex gap-4">
                <Link
                  href="/signup"
                  className="inline-flex items-center px-6 py-3 bg-white text-gray-800 border border-black hover:border-transparent hover:bg-gradient-to-r hover:from-[#051934] hover:to-[#98b7b3] hover:text-white rounded-2xl font-medium transition-[background-color,color] duration-100 ease-linear hover:animate-gradient-wave bg-[length:200%_auto]"
                >
                  Get Started
                </Link>
                <Link
                  href="#how-it-works"
                  className="inline-flex items-center px-6 py-3 bg-white text-gray-800 border border-black hover:border-transparent hover:bg-gradient-to-r hover:from-[#051934] hover:to-[#98b7b3] hover:text-white rounded-2xl font-medium transition-[background-color,color] duration-100 ease-linear hover:animate-gradient-wave bg-[length:200%_auto]"
                >
                  Learn more
                </Link>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="w-full max-w-md h-96 bg-blue-teal/10 rounded-lg flex items-center justify-center">
                <div className="text-medium-blue text-xl">Voice Waveform Visualization</div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section id="features" className="bg-primary-teal/5 backdrop-blur-sm py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-2xl font-extrabold text-dark-blue sm:text-3xl">
              Key Features
            </h2>
            <p className="mt-4 max-w-2xl text-lg text-medium-blue/90 mx-auto">
              Proactive monitoring for peace of mind
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6">
              <div className="w-12 h-12 bg-primary-teal/20 rounded-md flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-medium-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-dark-blue">Early Intervention</h3>
              <p className="mt-2 text-base text-medium-blue/80">
                Catch dementia or Parkinson&apos;s at a point where new therapies can still be effective.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6">
              <div className="w-12 h-12 bg-primary-teal/20 rounded-md flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-medium-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-dark-blue">Continuous Monitoring</h3>
              <p className="mt-2 text-base text-medium-blue/80">
                Regular, non-invasive check-ups through daily or weekly voice samples.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6">
              <div className="w-12 h-12 bg-primary-teal/20 rounded-md flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-medium-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-dark-blue">User-Friendly Workflow</h3>
              <p className="mt-2 text-base text-medium-blue/80">
                Simple voice recording tasks, automatic AI analysis, and actionable alerts.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* How It Works Section */}
      <section id="how-it-works" className="bg-transparent py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-2xl font-extrabold text-dark-blue sm:text-3xl">
              How It Works
            </h2>
            <p className="mt-4 max-w-2xl text-lg text-medium-blue/90 mx-auto">
              Simple process, powerful insights
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-blue-teal/20 rounded-full flex items-center justify-center mb-4">
                <span className="text-xl font-bold text-medium-blue">1</span>
              </div>
              <h3 className="text-lg font-medium text-dark-blue">Record</h3>
              <p className="mt-2 text-base text-medium-blue/80">
                Speak for 30-60 seconds, reading a passage or describing a picture.
              </p>
            </div>
            
            {/* Step 2 */}
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-blue-teal/20 rounded-full flex items-center justify-center mb-4">
                <span className="text-xl font-bold text-medium-blue">2</span>
              </div>
              <h3 className="text-lg font-medium text-dark-blue">Analyze</h3>
              <p className="mt-2 text-base text-medium-blue/80">
                Our AI detects key vocal biomarkers relevant to cognitive health.
              </p>
            </div>
            
            {/* Step 3 */}
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-blue-teal/20 rounded-full flex items-center justify-center mb-4">
                <span className="text-xl font-bold text-medium-blue">3</span>
              </div>
              <h3 className="text-lg font-medium text-dark-blue">Monitor</h3>
              <p className="mt-2 text-base text-medium-blue/80">
                Track results over time on your personal dashboard.
              </p>
            </div>
            
            {/* Step 4 */}
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-blue-teal/20 rounded-full flex items-center justify-center mb-4">
                <span className="text-xl font-bold text-medium-blue">4</span>
              </div>
              <h3 className="text-lg font-medium text-dark-blue">Alert</h3>
              <p className="mt-2 text-base text-medium-blue/80">
                Receive notifications if significant changes are detected.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="bg-primary-teal/10 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="text-center">
            <h2 className="text-2xl font-extrabold text-dark-blue sm:text-3xl">
              Start monitoring cognitive health today
            </h2>
            <p className="mt-4 max-w-2xl text-lg text-medium-blue/90 mx-auto">
              Early detection leads to better outcomes. Sign up for Neurotone now.
            </p>
            <div className="mt-8">
              <Link
                href="/signup"
                className="inline-flex items-center px-6 py-3 bg-white text-gray-800 border border-black hover:border-transparent hover:bg-gradient-to-r hover:from-[#051934] hover:to-[#98b7b3] hover:text-white rounded-2xl font-medium transition-[background-color,color] duration-100 ease-linear hover:animate-gradient-wave bg-[length:200%_auto]"
              >
                Get Started
              </Link>
            </div>
          </div>
    </div>
      </section>
      
      <Footer />
    </main>
  );
}

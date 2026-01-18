import Link from 'next/link';
import { ArrowRight, UserPlus, Search, Link2, DollarSign, CheckCircle2, Shield, Clock, BarChart3 } from 'lucide-react';
import { Navbar, Footer } from '@/components/navigation';
import { Container } from '@/components/layout';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'How It Works | CreatorStays',
  description: 'Learn how CreatorStays connects vacation rental hosts with content creators for performance-based marketing.',
};

const hostSteps = [
  {
    icon: UserPlus,
    title: 'Create Your Account',
    description: 'Sign up and pay the one-time $199 listing fee to access our creator network.',
  },
  {
    icon: Search,
    title: 'List Your Properties',
    description: 'Add your Airbnb listings and set commission rates for each property.',
  },
  {
    icon: CheckCircle2,
    title: 'Approve Creators',
    description: 'Review creator applications and approve those who match your brand.',
  },
  {
    icon: DollarSign,
    title: 'Pay for Results',
    description: 'Only pay when creators drive confirmed bookings. We handle payouts.',
  },
];

const creatorSteps = [
  {
    icon: UserPlus,
    title: 'Join for Free',
    description: 'Create your profile showcasing your social channels and audience.',
  },
  {
    icon: Search,
    title: 'Browse Properties',
    description: 'Find properties that match your content style and audience interests.',
  },
  {
    icon: Link2,
    title: 'Share Your Link',
    description: 'Get approved and receive a unique tracking link to share with your audience.',
  },
  {
    icon: DollarSign,
    title: 'Earn Commissions',
    description: 'Get paid automatically when your followers book through your link.',
  },
];

const features = [
  {
    icon: Shield,
    title: '30-Day Attribution',
    description: 'Creators get credit for bookings up to 30 days after a click, ensuring fair attribution.',
  },
  {
    icon: Clock,
    title: 'Automatic Payouts',
    description: 'Once a booking is confirmed, payouts are processed automatically via Stripe.',
  },
  {
    icon: BarChart3,
    title: 'Real-Time Analytics',
    description: 'Both hosts and creators can track clicks, conversions, and earnings in real-time.',
  },
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero */}
      <section className="pt-28 pb-16 md:pt-36 md:pb-24 bg-gradient-to-br from-coral-50 via-white to-sand-50">
        <Container>
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="font-serif text-4xl md:text-5xl font-semibold text-gray-900 mb-6">
              How CreatorStays Works
            </h1>
            <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
              We connect vacation rental hosts with content creators for authentic, 
              performance-based marketing. Here&apos;s how it works for both sides.
            </p>
          </div>
        </Container>
      </section>
      
      {/* For Hosts */}
      <section className="py-16 md:py-24 bg-white">
        <Container>
          <div className="text-center mb-16">
            <p className="text-coral-500 font-medium mb-3">For Hosts</p>
            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-gray-900">
              Turn creators into your marketing team
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {hostSteps.map((step, index) => (
              <div key={index} className="relative">
                {index < hostSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-10 left-[calc(50%+40px)] w-[calc(100%-40px)] h-px bg-gradient-to-r from-coral-200 to-coral-100" />
                )}
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-coral-100 text-coral-600 mb-6">
                    <step.icon className="w-8 h-8" />
                  </div>
                  <h3 className="font-serif text-xl font-semibold text-gray-900 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-600">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link href="/signup?role=host">
              <Button size="lg" className="bg-coral-500 hover:bg-coral-600 text-white">
                Get Started as Host
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </Container>
      </section>
      
      {/* For Creators */}
      <section className="py-16 md:py-24 bg-sand-50/50">
        <Container>
          <div className="text-center mb-16">
            <p className="text-coral-500 font-medium mb-3">For Creators</p>
            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-gray-900">
              Monetize your influence
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {creatorSteps.map((step, index) => (
              <div key={index} className="relative">
                {index < creatorSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-10 left-[calc(50%+40px)] w-[calc(100%-40px)] h-px bg-gradient-to-r from-coral-200 to-coral-100" />
                )}
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white shadow-sm text-coral-600 mb-6">
                    <step.icon className="w-8 h-8" />
                  </div>
                  <h3 className="font-serif text-xl font-semibold text-gray-900 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-600">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link href="/signup?role=creator">
              <Button size="lg" variant="outline" className="border-gray-300">
                Join as Creator
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </Container>
      </section>
      
      {/* Attribution & Features */}
      <section className="py-16 md:py-24 bg-white">
        <Container>
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-gray-900 mb-4">
              Built for trust & transparency
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our platform handles the complex parts so you can focus on what matters.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="p-8 rounded-2xl bg-sand-50/50 border border-sand-100">
                <div className="w-12 h-12 rounded-xl bg-coral-100 flex items-center justify-center mb-5">
                  <feature.icon className="w-6 h-6 text-coral-600" />
                </div>
                <h3 className="font-serif text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>
      
      {/* CTA */}
      <section className="py-16 md:py-24 bg-gray-900">
        <Container>
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-white mb-6">
              Ready to get started?
            </h2>
            <p className="text-lg text-gray-300 mb-10">
              Join the marketplace connecting hosts and creators for performance-based partnerships.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup?role=host">
                <Button size="lg" className="w-full sm:w-auto bg-coral-500 hover:bg-coral-600 text-white">
                  List Your Property
                </Button>
              </Link>
              <Link href="/signup?role=creator">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-gray-600 text-white hover:bg-white/10">
                  Join as Creator
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </section>
      
      <Footer />
    </div>
  );
}

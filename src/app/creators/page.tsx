import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Check, Camera, DollarSign, BarChart3, Clock, Heart, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Navbar, Footer } from '@/components/navigation';

export const metadata = {
  title: 'For Creators',
  description: 'Join CreatorStays and earn commissions promoting amazing vacation rentals to your audience. Free to join, no upfront costs.',
};

export default function CreatorsPage() {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 bg-gradient-hero">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center rounded-full bg-sage-100 px-4 py-1.5 text-sm text-sage-700">
                For Content Creators
              </div>
              <h1 className="font-serif text-5xl sm:text-6xl font-semibold leading-tight tracking-tight">
                Monetize your 
                <span className="block text-sage-600">travel content</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-lg">
                Partner with premium vacation rentals and earn commissions every time 
                your audience books a stay. It&apos;s free to join.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/signup?role=creator">
                  <Button size="xl" variant="sage" className="w-full sm:w-auto">
                    Start Earning
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link href="/properties">
                  <Button size="xl" variant="outline" className="w-full sm:w-auto">
                    Browse Properties
                  </Button>
                </Link>
              </div>
              <p className="text-sm text-muted-foreground">
                Free to join • No upfront costs • Earn up to 15% per booking
              </p>
            </div>
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="aspect-[3/4] rounded-2xl overflow-hidden shadow-lg">
                    <Image
                      src="https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=600&q=80"
                      alt="Content creator"
                      width={300}
                      height={400}
                      className="object-cover w-full h-full"
                    />
                  </div>
                </div>
                <div className="space-y-4 pt-8">
                  <div className="aspect-[3/4] rounded-2xl overflow-hidden shadow-lg">
                    <Image
                      src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80"
                      alt="Luxury property"
                      width={300}
                      height={400}
                      className="object-cover w-full h-full"
                    />
                  </div>
                </div>
              </div>
              {/* Earnings Card */}
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 glass rounded-2xl p-4 shadow-xl min-w-[280px]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">This month&apos;s earnings</p>
                    <p className="font-serif text-2xl font-bold">$2,847</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-serif text-4xl font-semibold mb-4">
              Why creators love CreatorStays
            </h2>
            <p className="text-lg text-muted-foreground">
              A better way to monetize your travel and lifestyle content.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Heart,
                title: 'Authentic Partnerships',
                description: 'Promote properties you genuinely love. Your audience trusts your recommendations.',
              },
              {
                icon: DollarSign,
                title: 'Competitive Commissions',
                description: 'Earn up to 15% on every booking. Average payout is $85+ per confirmed stay.',
              },
              {
                icon: Camera,
                title: 'Creative Freedom',
                description: 'Create content your way. No scripts, no forced messaging. Just authentic storytelling.',
              },
              {
                icon: Clock,
                title: '30-Day Attribution',
                description: 'Get credit for bookings up to 30 days after someone clicks your link.',
              },
              {
                icon: BarChart3,
                title: 'Real-Time Analytics',
                description: 'Track clicks, conversions, and earnings in your personal dashboard.',
              },
              {
                icon: Sparkles,
                title: 'Exclusive Opportunities',
                description: 'Get invited to stays in exchange for content through our POST_FOR_STAY program.',
              },
            ].map((item, index) => (
              <Card key={index} className="border-0 bg-sand-50">
                <CardContent className="pt-8 pb-6 px-6">
                  <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center mb-6">
                    <item.icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-serif text-xl font-semibold mb-3">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-4 bg-sand-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-serif text-4xl font-semibold mb-4">
              Start earning in minutes
            </h2>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                step: '1',
                title: 'Create Profile',
                description: 'Sign up and showcase your social channels, audience size, and content niches.',
              },
              {
                step: '2',
                title: 'Browse & Apply',
                description: 'Find properties that match your audience and apply to their offers.',
              },
              {
                step: '3',
                title: 'Get Approved',
                description: 'Hosts review your profile and approve you to start promoting.',
              },
              {
                step: '4',
                title: 'Share & Earn',
                description: 'Create content with your unique link. Earn commission on every booking.',
              },
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 rounded-full bg-sage-100 flex items-center justify-center mx-auto mb-6">
                  <span className="font-serif text-2xl font-bold text-sage-600">{item.step}</span>
                </div>
                <h3 className="font-serif text-xl font-semibold mb-3">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Earnings Calculator */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl font-semibold mb-4">
              See your earning potential
            </h2>
            <p className="text-lg text-muted-foreground">
              Here&apos;s what creators typically earn on CreatorStays.
            </p>
          </div>
          <Card className="border-2">
            <CardContent className="p-8 lg:p-12">
              <div className="grid md:grid-cols-3 gap-8 text-center">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Average booking value</p>
                  <p className="font-serif text-3xl font-bold">$850</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Average commission</p>
                  <p className="font-serif text-3xl font-bold">10%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Your earnings</p>
                  <p className="font-serif text-3xl font-bold text-sage-600">$72.25</p>
                  <p className="text-xs text-muted-foreground">per booking (after 15% platform fee)</p>
                </div>
              </div>
              <div className="mt-8 pt-8 border-t">
                <p className="text-center text-muted-foreground">
                  Drive just 5 bookings a month = <span className="font-semibold text-foreground">$361/month</span> in passive income
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FTC Disclosure Notice */}
      <section className="py-16 px-4 bg-sand-50">
        <div className="max-w-4xl mx-auto">
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="p-6 lg:p-8">
              <h3 className="font-serif font-semibold mb-3 flex items-center gap-2">
                <span className="text-amber-600">⚠️</span> FTC Disclosure Requirement
              </h3>
              <p className="text-sm text-muted-foreground">
                The FTC requires creators to disclose material connections with brands. When promoting 
                properties through CreatorStays, you must clearly disclose your affiliate relationship 
                in all content. Use hashtags like #ad, #sponsored, or #affiliate, or include a clear 
                statement that you may earn commission from bookings. We&apos;ll remind you of this 
                requirement when you accept each deal.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 bg-sage-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-serif text-4xl sm:text-5xl font-semibold mb-6">
            Ready to monetize your influence?
          </h2>
          <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            Join hundreds of creators already earning with CreatorStays. It&apos;s free to get started.
          </p>
          <Link href="/signup?role=creator">
            <Button size="xl" variant="secondary" className="w-full sm:w-auto">
              Create Your Profile
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}

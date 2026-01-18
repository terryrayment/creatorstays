import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Check, BarChart3, Users, Shield, Zap, DollarSign, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Navbar, Footer } from '@/components/navigation';

export const metadata = {
  title: 'For Hosts',
  description: 'List your vacation rental on CreatorStays and connect with verified content creators to drive bookings through authentic promotion.',
};

export default function HostsPage() {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 bg-gradient-hero">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center rounded-full bg-coral-100 px-4 py-1.5 text-sm text-coral-700">
                For Property Hosts
              </div>
              <h1 className="font-serif text-5xl sm:text-6xl font-semibold leading-tight tracking-tight">
                Turn creators into your 
                <span className="block text-coral-500">booking engine</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-lg">
                Connect with verified content creators who will authentically promote your 
                property to engaged audiences. Pay only for results.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/signup?role=host">
                  <Button size="xl" variant="coral" className="w-full sm:w-auto">
                    List Your Property
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link href="/how-it-works">
                  <Button size="xl" variant="outline" className="w-full sm:w-auto">
                    See How It Works
                  </Button>
                </Link>
              </div>
              <p className="text-sm text-muted-foreground">
                One-time $199 listing fee • No monthly charges • Pay only on bookings
              </p>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl">
                <Image
                  src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80"
                  alt="Beautiful vacation rental property"
                  fill
                  className="object-cover"
                  priority
                />
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
              Why hosts choose CreatorStays
            </h2>
            <p className="text-lg text-muted-foreground">
              Get more direct bookings through authentic creator content.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Users,
                title: 'Vetted Creator Network',
                description: 'Access creators with real, engaged audiences in travel, lifestyle, and luxury niches.',
              },
              {
                icon: BarChart3,
                title: 'Performance-Based',
                description: 'Set your own commission rates and only pay when creators drive actual bookings.',
              },
              {
                icon: Shield,
                title: 'Full Control',
                description: 'Review and approve every creator before they promote your property.',
              },
              {
                icon: Zap,
                title: 'Easy Setup',
                description: 'List your property in minutes. Just add your Airbnb URL and set your offer terms.',
              },
              {
                icon: TrendingUp,
                title: 'Real Attribution',
                description: '30-day tracking window with cookie-based attribution ensures accurate reporting.',
              },
              {
                icon: DollarSign,
                title: 'Transparent Pricing',
                description: 'One-time $199 listing fee plus 15% platform fee on successful payouts.',
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
              Get started in three steps
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'List Your Property',
                description: 'Add your property details and Airbnb URL. Set your commission rate and offer terms.',
              },
              {
                step: '2',
                title: 'Review Applications',
                description: 'Creators apply to promote your property. Review their profiles and approve the best fits.',
              },
              {
                step: '3',
                title: 'Track & Pay',
                description: 'Monitor clicks and bookings. Submit claims when bookings come in and we handle payouts.',
              },
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 rounded-full bg-coral-100 flex items-center justify-center mx-auto mb-6">
                  <span className="font-serif text-2xl font-bold text-coral-600">{item.step}</span>
                </div>
                <h3 className="font-serif text-xl font-semibold mb-3">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl font-semibold mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-lg text-muted-foreground">
              No hidden fees. No monthly charges. Pay for results.
            </p>
          </div>
          <Card className="border-2">
            <CardContent className="p-8 lg:p-12">
              <div className="grid lg:grid-cols-2 gap-8 items-center">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">One-time listing fee</p>
                  <p className="font-serif text-5xl font-bold mb-4">$199</p>
                  <p className="text-muted-foreground mb-6">
                    Unlimited properties, unlimited offers, unlimited creators.
                  </p>
                  <ul className="space-y-3">
                    {[
                      'List unlimited properties',
                      'Create unlimited offers',
                      'Access full creator network',
                      'Real-time analytics dashboard',
                      'Stripe-powered payouts',
                    ].map((item, index) => (
                      <li key={index} className="flex items-center gap-3">
                        <Check className="w-5 h-5 text-green-500" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-sand-50 rounded-2xl p-6 lg:p-8">
                  <h3 className="font-serif font-semibold mb-4">Platform Fee</h3>
                  <p className="text-muted-foreground mb-4">
                    When a creator drives a booking and you approve the payout:
                  </p>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between py-2 border-b">
                      <span>Your commission to creator</span>
                      <span>e.g., $100</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span>Platform fee (15% of payout)</span>
                      <span>+$15</span>
                    </div>
                    <div className="flex justify-between py-2 font-semibold">
                      <span>You pay</span>
                      <span>$115</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-4">
                    Creator receives $85 after their 15% platform fee.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 bg-coral-500 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-serif text-4xl sm:text-5xl font-semibold mb-6">
            Ready to grow your bookings?
          </h2>
          <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            Join hundreds of hosts already using creator marketing to fill their calendars.
          </p>
          <Link href="/signup?role=host">
            <Button size="xl" variant="secondary" className="w-full sm:w-auto">
              List Your Property
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}

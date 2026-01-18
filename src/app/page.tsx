import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Home, Users, DollarSign, Shield, Sparkles, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Navbar, Footer } from '@/components/navigation';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 bg-gradient-hero">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center rounded-full bg-coral-100 px-4 py-1.5 text-sm text-coral-700">
                <Sparkles className="w-4 h-4 mr-2" />
                Now in Beta
              </div>
              <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-semibold leading-tight tracking-tight">
                Where creators
                <span className="block text-gradient">meet amazing stays</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-lg">
                The marketplace connecting content creators with short-term rental hosts. 
                Earn commissions promoting properties your audience will love.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/signup?role=creator">
                  <Button size="xl" className="w-full sm:w-auto">
                    Join as Creator
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link href="/signup?role=host">
                  <Button size="xl" variant="outline" className="w-full sm:w-auto">
                    List Your Property
                  </Button>
                </Link>
              </div>
              <div className="flex items-center gap-8 pt-4">
                <div>
                  <p className="text-3xl font-serif font-semibold">500+</p>
                  <p className="text-sm text-muted-foreground">Active Creators</p>
                </div>
                <div className="w-px h-12 bg-border" />
                <div>
                  <p className="text-3xl font-serif font-semibold">1,200+</p>
                  <p className="text-sm text-muted-foreground">Properties</p>
                </div>
                <div className="w-px h-12 bg-border" />
                <div>
                  <p className="text-3xl font-serif font-semibold">$2M+</p>
                  <p className="text-sm text-muted-foreground">Creator Earnings</p>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl">
                <Image
                  src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80"
                  alt="Luxury vacation rental"
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 property-card-overlay" />
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="glass rounded-2xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-serif font-semibold text-white">Oceanfront Villa</p>
                        <p className="text-sm text-white/80">Malibu, California</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-white/80">Commission</p>
                        <p className="font-serif font-semibold text-white">10%</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Floating card */}
              <div className="absolute -left-8 top-1/4 glass rounded-2xl p-4 shadow-lg animate-float hidden lg:block">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <Check className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Booking confirmed!</p>
                    <p className="text-xs text-muted-foreground">You earned $127</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-serif text-4xl font-semibold mb-4">
              How CreatorStays Works
            </h2>
            <p className="text-lg text-muted-foreground">
              A simple, transparent process for creators and hosts to collaborate.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Users,
                title: 'Connect',
                description: 'Creators browse properties and apply to offers that match their audience. Hosts review creator profiles and approve partnerships.',
                step: '01',
              },
              {
                icon: Sparkles,
                title: 'Create',
                description: 'Share authentic content about your stay. Use your unique tracking link to attribute bookings to your influence.',
                step: '02',
              },
              {
                icon: DollarSign,
                title: 'Earn',
                description: 'When someone books through your link, you earn a commission. Payouts are automatic via Stripe.',
                step: '03',
              },
            ].map((item, index) => (
              <Card key={index} className="relative overflow-hidden border-0 bg-sand-50">
                <CardContent className="pt-8 pb-6 px-6">
                  <span className="absolute top-4 right-4 font-serif text-6xl font-bold text-sand-200">
                    {item.step}
                  </span>
                  <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center mb-6">
                    <item.icon className="w-6 h-6 text-foreground" />
                  </div>
                  <h3 className="font-serif text-xl font-semibold mb-3">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* For Creators Section */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1 grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="aspect-[3/4] rounded-2xl overflow-hidden">
                  <Image
                    src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80"
                    alt="Modern apartment"
                    width={300}
                    height={400}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="aspect-square rounded-2xl overflow-hidden">
                  <Image
                    src="https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&q=80"
                    alt="Cozy interior"
                    width={300}
                    height={300}
                    className="object-cover w-full h-full"
                  />
                </div>
              </div>
              <div className="space-y-4 pt-8">
                <div className="aspect-square rounded-2xl overflow-hidden">
                  <Image
                    src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80"
                    alt="Luxury home"
                    width={300}
                    height={300}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="aspect-[3/4] rounded-2xl overflow-hidden">
                  <Image
                    src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80"
                    alt="Beach house"
                    width={300}
                    height={400}
                    className="object-cover w-full h-full"
                  />
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2 space-y-8">
              <div className="inline-flex items-center rounded-full bg-sage-100 px-4 py-1.5 text-sm text-sage-700">
                For Creators
              </div>
              <h2 className="font-serif text-4xl font-semibold">
                Turn your influence into income
              </h2>
              <p className="text-lg text-muted-foreground">
                Partner with premium vacation rentals and earn commissions on every booking 
                your content drives. No upfront costs, no inventory to manage.
              </p>
              <ul className="space-y-4">
                {[
                  'Browse hundreds of curated properties',
                  'Choose deals that match your audience',
                  'Track your earnings in real-time',
                  'Get paid automatically via Stripe',
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-sage-100 flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-sage-600" />
                    </div>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Link href="/signup?role=creator">
                <Button size="lg" variant="sage">
                  Start Earning
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* For Hosts Section */}
      <section className="py-24 px-4 bg-sand-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center rounded-full bg-coral-100 px-4 py-1.5 text-sm text-coral-700">
                For Hosts
              </div>
              <h2 className="font-serif text-4xl font-semibold">
                Reach audiences you can&apos;t buy
              </h2>
              <p className="text-lg text-muted-foreground">
                Connect with creators who have engaged audiences in travel, lifestyle, and 
                luxury niches. Pay only for results with our performance-based model.
              </p>
              <ul className="space-y-4">
                {[
                  'Access a network of verified creators',
                  'Set your own commission rates',
                  'Approve creators before they promote',
                  'Track bookings and ROI in one dashboard',
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-coral-100 flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-coral-600" />
                    </div>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="flex items-center gap-4">
                <Link href="/signup?role=host">
                  <Button size="lg" variant="coral">
                    List Your Property
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <p className="text-sm text-muted-foreground">
                  One-time $199 listing fee
                </p>
              </div>
            </div>
            <div className="relative">
              <Card className="border-0 shadow-xl">
                <CardContent className="p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-xl overflow-hidden">
                      <Image
                        src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=200&q=80"
                        alt="Property"
                        width={64}
                        height={64}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div>
                      <h3 className="font-serif font-semibold">Beachfront Paradise</h3>
                      <p className="text-sm text-muted-foreground">San Diego, CA</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-3 border-b">
                      <span className="text-muted-foreground">Active Creators</span>
                      <span className="font-semibold">12</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b">
                      <span className="text-muted-foreground">Click-throughs</span>
                      <span className="font-semibold">2,847</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b">
                      <span className="text-muted-foreground">Bookings</span>
                      <span className="font-semibold">34</span>
                    </div>
                    <div className="flex justify-between items-center py-3">
                      <span className="text-muted-foreground">Revenue Generated</span>
                      <span className="font-serif text-xl font-semibold text-sage-600">$28,450</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-serif text-4xl font-semibold mb-4">
              Built on trust and transparency
            </h2>
            <p className="text-lg text-muted-foreground">
              We handle the complexity so you can focus on what you do best.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Shield,
                title: 'Secure Payments',
                description: 'Powered by Stripe with automatic payouts to your bank account.',
              },
              {
                icon: Home,
                title: 'Verified Properties',
                description: 'Every property is reviewed before going live on the platform.',
              },
              {
                icon: Users,
                title: 'Real Attribution',
                description: '30-day cookie window ensures you get credit for your influence.',
              },
              {
                icon: DollarSign,
                title: 'Fair Fees',
                description: '15% platform fee on both sides. No hidden costs.',
              },
            ].map((item, index) => (
              <Card key={index} className="text-center border-0 bg-sand-50/50">
                <CardContent className="pt-8 pb-6 px-6">
                  <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center mx-auto mb-4">
                    <item.icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-serif font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 bg-foreground text-background">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-serif text-4xl sm:text-5xl font-semibold mb-6">
            Ready to get started?
          </h2>
          <p className="text-xl text-background/70 mb-10 max-w-2xl mx-auto">
            Join hundreds of creators and hosts already earning and growing with CreatorStays.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup?role=creator">
              <Button size="xl" variant="secondary" className="w-full sm:w-auto">
                Join as Creator
              </Button>
            </Link>
            <Link href="/signup?role=host">
              <Button size="xl" variant="outline" className="w-full sm:w-auto border-background/30 text-background hover:bg-background/10">
                List Your Property
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

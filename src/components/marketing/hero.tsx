import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sparkles, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/layout';

export function Hero() {
  return (
    <section className="relative pt-28 pb-20 md:pt-36 md:pb-28 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-coral-50 via-white to-sand-50 -z-10" />
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-bl from-coral-100/40 to-transparent -z-10" />
      
      <Container>
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center rounded-full bg-coral-100 px-4 py-1.5 text-sm font-medium text-coral-700">
              <Sparkles className="w-4 h-4 mr-2" />
              Now in Beta
            </div>
            
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold leading-[1.1] tracking-tight text-gray-900">
              Turn creators into your{' '}
              <span className="text-coral-500">booking engine</span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-600 max-w-lg leading-relaxed">
              The marketplace connecting vacation rental hosts with content creators. 
              Drive bookings through authentic promotion. Pay only for results.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/signup?role=host">
                <Button size="lg" className="w-full sm:w-auto bg-coral-500 hover:bg-coral-600 text-white shadow-lg shadow-coral-500/25">
                  List Your Property
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/signup?role=creator">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-gray-300">
                  Join as Creator
                </Button>
              </Link>
            </div>
            
            <div className="flex items-center gap-8 pt-4">
              <div>
                <p className="text-3xl font-serif font-semibold text-gray-900">500+</p>
                <p className="text-sm text-gray-500">Active Creators</p>
              </div>
              <div className="w-px h-12 bg-gray-200" />
              <div>
                <p className="text-3xl font-serif font-semibold text-gray-900">1,200+</p>
                <p className="text-sm text-gray-500">Properties</p>
              </div>
              <div className="w-px h-12 bg-gray-200" />
              <div>
                <p className="text-3xl font-serif font-semibold text-gray-900">$2M+</p>
                <p className="text-sm text-gray-500">Creator Earnings</p>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl shadow-gray-900/10">
              <Image
                src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80"
                alt="Luxury vacation rental"
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0" />
              <div className="absolute bottom-6 left-6 right-6">
                <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-serif font-semibold text-gray-900">Oceanfront Villa</p>
                      <p className="text-sm text-gray-500">Malibu, California</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Commission</p>
                      <p className="font-serif font-semibold text-coral-500">10%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Floating notification */}
            <div className="absolute -left-4 lg:-left-8 top-1/4 bg-white rounded-2xl p-4 shadow-xl border border-gray-100 hidden md:block">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <Check className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Booking confirmed!</p>
                  <p className="text-xs text-gray-500">You earned $127</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

export default Hero;

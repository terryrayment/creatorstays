import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/layout';

const benefits = [
  'Browse hundreds of curated properties',
  'Choose deals that match your audience',
  'Create content your way - no scripts required',
  'Track your earnings in real-time',
  'Get paid automatically via Stripe',
  '30-day attribution window',
];

export function CreatorBenefits() {
  return (
    <section className="py-20 md:py-28 bg-gradient-to-br from-coral-50 to-sand-50">
      <Container>
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="order-2 lg:order-1">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="aspect-[3/4] rounded-2xl overflow-hidden shadow-lg">
                  <Image
                    src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80"
                    alt="Modern apartment"
                    width={300}
                    height={400}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="aspect-square rounded-2xl overflow-hidden shadow-lg">
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
                <div className="aspect-square rounded-2xl overflow-hidden shadow-lg">
                  <Image
                    src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80"
                    alt="Luxury home"
                    width={300}
                    height={300}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="aspect-[3/4] rounded-2xl overflow-hidden shadow-lg">
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
          </div>
          
          <div className="order-1 lg:order-2 space-y-8">
            <div>
              <p className="text-coral-500 font-medium mb-3">For Creators</p>
              <h2 className="font-serif text-3xl md:text-4xl font-semibold text-gray-900 mb-4">
                Turn your influence into income
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                Partner with premium vacation rentals and earn commissions on every booking 
                your content drives. No upfront costs, no inventory to manage.
              </p>
            </div>
            
            <ul className="space-y-4">
              {benefits.map((benefit, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-coral-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-4 h-4 text-coral-600" />
                  </div>
                  <span className="text-gray-700">{benefit}</span>
                </li>
              ))}
            </ul>
            
            <Link href="/signup?role=creator">
              <Button size="lg" className="bg-coral-500 hover:bg-coral-600 text-white shadow-lg shadow-coral-500/25">
                Start Earning
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}

export default CreatorBenefits;

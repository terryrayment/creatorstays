import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/layout';

export function CTABand() {
  return (
    <section className="py-20 md:py-28 bg-gray-900 relative overflow-hidden">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-coral-500/10 to-transparent" />
      
      <Container className="relative">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-semibold text-white mb-6">
            Ready to grow your bookings?
          </h2>
          <p className="text-lg md:text-xl text-gray-300 mb-10">
            Join hundreds of hosts and creators already partnering on CreatorStays.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup?role=host">
              <Button size="lg" className="w-full sm:w-auto bg-coral-500 hover:bg-coral-600 text-white">
                List Your Property
                <ArrowRight className="w-5 h-5 ml-2" />
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
  );
}

export default CTABand;

import { Check, Info } from 'lucide-react';
import { Container } from '@/components/layout';

export function Pricing() {
  return (
    <section className="py-20 md:py-28 bg-white">
      <Container size="narrow">
        <div className="text-center mb-16">
          <p className="text-coral-500 font-medium mb-3">Simple Pricing</p>
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-gray-900 mb-4">
            Transparent fees, no surprises
          </h2>
          <p className="text-lg text-gray-600">
            Pay only when creators drive real results.
          </p>
        </div>
        
        <div className="bg-gradient-to-br from-sand-50 to-coral-50/30 rounded-3xl p-8 md:p-12 border border-sand-100">
          <div className="grid md:grid-cols-3 gap-8 mb-10">
            {/* Listing Fee */}
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-2">One-time listing fee</p>
              <p className="font-serif text-4xl font-bold text-gray-900">$199</p>
              <p className="text-sm text-gray-500 mt-2">Unlimited properties</p>
            </div>
            
            {/* Host Fee */}
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-2">Host platform fee</p>
              <p className="font-serif text-4xl font-bold text-gray-900">15%</p>
              <p className="text-sm text-gray-500 mt-2">Of creator payout</p>
            </div>
            
            {/* Creator Fee */}
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-2">Creator platform fee</p>
              <p className="font-serif text-4xl font-bold text-gray-900">15%</p>
              <p className="text-sm text-gray-500 mt-2">Of earned commission</p>
            </div>
          </div>
          
          {/* Example */}
          <div className="bg-white rounded-2xl p-6 mb-8">
            <p className="font-medium text-gray-900 mb-4">Example: $100 commission to creator</p>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Creator earns</span>
                <span className="font-medium text-gray-900">$85 (after 15% fee)</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Host pays</span>
                <span className="font-medium text-gray-900">$115 (commission + 15% fee)</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Platform revenue</span>
                <span className="font-medium text-coral-500">$30 total</span>
              </div>
            </div>
          </div>
          
          {/* Trust note */}
          <div className="flex items-start gap-3 text-sm text-gray-600 bg-white/50 rounded-xl p-4">
            <Info className="w-5 h-5 text-coral-500 flex-shrink-0 mt-0.5" />
            <p>
              <strong className="text-gray-900">No hidden fees.</strong> You only pay platform fees when a creator 
              drives a confirmed booking. The listing fee is a one-time charge to access our creator network 
              and list unlimited properties.
            </p>
          </div>
        </div>
        
        {/* What's included */}
        <div className="mt-12 grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-serif font-semibold text-gray-900 mb-4">What hosts get</h3>
            <ul className="space-y-3">
              {[
                'Unlimited property listings',
                'Access to full creator network',
                'Real-time analytics dashboard',
                'Booking claim management',
                'Stripe-powered payouts',
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-gray-600">
                  <Check className="w-5 h-5 text-coral-500" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-serif font-semibold text-gray-900 mb-4">What creators get</h3>
            <ul className="space-y-3">
              {[
                'Free to join',
                'Browse all available properties',
                'Unique tracking links',
                'Earnings dashboard',
                'Direct deposit payouts',
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-gray-600">
                  <Check className="w-5 h-5 text-coral-500" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  );
}

export default Pricing;

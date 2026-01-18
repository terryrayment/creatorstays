import { Users, BarChart3, Shield, Zap, DollarSign, Clock } from 'lucide-react';
import { Container } from '@/components/layout';

const features = [
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
    description: 'Review and approve every creator before they start promoting your property.',
  },
  {
    icon: Zap,
    title: 'Easy Setup',
    description: 'List your property in minutes. Just add your Airbnb URL and set your offer terms.',
  },
  {
    icon: Clock,
    title: '30-Day Attribution',
    description: 'Cookie-based tracking ensures creators get credit for bookings they influence.',
  },
  {
    icon: DollarSign,
    title: 'Transparent Pricing',
    description: 'One-time $199 listing fee plus 15% platform fee on successful payouts only.',
  },
];

export function FeatureCards() {
  return (
    <section className="py-20 md:py-28 bg-white">
      <Container>
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-coral-500 font-medium mb-3">Why Choose Us</p>
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-gray-900 mb-4">
            Why hosts choose CreatorStays
          </h2>
          <p className="text-lg text-gray-600">
            Everything you need to turn creator partnerships into booked nights.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-6 lg:p-8 rounded-2xl bg-sand-50/50 border border-sand-100 hover:bg-white hover:shadow-lg hover:shadow-gray-900/5 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-coral-100 flex items-center justify-center mb-5 group-hover:bg-coral-500 group-hover:text-white transition-colors">
                <feature.icon className="w-6 h-6 text-coral-600 group-hover:text-white" />
              </div>
              <h3 className="font-serif text-xl font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

export default FeatureCards;

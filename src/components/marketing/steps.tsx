import { Container } from '@/components/layout';

const steps = [
  {
    number: '01',
    title: 'List Your Property',
    description: 'Add your property details and Airbnb URL. Set your commission rate and offer terms in minutes.',
  },
  {
    number: '02',
    title: 'Approve Creators',
    description: 'Creators apply to promote your property. Review their profiles, audience, and content style.',
  },
  {
    number: '03',
    title: 'They Create & Share',
    description: 'Approved creators share authentic content with their unique tracking link to their audience.',
  },
  {
    number: '04',
    title: 'Track & Pay',
    description: 'Monitor clicks and conversions. We handle attribution and payouts automatically via Stripe.',
  },
];

export function Steps() {
  return (
    <section className="py-20 md:py-28 bg-sand-50/50">
      <Container>
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-coral-500 font-medium mb-3">Simple Process</p>
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-gray-900 mb-4">
            How it works
          </h2>
          <p className="text-lg text-gray-600">
            Get started in minutes. See results in days.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-[calc(50%+40px)] w-[calc(100%-40px)] h-px bg-gradient-to-r from-coral-200 to-coral-100" />
              )}
              
              <div className="text-center">
                <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-full bg-coral-500 text-white font-serif text-xl font-semibold mb-6 shadow-lg shadow-coral-500/25">
                  {step.number}
                </div>
                <h3 className="font-serif text-xl font-semibold text-gray-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

export default Steps;

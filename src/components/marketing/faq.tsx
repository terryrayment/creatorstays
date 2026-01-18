'use client';

import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { Container } from '@/components/layout';
import { cn } from '@/lib/utils';

const faqs = [
  {
    question: 'How does attribution work?',
    answer: 'When a creator shares their unique tracking link, we set a first-party cookie on the visitor\'s browser. If that visitor books within 30 days (or your custom attribution window), the creator gets credit. Hosts submit booking claims with dates, and we match them to tracked clicks.',
  },
  {
    question: 'Do I need to use Airbnb?',
    answer: 'Currently, we support properties listed on Airbnb. When a creator shares their link, visitors are redirected to your Airbnb listing. We\'re working on supporting direct bookings and other platforms soon.',
  },
  {
    question: 'How do payouts work?',
    answer: 'When a booking is confirmed and approved, we automatically transfer the creator\'s commission minus our 15% fee via Stripe. Creators need to set up a Stripe Connect account to receive payouts. Funds typically arrive within 2-3 business days.',
  },
  {
    question: 'Can I approve which creators promote my property?',
    answer: 'Yes! You have full control. When a creator applies to promote your property, you can review their profile, social channels, audience size, and content style. Only approved creators can generate tracking links for your property.',
  },
  {
    question: 'What kind of content do creators make?',
    answer: 'Creators have full creative freedom - there are no scripts or forced messaging. Most create authentic social media posts, stories, reels, or blog content showcasing your property. The best performing content feels genuine, not like an ad.',
  },
  {
    question: 'Is there a minimum commitment?',
    answer: 'No. The $199 listing fee is one-time with no recurring charges. You can pause or remove listings anytime. You only pay platform fees when creators actually drive bookings.',
  },
  {
    question: 'What about FTC disclosure requirements?',
    answer: 'We take compliance seriously. All creators must agree to properly disclose their affiliate relationship when accepting a deal. We remind them of FTC requirements and provide suggested disclosure language.',
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = React.useState<number | null>(0);

  return (
    <section className="py-20 md:py-28 bg-sand-50/50">
      <Container size="narrow">
        <div className="text-center mb-16">
          <p className="text-coral-500 font-medium mb-3">FAQ</p>
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-gray-900 mb-4">
            Frequently asked questions
          </h2>
          <p className="text-lg text-gray-600">
            Everything you need to know about CreatorStays.
          </p>
        </div>
        
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-6 text-left"
              >
                <span className="font-medium text-gray-900 pr-4">{faq.question}</span>
                <ChevronDown
                  className={cn(
                    'w-5 h-5 text-gray-400 flex-shrink-0 transition-transform',
                    openIndex === index && 'rotate-180'
                  )}
                />
              </button>
              <div
                className={cn(
                  'overflow-hidden transition-all duration-300',
                  openIndex === index ? 'max-h-96' : 'max-h-0'
                )}
              >
                <div className="px-6 pb-6 text-gray-600 leading-relaxed">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

export default FAQ;

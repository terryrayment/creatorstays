import { Navbar, Footer } from '@/components/navigation';
import {
  Hero,
  FeatureCards,
  Steps,
  PropertyGrid,
  CreatorBenefits,
  Pricing,
  FAQ,
  CTABand,
} from '@/components/marketing';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <FeatureCards />
      <Steps />
      <PropertyGrid />
      <CreatorBenefits />
      <Pricing />
      <FAQ />
      <CTABand />
      <Footer />
    </div>
  );
}

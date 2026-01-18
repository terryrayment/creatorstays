import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Search, SlidersHorizontal } from 'lucide-react';
import { Navbar, Footer } from '@/components/navigation';
import { Container } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export const metadata = {
  title: 'Browse Properties | CreatorStays',
  description: 'Find vacation rentals looking for content creators. Browse commission opportunities and start earning.',
};

const properties = [
  {
    id: 1,
    title: 'Modern Beach House',
    location: 'Malibu, CA',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80',
    commission: '10%',
    tags: ['Beachfront', 'Luxury'],
    avgBooking: '$850',
  },
  {
    id: 2,
    title: 'Mountain Retreat',
    location: 'Aspen, CO',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80',
    commission: '12%',
    tags: ['Ski-in/out', 'Hot Tub'],
    avgBooking: '$1,200',
  },
  {
    id: 3,
    title: 'Downtown Loft',
    location: 'Austin, TX',
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&q=80',
    commission: '8%',
    tags: ['Urban', 'Pet Friendly'],
    avgBooking: '$450',
  },
  {
    id: 4,
    title: 'Lakefront Cabin',
    location: 'Lake Tahoe, CA',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&q=80',
    commission: '15%',
    tags: ['Waterfront', 'Family'],
    avgBooking: '$750',
  },
  {
    id: 5,
    title: 'Desert Oasis',
    location: 'Scottsdale, AZ',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80',
    commission: '10%',
    tags: ['Pool', 'Golf'],
    avgBooking: '$600',
  },
  {
    id: 6,
    title: 'Coastal Villa',
    location: 'San Diego, CA',
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80',
    commission: '12%',
    tags: ['Ocean View', 'Luxury'],
    avgBooking: '$950',
  },
  {
    id: 7,
    title: 'Historic Brownstone',
    location: 'Brooklyn, NY',
    image: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=600&q=80',
    commission: '8%',
    tags: ['Urban', 'Historic'],
    avgBooking: '$550',
  },
  {
    id: 8,
    title: 'Tropical Retreat',
    location: 'Miami, FL',
    image: 'https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?w=600&q=80',
    commission: '12%',
    tags: ['Pool', 'Beach'],
    avgBooking: '$700',
  },
  {
    id: 9,
    title: 'Wine Country Estate',
    location: 'Napa Valley, CA',
    image: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=600&q=80',
    commission: '15%',
    tags: ['Vineyard', 'Luxury'],
    avgBooking: '$1,100',
  },
];

export default function PropertiesPage() {
  return (
    <div className="min-h-screen bg-sand-50/30">
      <Navbar />
      
      {/* Header */}
      <section className="pt-28 pb-12 bg-white border-b border-gray-100">
        <Container>
          <h1 className="font-serif text-3xl md:text-4xl font-semibold text-gray-900 mb-4">
            Browse Properties
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl">
            Find vacation rentals looking for content creators. Apply to promote properties 
            that match your audience and start earning commissions.
          </p>
          
          {/* Search/Filter Bar */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search by location or property type..."
                className="pl-10 h-12 bg-sand-50/50 border-sand-200"
              />
            </div>
            <Button variant="outline" className="h-12 border-gray-300">
              <SlidersHorizontal className="w-5 h-5 mr-2" />
              Filters
            </Button>
          </div>
        </Container>
      </section>
      
      {/* Properties Grid */}
      <section className="py-12">
        <Container>
          <p className="text-sm text-gray-500 mb-6">{properties.length} properties available</p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {properties.map((property) => (
              <Link
                key={property.id}
                href={`/properties/${property.id}`}
                className="group block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow"
              >
                <div className="relative aspect-[4/3]">
                  <Image
                    src={property.image}
                    alt={property.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4 flex gap-2">
                    {property.tags.map((tag) => (
                      <Badge
                        key={tag}
                        className="bg-white/90 text-gray-900 hover:bg-white"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-serif text-lg font-semibold text-gray-900 group-hover:text-coral-500 transition-colors">
                    {property.title}
                  </h3>
                  <p className="text-gray-500 flex items-center gap-1 mt-1 mb-4">
                    <MapPin className="w-4 h-4" />
                    {property.location}
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div>
                      <p className="text-xs text-gray-500">Commission</p>
                      <p className="font-semibold text-coral-500">{property.commission}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Avg. Booking</p>
                      <p className="font-semibold text-gray-900">{property.avgBooking}</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>
      
      <Footer />
    </div>
  );
}

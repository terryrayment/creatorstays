import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Container } from '@/components/layout';

const properties = [
  {
    id: 1,
    title: 'Modern Beach House',
    location: 'Malibu, CA',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80',
    commission: '10%',
    tags: ['Beachfront', 'Luxury'],
  },
  {
    id: 2,
    title: 'Mountain Retreat',
    location: 'Aspen, CO',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80',
    commission: '12%',
    tags: ['Ski-in/out', 'Hot Tub'],
  },
  {
    id: 3,
    title: 'Downtown Loft',
    location: 'Austin, TX',
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&q=80',
    commission: '8%',
    tags: ['Urban', 'Pet Friendly'],
  },
  {
    id: 4,
    title: 'Lakefront Cabin',
    location: 'Lake Tahoe, CA',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&q=80',
    commission: '15%',
    tags: ['Waterfront', 'Family'],
  },
  {
    id: 5,
    title: 'Desert Oasis',
    location: 'Scottsdale, AZ',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80',
    commission: '10%',
    tags: ['Pool', 'Golf'],
  },
  {
    id: 6,
    title: 'Coastal Villa',
    location: 'San Diego, CA',
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80',
    commission: '12%',
    tags: ['Ocean View', 'Luxury'],
  },
];

export function PropertyGrid() {
  return (
    <section className="py-20 md:py-28 bg-white">
      <Container>
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div>
            <p className="text-coral-500 font-medium mb-3">Featured Listings</p>
            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-gray-900 mb-4">
              Properties looking for creators
            </h2>
            <p className="text-lg text-gray-600 max-w-xl">
              Browse opportunities from hosts ready to partner with content creators.
            </p>
          </div>
          <Link href="/properties">
            <Button variant="outline" className="border-gray-300">
              View All Properties
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {properties.map((property) => (
            <Link
              key={property.id}
              href={`/properties/${property.id}`}
              className="group block"
            >
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-4">
                <Image
                  src={property.image}
                  alt={property.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
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
                <div className="absolute bottom-4 right-4">
                  <div className="bg-coral-500 text-white px-3 py-1.5 rounded-full text-sm font-medium">
                    {property.commission} commission
                  </div>
                </div>
              </div>
              <h3 className="font-serif text-lg font-semibold text-gray-900 group-hover:text-coral-500 transition-colors">
                {property.title}
              </h3>
              <p className="text-gray-500 flex items-center gap-1 mt-1">
                <MapPin className="w-4 h-4" />
                {property.location}
              </p>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}

export default PropertyGrid;

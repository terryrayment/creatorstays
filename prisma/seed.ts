import { PrismaClient, UserRole, OfferType, DealStatus, PropertyStatus, OfferStatus, PreferredDealType, PreferredRateType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Clean up existing data
  await prisma.auditLog.deleteMany();
  await prisma.ledgerEntry.deleteMany();
  await prisma.bookingClaim.deleteMany();
  await prisma.visitorAttribution.deleteMany();
  await prisma.trackingClick.deleteMany();
  await prisma.deal.deleteMany();
  await prisma.offer.deleteMany();
  await prisma.property.deleteMany();
  await prisma.paymentAccount.deleteMany();
  await prisma.creatorProfile.deleteMany();
  await prisma.hostProfile.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.verificationToken.deleteMany();
  await prisma.user.deleteMany();

  // Create Admin User
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@creatorstays.com',
      name: 'Admin User',
      role: UserRole.ADMIN,
      emailVerified: new Date(),
    },
  });
  console.log('✅ Created admin user:', adminUser.email);

  // Create Host User
  const hostUser = await prisma.user.create({
    data: {
      email: 'host@example.com',
      name: 'Sarah Mitchell',
      role: UserRole.HOST,
      emailVerified: new Date(),
      hostProfile: {
        create: {
          displayName: 'Sarah Mitchell',
          companyName: 'Coastal Retreats LLC',
          bio: 'We manage luxury beachfront properties across Southern California. Our mission is to provide unforgettable coastal experiences for families and couples.',
          location: 'San Diego, CA',
          website: 'https://coastalretreats.example.com',
          hasCompletedSetup: true,
          hasPaidListingFee: true,
        },
      },
      paymentAccount: {
        create: {
          stripeCustomerId: 'cus_test_host_123',
          chargesEnabled: true,
          payoutsEnabled: true,
        },
      },
    },
    include: {
      hostProfile: true,
    },
  });
  console.log('✅ Created host user:', hostUser.email);

  // Create Creator User
  const creatorUser = await prisma.user.create({
    data: {
      email: 'creator@example.com',
      name: 'Alex Rivera',
      role: UserRole.CREATOR,
      emailVerified: new Date(),
      creatorProfile: {
        create: {
          displayName: 'Alex Rivera',
          bio: 'Travel content creator passionate about unique stays and hidden gems. I help my audience discover amazing vacation rentals they\'ll actually want to book.',
          niches: ['Travel', 'Lifestyle', 'Luxury'],
          instagramHandle: 'alexrivera.travels',
          tiktokHandle: 'alexrivera',
          youtubeHandle: 'AlexRiveraTravels',
          audienceSize: 125000,
          mediaKitUrl: 'https://example.com/alexrivera-mediakit.pdf',
          preferredDealTypes: [PreferredDealType.PERCENT_COMMISSION, PreferredDealType.POST_FOR_STAY],
          preferredRateType: PreferredRateType.PER_BOOKING,
          preferredRateValue: 10,
          hasCompletedSetup: true,
          hasAcceptedTerms: true,
        },
      },
      paymentAccount: {
        create: {
          stripeConnectAccountId: 'acct_test_creator_123',
          chargesEnabled: true,
          payoutsEnabled: true,
          detailsSubmitted: true,
        },
      },
    },
    include: {
      creatorProfile: true,
    },
  });
  console.log('✅ Created creator user:', creatorUser.email);

  // Create Properties
  const property1 = await prisma.property.create({
    data: {
      hostId: hostUser.hostProfile!.id,
      title: 'Oceanfront Paradise in La Jolla',
      description: 'Wake up to panoramic ocean views in this stunning 3-bedroom beachfront home. Features a private deck, gourmet kitchen, and direct beach access. Perfect for families or couples seeking a luxurious coastal escape.',
      city: 'La Jolla',
      state: 'California',
      country: 'United States',
      airbnbUrl: 'https://www.airbnb.com/rooms/12345678',
      heroImageUrl: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=1200',
      gallery: [
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
        'https://images.unsplash.com/photo-1484154218962-a197022b25ba?w=800',
      ],
      maxGuests: 6,
      bedrooms: 3,
      bathrooms: 2.5,
      amenities: ['Ocean View', 'Private Beach Access', 'Hot Tub', 'Gourmet Kitchen', 'WiFi', 'Parking', 'Pet Friendly'],
      status: PropertyStatus.ACTIVE,
    },
  });

  const property2 = await prisma.property.create({
    data: {
      hostId: hostUser.hostProfile!.id,
      title: 'Modern Downtown Loft',
      description: 'Stylish urban loft in the heart of the Gaslamp Quarter. Walking distance to restaurants, bars, and attractions. Features industrial-chic design with all modern amenities.',
      city: 'San Diego',
      state: 'California',
      country: 'United States',
      airbnbUrl: 'https://www.airbnb.com/rooms/87654321',
      heroImageUrl: 'https://images.unsplash.com/photo-1502672023488-70e25813eb80?w=1200',
      gallery: [
        'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800',
      ],
      maxGuests: 4,
      bedrooms: 2,
      bathrooms: 1,
      amenities: ['City View', 'Rooftop Access', 'Gym', 'WiFi', 'Smart TV'],
      status: PropertyStatus.ACTIVE,
    },
  });
  console.log('✅ Created properties');

  // Create Offers
  const offer1 = await prisma.offer.create({
    data: {
      hostId: hostUser.hostProfile!.id,
      propertyId: property1.id,
      title: '10% Commission on Bookings',
      description: 'Earn 10% commission on every booking you drive to our La Jolla beachfront property. Perfect for travel influencers with an engaged audience interested in luxury stays.',
      offerType: OfferType.PERCENT,
      percentRate: 0.10,
      minBookingValue: 500,
      maxPayout: 500,
      attributionWindowDays: 30,
      cookieRequired: true,
      requiresApproval: true,
      status: OfferStatus.ACTIVE,
    },
  });

  const offer2 = await prisma.offer.create({
    data: {
      hostId: hostUser.hostProfile!.id,
      propertyId: property1.id,
      title: 'Complimentary Stay for Content',
      description: 'Get a free 3-night stay in exchange for creating authentic content about your experience. Must have 50K+ followers and engagement rate above 3%.',
      offerType: OfferType.POST_FOR_STAY,
      freeNights: 3,
      attributionWindowDays: 14,
      cookieRequired: false,
      requiresApproval: true,
      status: OfferStatus.ACTIVE,
    },
  });

  const offer3 = await prisma.offer.create({
    data: {
      hostId: hostUser.hostProfile!.id,
      propertyId: property2.id,
      title: '$75 Flat Fee Per Booking',
      description: 'Earn $75 for every confirmed booking at our downtown loft. Great for city guides and urban lifestyle creators.',
      offerType: OfferType.FLAT,
      flatAmount: 75,
      minBookingValue: 200,
      attributionWindowDays: 21,
      cookieRequired: true,
      requiresApproval: false,
      status: OfferStatus.ACTIVE,
    },
  });
  console.log('✅ Created offers');

  // Create a Deal
  const deal = await prisma.deal.create({
    data: {
      offerId: offer1.id,
      hostId: hostUser.hostProfile!.id,
      creatorId: creatorUser.creatorProfile!.id,
      status: DealStatus.ACTIVE,
      proposedBy: UserRole.CREATOR,
      agreedPercent: 0.10,
      hasAgreedToDisclose: true,
      startAt: new Date(),
      endAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
    },
  });
  console.log('✅ Created deal');

  // Create sample tracking click
  const click = await prisma.trackingClick.create({
    data: {
      dealId: deal.id,
      offerId: offer1.id,
      creatorId: creatorUser.creatorProfile!.id,
      propertyId: property1.id,
      clickToken: 'sample_click_token_abc123',
      ipHash: 'hash_192_168_1_1',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
      referer: 'https://instagram.com',
      landingUrl: 'https://www.airbnb.com/rooms/12345678',
    },
  });

  await prisma.visitorAttribution.create({
    data: {
      clickId: click.id,
      cookieId: 'cs_visitor_xyz789',
      consentStatus: 'ACCEPTED',
      visitCount: 3,
      lastSeenAt: new Date(),
    },
  });
  console.log('✅ Created tracking data');

  // Create ledger entry for host listing fee
  await prisma.ledgerEntry.create({
    data: {
      userId: hostUser.id,
      type: 'HOST_LISTING_FEE',
      status: 'COMPLETED',
      amount: 199,
      currency: 'USD',
      description: 'One-time listing fee',
      stripeRef: 'pi_test_listingfee_123',
    },
  });
  console.log('✅ Created ledger entries');

  console.log('');
  console.log('🎉 Seed completed successfully!');
  console.log('');
  console.log('Test accounts:');
  console.log('  Admin: admin@creatorstays.com');
  console.log('  Host: host@example.com');
  console.log('  Creator: creator@example.com');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

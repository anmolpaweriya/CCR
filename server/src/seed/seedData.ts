import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Wallet } from '../models/Wallet.js';
import { CreditTransaction } from '../models/CreditTransaction.js';
import { AssistanceRequest } from '../models/AssistanceRequest.js';
import { Resource } from '../models/Resource.js';
import { ResourceRequest } from '../models/ResourceRequest.js';
import { Contribution } from '../models/Contribution.js';
import { Payment } from '../models/Payment.js';
import { Withdrawal } from '../models/Withdrawal.js';
import { GoodwillTransaction } from '../models/GoodwillTransaction.js';
import { Notification } from '../models/Notification.js';
import { Review } from '../models/Review.js';
import { Dispute } from '../models/Dispute.js';
import { AdminAuditLog } from '../models/AdminAuditLog.js';

export const seedDatabase = async (): Promise<void> => {
  console.log('🌱 Starting CCR Database Seeding...');

  // Clear existing collections
  await Promise.all([
    User.deleteMany({}),
    Wallet.deleteMany({}),
    CreditTransaction.deleteMany({}),
    AssistanceRequest.deleteMany({}),
    Resource.deleteMany({}),
    ResourceRequest.deleteMany({}),
    Contribution.deleteMany({}),
    Payment.deleteMany({}),
    Withdrawal.deleteMany({}),
    GoodwillTransaction.deleteMany({}),
    Notification.deleteMany({}),
    Review.deleteMany({}),
    Dispute.deleteMany({}),
    AdminAuditLog.deleteMany({}),
  ]);

  const defaultPassword = 'Password123!';
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(defaultPassword, salt);

  // 1. Create Core Users (Admin, Demo User, Demo Contributor + 18 community members = 21 users)
  const usersData = [
    {
      name: 'CCR Administrator',
      email: 'admin@ccr.demo',
      role: 'ADMIN' as const,
      skills: ['Community Leadership', 'Platform Governance', 'Arbitration'],
      interests: ['Public Policy', 'Mutual Aid', 'Urban Planning'],
      locationZone: 'Central District',
      availability: 'Flexible',
      reputationScore: 100,
      completedContributions: 35,
      badges: ['Platform Guardian', 'Community Helper'],
    },
    {
      name: 'Anmol Sharma',
      email: 'user@ccr.demo',
      role: 'USER' as const,
      skills: ['Carpentry', 'Gardening', 'Computer Hardware'],
      interests: ['Tool Restoration', 'Urban Farming', 'DIY Crafts'],
      locationZone: 'Greenwood District',
      availability: 'Weekends & Evenings',
      reputationScore: 94,
      completedContributions: 12,
      badges: ['Community Helper', 'Resource Sharer'],
    },
    {
      name: 'Elena Rostova',
      email: 'contributor@ccr.demo',
      role: 'USER' as const,
      skills: ['Electrical Repair', 'Plumbing', 'Appliance Diagnosis', 'Woodworking'],
      interests: ['Electronics Repair', 'Permaculture', 'Carpentry'],
      locationZone: 'Greenwood District',
      availability: 'Flexible',
      reputationScore: 98,
      completedContributions: 24,
      badges: ['Reliable Contributor', 'Goodwill Contributor', 'Community Helper'],
    },
    {
      name: 'Marcus Vance',
      email: 'marcus.v@ccr.demo',
      role: 'USER' as const,
      skills: ['Bicycle Repair', 'Welding', 'Metalworking'],
      interests: ['Cycling', 'Zero Waste', 'Metal Sculpture'],
      locationZone: 'Riverside North',
      availability: 'Weekdays',
      reputationScore: 92,
      completedContributions: 8,
      badges: ['Community Helper'],
    },
    {
      name: 'Priya Patel',
      email: 'priya.p@ccr.demo',
      role: 'USER' as const,
      skills: ['Software Troubleshooting', 'Web Design', 'Digital Literacy'],
      interests: ['Open Source', 'EdTech', 'Gardening'],
      locationZone: 'Tech Corridor',
      availability: 'Evenings',
      reputationScore: 96,
      completedContributions: 15,
      badges: ['Community Helper', 'Reliable Contributor'],
    },
    {
      name: 'David Chen',
      email: 'david.c@ccr.demo',
      role: 'USER' as const,
      skills: ['Furniture Assembly', 'Moving & Heavy Lifting', 'Packing'],
      interests: ['Fitness', 'Carpentry', 'Interior Design'],
      locationZone: 'Greenwood District',
      availability: 'Weekends',
      reputationScore: 89,
      completedContributions: 6,
      badges: ['Community Helper'],
    },
    {
      name: 'Sofia Gomez',
      email: 'sofia.g@ccr.demo',
      role: 'USER' as const,
      skills: ['Plant Care', 'Landscape Pruning', 'Organic Soil Prep'],
      interests: ['Botanicals', 'Permaculture', 'Herbalism'],
      locationZone: 'South Meadows',
      availability: 'Weekdays',
      reputationScore: 95,
      completedContributions: 11,
      badges: ['Goodwill Contributor', 'Community Helper'],
    },
    {
      name: 'Tariq Al-Mansoor',
      email: 'tariq.m@ccr.demo',
      role: 'USER' as const,
      skills: ['Audio Engineering', 'Camera Operation', 'Lighting Setup'],
      interests: ['Documentary', 'Soundscapes', 'Podcasting'],
      locationZone: 'Central District',
      availability: 'Flexible',
      reputationScore: 91,
      completedContributions: 9,
      badges: ['Resource Sharer'],
    },
    {
      name: 'Hannah Abbott',
      email: 'hannah.a@ccr.demo',
      role: 'USER' as const,
      skills: ['Painting', 'Drywall Repair', 'Color Consultation'],
      interests: ['Visual Arts', 'Restoration', 'Ceramics'],
      locationZone: 'Riverside North',
      availability: 'Weekends',
      reputationScore: 93,
      completedContributions: 7,
      badges: ['Community Helper'],
    },
    {
      name: 'Lucas Meyer',
      email: 'lucas.m@ccr.demo',
      role: 'USER' as const,
      skills: ['Auto Mechanics', 'Tire Replacement', 'Battery Diagnostics'],
      interests: ['Vintage Motors', 'Solar Retrofits'],
      locationZone: 'Industrial Fringe',
      availability: 'Saturdays',
      reputationScore: 88,
      completedContributions: 5,
      badges: ['Community Helper'],
    },
    {
      name: 'Amina Idris',
      email: 'amina.i@ccr.demo',
      role: 'USER' as const,
      skills: ['Math Tutoring', 'Physics Problem Solving', 'Calculus'],
      interests: ['STEM Education', 'Chess', 'Astronomy'],
      locationZone: 'University Heights',
      availability: 'Evenings',
      reputationScore: 99,
      completedContributions: 20,
      badges: ['Reliable Contributor', 'Goodwill Contributor'],
    },
    {
      name: 'Kenji Sato',
      email: 'kenji.s@ccr.demo',
      role: 'USER' as const,
      skills: ['Bonsai Pruning', 'Wood Carving', 'Joinery'],
      interests: ['Traditional Crafts', 'Tea Culture'],
      locationZone: 'Greenwood District',
      availability: 'Weekdays',
      reputationScore: 97,
      completedContributions: 14,
      badges: ['Resource Sharer', 'Reliable Contributor'],
    },
    {
      name: 'Chloe Bennett',
      email: 'chloe.b@ccr.demo',
      role: 'USER' as const,
      skills: ['Pet First Aid', 'Dog Socialization', 'Cat Behavior'],
      interests: ['Animal Welfare', 'Wildlife Rescue'],
      locationZone: 'South Meadows',
      availability: 'Flexible',
      reputationScore: 94,
      completedContributions: 10,
      badges: ['Community Helper'],
    },
    {
      name: 'Mateo Morales',
      email: 'mateo.m@ccr.demo',
      role: 'USER' as const,
      skills: ['Pressure Washing', 'Gutter Cleaning', 'Roof Inspection'],
      interests: ['Home Renovation', 'Gardening'],
      locationZone: 'Central District',
      availability: 'Weekends',
      reputationScore: 90,
      completedContributions: 8,
      badges: ['Community Helper'],
    },
    {
      name: 'Nia Washington',
      email: 'nia.w@ccr.demo',
      role: 'USER' as const,
      skills: ['Resume Review', 'Interview Prep', 'Career Coaching'],
      interests: ['Workforce Development', 'Public Speaking'],
      locationZone: 'Tech Corridor',
      availability: 'Evenings',
      reputationScore: 96,
      completedContributions: 13,
      badges: ['Goodwill Contributor'],
    },
    {
      name: 'Liam O’Connor',
      email: 'liam.o@ccr.demo',
      role: 'USER' as const,
      skills: ['Plumbing', 'Pipe Insulation', 'Water Filtration'],
      interests: ['Hydraulics', 'Sustainable Living'],
      locationZone: 'Riverside North',
      availability: 'Flexible',
      reputationScore: 92,
      completedContributions: 9,
      badges: ['Community Helper'],
    },
    {
      name: 'Zoe Kravitz',
      email: 'zoe.k@ccr.demo',
      role: 'USER' as const,
      skills: ['Sewing & Mending', 'Textile Repair', 'Embroidery'],
      interests: ['Upcycling', 'Fashion Design', 'Craftivism'],
      locationZone: 'Greenwood District',
      availability: 'Weekdays',
      reputationScore: 93,
      completedContributions: 7,
      badges: ['Community Helper'],
    },
    {
      name: 'Rajesh Nair',
      email: 'rajesh.n@ccr.demo',
      role: 'USER' as const,
      skills: ['Home Networking', 'WiFi Optimization', 'NAS Setup'],
      interests: ['Smart Homes', 'Privacy & Security'],
      locationZone: 'Tech Corridor',
      availability: 'Evenings',
      reputationScore: 95,
      completedContributions: 11,
      badges: ['Community Helper'],
    },
    {
      name: 'Fatima Zahra',
      email: 'fatima.z@ccr.demo',
      role: 'USER' as const,
      skills: ['Baking Instruction', 'Catering Prep', 'Culinary Basics'],
      interests: ['Baking', 'Food Sovereignty'],
      locationZone: 'South Meadows',
      availability: 'Weekends',
      reputationScore: 98,
      completedContributions: 16,
      badges: ['Goodwill Contributor', 'Reliable Contributor'],
    },
    {
      name: 'Oscar Lindqvist',
      email: 'oscar.l@ccr.demo',
      role: 'USER' as const,
      skills: ['Carpentry', 'Shelving Installation', 'Sanding'],
      interests: ['Scandinavian Woodcraft', 'Restoration'],
      locationZone: 'Greenwood District',
      availability: 'Flexible',
      reputationScore: 91,
      completedContributions: 8,
      badges: ['Resource Sharer'],
    },
    {
      name: 'Maya Lin',
      email: 'maya.l@ccr.demo',
      role: 'USER' as const,
      skills: ['Drafting', 'CAD Modeling', '3D Printing Support'],
      interests: ['Architecture', 'Urban Greenspace'],
      locationZone: 'University Heights',
      availability: 'Weekdays',
      reputationScore: 97,
      completedContributions: 14,
      badges: ['Reliable Contributor'],
    },
  ];

  const createdUsers = await User.create(
    usersData.map((u) => ({
      ...u,
      passwordHash,
      isVerified: true,
      isSuspended: false,
    }))
  );

  const adminUser = createdUsers[0];
  const demoUser = createdUsers[1];
  const demoContributor = createdUsers[2];

  // 2. Create Wallets for each user with realistic balances
  for (let i = 0; i < createdUsers.length; i++) {
    const user = createdUsers[i];
    let cash = 60;
    let goodwill = 25;

    if (user.email === 'user@ccr.demo') {
      cash = 125;
      goodwill = 35;
    } else if (user.email === 'contributor@ccr.demo') {
      cash = 180;
      goodwill = 65;
    } else if (user.email === 'admin@ccr.demo') {
      cash = 500;
      goodwill = 200;
    } else {
      cash = 40 + (i % 5) * 20;
      goodwill = 15 + (i % 4) * 10;
    }

    await Wallet.create({
      user: user._id,
      cashCredits: cash,
      goodwillCredits: goodwill,
      totalCashEarned: cash + 40,
      totalCashSpent: 40,
      totalGoodwillEarned: goodwill + 15,
      totalGoodwillSpent: 15,
      pendingCashCredits: 0,
      withdrawableCashCredits: cash,
    });

    // Seed transaction ledger entries
    await CreditTransaction.create([
      {
        user: user._id,
        creditType: 'cash_credit',
        transactionType: 'TOPUP',
        amount: cash,
        balanceBefore: 0,
        balanceAfter: cash,
        referenceType: 'WELCOME_BONUS',
        referenceId: `INIT-CASH-${user._id}`,
        description: 'Initial community credit allocation',
        status: 'COMPLETED',
      },
      {
        user: user._id,
        creditType: 'goodwill_credit',
        transactionType: 'GOODWILL_REWARD',
        amount: goodwill,
        balanceBefore: 0,
        balanceAfter: goodwill,
        referenceType: 'WELCOME_BONUS',
        referenceId: `INIT-GW-${user._id}`,
        description: 'Initial goodwill balance',
        status: 'COMPLETED',
      },
    ]);
  }

  // 3. Create 12+ Physical Resources
  const resourcesData = [
    {
      name: 'DeWalt 20V Cordless Power Drill & Bit Set',
      description:
        'Heavy-duty brushless drill with 2 lithium-ion batteries, charger, and 30-piece masonry/wood drill bit kit.',
      category: 'Tools & Hardware',
      images: [
        'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=800&q=80',
      ],
      condition: 'LIKE_NEW' as const,
      availability: 'IMMEDIATE' as const,
      locationZone: 'Greenwood District',
      owner: demoContributor._id,
      creditPrice: 10,
      deposit: 0,
      status: 'AVAILABLE' as const,
      rules: ['Clean chuck after use', 'Return fully charged'],
    },
    {
      name: 'Werner 8-Foot Aluminum Step Ladder',
      description:
        'Sturdy Type I 250lb duty rated ladder with slip-resistant traction-tred steps and holster top.',
      category: 'Tools & Hardware',
      images: [
        'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
      ],
      condition: 'EXCELLENT' as const,
      availability: 'WEEKDAYS' as const,
      locationZone: 'Greenwood District',
      owner: demoUser._id,
      creditPrice: 8,
      deposit: 0,
      status: 'AVAILABLE' as const,
      rules: ['Store indoors', 'Do not exceed weight rating'],
    },
    {
      name: 'Sony Alpha A7 III Full-Frame Camera',
      description:
        '24.2MP mirrorless camera body with 28-70mm lens, 2 high-capacity batteries, and 128GB high-speed SD card.',
      category: 'Electronics & Audio',
      images: [
        'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80',
      ],
      condition: 'LIKE_NEW' as const,
      availability: 'UPON_REQUEST' as const,
      locationZone: 'Central District',
      owner: createdUsers[7]._id, // Tariq
      creditPrice: 25,
      deposit: 50,
      status: 'AVAILABLE' as const,
      rules: ['Camera strap must be worn', 'Lens cap on when not shooting', 'No extreme weather'],
    },
    {
      name: 'Trek FX 2 Disc Commuter Bicycle (Medium)',
      description:
        'Lightweight aluminum hybrid commuter bike with hydraulic disc brakes, rear rack, and pannier bags.',
      category: 'Bicycles & Mobility',
      images: [
        'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=800&q=80',
      ],
      condition: 'EXCELLENT' as const,
      availability: 'IMMEDIATE' as const,
      locationZone: 'Riverside North',
      owner: createdUsers[3]._id, // Marcus
      creditPrice: 12,
      deposit: 0,
      status: 'AVAILABLE' as const,
      rules: ['U-lock included and required when parking', 'Helmet provided upon request'],
    },
    {
      name: 'The North Face 4-Person Geodesic Camping Tent',
      description:
        'Weatherproof 3-season camping tent with color-coded pole system, high-low ventilation, and ground tarp.',
      category: 'Outdoor & Camping',
      images: [
        'https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=800&q=80',
      ],
      condition: 'GOOD' as const,
      availability: 'WEEKENDS' as const,
      locationZone: 'South Meadows',
      owner: createdUsers[6]._id, // Sofia
      creditPrice: 15,
      deposit: 0,
      status: 'AVAILABLE' as const,
      rules: ['Ensure fully dry before packing away', 'No cooking inside tent'],
    },
    {
      name: 'Kärcher 2000 PSI Electric Pressure Washer',
      description:
        'Compact pressure washer with Vario Power spray wand, DirtBlaster nozzle, and 25-ft high pressure hose.',
      category: 'Appliances & Home',
      images: [
        'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
      ],
      condition: 'EXCELLENT' as const,
      availability: 'IMMEDIATE' as const,
      locationZone: 'Central District',
      owner: createdUsers[13]._id, // Mateo
      creditPrice: 14,
      deposit: 0,
      status: 'AVAILABLE' as const,
      rules: ['Connect water supply before powering motor', 'Store indoors'],
    },
    {
      name: 'Yamaha StagePas 400BT Portable PA System',
      description:
        '400-watt portable sound system with 8-channel mixer, Bluetooth streaming, two speakers, and wireless microphone.',
      category: 'Electronics & Audio',
      images: [
        'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
      ],
      condition: 'EXCELLENT' as const,
      availability: 'UPON_REQUEST' as const,
      locationZone: 'Tech Corridor',
      owner: createdUsers[4]._id, // Priya
      creditPrice: 20,
      deposit: 20,
      status: 'AVAILABLE' as const,
      rules: ['Keep volume within safe limits', 'Cover if used outdoors'],
    },
    {
      name: 'Makita Cordless Circular Saw (6-1/2 Inch)',
      description:
        'Precision wood cutting saw with carbide-tipped blade, dust extraction port, and dual 18V battery pack.',
      category: 'Tools & Hardware',
      images: [
        'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=800&q=80',
      ],
      condition: 'GOOD' as const,
      availability: 'WEEKDAYS' as const,
      locationZone: 'Greenwood District',
      owner: createdUsers[19]._id, // Oscar
      creditPrice: 12,
      deposit: 0,
      status: 'AVAILABLE' as const,
      rules: ['Safety goggles mandatory', 'Inspect blade before each cut'],
    },
    {
      name: 'Honda 2000W Inverter Whisper-Quiet Generator',
      description:
        'Super quiet clean power source for outdoor events, camping, or emergency home backup power.',
      category: 'Appliances & Home',
      images: [
        'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
      ],
      condition: 'EXCELLENT' as const,
      availability: 'IMMEDIATE' as const,
      locationZone: 'Industrial Fringe',
      owner: createdUsers[9]._id, // Lucas
      creditPrice: 22,
      deposit: 30,
      status: 'AVAILABLE' as const,
      rules: ['Never run indoors or near windows', 'Return with full tank of regular gas'],
    },
    {
      name: 'Singer Heavy Duty 4432 Sewing Machine',
      description:
        'High-speed commercial motor sewing machine capable of canvas, denim, leather, and fine fabrics.',
      category: 'Appliances & Home',
      images: [
        'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=800&q=80',
      ],
      condition: 'LIKE_NEW' as const,
      availability: 'WEEKDAYS' as const,
      locationZone: 'Greenwood District',
      owner: createdUsers[16]._id, // Zoe
      creditPrice: 10,
      deposit: 0,
      status: 'AVAILABLE' as const,
      rules: ['Use appropriate needle gauge for fabric thickness'],
    },
    {
      name: 'Stihl Gas Hedge Trimmer & Pruning Pole',
      description:
        'Professional grade hedge trimmer with 24-inch double-sided blade and reach extension.',
      category: 'Tools & Hardware',
      images: [
        'https://images.unsplash.com/photo-1592417817098-8f3d6eb22509?auto=format&fit=crop&w=800&q=80',
      ],
      condition: 'GOOD' as const,
      availability: 'WEEKENDS' as const,
      locationZone: 'Greenwood District',
      owner: demoUser._id,
      creditPrice: 11,
      deposit: 0,
      status: 'AVAILABLE' as const,
      rules: ['Wear ear and eye protection', 'Wipe sap off blades after use'],
    },
  ];

  await Resource.create(resourcesData);

  // 4. Create 16+ Assistance Requests
  const requestsData = [
    {
      title: 'Help Assemble IKEA Pax Wardrobe System',
      description:
        'Need a helping hand to align and bolt together a 3-section PAX wardrobe with sliding mirror doors. I have the basic tools, just need an extra pair of capable hands for about 2 hours.',
      category: 'Home Improvement',
      requiredSkills: ['Furniture Assembly', 'Carpentry'],
      estimatedDuration: 120,
      urgency: 'MEDIUM' as const,
      preferredDate: '2026-09-24',
      preferredTime: 'Saturday Morning',
      approximateLocation: 'Greenwood District (approx. 0.8 km)',
      creditValue: 14,
      requestType: 'STANDARD' as const,
      status: 'OPEN' as const,
      requester: createdUsers[5]._id, // David
      aiValuation: {
        recommendedCredits: 14,
        reasons: [
          'Base time commitment: 120 mins (~12 credits)',
          'High skill / technical complexity requirement (+4 credits)',
          'Standard scheduled urgency',
        ],
      },
    },
    {
      title: 'Emergency Garden Bed Relocation & Soil Tilling',
      description:
        'Elderly neighbor needs help moving three raised cedar garden boxes before landscaping works begin on Monday.',
      category: 'Gardening & Outdoor',
      requiredSkills: ['Gardening', 'Heavy Lifting'],
      estimatedDuration: 90,
      urgency: 'HIGH' as const,
      preferredDate: '2026-09-22',
      preferredTime: 'Afternoon',
      approximateLocation: 'South Meadows (approx. 1.5 km)',
      creditValue: 12,
      requestType: 'GOODWILL' as const, // Goodwill assistance request
      status: 'OPEN' as const,
      requester: createdUsers[6]._id, // Sofia
      aiValuation: {
        recommendedCredits: 12,
        reasons: [
          'Base time commitment: 90 mins (~9 credits)',
          'Moderate physical effort / tool usage (+2 credits)',
          'High urgency priority (+3 credits)',
        ],
      },
    },
    {
      title: 'Troubleshoot Kitchen GFI Outlet & Breaker Trip',
      description:
        'The kitchen circuit keeps tripping whenever the coffee maker or microwave is plugged in. Looking for someone with electrical experience to inspect the outlet wiring safely.',
      category: 'Home Improvement',
      requiredSkills: ['Electrical Repair', 'Troubleshooting'],
      estimatedDuration: 60,
      urgency: 'HIGH' as const,
      preferredDate: '2026-09-21',
      preferredTime: 'Evening',
      approximateLocation: 'Greenwood District (approx. 0.4 km)',
      creditValue: 10,
      requestType: 'STANDARD' as const,
      status: 'OPEN' as const,
      requester: demoUser._id,
      aiValuation: {
        recommendedCredits: 10,
        reasons: [
          'Base time commitment: 60 mins (~6 credits)',
          'High skill / electrical requirement (+4 credits)',
        ],
      },
    },
    {
      title: 'Help Move Heavy Oak Desk to Second Floor',
      description:
        'Solid vintage oak desk delivered to driveway. Need one strong helper for 30 minutes to carry it upstairs into the study.',
      category: 'Moving & Lifting',
      requiredSkills: ['Moving & Heavy Lifting'],
      estimatedDuration: 30,
      urgency: 'MEDIUM' as const,
      preferredDate: '2026-09-23',
      preferredTime: '5:00 PM',
      approximateLocation: 'Greenwood District (approx. 1.1 km)',
      creditValue: 7,
      requestType: 'STANDARD' as const,
      status: 'OPEN' as const,
      requester: createdUsers[8]._id, // Hannah
      aiValuation: {
        recommendedCredits: 7,
        reasons: [
          'Base time commitment: 30 mins (~3 credits)',
          'Moderate physical effort (+2 credits)',
          'Nearby community demand factor (+2 credits)',
        ],
      },
    },
    {
      title: 'Bicycle Derailleur Tuning & Gear Cable Replacement',
      description:
        'Rear gears are skipping under pressure. Have replacement Shimano cable on hand, looking for a bike enthusiast with a stand and cable puller.',
      category: 'Tech & Digital',
      requiredSkills: ['Bicycle Repair'],
      estimatedDuration: 45,
      urgency: 'LOW' as const,
      preferredDate: '2026-09-25',
      preferredTime: 'Weekend Afternoon',
      approximateLocation: 'Riverside North (approx. 2.0 km)',
      creditValue: 6,
      requestType: 'STANDARD' as const,
      status: 'OPEN' as const,
      requester: createdUsers[14]._id, // Nia
      aiValuation: {
        recommendedCredits: 6,
        reasons: [
          'Base time commitment: 45 mins (~4 credits)',
          'Technical tool usage (+2 credits)',
        ],
      },
    },
    {
      title: 'Senior Citizen Digital Tablet & Video Call Setup',
      description:
        'Setting up a new Android tablet for my grandmother so she can video call family. Need a patient volunteer to configure large fonts, WhatsApp, and teach basic touch gestures.',
      category: 'Tutoring & Skills',
      requiredSkills: ['Digital Literacy', 'Patient Communication'],
      estimatedDuration: 60,
      urgency: 'MEDIUM' as const,
      preferredDate: '2026-09-22',
      preferredTime: 'Morning',
      approximateLocation: 'Tech Corridor (approx. 1.3 km)',
      creditValue: 8,
      requestType: 'GOODWILL' as const,
      status: 'OPEN' as const,
      requester: createdUsers[4]._id, // Priya
      aiValuation: {
        recommendedCredits: 8,
        reasons: [
          'Community goodwill educational assistance',
          'Estimated duration: 60 minutes',
        ],
      },
    },
    {
      title: 'Install Wall-Mount for 55-inch TV into Studs',
      description:
        'Have drywall with wooden studs. Need someone with a reliable stud finder and impact driver to anchor the mount level.',
      category: 'Home Improvement',
      requiredSkills: ['Carpentry', 'Stud Finding', 'Drilling'],
      estimatedDuration: 45,
      urgency: 'MEDIUM' as const,
      preferredDate: '2026-09-23',
      preferredTime: 'Flexible',
      approximateLocation: 'Greenwood District (approx. 0.6 km)',
      creditValue: 8,
      requestType: 'STANDARD' as const,
      status: 'OPEN' as const,
      requester: createdUsers[17]._id, // Rajesh
      aiValuation: {
        recommendedCredits: 8,
        reasons: ['Base time commitment: 45 mins', 'Hardware installation skill'],
      },
    },
    {
      title: 'Community Garden Fence Repair & Gate Latch',
      description:
        'The communal garden latch is broken allowing stray dogs in. Need a volunteer to screw in a new spring latch and reinforce 2 fence pickets.',
      category: 'Gardening & Outdoor',
      requiredSkills: ['Carpentry', 'Gardening'],
      estimatedDuration: 60,
      urgency: 'HIGH' as const,
      preferredDate: '2026-09-21',
      preferredTime: 'Afternoon',
      approximateLocation: 'Greenwood District (approx. 0.2 km)',
      creditValue: 10,
      requestType: 'GOODWILL' as const,
      status: 'OPEN' as const,
      requester: demoUser._id,
      aiValuation: {
        recommendedCredits: 10,
        reasons: ['Community asset repair', 'Urgency: High (+3 credits)'],
      },
    },
  ];

  await AssistanceRequest.create(requestsData);

  // 5. Seed Demo Payments
  await Payment.create([
    {
      user: demoUser._id,
      amount: 100,
      credits: 100,
      provider: 'DEMO_PAYMENT',
      status: 'SUCCESS',
      transactionId: `DEMO-PAY-${Date.now()}-101`,
      cardLast4: '4242',
    },
    {
      user: demoContributor._id,
      amount: 50,
      credits: 50,
      provider: 'DEMO_PAYMENT',
      status: 'SUCCESS',
      transactionId: `DEMO-PAY-${Date.now()}-102`,
      cardLast4: '4242',
    },
  ]);

  // 6. Seed Demo Withdrawals (Pending for admin testing)
  await Withdrawal.create([
    {
      user: demoContributor._id,
      amount: 50,
      creditType: 'cash_credit',
      payoutMethod: 'UPI',
      payoutDetails: 'elena.rostova@okaxis',
      status: 'REQUESTED',
    },
    {
      user: createdUsers[3]._id, // Marcus
      amount: 30,
      creditType: 'cash_credit',
      payoutMethod: 'BANK_TRANSFER',
      payoutDetails: 'Account: 9876543210 - IFSC: DEMO0001234',
      status: 'REQUESTED',
    },
  ]);

  // 7. Seed Goodwill Transactions History
  await GoodwillTransaction.create([
    {
      contributor: demoContributor._id,
      recipient: createdUsers[6]._id,
      itemType: 'ASSISTANCE',
      itemTitle: 'Repaired elderly neighbor porch stairs',
      referenceId: `AST-SEED-01`,
      goodwillCreditsAwarded: 15,
      verified: true,
      verifiedAt: new Date(Date.now() - 86400000 * 3),
    },
    {
      contributor: demoContributor._id,
      recipient: demoUser._id,
      itemType: 'RESOURCE',
      itemTitle: 'Power Drill (Goodwill Community Loan)',
      referenceId: `RES-SEED-01`,
      goodwillCreditsAwarded: 10,
      verified: true,
      verifiedAt: new Date(Date.now() - 86400000 * 2),
    },
    {
      contributor: createdUsers[10]._id, // Amina
      recipient: createdUsers[14]._id, // Nia
      itemType: 'ASSISTANCE',
      itemTitle: 'Free Calculus Tutoring for High School Exam',
      referenceId: `AST-SEED-02`,
      goodwillCreditsAwarded: 12,
      verified: true,
      verifiedAt: new Date(Date.now() - 86400000 * 5),
    },
  ]);

  // 8. Seed Notifications for Demo User & Contributor
  await Notification.create([
    {
      recipient: demoUser._id,
      title: 'Welcome to CCR! 🎉',
      message:
        'Your account has been credited with 50 Cash Credits and 20 Goodwill Credits to explore and request help.',
      type: 'CREDITS_RECEIVED',
      link: '/wallet',
      isRead: false,
    },
    {
      recipient: demoContributor._id,
      title: '💚 New Goodwill Opportunity Nearby',
      message: 'Sofia requested help for "Emergency Garden Bed Relocation". Check it out!',
      type: 'GOODWILL_REQUEST',
      link: '/assistance',
      isRead: false,
    },
    {
      recipient: demoContributor._id,
      title: 'Contribution Verified! 🎉',
      message: 'Your help for "Porch stairs repair" was verified. +15 Goodwill Credits awarded.',
      type: 'CREDITS_RECEIVED',
      link: '/wallet',
      isRead: true,
    },
  ]);

  // 9. Seed Admin Audit Log
  await AdminAuditLog.create([
    {
      admin: adminUser._id,
      action: 'CREDIT_ADJUSTED',
      entity: 'Wallet',
      entityId: demoUser._id.toString(),
      previousState: { cashCredits: 100 },
      newState: { cashCredits: 125 },
      reason: 'Community grant for neighborhood workshop initiative',
    },
  ]);

  console.log('✅ CCR Database successfully seeded!');
  console.log('Demo Accounts:');
  console.log('  Admin:       admin@ccr.demo       / Password123!');
  console.log('  User:        user@ccr.demo        / Password123!');
  console.log('  Contributor: contributor@ccr.demo / Password123!');
};

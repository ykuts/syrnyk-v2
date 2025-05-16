// migrations/populate-delivery-zones.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Create Vaud delivery zone
  const vaudZone = await prisma.deliveryZone.create({
    data: {
      name: 'Vaud',
      canton: 'VD',
      description: 'Vaud canton delivery zone',
      dayOfWeek: 6, // Saturday
    },
  });

  // Create Geneva delivery zone
  const genevaZone = await prisma.deliveryZone.create({
    data: {
      name: 'Geneva',
      canton: 'GE',
      description: 'Geneva canton delivery zone',
      dayOfWeek: 1, // Monday
    },
  });

  // Create pickup time slots
  const pickupTimeSlots = [
    { name: 'Morning', startTime: '09:00', endTime: '13:00' },
    { name: 'Afternoon', startTime: '13:00', endTime: '17:00' },
    { name: 'Evening', startTime: '17:00', endTime: '20:00' },
  ];

  for (const slot of pickupTimeSlots) {
    await prisma.deliveryTimeSlot.create({
      data: {
        ...slot,
        isActive: true,
      },
    });
  }

  // Create address delivery time slots
  const addressDeliveryTimeSlots = [
    { name: 'Morning', startTime: '09:00', endTime: '12:00' },
    { name: 'Early Afternoon', startTime: '12:00', endTime: '15:00' },
    { name: 'Late Afternoon', startTime: '15:00', endTime: '18:00' },
  ];

  for (const slot of addressDeliveryTimeSlots) {
    await prisma.deliveryTimeSlot.create({
      data: {
        ...slot,
        zoneId: vaudZone.id,
        isActive: true,
      },
    });
    
    await prisma.deliveryTimeSlot.create({
      data: {
        ...slot,
        zoneId: genevaZone.id,
        isActive: true,
      },
    });
  }

  // Create pickup location for Nyon
  await prisma.pickupLocation.create({
    data: {
      name: 'Nyon Store',
      address: 'Store Address Here',
      city: 'Nyon',
      postalCode: '1260',
      openingHours: JSON.stringify({
        0: { open: '09:00', close: '20:00' }, // Sunday
        1: { open: '09:00', close: '20:00' }, // Monday
        2: { open: '09:00', close: '20:00' }, // Tuesday
        6: { open: '09:00', close: '20:00' }, // Saturday
      }),
    },
  });

  // Now populate the Vaud cities for free delivery at 100 CHF
  // Parse your city data
  const citiesData = `
    Регіон Індекс Місто
    Лозанна 1000 Lausanne
    1009 Pully
    1092 Belmont-sur-Lausanne
    1066 Epalinges
    1052 Le Mont-sur-Lausanne
    1033 Cheseaux-sur-Lausanne
    1073 Savigny
    1095 Lutry
    1096 Cully
    1091 Grandvaux
    1090 Epesses
    1098 Saint-Saphorin
    Ренан 1020 Renens
    1023 Crissier
    1024 Ecublens
    1022 Chavannes-près-Renens
    1008 Prilly
    1032 Romanel-sur-Lausanne
    1030 Bussigny
    1025 Saint-Sulpice
    1026 Denges
    1027 Lonay
    Морж 1110 Morges
    1131 Tolochenaz
    1028 Préverenges
    1027 Lonay
    1162 Saint-Prex
    Аламан 1165 Allaman
    1170 Aubonne
    1173 Féchy
    1163 Etoy
    1136 Buchillon
    1166 Perroy
    1182 Gilly
    1175 Lavigny
    1135 Denens
    1134 Vufflens-le-Château
    1132 Lully
    Роль 1180 Rolle
    1166 Perroy
    1185 Mont-sur-Rolle
    1186 Essertines-sur-Rolle
    1172 Bougy-Villars
    1173 Féchy
    1180 Tartegnin
    1182 Gilly
    Гланд 1196 Gland
    1184 Luins
    1184 Vinzel
    1195 Dully
    1183 Bursins
    1195 Bursinel
    1182 Gilly
    1180 Tartegnin
    Ньон 1260 Nyon
    1197 Prangins
    1299 Crans-près-Céligny
    1298 Céligny
    1279 Chavannes-de-Bogis
    1290 Chavannes-des-Bois
    1279 Bogis-Bossey
    1277 Borex
    1266 Duillier
    1262 Eysins
    1276 Gingins
    1271 Givrins
    1270 Trélex
    1272 Genolier
    1264 Saint-Cergue
    Коппе 1296 Coppet
    1295 Tannay
    1295 Mies
    1297 Founex
    1291 Commugny
  `;

  // Parse the city data into a structured format
  const cityLines = citiesData.trim().split('\n');
  let currentRegion = '';
  const cities = [];

  for (let i = 1; i < cityLines.length; i++) { // Skip header line
    const line = cityLines[i].trim();
    const parts = line.split(/\s+/);
    
    if (parts.length >= 3) {
      // This is a city with postal code
      const postalCode = parts[0];
      const cityName = parts.slice(1).join(' ');
      cities.push({
        postalCode,
        name: cityName,
        region: currentRegion
      });
    } else if (parts.length === 2) {
      // This might be a city with postal code
      const postalCode = parts[0];
      const cityName = parts[1];
      cities.push({
        postalCode,
        name: cityName,
        region: currentRegion
      });
    } else if (parts.length === 1) {
      // This is likely a region name
      currentRegion = parts[0];
    }
  }

  // Filter out any invalid entries and create cities
  const validCities = cities.filter(city => /^\d+$/.test(city.postalCode));
  
  console.log(`Inserting ${validCities.length} cities...`);
  
  for (const city of validCities) {
    try {
      await prisma.deliveryCity.create({
        data: {
          zoneId: vaudZone.id,
          name: city.name,
          postalCode: city.postalCode,
          freeThreshold: 100.00, // 100 CHF for free delivery
        },
      });
    } catch (error) {
      console.error(`Error inserting city ${city.name}: ${error.message}`);
    }
  }

  console.log('Database seeded successfully!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
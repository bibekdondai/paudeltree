// Seed script for Paudel family data
// Run with: node scripts/seedFamilyData.js

const admin = require('firebase-admin');

const familyData = [
  // Generation 1 - Root
  { name: 'Chakrapani Paudel', birth: '1920', death: '1985', gender: 'male' },

  // Generation 2 - Children of Chakrapani
  { name: 'Laxima Paudel', birth: '1945', gender: 'female', parent: 'Chakrapani Paudel' },
  { name: 'Bhadrikala Paudel', birth: '1947', gender: 'female', parent: 'Chakrapani Paudel' },
  
  // Chabilal's family
  { name: 'Chabilal Paudel', birth: '1949', gender: 'male', parent: 'Chakrapani Paudel' },
  { name: 'Durga Paudel', birth: '1952', gender: 'female', spouse: 'Chabilal Paudel' },
  { name: 'Ganesh Paudel', birth: '1970', gender: 'male', parent: 'Chabilal Paudel' },
  { name: 'Anjana Paudel', birth: '1972', gender: 'female', spouse: 'Ganesh Paudel' },
  { name: 'Anurag Paudel', birth: '1995', gender: 'male', parent: 'Ganesh Paudel' },
  { name: 'Kumar Paudel', birth: '1974', gender: 'male', parent: 'Chabilal Paudel' },
  { name: 'Sumana Paudel', birth: '1976', gender: 'female', spouse: 'Kumar Paudel' },
  { name: 'Kushal Paudel', birth: '1998', gender: 'male', parent: 'Kumar Paudel' },

  // Arjun's family
  { name: 'Arjun Paudel', birth: '1951', gender: 'male', parent: 'Chakrapani Paudel' },
  { name: 'Bishnu Paudel', birth: '1954', gender: 'female', spouse: 'Arjun Paudel' },
  { name: 'Amrit Paudel', birth: '1972', gender: 'male', parent: 'Arjun Paudel' },
  { name: 'Neesa Paudel', birth: '1975', gender: 'female', spouse: 'Amrit Paudel' },
  { name: 'Arohi Paudel', birth: '1996', gender: 'female', parent: 'Amrit Paudel' },
  { name: 'Arab Paudel', birth: '1999', gender: 'male', parent: 'Amrit Paudel' },
  { name: 'Bimala Sapkota', birth: '1974', gender: 'female', parent: 'Arjun Paudel' },
  { name: 'Susanta Sapkota', birth: '1971', gender: 'male', spouse: 'Bimala Sapkota' },
  { name: 'Georgia Sapkota', birth: '1997', gender: 'female', parent: 'Bimala Sapkota' },
  { name: 'Jessica Sapkota', birth: '2000', gender: 'female', parent: 'Bimala Sapkota' },
  { name: 'Surendra Paudel', birth: '1977', gender: 'male', parent: 'Arjun Paudel' },
  { name: 'Sandhya Paudel', birth: '1979', gender: 'female', spouse: 'Surendra Paudel' },

  // Durga Devi's family
  { name: 'Durga Devi Adhikari', birth: '1953', gender: 'female', parent: 'Chakrapani Paudel' },
  { name: 'Krishna Raj Adhikari', birth: '1950', gender: 'male', spouse: 'Durga Devi Adhikari' },
  { name: 'Nawaraj Adhikari', birth: '1973', gender: 'male', parent: 'Durga Devi Adhikari' },
  { name: 'Seema Adhikari', birth: '1976', gender: 'female', spouse: 'Nawaraj Adhikari' },
  { name: 'Niyasha Adhikari', birth: '1998', gender: 'female', parent: 'Nawaraj Adhikari' },
  { name: 'Nidesh Adhikari', birth: '2001', gender: 'male', parent: 'Nawaraj Adhikari' },
  { name: 'Santosh Adhikari', birth: '1975', gender: 'male', parent: 'Durga Devi Adhikari' },
  { name: 'Samjhana Adhikari', birth: '1978', gender: 'female', spouse: 'Santosh Adhikari' },
  { name: 'Sabiya Adhikari', birth: '2002', gender: 'female', parent: 'Santosh Adhikari' },

  // Devi's family
  { name: 'Devi Acharya', birth: '1955', gender: 'female', parent: 'Chakrapani Paudel' },
  { name: 'Tikaram Acharya', birth: '1952', gender: 'male', spouse: 'Devi Acharya' },
  { name: 'Ambika GC', birth: '1976', gender: 'female', parent: 'Devi Acharya' },
  { name: 'Sher Bahadur GC', birth: '1974', gender: 'male', spouse: 'Ambika GC' },
  { name: 'Susant GC', birth: '2000', gender: 'male', parent: 'Ambika GC' },
  { name: 'Arab GC', birth: '2003', gender: 'male', parent: 'Ambika GC' },
  { name: 'Ashok Acharya', birth: '1978', gender: 'male', parent: 'Devi Acharya' },
  { name: 'Shraddha Acharya', birth: '1980', gender: 'female', spouse: 'Ashok Acharya' },
  { name: 'Ayzal Acharya', birth: '2002', gender: 'male', parent: 'Ashok Acharya' },
  { name: 'Sage Acharya', birth: '2004', gender: 'female', parent: 'Ashok Acharya' },
  { name: 'Saraswati Adhikari', birth: '1980', gender: 'female', parent: 'Devi Acharya' },
  { name: 'Amrit Adhikari', birth: '1977', gender: 'male', spouse: 'Saraswati Adhikari' },
  { name: 'Aahan Adhikari', birth: '2003', gender: 'male', parent: 'Saraswati Adhikari' },
  { name: 'Ayush Adhikari', birth: '2006', gender: 'male', parent: 'Saraswati Adhikari' },

  // Sita's family
  { name: 'Sita Lamsal', birth: '1957', gender: 'female', parent: 'Chakrapani Paudel' },
  { name: 'Netra Lamsal', birth: '1954', gender: 'male', spouse: 'Sita Lamsal' },
  { name: 'Bijay Lamsal', birth: '1978', gender: 'male', parent: 'Sita Lamsal' },
  { name: 'Astha Lamsal', birth: '1980', gender: 'female', spouse: 'Bijay Lamsal' },
  { name: 'Bihan Lamsal', birth: '2005', gender: 'male', parent: 'Bijay Lamsal' },
  { name: 'Binita Chapagain', birth: '1980', gender: 'female', parent: 'Sita Lamsal' },
  { name: 'Basanta Chapagain', birth: '1977', gender: 'male', spouse: 'Binita Chapagain' },
  { name: 'Brianca Chapagain', birth: '2006', gender: 'female', parent: 'Binita Chapagain' },

  // Himal's family
  { name: 'Himal Paudel', birth: '1959', gender: 'male', parent: 'Chakrapani Paudel' },
  { name: 'Manju Paudel', birth: '1962', gender: 'female', spouse: 'Himal Paudel' },
  { name: 'Bibek Paudel', birth: '1982', gender: 'male', parent: 'Himal Paudel' },
  { name: 'Bipson Paudel', birth: '1985', gender: 'male', parent: 'Himal Paudel' },

  // Umakanta's family
  { name: 'Umakanta Paudel', birth: '1961', gender: 'male', parent: 'Chakrapani Paudel' },
  { name: 'Ganga Paudel', birth: '1964', gender: 'female', spouse: 'Umakanta Paudel' },
  { name: 'Biswash Paudel', birth: '1984', gender: 'male', parent: 'Umakanta Paudel' },
  { name: 'Binamra Paudel', birth: '1987', gender: 'female', parent: 'Umakanta Paudel' },
];

async function seedDatabase() {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_SDK_KEY || '{}');
    
    if (!serviceAccount.project_id) {
      console.error('FIREBASE_ADMIN_SDK_KEY not configured');
      process.exit(1);
    }

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    const db = admin.firestore();
    const batch = db.batch();

    const memberMap = new Map();
    
    // First pass: create all members with generation calculation
    for (const person of familyData) {
      const docRef = db.collection('familyMembers').doc();
      memberMap.set(person.name, { id: docRef.id, person });
      
      batch.set(docRef, {
        name: person.name,
        dateOfBirth: person.birth,
        dateOfDeath: person.death || null,
        gender: person.gender,
        parentIds: [],
        spouseIds: [],
        generation: 1,
        notes: '',
        photoUrl: null,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }

    // Commit first pass
    await batch.commit();
    console.log('Created all family members');

    // Second pass: establish relationships
    const updateBatch = db.batch();
    let updateCount = 0;

    for (const person of familyData) {
      const memberData = memberMap.get(person.name);
      if (!memberData) continue;

      const docRef = db.collection('familyMembers').doc(memberData.id);
      const updates = { parentIds: [], spouseIds: [] };

      // Add parent relationship
      if (person.parent) {
        const parentData = memberMap.get(person.parent);
        if (parentData) {
          updates.parentIds.push(parentData.id);
        }
      }

      // Add spouse relationship
      if (person.spouse) {
        const spouseData = memberMap.get(person.spouse);
        if (spouseData) {
          updates.spouseIds.push(spouseData.id);
          // Also add reciprocal spouse relationship
          const spouseRef = db.collection('familyMembers').doc(spouseData.id);
          updateBatch.update(spouseRef, {
            spouseIds: admin.firestore.FieldValue.arrayUnion(memberData.id)
          });
        }
      }

      updateBatch.update(docRef, updates);
      updateCount++;

      if (updateCount % 100 === 0) {
        await updateBatch.commit();
        console.log(`Updated ${updateCount} members`);
      }
    }

    if (updateCount % 100 !== 0) {
      await updateBatch.commit();
    }

    console.log(`✓ Database seeded with ${familyData.length} family members`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();

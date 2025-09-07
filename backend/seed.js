require('dotenv').config();
const mongoose = require('mongoose');
const path = require('path');

const Medicine = require(path.join(__dirname, 'models', 'Medicine'));
const Doctor = require(path.join(__dirname, 'models', 'Doctor'));

const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/medhelp';

async function seed() {
  try {
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB for seeding');

    // Clear existing data (safe for demo)
    await Medicine.deleteMany({});
    await Doctor.deleteMany({});

    const medicines = [
      { name: 'Paracetamol', location: 'Delhi', availability: 25 },
      { name: 'Insulin', location: 'Mumbai', availability: 10 },
      { name: 'Amoxicillin', location: 'Delhi', availability: 5 },
      { name: 'Aspirin', location: 'Bangalore', availability: 50 }
    ];

    const doctors = [
      { name: 'Dr. Asha Verma', category: 'Cardiologist', location: 'Delhi', phone: 9123456780 },
      { name: 'Dr. Rajesh Kumar', category: 'General Physician', location: 'Mumbai', phone: 9988776655 },
      { name: 'Dr. Meera Singh', category: 'Pediatrician', location: 'Bangalore', phone: 9112233445 }
    ];

    const medRes = await Medicine.insertMany(medicines);
    const docRes = await Doctor.insertMany(doctors);

    console.log(`Inserted ${medRes.length} medicines and ${docRes.length} doctors.`);
  } catch (err) {
    console.error('❌ Seeding error:', err.message || err);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Seeding finished, connection closed');
    process.exit(0);
  }
}

seed();

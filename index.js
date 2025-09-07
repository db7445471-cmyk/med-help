// Simple CLI to add Doctors and Medicines into the existing backend database
// Uses CommonJS so it runs with the repo's current package.json (type: "commonjs")
const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');
const readlineSync = require('readline-sync');
const path = require('path');

// require existing models from backend
const Doctor = require(path.join(__dirname, 'backend', 'models', 'Doctor.js'));
const Medicine = require(path.join(__dirname, 'backend', 'models', 'Medicine.js'));

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/medhelp';

async function connectDB() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');
  } catch (err) {
    console.error('❌ Error connecting to MongoDB:', err.message || err);
    process.exit(1);
  }
}

async function addDoctor() {
  const name = readlineSync.question('Doctor name: ').trim();
  const email = readlineSync.questionEMail('Email (unique): ');
  const password = readlineSync.question('Password (will be stored as plain text unless you add hashing): ', { hideEchoBack: true });
  const category = readlineSync.question('Specialization / Category (e.g. Cardiologist): ');
  const location = readlineSync.question('Location: ');
  const phone = readlineSync.question('Phone (optional): ');

  const doc = new Doctor({ name, email, password, category, location, phone });
  await doc.save();
  console.log('✅ Doctor saved with id', doc._id.toString());
}

async function addMedicine() {
  const name = readlineSync.question('Medicine name: ').trim();
  const location = readlineSync.question('Available Location: ').trim();
  const availability = readlineSync.questionInt('Availability (number, enter 0 if unknown): ');
  // optionally link to a doctor who added this
  const addedByEmail = readlineSync.question('Adding doctor email (optional, press enter to skip): ').trim();
  let addedBy = null;
  if (addedByEmail) {
    const d = await Doctor.findOne({ email: addedByEmail });
    if (d) addedBy = d._id;
    else console.log('⚠️ No doctor found with that email; medicine will be saved without addedBy');
  }

  const med = new Medicine({ name, location, availability, addedBy });
  await med.save();
  console.log('✅ Medicine saved with id', med._id.toString());
}

async function mainMenu() {
  while (true) {
    console.log('\n=== MENU ===');
    console.log('1) Add Doctor');
    console.log('2) Add Medicine');
    console.log('3) Exit');
    const choice = readlineSync.question('Choice: ').trim();
    try {
      if (choice === '1') await addDoctor();
      else if (choice === '2') await addMedicine();
      else if (choice === '3') {
        console.log('Goodbye');
        process.exit(0);
      } else {
        console.log('Invalid choice');
      }
    } catch (err) {
      console.error('Operation failed:', err.message || err);
    }
  }
}

(async function run() {
  await connectDB();
  // Start CLI only when called directly
  if (process.argv.includes('--cli') || process.env.RUN_CLI === 'true') {
    await mainMenu();
  } else {
    console.log('Run with --cli to use the interactive menu, e.g. `node index.js --cli`');
    console.log('You can also run `node index.js` and then call exported functions programmatically.');
    // close the connection and exit to avoid lingering process
    await mongoose.disconnect();
    process.exit(0);
  }
})();

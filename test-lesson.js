const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

async function test() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;
    const lesson = await db.collection('lessons').findOne({ slug: 'introducing-output-printing' });
    
    if (!lesson) {
      console.log('Lesson not found!');
      process.exit(1);
    }
    
    console.log(`Found lesson with ID: ${lesson._id}`);
    
    const response = await fetch(`http://localhost:3000/lessons/${lesson._id}`);
    const data = await response.json();
    
    if (data.content && data.content.includes('```python-run')) {
      console.log('✅ SUCCESS: python-run block is present in the API response!');
    } else {
      console.log('❌ FAILURE: python-run block is missing!');
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

test();

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const DB_DIR = path.join(__dirname, '../data');
const DB_FILE = path.join(DB_DIR, 'db.json');

// Ensure data directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

// Ensure database JSON file exists
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify({ users: [], habits: [] }, null, 2));
}

let useMongoose = false;

// Attempt to connect to MongoDB
async function connectDB() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.log('\x1b[33m%s\x1b[0m', '⚠️  No MONGO_URI specified in .env. Falling back to local JSON database.');
    return false;
  }

  try {
    // Set low timeout so it fails fast if MongoDB is not running locally
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 2000
    });
    console.log('\x1b[32m%s\x1b[0m', '⚡ Connected to MongoDB successfully.');
    useMongoose = true;
    return true;
  } catch (error) {
    console.log('\x1b[33m%s\x1b[0m', `⚠️  MongoDB connection failed: ${error.message}`);
    console.log('\x1b[33m%s\x1b[0m', '👉 Falling back to local JSON database. All data will be saved in server/data/db.json.');
    useMongoose = false;
    return false;
  }
}

// Local JSON Database Operations helper
function readJSON() {
  try {
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (e) {
    return { users: [], habits: [] };
  }
}

function writeJSON(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// Emulate Mongoose Model behavior for simple JSON storage
class MockModel {
  constructor(collectionName, schemaDefaults = {}) {
    this.collectionName = collectionName;
    this.schemaDefaults = schemaDefaults;
  }

  generateId() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  async find(query = {}) {
    const db = readJSON();
    const items = db[this.collectionName] || [];
    const filtered = items.filter(item => {
      for (let key in query) {
        if (query[key] !== item[key]) return false;
      }
      return true;
    });
    return filtered.map(item => this.initInstance(item));
  }

  async findOne(query = {}) {
    const results = await this.find(query);
    return results[0] || null;
  }

  async findById(id) {
    const db = readJSON();
    const items = db[this.collectionName] || [];
    const item = items.find(item => item._id === id || item.id === id);
    return item ? this.initInstance(item) : null;
  }

  async findByIdAndDelete(id) {
    const db = readJSON();
    const items = db[this.collectionName] || [];
    const index = items.findIndex(item => item._id === id || item.id === id);
    if (index === -1) return null;
    const deleted = items.splice(index, 1)[0];
    writeJSON(db);
    return this.initInstance(deleted);
  }

  async create(data) {
    const db = readJSON();
    const newDoc = {
      _id: this.generateId(),
      ...this.schemaDefaults,
      ...data
    };
    db[this.collectionName].push(newDoc);
    writeJSON(db);
    return this.initInstance(newDoc);
  }

  // Helper to construct a document instance that has a .save() method
  initInstance(data) {
    const self = this;
    const doc = {
      _id: data._id || this.generateId(),
      ...this.schemaDefaults,
      ...data,
      async save() {
        const db = readJSON();
        const items = db[self.collectionName] || [];
        const idx = items.findIndex(item => item._id === this._id);
        
        if (idx !== -1) {
          items[idx] = { ...items[idx], ...this };
          delete items[idx].save; // don't serialize function
        } else {
          const serialized = { ...this };
          delete serialized.save;
          items.push(serialized);
        }
        db[self.collectionName] = items;
        writeJSON(db);
        return this;
      }
    };
    return doc;
  }
}

// Function to export model dynamically
function createModel(modelName, mongooseSchema, collectionName, defaults = {}) {
  const getHandler = {
    construct(target, args) {
      const data = args[0] || {};
      if (useMongoose) {
        const MongoModel = mongoose.model(modelName);
        return new MongoModel(data);
      } else {
        const mock = new MockModel(collectionName, defaults);
        return mock.initInstance(data);
      }
    },
    get(target, prop) {
      if (useMongoose) {
        const MongoModel = mongoose.model(modelName, mongooseSchema);
        return MongoModel[prop];
      } else {
        const mock = new MockModel(collectionName, defaults);
        if (typeof mock[prop] === 'function') {
          return mock[prop].bind(mock);
        }
        return mock[prop];
      }
    }
  };

  // Create target function so construct works
  const DummyConstructor = function(data) {
    this.data = data;
  };

  return new Proxy(DummyConstructor, getHandler);
}

module.exports = {
  connectDB,
  createModel,
  isFallback: () => !useMongoose
};

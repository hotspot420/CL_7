// server.js
import express from 'express';
import path from 'path';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';

const app = express();
const PORT = 3000;
const defaultData = { sentences: [] };

// Middleware to parse JSON bodies
app.use(express.json());

// Middleware to serve static files
app.use(express.static('public'));

// Setup Lowdb to use a JSON file as the database
const db = new Low(new JSONFile('db.json'), {})

async function initDB() {
    await db.read(); // Read the existing data from the database

    // If no data exists, initialize with default data
    if (!db.data) {
        db.data = { sentences: [] }; // Set default data
        await db.write(); // Write the default data to the database
    }
}

// Initialize the database
initDB().catch(err => {
    console.error("Failed to initialize the database:", err);
});

// Route 1: Serve a static HTML file at the root URL ("/")
app.get('/', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'public', 'index.html'));
});

// Route 2: Store new data via the "/new-data" route
app.post('/new-data', async (req, res) => {
    const newSentence = req.body.sentence;
    if (!newSentence) {
        return res.status(400).json({ message: 'No sentence provided' });
    }

    // Add the new sentence to the database
    db.data.sentences.push(newSentence);
    await db.write();

    res.json({ message: 'Sentence successfully stored' });
});

// Route 3: Serve stored data via the "/data" route
app.get('/data', async (req, res) => {
    await db.read();
    res.json(db.data.sentences);
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});

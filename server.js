const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
// macOS Port 5000 çakışmasını önlemek için 5001 kullanıyoruz
const PORT = 5001;

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

app.use('/uploads', express.static(UPLOADS_DIR));

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

const DB_PATH = path.join(__dirname, 'database.json');
const initDB = () => {
    if (!fs.existsSync(DB_PATH)) {
        const initialData = { leads: [], messages: [], gallery: [] };
        fs.writeFileSync(DB_PATH, JSON.stringify(initialData, null, 2));
    }
};

const readDB = () => JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
const writeDB = (data) => fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));

// API Endpoints
app.post('/api/upload', upload.single('image'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'Resim yüklenemedi' });
    const imageUrl = `http://localhost:${PORT}/uploads/${req.file.filename}`;
    res.json({ url: imageUrl });
});

app.get('/api/gallery', (req, res) => res.json(readDB().gallery));
app.post('/api/gallery', (req, res) => {
    const db = readDB();
    const newItem = { ...req.body, id: 'gal-' + Date.now() };
    db.gallery.unshift(newItem);
    writeDB(db);
    res.status(201).json(newItem);
});

app.get('/api/leads', (req, res) => res.json(readDB().leads));
app.post('/api/leads', (req, res) => {
    const db = readDB();
    const newLead = { ...req.body, id: 'L-' + Date.now(), createdAt: new Date().toISOString() };
    db.leads.unshift(newLead);
    writeDB(db);
    res.status(201).json(newLead);
});

app.get('/api/messages', (req, res) => res.json(readDB().messages));
app.post('/api/messages', (req, res) => {
    const db = readDB();
    const newMessage = { ...req.body, id: 'M-' + Date.now(), createdAt: new Date().toISOString() };
    db.messages.unshift(newMessage);
    writeDB(db);
    res.status(201).json(newMessage);
});

initDB();

const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`
    🚀 NORTH ENERJI BACKEND AKTİF!
    ----------------------------------
    📡 Sunucu Adresi: http://localhost:${PORT}
    📸 Resim Klasörü: ${UPLOADS_DIR}
    📂 Veritabanı: ${DB_PATH}
    
    Backend artık Port 5001 üzerinden dinlemede.
    `);
});

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`❌ HATA: Port ${PORT} kullanımda! Lütfen başka bir uygulama bu portu kullanıyor mu kontrol edin.`);
    } else {
        console.error('❌ Sunucu hatası:', err);
    }
});
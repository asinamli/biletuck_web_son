const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

// Route dosyaları
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const organizerRequestRoutes = require('./routes/organizerRequest.routes');
const eventRoutes = require('./routes/event.routes');
const eventRequestRoutes = require('./routes/eventRequest.routes');
const ticketRoutes = require('./routes/ticket.routes');
const categoryRoutes = require('./routes/category.routes');
const paymentRoutes = require('./routes/payment.routes');

const app = express();

// Body parser
app.use(express.json());

// CORS etkinleştir
app.use(cors());

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/organizer-requests', organizerRequestRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/event-requests', eventRequestRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/payment', paymentRoutes);

// Ana sayfa rotası
app.get('/', (req, res) => {
  res.send('Etkinlik Bilet Satış API - MongoDB');
});

// Not found handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `${req.originalUrl} yolu bulunamadı`,
  });
});

const PORT = process.env.PORT || 5010; // 5000 ve 5001 çakışması olabileceği için farklı bir port kullanıyoruz

const server = app.listen(PORT, () => {
  console.log(`Server ${PORT} portunda çalışıyor`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log(`Hata: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
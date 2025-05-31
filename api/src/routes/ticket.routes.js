const express = require('express');
const {
  getTickets,
  getTicket,
  createTicket,
  updateTicket,
  deleteTicket,
  getMyTickets,
  checkout
} = require('../controllers/ticket.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// Genel bilet işlemleri
router.route('/')
  .get(protect, getTickets)
  .post(protect, createTicket);

// Kullanıcının kendi biletlerini görebileceği endpoint
router.get('/my-tickets', protect, getMyTickets);

// Ödeme tamamlama işlemi
router.post('/checkout', protect, checkout);

// Spesifik bilet işlemleri
router.route('/:id')
  .get(protect, getTicket)
  .put(protect, updateTicket)
  .delete(protect, deleteTicket);

module.exports = router;
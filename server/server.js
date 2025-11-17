// server/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const bookRoutes = require('./routes/books');
const goalsRoutes = require('./routes/goals');
const reviewsRoutes = require("./routes/reviews");


const app = express();
const PORT = process.env.PORT || 4000;

// CORS: ajustá el origin a tu URL de React
app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true, // true si usás cookies
  })
);

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Book Journaling API ');
});

app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/goals', goalsRoutes);
app.use("/api/reviews", reviewsRoutes);

app.listen(PORT, () => {
  console.log(`✅ Server escuchando en http://localhost:${PORT}`);
});

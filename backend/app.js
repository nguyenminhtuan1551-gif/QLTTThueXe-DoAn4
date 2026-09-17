const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');

const sessionMiddleware = require('./common/session');
const { loadSessionUser } = require('./middlewares/auth.middleware');
const { notFoundHandler, errorHandler } = require('./middlewares/error.middleware');
const apiRouter = require('./routes');

dotenv.config();

const app = express();

app.disable('x-powered-by');

// Cấu hình CORS hỗ trợ cả Web Admin và Mobile App
const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map((url) => url.trim())
  : [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:8081',
      'http://localhost:19006',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:8081',
    ];

app.use(
  cors({
    origin: (origin, callback) => {
      // Cho phép requests không có origin (ví dụ: mobile app, postman, cURL)
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        process.env.NODE_ENV !== 'production' ||
        origin.startsWith('http://localhost') ||
        origin.startsWith('http://127.0.0.1') ||
        origin.startsWith('http://192.168.')
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  }),
);

app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(sessionMiddleware);
app.use(loadSessionUser);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'Car rental backend is running with JWT & Session Auth.',
  });
});

app.use('/api', apiRouter);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;

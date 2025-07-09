import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3003;

// Включаем CORS для всех запросов
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Прокси для backend API
app.use('/api', createProxyMiddleware({
  target: 'http://localhost:8765',
  changeOrigin: true,
  pathRewrite: {
    '^/api': '', // удаляем /api из пути
  },
  onError: (err, req, res) => {
    console.error('Proxy error:', err);
    res.status(500).send('Proxy error');
  }
}));

// Статические файлы виджета
app.use(express.static(path.join(__dirname, 'dist')));

// Все остальные запросы возвращают index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Proxy server running on http://localhost:${PORT}`);
  console.log(`📦 Serving widget from dist/`);
  console.log(`🔗 Proxying /api/* to http://localhost:8765`);
}); 
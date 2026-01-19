import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cardRoutes from './routes/cards.js';
import sessionRoutes from './routes/sessions.js';
import storyRoutes from './routes/story.js';
import settingsRoutes from './routes/settings.js';
import scriptRoutes from './routes/scripts.js';
import { initializeScripts } from './scripts/index.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize scripts
initializeScripts();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/cards', cardRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/story', storyRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/scripts', scriptRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Story Generator API is running' });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`API endpoints available at http://localhost:${PORT}/api`);
});

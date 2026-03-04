import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes.js';
import contactRoutes from './routes/contact.routes.js';
import campaignRoutes from './routes/campaign.routes.js';
import statsRoutes from './routes/stats.routes.js';
import aiRoutes from './routes/ai.routes.js';
import sequenceRoutes from './routes/sequence.routes.js';
import eventRoutes from './routes/event.routes.js';
import companyRoutes from './routes/company.routes.js';
import pipelineRoutes from './routes/pipeline.routes.js';
import networkRoutes from './routes/network.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/sequences', sequenceRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/pipeline', pipelineRoutes);
app.use('/api/network', networkRoutes);

app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});

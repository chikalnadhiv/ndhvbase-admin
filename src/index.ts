import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import authRoutes from './routes/auth';
import contactsRoutes from './routes/contacts';
import pricingRoutes from './routes/pricing';
import projectsRoutes from './routes/projects';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: '*', // Allow all origins for testing
  credentials: false,
}));
// Increase payload limit for base64 images
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// API Routes
app.use('/api/admin/auth', authRoutes);
app.use('/api/contacts', contactsRoutes);
app.use('/api/pricing', pricingRoutes);
app.use('/api/projects', projectsRoutes);

// Serve admin panel static files
// Serve admin panel static files
const adminPath = path.join(process.cwd(), 'admin-build');
console.log('Serving admin from:', adminPath);
app.use('/admin', express.static(adminPath));

// Serve admin panel for root /admin route
app.get('/admin', (req, res) => {
  const indexPath = path.join(adminPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send(`Admin panel not found at ${adminPath}`);
  }
});

// Serve admin panel for all /admin/* routes (SPA fallback)
app.get('/admin/*', (req, res) => {
  const indexPath = path.join(adminPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    // Fallback for debugging
    res.status(404).send(`
      <h1>404 - Admin Panel Not Found</h1>
      <p>Looking for: ${indexPath}</p>
      <p>Current Directory: ${process.cwd()}</p>
      <p>Files in admin-build: ${JSON.stringify(listDir(adminPath))}</p>
      <p>Files in cwd: ${JSON.stringify(listDir(process.cwd()))}</p>
    `);
  }
});

// Helper to list directory safely
const listDir = (dir: string) => {
  try {
    return fs.readdirSync(dir);
  } catch (e: any) {
    return `Error: ${e.message}`;
  }
};

// Test endpoint for mobile debugging
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Backend is accessible!',
    timestamp: new Date().toISOString(),
    ip: req.ip
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Root route - redirect to admin
app.get('/', (req, res) => {
  res.redirect('/admin');
});

// Start server - listen on all network interfaces (0.0.0.0)
if (require.main === module) {
  const server = app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Backend server running on:`);
    console.log(`  - Local:   http://localhost:${PORT}`);
    console.log(`  - Network: http://192.168.100.11:${PORT}`);
    console.log(`Admin panel available at http://localhost:${PORT}/admin`);
  });
}

export default app;

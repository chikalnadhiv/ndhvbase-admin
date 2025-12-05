import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
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

// Helper to find admin path
function getAdminPath() {
  const fs = require('fs');
  const paths = [
    path.join(process.cwd(), 'admin', 'dist'),
    path.join(process.cwd(), 'dist', 'admin', 'dist'),
    path.join(__dirname, 'admin', 'dist'),
    path.join(__dirname, '..', 'admin', 'dist'),
  ];
  
  for (const p of paths) {
    if (fs.existsSync(p)) {
      console.log(`Found admin path at: ${p}`);
      return p;
    }
  }
  console.log('Could not find admin path. Checked:', paths);
  console.log('CWD contents:', fs.readdirSync(process.cwd()));
  return path.join(process.cwd(), 'admin', 'dist');
}

const adminPath = getAdminPath();
app.use('/admin', express.static(adminPath));

// Debug endpoint to check filesystem
app.get('/api/debug-config', (req, res) => {
  const fs = require('fs');
  res.json({
    cwd: process.cwd(),
    __dirname,
    adminPath,
    exists: fs.existsSync(adminPath),
    files: fs.existsSync(adminPath) ? fs.readdirSync(adminPath) : [],
    env: process.env
  });
});

// Serve admin panel for all /admin/* routes (SPA fallback)
app.get(['/admin', '/admin/*'], (req, res) => {
  const indexPath = path.join(adminPath, 'index.html');
  if (require('fs').existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Admin panel not found (index.html missing)');
  }
});

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

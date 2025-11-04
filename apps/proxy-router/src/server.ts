import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();
const PORT = 8080;

// CORS para el frontend
app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// PATRÓN TIMEOUT: Redirige directamente al API (sin Envoy)
app.use('/api/timeout', createProxyMiddleware({
  target: 'http://service-api:3000',
  changeOrigin: true,
  onProxyReq: (proxyReq: any, req: express.Request, res: express.Response) => {
    console.log(`📊 [ROUTER] PATRÓN TIMEOUT: ${req.method} ${req.url} → API directa`);
  }
}));

// PATRÓN SIDECAR: Redirige a través del sidecar Envoy
app.use('/api/sidecar', createProxyMiddleware({
  target: 'http://sidecar-proxy:8081',
  changeOrigin: true,
  onProxyReq: (proxyReq: any, req: express.Request, res: express.Response) => {
    console.log(`🛡️ [ROUTER] PATRÓN SIDECAR: ${req.method} ${req.url} → Envoy sidecar`);
  }
}));

app.listen(PORT, () => {
  console.log(`🔀 [ROUTER] Proxy Router running on port ${PORT}`);
  console.log(`📊 [ROUTER] /api/timeout → service-api:3000 (directo)`);
  console.log(`🛡️ [ROUTER] /api/sidecar → sidecar-proxy:8081 (vía Envoy)`);
});
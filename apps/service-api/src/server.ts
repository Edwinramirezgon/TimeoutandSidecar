import express from 'express';
import { SlowOk, SlowTimeout, WorkOk } from './types.js';

const app = express();
const PORT = 3000;
const DOWNSTREAM_URL = process.env.DOWNSTREAM_URL || 'http://slow-svc:4000/work';

async function fetchWithTimeout(url: string, timeoutMs: number): Promise<WorkOk> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

// PATRÓN TIMEOUT: Endpoint directo sin sidecar
app.get('/api/timeout', async (req: express.Request, res: express.Response) => {
  const ms = Number(req.query.ms) || 0;
  const url = `${DOWNSTREAM_URL}?ms=${ms}`;
  const startTime = Date.now();
  
  console.log(`📊 [TIMEOUT] Iniciando petición directa: latencia=${ms}ms, timeout=2000ms`);
  console.log(`🔗 [TIMEOUT] Llamando a downstream: ${url}`);
  
  try {
    const result = await fetchWithTimeout(url, 2000); // Timeout más corto para patrón timeout
    const elapsed = Date.now() - startTime;
    
    console.log(`✅ [TIMEOUT] Éxito en ${elapsed}ms - Sin proxy intermedio`);
    
    const response: SlowOk = {
      ok: true,
      source: "downstream",
      delayedMs: ms,
      ts: Date.now()
    };
    res.json(response);
  } catch (error) {
    const elapsed = Date.now() - startTime;
    console.log(`❌ [TIMEOUT] TIMEOUT en ${elapsed}ms - Aplicando fallback directo`);
    
    const response: SlowTimeout = {
      ok: false,
      fallback: true,
      reason: "timeout",
      message: `Timeout directo después de ${elapsed}ms (límite: 2000ms)`
    };
    res.status(504).json(response);
  }
});

// PATRÓN SIDECAR: Endpoint que pasa por Envoy
app.get('/api/sidecar', async (req: express.Request, res: express.Response) => {
  const ms = Number(req.query.ms) || 0;
  const url = `${DOWNSTREAM_URL}?ms=${ms}`;
  const startTime = Date.now();
  
  console.log(`🛡️ [SIDECAR] Iniciando petición vía sidecar: latencia=${ms}ms, timeout=2200ms`);
  console.log(`🔗 [SIDECAR] Llamando a downstream: ${url}`);
  
  try {
    const result = await fetchWithTimeout(url, 2200); // Timeout más alto para patrón sidecar
    const elapsed = Date.now() - startTime;
    
    console.log(`✅ [SIDECAR] Éxito en ${elapsed}ms - Protegido por sidecar`);
    
    const response: SlowOk = {
      ok: true,
      source: "downstream",
      delayedMs: ms,
      ts: Date.now()
    };
    res.json(response);
  } catch (error) {
    const elapsed = Date.now() - startTime;
    console.log(`❌ [SIDECAR] TIMEOUT en ${elapsed}ms - Fallback con protección sidecar`);
    
    const response: SlowTimeout = {
      ok: false,
      fallback: true,
      reason: "timeout",
      message: `Sidecar timeout después de ${elapsed}ms (límite: 2200ms)`
    };
    res.status(504).json(response);
  }
});

app.listen(PORT, () => {
  console.log(`🚀 [API] Service API running on port ${PORT}`);
  console.log(`🎯 [API] Downstream URL: ${DOWNSTREAM_URL}`);
  console.log(`📊 [API] /api/timeout - Patrón Timeout (2000ms timeout)`);
  console.log(`🛡️ [API] /api/sidecar - Patrón Sidecar (2200ms timeout)`);
  console.log(`📋 [API] Cada patrón es independiente y demostrable`);
});
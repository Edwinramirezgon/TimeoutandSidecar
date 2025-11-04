import express from 'express';

const app = express();
const PORT = 4000;

interface WorkOk {
  ok: true;
  workTookMs: number;
}

app.get('/work', async (req: express.Request, res: express.Response) => {
  const ms = Number(req.query.ms) || 0;
  const startTime = Date.now();
  
  console.log(`💼 [SLOW] Iniciando trabajo: ${ms}ms de latencia simulada`);
  console.log(`⏳ [SLOW] Durmiendo por ${ms}ms...`);
  
  await new Promise(resolve => setTimeout(resolve, ms));
  
  const actualMs = Date.now() - startTime;
  console.log(`✅ [SLOW] Trabajo completado en ${actualMs}ms (solicitado: ${ms}ms)`);
  
  const response: WorkOk = {
    ok: true,
    workTookMs: actualMs
  };
  
  res.json(response);
});

app.listen(PORT, () => {
  console.log(`🐌 [SLOW] Slow service running on port ${PORT}`);
  console.log(`🎯 [SLOW] Simula latencia configurable para demostrar timeouts`);
});
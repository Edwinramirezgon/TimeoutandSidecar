import { useState } from 'react';
import { httpRequest } from './http';
import type { SlowOk, SlowTimeout, HttpResult } from './types';

export function SidecarDemo() {
  const [clientTimeout, setClientTimeout] = useState(5000);
  const [simulatedLatency, setSimulatedLatency] = useState(1200);
  const [result, setResult] = useState<HttpResult<SlowOk | SlowTimeout> | null>(null);
  const [loading, setLoading] = useState(false);
  const [requestTime, setRequestTime] = useState<number | null>(null);

  const makeRequest = async () => {
    setLoading(true);
    setResult(null);
    setRequestTime(null);
    
    const startTime = Date.now();
    const url = `${import.meta.env.VITE_API_URL}/api/sidecar?ms=${simulatedLatency}`;
    const response = await httpRequest<SlowOk | SlowTimeout>(url, clientTimeout);
    const endTime = Date.now();
    
    setRequestTime(endTime - startTime);
    setResult(response);
    setLoading(false);
  };

  const setScenario = (scenario: number) => {
    switch (scenario) {
      case 1: // Cliente corta antes que sidecar
        setClientTimeout(1500);
        setSimulatedLatency(1800);
        break;
      case 2: // Sidecar hace retry
        setClientTimeout(5000);
        setSimulatedLatency(2500);
        break;
      case 3: // Éxito con sidecar
        setClientTimeout(5000);
        setSimulatedLatency(1200);
        break;
    }
  };

  const getResultMessage = () => {
    if (!result) return '';
    if (result.status === 0) return '🔴 YO ME CANSÉ - Cancelé antes que el proxy';
    if (result.status === 504) return '🟡 PROXY SE CANSÓ - Hizo reintentos pero falló';
    if (result.status === 200) return '🟢 ÉXITO - Proxy consiguió respuesta';
    return `❌ ERROR ${result.status}`;
  };

  const getExplanation = () => {
    if (!result) return '';
    if (result.status === 0) {
      return `Esperé ${clientTimeout}ms y me cansé antes de que el proxy pudiera ayudar.`;
    }
    if (result.status === 504) {
      return `El proxy intentó ${result.headers['x-envoy-attempt-count'] || '1'} vez(es) pero el trabajo tardaba ${simulatedLatency}ms.`;
    }
    if (result.status === 200) {
      return `El proxy manejó la petición exitosamente en ${result.headers['x-envoy-attempt-count'] || '1'} intento(s).`;
    }
    return '';
  };

  return (
    <div className="demo-container">
      <div className="demo-header">
        <h2>🛡️ PATRÓN SIDECAR</h2>
        <p>Un proxy intercepta peticiones y aplica políticas automáticas de resiliencia.</p>
      </div>

      <div className="demo-controls">
        <div className="input-group">
          <label>Mi paciencia (ms):</label>
          <input
            type="number"
            value={clientTimeout}
            onChange={(e) => setClientTimeout(Number(e.target.value))}
          />
        </div>
        
        <div className="input-group">
          <label>Trabajo tarda (ms):</label>
          <input
            type="number"
            value={simulatedLatency}
            onChange={(e) => setSimulatedLatency(Number(e.target.value))}
          />
        </div>
        
        <div className="scenario-buttons">
          <button onClick={makeRequest} disabled={loading}>
            {loading ? 'Probando...' : 'Probar'}
          </button>
          <button onClick={() => setScenario(1)}>Yo me canso</button>
          <button onClick={() => setScenario(2)}>Proxy reintenta</button>
          <button onClick={() => setScenario(3)}>Todo bien</button>
        </div>
      </div>

      <div className="demo-layout">
        <div className="result-section">
          <h3>Resultado</h3>
          {result && (
            <div>
              <p className="result-message">{getResultMessage()}</p>
              <p className="explanation">{getExplanation()}</p>
              <div className="metrics">
                <p>Tiempo real: {requestTime}ms</p>
                <p>Status: {result.status}</p>
                <p>Intentos del proxy: {result.headers['x-envoy-attempt-count'] || '1'}</p>
                <p>Vino del proxy: {result.headers['x-request-from'] === 'sidecar-envoy' ? 'Sí' : 'No'}</p>
              </div>
            </div>
          )}
        </div>

        <div className="architecture-section">
          <h3>Arquitectura</h3>
          <div className="flow">
            <div className="step">
              <strong>Cliente</strong>
              <p>Paciencia: {clientTimeout}ms</p>
            </div>
            <div className="arrow">→</div>
            <div className="step">
              <strong>Proxy</strong>
              <p>Timeout: 2000ms</p>
              <p>Retry: 1 vez</p>
            </div>
            <div className="arrow">→</div>
            <div className="step">
              <strong>API</strong>
              <p>Timeout: 2200ms</p>
            </div>
            <div className="arrow">→</div>
            <div className="step">
              <strong>Trabajo</strong>
              <p>Tarda: {simulatedLatency}ms</p>
            </div>
          </div>
          <div className="characteristics">
            <h4>Características:</h4>
            <p>• Proxy intercepta todo</p>
            <p>• Reintentos automáticos</p>
            <p>• Políticas centralizadas</p>
            <p>• Headers de observabilidad</p>
          </div>
        </div>
      </div>
    </div>
  );
}
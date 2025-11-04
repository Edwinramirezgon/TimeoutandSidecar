import { useState } from 'react';
import { httpRequest } from './http';
import type { SlowOk, SlowTimeout, HttpResult } from './types';

export function TimeoutDemo() {
  const [clientTimeout, setClientTimeout] = useState(1500);
  const [simulatedLatency, setSimulatedLatency] = useState(2000);
  const [result, setResult] = useState<HttpResult<SlowOk | SlowTimeout> | null>(null);
  const [loading, setLoading] = useState(false);
  const [requestTime, setRequestTime] = useState<number | null>(null);

  const makeRequest = async () => {
    setLoading(true);
    setResult(null);
    setRequestTime(null);
    
    const startTime = Date.now();
    const url = `${import.meta.env.VITE_API_URL}/api/timeout?ms=${simulatedLatency}`;
    const response = await httpRequest<SlowOk | SlowTimeout>(url, clientTimeout);
    const endTime = Date.now();
    
    setRequestTime(endTime - startTime);
    setResult(response);
    setLoading(false);
  };

  const setScenario = (scenario: number) => {
    switch (scenario) {
      case 1: // Cliente corta
        setClientTimeout(1000);
        setSimulatedLatency(1500);
        break;
      case 2: // API corta
        setClientTimeout(3000);
        setSimulatedLatency(2500);
        break;
      case 3: // Éxito
        setClientTimeout(3000);
        setSimulatedLatency(800);
        break;
    }
  };

  const getResultMessage = () => {
    if (!result) return '';
    if (result.status === 0) return '🔴 YO ME CANSÉ - Cancelé la petición';
    if (result.status === 504) return '🟡 EL API SE CANSÓ - Devolvió fallback';
    if (result.status === 200) return '🟢 ÉXITO - Obtuve respuesta';
    return `❌ ERROR ${result.status}`;
  };

  const getExplanation = () => {
    if (!result) return '';
    if (result.status === 0) {
      return `Esperé ${clientTimeout}ms pero el trabajo iba a tardar ${simulatedLatency}ms, así que cancelé.`;
    }
    if (result.status === 504) {
      return `El API esperó 2 segundos, se cansó y devolvió un mensaje de error programado.`;
    }
    if (result.status === 200) {
      return `El trabajo terminó en ${simulatedLatency}ms, antes de cualquier timeout.`;
    }
    return '';
  };

  return (
    <div className="demo-container">
      <div className="demo-header">
        <h2>📊 PATRÓN TIMEOUT</h2>
        <p>Cada componente maneja sus propios timeouts. Sin intermediarios.</p>
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
          <button onClick={() => setScenario(2)}>API se cansa</button>
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
              <strong>API</strong>
              <p>Timeout: 2000ms</p>
            </div>
            <div className="arrow">→</div>
            <div className="step">
              <strong>Trabajo</strong>
              <p>Tarda: {simulatedLatency}ms</p>
            </div>
          </div>
          <div className="characteristics">
            <h4>Características:</h4>
            <p>• Comunicación directa</p>
            <p>• Fallbacks manuales</p>
            <p>• Sin reintentos</p>
          </div>
        </div>
      </div>
    </div>
  );
}
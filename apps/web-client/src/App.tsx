import { useState } from 'react';
import { TimeoutDemo } from './TimeoutDemo';
import { SidecarDemo } from './SidecarDemo';
import './App.css';

function App() {
  const [activeDemo, setActiveDemo] = useState<'timeout' | 'sidecar'>('timeout');

  return (
    <div className="app">
      <header className="app-header">
        <h1>🎯 Demostración de Patrones Independientes</h1>
        <p className="subtitle">
          Dos enfoques completamente diferentes para manejar resiliencia en aplicaciones
        </p>
      </header>

      <nav className="demo-selector">
        <button 
          className={activeDemo === 'timeout' ? 'active' : ''}
          onClick={() => setActiveDemo('timeout')}
        >
          📊 DEMO PATRÓN TIMEOUT
          <small>Manejo directo de timeouts</small>
        </button>
        <button 
          className={activeDemo === 'sidecar' ? 'active' : ''}
          onClick={() => setActiveDemo('sidecar')}
        >
          🛡️ DEMO PATRÓN SIDECAR
          <small>Proxy con políticas automáticas</small>
        </button>
      </nav>

      <main className="demo-content">
        {activeDemo === 'timeout' ? <TimeoutDemo /> : <SidecarDemo />}
      </main>

      <footer className="pattern-comparison">
        <div className="comparison-card">
          <h3>📊 Patrón Timeout</h3>
          <ul>
            <li>Cada servicio maneja sus timeouts</li>
            <li>Comunicación directa</li>
            <li>Fallbacks manuales en código</li>
            <li>Sin reintentos automáticos</li>
          </ul>
        </div>
        <div className="vs">VS</div>
        <div className="comparison-card">
          <h3>🛡️ Patrón Sidecar</h3>
          <ul>
            <li>Proxy maneja toda la resiliencia</li>
            <li>Intercepta todas las peticiones</li>
            <li>Políticas declarativas (YAML)</li>
            <li>Reintentos y circuit breaking automáticos</li>
          </ul>
        </div>
      </footer>
    </div>
  );
}

export default App;
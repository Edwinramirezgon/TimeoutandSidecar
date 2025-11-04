# 🎯 DEMOSTRACIÓN DE PATRONES INDEPENDIENTES

Este proyecto demuestra **dos patrones independientes** de manejo de timeouts:

## 📊 PATRÓN TIMEOUT (Directo)

### ¿Qué demuestra?
- Timeouts manejados directamente por el cliente y API
- Sin proxy intermedio que aplique políticas
- Fallbacks manuales en el código del API

### Arquitectura
```
🖥️ Cliente → 📡 API Directa → 🐌 Servicio Lento
  1000ms      2000ms timeout    Variable
```

### Flujo de Petición
1. Cliente hace petición a `/api/timeout`
2. Router dirige **directamente** al API (puerto 3000)
3. API aplica timeout interno de 2000ms
4. Si excede tiempo: API devuelve fallback 504

### Escenarios
- **Cliente Timeout**: Cliente (1000ms) vs Latencia (1500ms) → Cliente corta
- **API Timeout**: Cliente (3000ms) vs Latencia (2500ms) → API corta
- **Éxito**: Cliente (3000ms) vs Latencia (800ms) → Respuesta exitosa

---

## 🛡️ PATRÓN SIDECAR (Con Proxy)

### ¿Qué demuestra?
- Proxy sidecar intercepta y aplica políticas
- Retries automáticos sin modificar código
- Timeouts en cascada con protección de capas

### Arquitectura
```
🖥️ Cliente → 🛡️ Sidecar (Envoy) → 📡 API → 🐌 Servicio Lento
  5000ms      2000ms + 1 retry    2200ms    Variable
```

### Flujo de Petición
1. Cliente hace petición a `/api/sidecar`
2. Router dirige al **Sidecar Envoy** (puerto 8081)
3. Envoy aplica timeout de 2000ms + 1 retry
4. Si falla: Envoy devuelve 504 con headers de intentos

### Escenarios
- **Cliente vs Sidecar**: Cliente (1500ms) vs Latencia (1800ms) → Cliente corta
- **Sidecar Retry**: Cliente (5000ms) vs Latencia (2500ms) → Envoy hace 2 intentos
- **Éxito Sidecar**: Cliente (5000ms) vs Latencia (1200ms) → Éxito con headers

---

## 🔍 DIFERENCIAS CLAVE

| Aspecto | Patrón Timeout | Patrón Sidecar |
|---------|----------------|----------------|
| **Proxy** | ❌ Directo al API | ✅ A través de Envoy |
| **Retries** | ❌ Sin retries | ✅ 1 retry automático |
| **Headers** | `X-Request-From: timeout-proxy` | `X-Envoy-Attempt-Count: 1/2` |
| **Timeout API** | 2000ms | 2200ms |
| **Timeout Sidecar** | N/A | 2000ms |
| **Fallback** | Manual en código | Automático por Envoy |

## 🚀 CÓMO DEMOSTRAR CADA PATRÓN

### 1. Seleccionar Patrón en UI
- Click en **"📊 Patrón Timeout"** o **"🛡️ Patrón Sidecar"**
- Los escenarios cambian automáticamente

### 2. Observar Logs Diferentes
```bash
# Patrón Timeout
📊 [ROUTER] PATRÓN TIMEOUT: GET /api/timeout → API directa
📊 [TIMEOUT] Iniciando petición directa: latencia=1500ms, timeout=2000ms

# Patrón Sidecar  
🛡️ [ROUTER] PATRÓN SIDECAR: GET /api/sidecar → Envoy sidecar
🛡️ [SIDECAR] Iniciando petición vía sidecar: latencia=2500ms, timeout=2200ms
```

### 3. Comparar Headers de Respuesta
```javascript
// Patrón Timeout
{
  "x-request-from": "timeout-proxy"
}

// Patrón Sidecar
{
  "x-request-from": "sidecar-envoy",
  "x-envoy-attempt-count": "2"
}
```

## 🎯 CASOS DE USO REALES

### Patrón Timeout
- **APIs simples** sin necesidad de retries
- **Microservicios internos** con control directo
- **Aplicaciones legacy** sin service mesh

### Patrón Sidecar
- **Service Mesh** (Istio, Linkerd)
- **Microservicios distribuidos** con políticas centralizadas
- **APIs críticas** que requieren resiliencia automática

## 🔧 CONFIGURACIÓN INDEPENDIENTE

Cada patrón tiene su propia configuración:

- **Timeout**: `envoy-timeout.yaml` (sin retries)
- **Sidecar**: `envoy-sidecar.yaml` (con retries)
- **Router**: Dirige según endpoint (`/api/timeout` vs `/api/sidecar`)

Esto permite demostrar cada patrón **completamente independiente** del otro.
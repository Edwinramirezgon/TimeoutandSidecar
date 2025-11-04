# 🎯 Patrones de Timeout Demo

**Demostración de dos patrones independientes** de manejo de timeouts con TypeScript de extremo a extremo.

Este proyecto demuestra:
- 📊 **Patrón Timeout**: Manejo directo de timeouts sin proxy intermedio
- 🛡️ **Patrón Sidecar**: Proxy intercepta y aplica políticas automáticamente

**Cada patrón es completamente independiente y demostrable por separado.**

## 📊 Patrón Timeout (Directo)

**Manejo tradicional** de timeouts donde cada capa maneja sus propios límites:
- ⏱️ Cliente aplica timeout con AbortController
- 💻 API aplica timeout interno y fallback manual
- ❌ Sin retries automáticos
- 📄 Fallbacks programados en código

## 🛡️ Patrón Sidecar (Con Proxy)

**Proxy intercepta** todas las peticiones y aplica políticas:
- ⏱️ Timeouts en cascada
- 🔄 Retries automáticos
- 🛡️ Circuit breaking
- 📊 Observabilidad con headers
- 🔒 Políticas centralizadas

**Sin modificar el código de la aplicación.**

## 🏗️ Arquitecturas Independientes

### 📊 Patrón Timeout (Directo)
```
🖥️ Cliente → 🔀 Router → 💻 API Directa → 🐌 Slow Service
  Variable    8080        3000 (2000ms)     Variable
```

### 🛡️ Patrón Sidecar (Con Proxy)
```
🖥️ Cliente → 🔀 Router → 🛡️ Envoy → 💻 API → 🐌 Slow Service
  Variable    8080       8081 (2s+retry)  3000    Variable
```

### Componentes:
- **🖥️ Frontend**: React con selector de patrón independiente
- **🔀 Router**: Dirige peticiones según patrón (`/api/timeout` vs `/api/sidecar`)
- **🛡️ Envoy**: Solo para patrón sidecar (timeout + retry)
- **💻 API**: Endpoints separados con timeouts diferentes
- **🐌 Slow Service**: Simula latencia configurable

## ⚡ Reglas de Timeout por Patrón

### 📊 Patrón Timeout
```
🖥️ Cliente < 💻 API Directa
  Variable  <   2000ms
```

### 🛡️ Patrón Sidecar
```
🖥️ Cliente < 🛡️ Sidecar < 💻 API
  Variable  <   2000ms   <  2200ms
```

**¿Por qué diferentes?**
- **Timeout**: Cliente controla directamente, API aplica fallback
- **Sidecar**: Proxy protege con retries, API tiene más tiempo

## Requisitos

- Node.js 20+
- Docker y Docker Compose
- npm o pnpm

## 🚀 Instalación y Ejecución

### 1️⃣ Levantar el Backend (Sidecar + APIs)

```bash
cd infra
docker compose up --build
```

**Servicios levantados:**
- 🐌 `slow-svc` → Puerto 4000 (simula trabajo lento)
- ⚙️ `service-api` → Puerto 3000 (lógica de negocio)  
- 🛡️ `sidecar-envoy` → Puerto 8080 (**punto de entrada**)
- 📊 Envoy Admin → Puerto 9901 (métricas)

### 2️⃣ Levantar el Frontend

```bash
cd apps/web-client
npm install
npm run dev
```

**URLs importantes:**
- Frontend: `http://localhost:5173`
- Router: `http://localhost:8080` (punto de entrada único)
- Envoy Admin (Timeout): `http://localhost:9901`
- Envoy Admin (Sidecar): `http://localhost:9902`

### 3️⃣ Ejecutar la Demo

1. Abre el frontend: `http://localhost:5173`
2. **Selecciona el patrón**: Click en "📊 Patrón Timeout" o "🛡️ Patrón Sidecar"
3. Usa los botones de escenarios (cambian según patrón)
4. Observa logs diferentes en la terminal
5. Compara headers y comportamientos

**📖 Documentación:**
- [PATRONES.md](./PATRONES.md) - Detalles técnicos
- [INICIO-RAPIDO.md](./INICIO-RAPIDO.md) - Guía de instalación

## 🎮 Escenarios por Patrón

### 📊 Patrón Timeout
- **Cliente Timeout**: Cliente (1000ms) vs Latencia (1500ms) → Cliente corta
- **API Timeout**: Cliente (3000ms) vs Latencia (2500ms) → API aplica fallback
- **Éxito**: Cliente (3000ms) vs Latencia (800ms) → Respuesta directa

### 🛡️ Patrón Sidecar
- **Cliente vs Sidecar**: Cliente (1500ms) vs Latencia (1800ms) → Cliente corta
- **Sidecar Retry**: Cliente (5000ms) vs Latencia (2500ms) → Envoy hace 2 intentos
- **Éxito Sidecar**: Cliente (5000ms) vs Latencia (1200ms) → Éxito con headers

**📋 Cada patrón tiene escenarios completamente diferentes**

## Interpretación de Resultados

### Headers Importantes
- `X-Envoy-Attempt-Count`: Intentos de Envoy (1 o 2)
- `X-Request-From`: Confirma el patrón usado

### Mensajes del Frontend
- **Status 0**: Timeout del cliente
- **Status 504**: Timeout del sidecar/API
- **Status 200**: Éxito

## 🎯 Casos de Uso Reales

Este patrón se usa en:
- **🕸️ Service Mesh**: Istio, Linkerd, Consul Connect
- **🚪 API Gateway**: Kong, Ambassador, Zuul
- **☁️ Cloud Native**: Kubernetes sidecar containers
- **📊 Observabilidad**: Distributed tracing, metrics
- **🔒 Seguridad**: mTLS, authentication, authorization

## 🏆 Beneficios Demostrados

✅ **Resiliencia**: Retries automáticos sin código
✅ **Aislamiento**: Separación de responsabilidades
✅ **Observabilidad**: Headers y logs de rastreo
✅ **Configuración**: Políticas declarativas (YAML)
✅ **Testing**: Fácil simulación de fallas
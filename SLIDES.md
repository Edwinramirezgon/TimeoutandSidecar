# 🎯 SLIDES PARA EXPOSICIÓN (10-12 slides)

## Slide 1: Título
**🎯 Patrones de Timeout Demo**
- Demostración de dos patrones independientes
- TypeScript de extremo a extremo
- Timeout vs Sidecar

## Slide 2: Problema
**🤔 ¿Qué pasa cuando las cosas van lentas?**
- Aplicaciones distribuidas fallan
- Timeouts son críticos para UX
- Diferentes enfoques, diferentes filosofías

## Slide 3: Dos Patrones
**📊 Patrón Timeout** vs **🛡️ Patrón Sidecar**
- Timeout: Cada uno se cuida solo
- Sidecar: Un guardián protege a todos
- Completamente independientes

## Slide 4: Arquitectura Timeout
```
🖥️ Cliente → 💻 API Directa → 🐌 Slow Service
  Variable    2000ms timeout    Variable
```
- Sin intermediarios
- Fallbacks manuales
- Control granular

## Slide 5: Arquitectura Sidecar
```
🖥️ Cliente → 🛡️ Envoy → 💻 API → 🐌 Slow Service
  Variable    2s+retry   2200ms   Variable
```
- Proxy intercepta todo
- Retries automáticos
- Políticas centralizadas

## Slide 6: Timeouts en Cascada
```
Cliente (1.5s) < Sidecar (2s) < API (2.2s)
     ↓              ↓           ↓
   Cancela      Reintenta    Fallback
```

## Slide 7: Demo en Vivo - Acto 1
**🎭 "El Cliente Impaciente"**
- Cliente 1500ms vs Trabajo 1800ms
- Resultado: 🔴 CORTÓ: CLIENTE
- Status 0, tiempo ~1500ms

## Slide 8: Demo en Vivo - Acto 2
**🎭 "El Guardián en Acción"**
- Cliente 5000ms vs Trabajo 2500ms (Sidecar)
- Resultado: 🟡 CORTÓ: SIDECAR
- `X-Envoy-Attempt-Count: 2`, ~4000ms

## Slide 9: Demo en Vivo - Acto 3
**🎭 "Final Feliz"**
- Cliente 3000ms vs Trabajo 1200ms
- Resultado: 🟢 CORTÓ: NADIE
- Status 200, ~1200ms

## Slide 10: Interpretación
**🔍 Cómo leer los resultados**
- Status 0 = Cliente canceló
- Status 504 = Sidecar/API canceló
- Status 200 = Éxito
- `X-Envoy-Attempt-Count` = Reintentos

## Slide 11: Casos de Uso Reales
**🌍 Dónde se usa esto**
- Service Mesh (Istio, Linkerd)
- API Gateways (Kong, Ambassador)
- Kubernetes sidecar containers
- Microservicios distribuidos

## Slide 12: Conclusión
**🎯 Dos filosofías, mismo problema**
- Timeout: Control manual, cada servicio decide
- Sidecar: Guardián automático, políticas centralizadas
- Ambos válidos, diferentes contextos
- **Demo completa disponible en GitHub**
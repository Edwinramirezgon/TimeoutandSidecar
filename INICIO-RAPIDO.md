# 🚀 INICIO RÁPIDO

## 1. Iniciar Docker
```bash
# Asegúrate de que Docker Desktop esté corriendo
open -a Docker
```

## 2. Levantar Backend
```bash
cd infra
docker compose up --build
```

## 3. Levantar Frontend
```bash
cd apps/web-client
npm install
npm run dev
```

## 4. Abrir Demo
- Frontend: http://localhost:5173
- Seleccionar patrón en la UI
- Probar escenarios

## URLs Útiles
- Router: http://localhost:8080
- Envoy Admin (Timeout): http://localhost:9901  
- Envoy Admin (Sidecar): http://localhost:9902

## Solución de Problemas

### Docker no inicia
```bash
# Verificar Docker
docker --version

# Iniciar Docker Desktop
open -a Docker

# Esperar 30 segundos y reintentar
```

### Puerto ocupado
```bash
# Ver qué usa el puerto 8080
lsof -i :8080

# Matar proceso si es necesario
kill -9 <PID>
```
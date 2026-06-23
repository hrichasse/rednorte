# RedNorte

Sistema web para gestion de listas de espera medica, agenda de citas y reasignacion de cupos para una red publica de salud del norte de Chile.

El proyecto esta organizado como monorepo:

```txt
Rednorte/
  backend/   API REST Java Spring Boot
  frontend/  Aplicacion web React/TanStack
```

## 1. Stack tecnico

### Frontend

- React 19
- TypeScript
- TanStack Start / TanStack Router
- Vite
- Tailwind CSS
- Lucide React
- Recharts
- Fetch API centralizada en `frontend/src/lib/api.ts`

### Backend

- Java 17
- Spring Boot 3.2.12
- Spring Web
- Spring Security
- Spring Data JPA
- Bean Validation
- Maven
- Lombok
- JWT con `jjwt`
- PostgreSQL JDBC

### Base de datos

- Supabase PostgreSQL
- Conexion directa desde Spring Boot por JDBC
- No usa Supabase Auth
- No usa SDK de Supabase
- No usa RLS en este MVP

## 2. Requisitos previos

Instalar:

- Java JDK 17 o superior
- Maven 3.9+
- Node.js 20+ recomendado
- npm
- Cuenta/proyecto en Supabase

Verificar:

```bash
java -version
mvn -version
node -v
npm -v
```

## 3. Configurar base de datos Supabase

1. Entrar a Supabase.
2. Abrir el proyecto.
3. Ir a:

```txt
SQL Editor -> New Query
```

4. Pegar y ejecutar el script:

```txt
backend/database/supabase-schema.sql
```

Ese script crea:

- `usuarios`
- `pacientes`
- `lista_espera`
- `cupos_disponibles`
- indices
- triggers `updated_at`
- datos demo

## 4. Variables de entorno del backend

Crear archivo:

```txt
backend/.env
```

Puedes usar como base:

```bash
cp backend/.env.example backend/.env
```

Contenido esperado:

```env
SUPABASE_HOST=tu-proyecto.supabase.co
SUPABASE_JDBC_URL=jdbc:postgresql://tu-host:5432/postgres?sslmode=require
SUPABASE_DB_USERNAME=postgres
SUPABASE_DB_PASSWORD=tu-password-de-bd
JWT_SECRET=una-clave-secreta-de-minimo-32-caracteres
```

Notas:

- `JWT_SECRET` debe tener minimo 32 caracteres.
- Si el host directo de Supabase falla por IPv6, usar el connection pooler de Supabase en `SUPABASE_JDBC_URL`.
- No subir `backend/.env` a GitHub. Ya esta ignorado por `.gitignore`.

## 5. Variables de entorno del frontend

Crear archivo:

```txt
frontend/.env.local
```

Contenido local:

```env
VITE_API_URL=http://localhost:8080
```

No subir `frontend/.env.local` a GitHub. Ya esta ignorado por `.gitignore`.

## 6. Instalar dependencias

### Backend

```bash
cd backend
mvn test
```

### Frontend

```bash
cd frontend
npm install
```

## 7. Como ejecutar la app localmente

Abrir dos terminales.

### Terminal 1: backend

```bash
cd backend
set -a
source .env
set +a
mvn spring-boot:run
```

Backend:

```txt
http://localhost:8080
```

Healthcheck:

```txt
http://localhost:8080/actuator/health
```

### Terminal 2: frontend

```bash
cd frontend
npm run dev
```

Frontend:

```txt
http://127.0.0.1:3000/
```

## 8. Orden correcto de prueba QA

1. Ejecutar script SQL en Supabase.
2. Crear `backend/.env`.
3. Levantar backend.
4. Verificar `http://localhost:8080/actuator/health`.
5. Crear `frontend/.env.local`.
6. Levantar frontend.
7. Probar landing.
8. Probar portal paciente.
9. Probar login funcionario.
10. Probar dashboard.

## 9. Rutas frontend

```txt
/           Landing publica
/portal     Portal paciente
/login      Login y registro de funcionarios
/dashboard  Panel interno
```

## 10. Credenciales demo

### Funcionario administrador

```txt
URL: http://127.0.0.1:3000/login
Email: admin@rednorte.cl
Password: rednorte2026
```

### Portal paciente

```txt
URL: http://127.0.0.1:3000/portal
RUT: 12.345.678-9
N de serie: 111111111
```

Otros pacientes demo:

```txt
15.234.567-8 -> 222222222
11.987.654-3 -> 333333333
16.543.210-7 -> 444444444
13.876.543-2 -> 555555555
14.765.432-1 -> 666666666
17.654.321-0 -> 777777777
10.543.219-8 -> 888888888
```

## 11. Funcionalidades principales

### Landing publica

Presenta RedNorte, explica el sistema y permite entrar al portal paciente o al acceso de funcionarios.

### Portal paciente

Permite consultar derivaciones medicas usando:

```txt
RUT + N de serie del documento
```

Muestra:

- paciente
- especialidad
- establecimiento
- estado
- fecha de ingreso
- hora medica si existe
- telefono asociado

### Login y registro

Permite:

- iniciar sesion con funcionario existente
- registrar funcionarios publicos de salud con rol `MEDICO` o `ADMINISTRATIVO`
- guardar JWT en el navegador

### Dashboard

Panel interno con:

- Lista de espera
- Agenda de citas
- Reasignacion de cupos
- Reportes
- Mi perfil

### Lista de espera

Permite:

- ver pacientes
- revisar prioridad
- revisar estado
- abrir detalle
- editar prioridad, estado y notas internas

### Agenda de citas

Permite:

- crear nueva cita
- confirmar cita
- cancelar cita
- marcar paciente atendido
- registrar inasistencia

### Reasignacion de cupos

Permite:

- ver cupos liberados/cancelados
- obtener sugerencias
- reasignar manualmente
- ejecutar reasignacion automatica

### Reportes

Muestra indicadores como:

- pacientes atendidos
- cupos reasignados
- tiempo promedio de espera
- cumplimiento
- distribucion por prioridad

## 12. Endpoints principales backend

### Auth

```txt
POST /api/auth/login
POST /api/auth/register
GET  /api/auth/me
```

### Lista de espera

```txt
GET   /api/lista-espera
GET   /api/lista-espera/{id}
PATCH /api/lista-espera/{id}
GET   /api/lista-espera/estadisticas
GET   /api/lista-espera/consulta-publica
GET   /api/lista-espera/consulta-paciente
```

### Pacientes

```txt
GET /api/pacientes
GET /api/pacientes/{id}
```

### Cupos

```txt
GET  /api/cupos/agenda
POST /api/cupos/citas
POST /api/cupos/{id}/cancelar
POST /api/cupos/{id}/confirmar
POST /api/cupos/{id}/atendida
POST /api/cupos/{id}/no-asistio
GET  /api/cupos/{id}/sugerencias
POST /api/cupos/{id}/asignar
POST /api/cupos/reasignacion/automatica
GET  /api/cupos/reasignacion
GET  /api/cupos/reportes
GET  /api/cupos/cancelados/count
```

## 13. Pruebas rapidas por terminal

### Backend health

```bash
curl http://localhost:8080/actuator/health
```

Respuesta esperada:

```json
{"status":"UP"}
```

### Login

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@rednorte.cl","password":"rednorte2026"}'
```

Debe devolver `token`.

### Consulta portal paciente

```bash
curl "http://localhost:8080/api/lista-espera/consulta-paciente?rut=12.345.678-9&numeroSerie=111111111"
```

Debe devolver una lista de derivaciones.

## 14. Comandos utiles

### Backend

```bash
cd backend
mvn test
mvn spring-boot:run
```

### Frontend

```bash
cd frontend
npm install
npm run dev
npm run build
npm run lint
```

## 15. Produccion sugerida

### Backend

Railway:

- Root directory: `backend`
- Build command: `mvn -DskipTests clean package`
- Start command: `java -jar target/rednorte-backend-0.0.1-SNAPSHOT.jar`
- Variables: las mismas de `backend/.env`

Importante para Railway:

```properties
server.port=${PORT:8080}
```

### Frontend

Vercel:

- Root directory: `frontend`
- Install command: `npm install`
- Build command: `npm run build`
- Output directory: `dist/client`
- Environment variable:

```env
VITE_API_URL=https://tu-backend-en-railway.up.railway.app
```

Luego agregar el dominio de Vercel al CORS del backend.

## 16. Problemas comunes

### Error `ERR_CONNECTION_REFUSED`

El backend no esta levantado o no esta en `8080`.

Revisar:

```bash
lsof -nP -iTCP:8080 -sTCP:LISTEN
```

### Error CORS

El frontend esta llamando al backend, pero el backend no permite ese origen.

Revisar:

```txt
backend/src/main/java/cl/rednorte/config/CorsConfig.java
```

### Error `JWT_SECRET debe tener al menos 32 caracteres`

El secreto JWT es demasiado corto. Cambiar `JWT_SECRET` en `backend/.env`.

### Error de base de datos al iniciar

Verificar:

- `SUPABASE_JDBC_URL`
- `SUPABASE_DB_USERNAME`
- `SUPABASE_DB_PASSWORD`
- que el script SQL haya sido ejecutado

### Error `ddl-auto=validate`

El backend valida que las tablas existan. Si falta una columna, ejecutar el script SQL actualizado.

## 17. Notas de seguridad

- No subir `.env`.
- No subir `.env.local`.
- No exponer `SUPABASE_DB_PASSWORD`.
- No exponer `JWT_SECRET`.
- El N de serie se almacena como hash SHA-256 en `pacientes.numero_documento_hash`.

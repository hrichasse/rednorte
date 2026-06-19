# RedNorte Backend

API REST Java Spring Boot 3.2 para RedNorte, conectada a Supabase PostgreSQL por JDBC directo y autenticacion JWT propia.

## Requisitos

- Java 17
- Maven 3.9+
- Proyecto Supabase con PostgreSQL

## Variables de entorno

Copia `.env.example` como `.env` o exporta las variables en tu shell:

```bash
SUPABASE_HOST=tu-proyecto.supabase.co
SUPABASE_JDBC_URL=jdbc:postgresql://tu-host:5432/postgres?sslmode=require
SUPABASE_DB_USERNAME=postgres
SUPABASE_DB_PASSWORD=tu-password-de-bd
JWT_SECRET=una-clave-secreta-de-minimo-32-caracteres
```

En Supabase, obtiene `SUPABASE_HOST` y `SUPABASE_DB_PASSWORD` desde:

`Settings -> Database -> Connection string -> URI`

Usa el host del string de conexion y la password de la base de datos. El backend no usa Supabase Auth.

Ejemplo de host esperado:

```text
db.xxxxxxxxxxxxx.supabase.co
```

No se necesitan las claves `anon`, `service_role`, publishable key ni Supabase Auth para este backend.

Si el host directo `db.<project-ref>.supabase.co` no resuelve o falla por IPv6, usa el JDBC string del pooler de Supabase en `SUPABASE_JDBC_URL`.

## Base de datos

Ejecuta el script limpio desde:

```text
database/supabase-schema.sql
```

Ruta en Supabase:

```text
SQL Editor -> New Query -> pegar script completo -> Run
```

El script incluye `CREATE EXTENSION IF NOT EXISTS pgcrypto;`, tablas, indices, triggers `updated_at` y datos de prueba.

Consulta publica de prueba:

```text
rut: 12.345.678-9
codigoDerivacion: RN-001
```

## Ejecutar

```bash
mvn spring-boot:run
```

Con perfil de desarrollo:

```bash
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

## Credenciales MVP

```text
email: admin@rednorte.cl
password: rednorte2026
```

## Endpoints principales

- `POST /api/auth/login`
- `GET /api/lista-espera`
- `GET /api/lista-espera/estadisticas`
- `GET /api/lista-espera/consulta-publica?rut=...&codigoDerivacion=...`
- `GET /api/pacientes`
- `GET /api/pacientes/{id}`
- `GET /api/cupos/disponibles`
- `GET /api/cupos/cancelados/count`

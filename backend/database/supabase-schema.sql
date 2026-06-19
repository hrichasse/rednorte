-- RedNorte - Supabase PostgreSQL schema
-- Ejecutar en Supabase -> SQL Editor -> New Query -> Run.
-- Entorno de desarrollo: este script elimina y recrea tablas.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Paso 1: limpiar si existe
DROP TABLE IF EXISTS cupos_disponibles CASCADE;
DROP TABLE IF EXISTS lista_espera CASCADE;
DROP TABLE IF EXISTS pacientes CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;

-- Paso 2: usuarios
CREATE TABLE usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  nombre TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  rol TEXT NOT NULL CHECK (rol IN ('ADMIN', 'MEDICO', 'ADMINISTRATIVO')) DEFAULT 'ADMINISTRATIVO',
  establecimiento TEXT,
  activo BOOLEAN NOT NULL DEFAULT true
);

COMMENT ON TABLE usuarios IS 'Personal autorizado del sistema RedNorte. Las contrasenas se almacenan con BCrypt desde Spring Boot.';
COMMENT ON COLUMN usuarios.password_hash IS 'Hash BCrypt generado por Spring Security. Nunca texto plano.';
COMMENT ON COLUMN usuarios.rol IS 'ADMIN: acceso total | MEDICO: ver y gestionar pacientes | ADMINISTRATIVO: ver listas y agendar citas';

-- Paso 3: pacientes
CREATE TABLE pacientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  nombre TEXT NOT NULL,
  rut TEXT UNIQUE NOT NULL,
  email TEXT,
  telefono TEXT,
  fecha_nacimiento DATE,
  numero_documento_hash TEXT,
  direccion TEXT,
  comuna TEXT,
  activo BOOLEAN NOT NULL DEFAULT true
);

COMMENT ON TABLE pacientes IS 'Pacientes registrados en el sistema de listas de espera RedNorte.';
COMMENT ON COLUMN pacientes.rut IS 'RUT chileno formato 12.345.678-9. Unico por paciente.';
COMMENT ON COLUMN pacientes.numero_documento_hash IS 'Hash SHA-256 del numero de serie/documento usado para consulta publica del portal.';

-- Paso 4: lista de espera
CREATE TABLE lista_espera (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  codigo_derivacion TEXT UNIQUE NOT NULL,
  especialidad TEXT NOT NULL,
  establecimiento TEXT NOT NULL,
  medico_derivador TEXT,
  prioridad TEXT NOT NULL CHECK (prioridad IN ('ALTA', 'MEDIA', 'BAJA')) DEFAULT 'MEDIA',
  estado TEXT NOT NULL CHECK (estado IN ('En espera', 'Citado', 'Urgente', 'Atendido')) DEFAULT 'En espera',
  dias_espera INTEGER NOT NULL DEFAULT 0,
  fecha_ingreso DATE NOT NULL DEFAULT CURRENT_DATE,
  fecha_cita DATE,
  hora_cita TIME,
  notas TEXT,
  usuario_registro_id UUID REFERENCES usuarios(id)
);

COMMENT ON TABLE lista_espera IS 'Lista de espera medica de RedNorte. Cada registro representa un paciente esperando atencion especializada.';
COMMENT ON COLUMN lista_espera.codigo_derivacion IS 'Codigo unico formato RN-XXX para consulta publica del paciente.';
COMMENT ON COLUMN lista_espera.dias_espera IS 'Dias desde fecha_ingreso. Se actualiza diariamente desde Spring Boot.';
COMMENT ON COLUMN lista_espera.usuario_registro_id IS 'Funcionario que registro la derivacion en el sistema.';

-- Paso 5: cupos disponibles
CREATE TABLE cupos_disponibles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  especialidad TEXT NOT NULL,
  establecimiento TEXT NOT NULL,
  fecha_cupo DATE NOT NULL,
  hora_cupo TIME NOT NULL,
  medico TEXT,
  estado TEXT NOT NULL CHECK (estado IN ('Disponible', 'Ocupado', 'Cancelado')) DEFAULT 'Disponible',
  lista_espera_id UUID REFERENCES lista_espera(id),
  motivo_cancelacion TEXT
);

COMMENT ON TABLE cupos_disponibles IS 'Cupos medicos disponibles para asignacion o reasignacion automatica.';
COMMENT ON COLUMN cupos_disponibles.lista_espera_id IS 'NULL si el cupo esta disponible. Referencia a lista_espera cuando esta ocupado o asignado.';
COMMENT ON COLUMN cupos_disponibles.motivo_cancelacion IS 'Razon de cancelacion si estado = Cancelado.';

-- Paso 6: indices
CREATE INDEX idx_pacientes_rut ON pacientes(rut);
CREATE INDEX idx_pacientes_activo ON pacientes(activo) WHERE activo = true;
CREATE INDEX idx_pacientes_documento_hash ON pacientes(numero_documento_hash);

CREATE INDEX idx_lista_espera_paciente ON lista_espera(paciente_id);
CREATE INDEX idx_lista_espera_codigo ON lista_espera(codigo_derivacion);
CREATE INDEX idx_lista_espera_estado ON lista_espera(estado);
CREATE INDEX idx_lista_espera_prioridad ON lista_espera(prioridad);
CREATE INDEX idx_lista_espera_especialidad ON lista_espera(especialidad);
CREATE INDEX idx_lista_espera_dias ON lista_espera(dias_espera DESC);

CREATE INDEX idx_cupos_estado ON cupos_disponibles(estado);
CREATE INDEX idx_cupos_fecha ON cupos_disponibles(fecha_cupo);
CREATE INDEX idx_cupos_especialidad ON cupos_disponibles(especialidad);

CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_activo ON usuarios(activo) WHERE activo = true;

-- Paso 7: updated_at automatico
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_pacientes_updated_at
  BEFORE UPDATE ON pacientes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_lista_espera_updated_at
  BEFORE UPDATE ON lista_espera
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_cupos_updated_at
  BEFORE UPDATE ON cupos_disponibles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Paso 8: usuarios de prueba
-- Nota: el backend MVP actualmente valida admin@rednorte.cl/rednorte2026 en AuthService.
-- Esta tabla queda lista para migrar luego a autenticacion real por BCrypt.
INSERT INTO usuarios (nombre, email, password_hash, rol, establecimiento) VALUES
  (
    'Dr. Daniel Carrasco',
    'admin@rednorte.cl',
    '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi',
    'ADMIN',
    'Hospital Regional del Norte'
  ),
  (
    'Dra. Carolina Mendez',
    'carolina.mendez@rednorte.cl',
    '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi',
    'MEDICO',
    'Hospital Regional del Norte'
  ),
  (
    'Luis Gutierrez',
    'luis.gutierrez@rednorte.cl',
    '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi',
    'ADMINISTRATIVO',
    'Hospital Comunitario Iquique'
  );

-- Paso 9: pacientes de prueba
INSERT INTO pacientes (nombre, rut, email, telefono, fecha_nacimiento, comuna, numero_documento_hash) VALUES
  ('Maria Gonzalez Torres', '12.345.678-9', 'maria.gonzalez@email.cl', '+56912345678', '1975-03-15', 'Arica', '1a5376ad727d65213a79f3108541cf95012969a0d3064f108b5dd6e7f8c19b89'),
  ('Carlos Rojas Mendoza', '15.234.567-8', 'carlos.rojas@email.cl', '+56923456789', '1968-07-22', 'Iquique', '342e489174cc8579d038ea97683b010fee86de2c274d2a2eafcb595b213e643f'),
  ('Ana Soto Perez', '11.987.654-3', 'ana.soto@email.cl', '+56934567890', '1982-11-08', 'Antofagasta', '6d350a2155acf0c0cd7dcbaab0c9587520a59e5da467948d0a568f4a61c0f7a0'),
  ('Pedro Munoz Silva', '16.543.210-7', 'pedro.munoz@email.cl', '+56945678901', '1990-05-30', 'Arica', 'bb0f6a26de562e481bcbfcc0380fe6ddc7f6bcb2a2fa5cda912087863efef205'),
  ('Isabel Fuentes Castro', '13.876.543-2', 'isabel.fuentes@email.cl', '+56956789012', '1972-09-14', 'Iquique', '2b218a3de6e9c348c3c482caee9ed793b7963c54d3bbe757a8b1ba7f64cdde0a'),
  ('Roberto Diaz Herrera', '14.765.432-1', 'roberto.diaz@email.cl', '+56967890123', '1965-01-25', 'Antofagasta', '185ce8fc660c5607c09afb444d81f918300a1fc7737d780e4a6c0ed5871c6dd6'),
  ('Carmen Vidal Ramos', '17.654.321-0', 'carmen.vidal@email.cl', '+56978901234', '1988-06-03', 'Arica', 'd43403a2c3dae4e4332bf99111e6e066ecda233354d5fa44484dff058e483bb8'),
  ('Luis Morales Pinto', '10.543.219-8', 'luis.morales@email.cl', '+56989012345', '1995-12-17', 'Iquique', '68bd1464f79367d0530965ec2f2e97be9845b19d027f759634fed555030a10e3');

-- Paso 10: lista de espera de prueba
INSERT INTO lista_espera (
  paciente_id,
  codigo_derivacion,
  especialidad,
  establecimiento,
  medico_derivador,
  prioridad,
  estado,
  dias_espera,
  fecha_ingreso
)
VALUES
  (
    (SELECT id FROM pacientes WHERE rut = '12.345.678-9'),
    'RN-001', 'Traumatologia', 'Hospital Regional del Norte',
    'Dr. Jorge Vidal', 'ALTA', 'En espera', 187,
    CURRENT_DATE - INTERVAL '187 days'
  ),
  (
    (SELECT id FROM pacientes WHERE rut = '15.234.567-8'),
    'RN-002', 'Cardiologia', 'Hospital Comunitario Iquique',
    'Dra. Patricia Soto', 'ALTA', 'Urgente', 143,
    CURRENT_DATE - INTERVAL '143 days'
  ),
  (
    (SELECT id FROM pacientes WHERE rut = '11.987.654-3'),
    'RN-003', 'Neurologia', 'Hospital Regional del Norte',
    'Dr. Marco Reyes', 'MEDIA', 'En espera', 98,
    CURRENT_DATE - INTERVAL '98 days'
  ),
  (
    (SELECT id FROM pacientes WHERE rut = '16.543.210-7'),
    'RN-004', 'Oftalmologia', 'CAPS Arica Centro',
    'Dra. Sandra Lopez', 'BAJA', 'Citado', 76,
    CURRENT_DATE - INTERVAL '76 days'
  ),
  (
    (SELECT id FROM pacientes WHERE rut = '13.876.543-2'),
    'RN-005', 'Medicina Interna', 'Hospital Comunitario Antofagasta',
    'Dr. Felipe Castro', 'MEDIA', 'En espera', 54,
    CURRENT_DATE - INTERVAL '54 days'
  ),
  (
    (SELECT id FROM pacientes WHERE rut = '14.765.432-1'),
    'RN-006', 'Cardiologia', 'Hospital Regional del Norte',
    'Dra. Patricia Soto', 'ALTA', 'Urgente', 42,
    CURRENT_DATE - INTERVAL '42 days'
  ),
  (
    (SELECT id FROM pacientes WHERE rut = '17.654.321-0'),
    'RN-007', 'Traumatologia', 'CAPS Iquique Norte',
    'Dr. Jorge Vidal', 'MEDIA', 'En espera', 38,
    CURRENT_DATE - INTERVAL '38 days'
  ),
  (
    (SELECT id FROM pacientes WHERE rut = '10.543.219-8'),
    'RN-008', 'Neurologia', 'Hospital Comunitario Antofagasta',
    'Dr. Marco Reyes', 'BAJA', 'En espera', 21,
    CURRENT_DATE - INTERVAL '21 days'
  );

-- Paso 11: cupos disponibles de prueba
INSERT INTO cupos_disponibles (especialidad, establecimiento, fecha_cupo, hora_cupo, medico, estado) VALUES
  ('Traumatologia', 'Hospital Regional del Norte', CURRENT_DATE + 28, '09:00', 'Dr. Jorge Vidal', 'Disponible'),
  ('Cardiologia', 'Hospital Regional del Norte', CURRENT_DATE + 31, '10:30', 'Dra. Patricia Soto', 'Disponible'),
  ('Neurologia', 'Hospital Comunitario Iquique', CURRENT_DATE + 33, '11:00', 'Dr. Marco Reyes', 'Disponible'),
  ('Oftalmologia', 'CAPS Arica Centro', CURRENT_DATE + 15, '08:30', 'Dra. Sandra Lopez', 'Cancelado'),
  ('Medicina Interna', 'Hospital Comunitario Antofagasta', CURRENT_DATE + 38, '14:00', 'Dr. Felipe Castro', 'Disponible'),
  ('Traumatologia', 'CAPS Iquique Norte', CURRENT_DATE + 20, '15:30', 'Dr. Jorge Vidal', 'Cancelado'),
  ('Cardiologia', 'Hospital Comunitario Iquique', CURRENT_DATE + 45, '09:00', 'Dra. Patricia Soto', 'Cancelado');

-- Paso 12: verificacion final
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

SELECT nombre, email, rol, establecimiento
FROM usuarios;

SELECT
  l.codigo_derivacion,
  p.nombre AS paciente,
  p.rut,
  l.especialidad,
  l.establecimiento,
  l.prioridad,
  l.estado,
  l.dias_espera,
  l.fecha_ingreso
FROM lista_espera l
JOIN pacientes p ON p.id = l.paciente_id
ORDER BY l.dias_espera DESC;

SELECT estado, COUNT(*) AS total
FROM cupos_disponibles
GROUP BY estado
ORDER BY estado;

SELECT especialidad, COUNT(*) AS pacientes
FROM lista_espera
GROUP BY especialidad
ORDER BY pacientes DESC;

SELECT indexname, tablename
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

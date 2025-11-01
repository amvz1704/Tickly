# Alineación con Base de Datos - nuevoScriptPeruano.sql

Este documento verifica que el `evento-service` está correctamente alineado con el esquema de base de datos definido en `nuevoScriptPeruano.sql`.

## Tabla: Evento

### Estructura en BD:
```sql
CREATE TABLE public."Evento" (
	id_evento integer NOT NULL,
	"id_cliente_empresa_Cliente_empresa" integer NOT NULL,
	"id_tipo_evento_Tipo_de_evento" smallint NOT NULL,
	descripcion varchar(2000) NOT NULL,
	imagen_publicitaria varchar(255) NOT NULL,
	imagen_distribucion varchar(255) NOT NULL,
	enlace_playlist varchar(255),
	edad_min smallint NOT NULL,
	estado boolean,
	CONSTRAINT "Evento_pk" PRIMARY KEY (id_evento)
);
```

### Validaciones en código (eventos.schema.js):
- ✅ `id_evento`: Se genera manualmente (no tiene auto-incremento en BD)
- ✅ `id_cliente_empresa`: `z.number().int().positive()` - Referencia a `Cliente_empresa.id_cliente_empresa`
- ✅ `id_tipo_evento`: `z.number().int().positive().max(32767)` - `smallint` NOT NULL (max 32767)
- ✅ `descripcion`: `z.string().min(1).max(2000)` - `varchar(2000)` NOT NULL
- ✅ `imagen_publicitaria`: `z.string().min(1).max(255)` - `varchar(255)` NOT NULL
- ✅ `imagen_distribucion`: `z.string().min(1).max(255)` - `varchar(255)` NOT NULL
- ✅ `enlace_playlist`: `z.string().url().max(255).optional()` - `varchar(255)`, nullable
- ✅ `edad_min`: `z.number().int().min(0).max(32767)` - `smallint` NOT NULL
- ✅ `estado`: `z.boolean().optional().default(true)` - `boolean`, nullable

### Relaciones:
- ✅ `Evento.id_cliente_empresa_Cliente_empresa` → `Cliente_empresa.id_cliente_empresa` (FK)
- ✅ `Evento.id_tipo_evento_Tipo_de_evento` → `Tipo_de_evento.id_tipo_evento` (FK)

## Tabla: Horarios_Eventos

### Estructura en BD:
```sql
CREATE TABLE public."Horarios_Eventos" (
	id_horario_eventos integer NOT NULL,
	fecha_inicio date NOT NULL,
	hora_inicio timestamp NOT NULL,
	duracion smallint NOT NULL,
	"id_evento_Evento" integer NOT NULL,
	CONSTRAINT "Horarios_Eventos_pk" PRIMARY KEY (id_horario_eventos)
);
```

### Validaciones en código:
- ✅ `id_horario_eventos`: Se genera manualmente (no tiene auto-incremento en BD)
- ✅ `fecha_inicio`: `z.string().regex(/^\d{4}-\d{2}-\d{2}$/)` - `date` NOT NULL (formato YYYY-MM-DD)
- ✅ `hora_inicio`: `z.string().datetime()` - `timestamp` NOT NULL
- ✅ `duracion`: `z.number().int().positive().max(32767)` - `smallint` NOT NULL (max 32767)
- ✅ `id_evento`: `z.number().int().positive()` - Referencia a `Evento.id_evento`

### Relaciones:
- ✅ `Horarios_Eventos.id_evento_Evento` → `Evento.id_evento` (FK)

## Tabla: Tipo_de_evento

### Estructura en BD:
```sql
CREATE TABLE public."Tipo_de_evento" (
	id_tipo_evento smallint NOT NULL,
	nombre varchar(30) NOT NULL,
	CONSTRAINT "Tipo_de_evento_pk" PRIMARY KEY (id_tipo_evento)
);
```

### Consultas en código:
- ✅ Endpoint `GET /api/eventos/tipos` retorna todos los tipos de evento
- ✅ Se valida existencia antes de crear/actualizar eventos

## Tabla: Cliente_empresa (compartida con usuario-service)

### Estructura en BD:
```sql
CREATE TABLE public."Cliente_empresa" (
	id_cliente_empresa integer NOT NULL GENERATED ALWAYS AS IDENTITY,
	"id_usuario_Usuario" integer NOT NULL,
	"RUC" varchar(11),
	razon_social varchar(50),
	nombre_comercial varchar(30),
	CONSTRAINT "Cliente_empresa_pk" PRIMARY KEY (id_cliente_empresa)
);
```

### Uso en evento-service:
- ✅ Se consulta para validar permisos (obtener `id_cliente_empresa` desde `id_usuario`)
- ✅ Se usa en JOINs para mostrar información de la empresa en eventos
- ✅ Se valida que el usuario autenticado sea dueño del evento antes de modificar/eliminar

## Notas Importantes:

1. **IDs sin auto-incremento**: Tanto `Evento.id_evento` como `Horarios_Eventos.id_horario_eventos` NO tienen `GENERATED ALWAYS AS IDENTITY`, por lo que se calculan manualmente con `MAX(id) + 1`.

2. **Tipos smallint**: Los campos `smallint` en PostgreSQL tienen un rango de -32,768 a 32,767. Las validaciones respetan este límite.

3. **Base de datos compartida**: `evento-service` comparte la misma BD que `usuario-service`, especialmente las tablas:
   - `Usuario`
   - `Cliente_empresa`
   - `Cliente_comprador`
   - `Administrador`

4. **JWT compartido**: El `JWT_SECRET` debe ser el mismo en ambos servicios para que los tokens funcionen correctamente.

## Estado de Alineación: ✅ COMPLETO

Todas las tablas, campos, tipos de datos y relaciones están correctamente alineados con `nuevoScriptPeruano.sql`.


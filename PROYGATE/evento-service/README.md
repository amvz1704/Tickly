# Evento Service

Servicio de gestión de eventos para el sistema Tickly.

## Descripción

Este servicio se encarga de la gestión completa de eventos, incluyendo:
- CRUD de eventos
- Gestión de horarios de eventos
- Consulta de tipos de evento
- Validación de permisos por rol

## Tecnologías

- Node.js 20
- Express.js
- PostgreSQL
- JWT para autenticación
- Zod para validación
- Docker

## Estructura del Proyecto

```
evento-service/
├── src/
│   ├── config/          # Configuración (BD, variables de entorno)
│   ├── controllers/     # Lógica de negocio
│   ├── middleware/      # Autenticación y manejo de errores
│   ├── models/          # Modelos de datos (opcional)
│   ├── routes/          # Definición de rutas
│   ├── services/        # Servicios (opcional)
│   ├── utils/           # Utilidades (JWT)
│   ├── validations/     # Validaciones con Zod
│   ├── app.js           # Configuración de Express
│   └── server.js        # Punto de entrada
├── Dockerfile
├── docker-compose.yml
└── package.json
```

## Configuración

### Variables de Entorno (.env)

```env
PORT=3002
DB_HOST=host.docker.internal  # o localhost para desarrollo local
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=tu_password
DB_NAME=nombre_base_datos  # Misma BD que usuario-service
JWT_SECRET=tu_secreto_jwt  # Mismo secreto que usuario-service
JWT_EXPIRES_IN=1h
```

**Notas importantes:**
- Para desarrollo local, cambiar `host.docker.internal` por `localhost` en `DB_HOST`
- Este servicio usa la **misma base de datos** que `usuario-service`
- El `JWT_SECRET` debe ser el mismo en ambos servicios para que los tokens funcionen correctamente

## Endpoints

### Eventos

- `GET /api/eventos` - Listar todos los eventos (con filtros opcionales: `?estado=true&id_cliente_empresa=1&id_tipo_evento=2`)
- `GET /api/eventos/:id` - Obtener evento por ID (requiere autenticación)
- `POST /api/eventos` - Crear evento (solo CLIENTE_EMPRESA)
- `PUT /api/eventos/:id` - Actualizar evento (dueño o ADMIN)
- `DELETE /api/eventos/:id` - Eliminar evento (dueño o ADMIN)

### Horarios

- `GET /api/eventos/:id/horarios` - Obtener horarios de un evento
- `POST /api/eventos/horarios` - Crear horario para un evento (solo CLIENTE_EMPRESA)

### Tipos de Evento

- `GET /api/eventos/tipos` - Listar tipos de evento (público)

## Autenticación

El servicio utiliza JWT tokens. Las peticiones protegidas requieren el header:
```
Authorization: Bearer <token>
```

Adicionalmente, el servicio puede recibir información del usuario desde el API Gateway mediante headers:
- `x-user-id`: ID del usuario
- `x-user-role`: Rol del usuario

## Permisos

- **Público**: Obtener tipos de evento
- **Autenticado**: Ver eventos y horarios
- **CLIENTE_EMPRESA**: Crear eventos y horarios, actualizar/eliminar sus propios eventos
- **ADMIN**: Acceso completo (crear, actualizar, eliminar cualquier evento)

## Instalación y Uso

### Desarrollo Local

```bash
# Instalar dependencias
npm install

# Configurar .env (ver sección de configuración)

# Ejecutar en modo desarrollo
npm run dev
```

### Docker

```bash
# Construir y ejecutar con Docker Compose
docker-compose up -d

# Ver logs
docker-compose logs -f evento-service
```

## Base de Datos

**Importante**: Este servicio comparte la misma base de datos PostgreSQL que `usuario-service`. Las mismas credenciales de conexión deben ser utilizadas.

El servicio utiliza las siguientes tablas:
- `Evento` - Tabla principal de eventos
- `Tipo_de_evento` - Catálogo de tipos de evento
- `Horarios_Eventos` - Horarios asociados a eventos
- `Cliente_empresa` - Para validar permisos y relaciones (compartida con usuario-service)
- `Usuario` - Tabla de usuarios (compartida con usuario-service, solo lectura para validaciones)

### Relaciones Clave:
- `Evento.id_cliente_empresa_Cliente_empresa` → `Cliente_empresa.id_cliente_empresa`
- `Cliente_empresa.id_usuario_Usuario` → `Usuario.id_usuario`

## Validaciones

- Validación de esquemas con Zod
- Verificación de permisos por rol
- Validación de existencia de recursos relacionados (tipo de evento, empresa)
- Prevención de eliminación si hay horarios asociados


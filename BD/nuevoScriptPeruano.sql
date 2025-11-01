-- ============================================================
-- Tabla: Usuario
-- (Modificada: contrasena VARCHAR(100) en lugar de 25)
-- ============================================================
CREATE TABLE public."Usuario" (
	id_usuario integer NOT NULL GENERATED ALWAYS AS IDENTITY,
	tipo_usuario varchar(50),
	nombre_pila varchar(30),
	apellido_paterno varchar(30),
	apellido_materno varchar(30),
	foto_perfil varchar(255),
	contrasena varchar(100) NOT NULL, 
	correo_electronico varchar(254) NOT NULL,
	telefono varchar(12),
	estado boolean,
	CONSTRAINT "PK_id_usuario" PRIMARY KEY (id_usuario)
);
ALTER TABLE public."Usuario" OWNER TO postgres;

-- ============================================================
-- Tabla: Cliente_comprador
-- ============================================================
CREATE TABLE public."Cliente_comprador" (
	id_cliente_comprador integer NOT NULL GENERATED ALWAYS AS IDENTITY,
	"id_usuario_Usuario" integer NOT NULL,
	num_identificacion varchar(20),
	CONSTRAINT pk_id_cliente_comprador PRIMARY KEY (id_cliente_comprador)
);
ALTER TABLE public."Cliente_comprador" OWNER TO postgres;

-- ============================================================
-- Tabla: Cliente_empresa
-- ============================================================
CREATE TABLE public."Cliente_empresa" (
	id_cliente_empresa integer NOT NULL GENERATED ALWAYS AS IDENTITY,
	"id_usuario_Usuario" integer NOT NULL,
	"RUC" varchar(11),
	razon_social varchar(50),
	nombre_comercial varchar(30),
	CONSTRAINT "Cliente_empresa_pk" PRIMARY KEY (id_cliente_empresa)
);
ALTER TABLE public."Cliente_empresa" OWNER TO postgres;

-- Relaciones Usuario ↔ Clientes
ALTER TABLE public."Cliente_comprador" ADD CONSTRAINT "Usuario_fk"
FOREIGN KEY ("id_usuario_Usuario")
REFERENCES public."Usuario" (id_usuario)
MATCH FULL ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE public."Cliente_comprador" ADD CONSTRAINT "Cliente_comprador_uq"
UNIQUE ("id_usuario_Usuario");

ALTER TABLE public."Cliente_empresa" ADD CONSTRAINT "Usuario_fk"
FOREIGN KEY ("id_usuario_Usuario")
REFERENCES public."Usuario" (id_usuario)
MATCH FULL ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE public."Cliente_empresa" ADD CONSTRAINT "Cliente_empresa_uq"
UNIQUE ("id_usuario_Usuario");

-- ============================================================
-- Tabla: Vendedor_presencial
-- ============================================================
CREATE TABLE public."Vendedor_presencial" (
	id_vendedor_presencial integer NOT NULL GENERATED ALWAYS AS IDENTITY,
	"id_usuario_Usuario" integer NOT NULL,
	"id_punto_venta_presencial_Puntos_de_venta_presencial" jsonb NOT NULL,
	sueldo smallint,
	CONSTRAINT pk_id_vendedor PRIMARY KEY (id_vendedor_presencial)
);
ALTER TABLE public."Vendedor_presencial" OWNER TO postgres;

ALTER TABLE public."Vendedor_presencial" ADD CONSTRAINT "Usuario_fk"
FOREIGN KEY ("id_usuario_Usuario")
REFERENCES public."Usuario" (id_usuario)
MATCH FULL ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE public."Vendedor_presencial" ADD CONSTRAINT "Vendedor_presencial_uq"
UNIQUE ("id_usuario_Usuario");

-- ============================================================
-- 🧑‍💼 Tabla: Administrador (renombrada y corregida)
-- ============================================================
CREATE TABLE public."Administrador" (
	id_administrador integer NOT NULL GENERATED ALWAYS AS IDENTITY,
	"id_usuario_Usuario" integer NOT NULL,
	CONSTRAINT pk_id_administrador PRIMARY KEY (id_administrador)
);
ALTER TABLE public."Administrador" OWNER TO postgres;

ALTER TABLE public."Administrador" ADD CONSTRAINT "Usuario_fk"
FOREIGN KEY ("id_usuario_Usuario")
REFERENCES public."Usuario" (id_usuario)
MATCH FULL ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE public."Administrador" ADD CONSTRAINT "Administrador_uq"
UNIQUE ("id_usuario_Usuario");

-- ============================================================
-- Tabla: Evento
-- ============================================================
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
ALTER TABLE public."Evento" OWNER TO postgres;

-- ============================================================
-- Tabla: Tipo_de_evento
-- ============================================================
CREATE TABLE public."Tipo_de_evento" (
	id_tipo_evento smallint NOT NULL,
	nombre varchar(30) NOT NULL,
	CONSTRAINT "Tipo_de_evento_pk" PRIMARY KEY (id_tipo_evento)
);
ALTER TABLE public."Tipo_de_evento" OWNER TO postgres;

-- ============================================================
-- Tabla: Local
-- ============================================================
CREATE TABLE public."Local" (
	id_local integer NOT NULL,
	nombre varchar(255),
	direccion varchar(255),
	direccion_maps smallint,
	ciudad smallint,
	CONSTRAINT "Local_pk" PRIMARY KEY (id_local)
);
ALTER TABLE public."Local" OWNER TO postgres;

-- ============================================================
-- Tabla: Descuento
-- ============================================================
CREATE TABLE public."Descuento" (
	id_descuento integer NOT NULL,
	codigo varchar(20),
	porcentaje smallint,
	valor_fijo numeric(5,2),
	tipo_descuento boolean,
	fecha_inicio date,
	hora_inicio time,
	fecha_fin date,
	hora_fin time,
	estado boolean,
	"id_horario_eventos_Horarios_Eventos" integer NOT NULL,
	CONSTRAINT "Descuento_pk" PRIMARY KEY (id_descuento)
);
ALTER TABLE public."Descuento" OWNER TO postgres;

-- Relaciones Evento ↔ Cliente_empresa / Tipo_de_evento
ALTER TABLE public."Evento" ADD CONSTRAINT "Cliente_empresa_fk"
FOREIGN KEY ("id_cliente_empresa_Cliente_empresa")
REFERENCES public."Cliente_empresa" (id_cliente_empresa)
MATCH FULL ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE public."Evento" ADD CONSTRAINT "Tipo_de_evento_fk"
FOREIGN KEY ("id_tipo_evento_Tipo_de_evento")
REFERENCES public."Tipo_de_evento" (id_tipo_evento)
MATCH FULL ON DELETE RESTRICT ON UPDATE CASCADE;

-- ============================================================
-- Tabla: many_Local_has_many_Evento
-- ============================================================
CREATE TABLE public."many_Local_has_many_Evento" (
	"id_local_Local" integer NOT NULL,
	"id_evento_Evento" integer NOT NULL,
	CONSTRAINT "many_Local_has_many_Evento_pk" PRIMARY KEY ("id_local_Local","id_evento_Evento")
);
ALTER TABLE public."many_Local_has_many_Evento" OWNER TO postgres;

ALTER TABLE public."many_Local_has_many_Evento" ADD CONSTRAINT "Local_fk"
FOREIGN KEY ("id_local_Local")
REFERENCES public."Local" (id_local)
MATCH FULL ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE public."many_Local_has_many_Evento" ADD CONSTRAINT "Evento_fk"
FOREIGN KEY ("id_evento_Evento")
REFERENCES public."Evento" (id_evento)
MATCH FULL ON DELETE RESTRICT ON UPDATE CASCADE;

-- ============================================================
-- Tabla: Puntos_de_venta_presencial
-- ============================================================
CREATE TABLE public."Puntos_de_venta_presencial" (
	id_punto_venta_presencial jsonb NOT NULL,
	direccion varchar(255),
	CONSTRAINT "Puntos_de_venta_presencial_pk" PRIMARY KEY (id_punto_venta_presencial)
);
ALTER TABLE public."Puntos_de_venta_presencial" OWNER TO postgres;

ALTER TABLE public."Vendedor_presencial" ADD CONSTRAINT "Puntos_de_venta_presencial_fk"
FOREIGN KEY ("id_punto_venta_presencial_Puntos_de_venta_presencial")
REFERENCES public."Puntos_de_venta_presencial" (id_punto_venta_presencial)
MATCH FULL ON DELETE RESTRICT ON UPDATE CASCADE;

-- ============================================================
-- Tabla: Venta
-- ============================================================
CREATE TABLE public."Venta" (
	id_venta integer NOT NULL,
	tipo_venta varchar(10) NOT NULL,
	fecha date NOT NULL,
	total numeric(5,2) NOT NULL,
	"id_evento_Evento" integer NOT NULL,
	"id_vendedor_presencial_Vendedor_presencial" integer,
	"id_punto_venta_presencial_Puntos_de_venta_presencial" jsonb,
	CONSTRAINT "Venta_pk" PRIMARY KEY (id_venta)
);
ALTER TABLE public."Venta" OWNER TO postgres;

-- ============================================================
-- Tabla: Ticket
-- ============================================================
CREATE TABLE public."Ticket" (
	id_ticket integer NOT NULL,
	codigo_ticket varchar(50) NOT NULL,
	fecha timestamp NOT NULL,
	"id_venta_Venta" integer NOT NULL,
	"id_cliente_comprador_Cliente_comprador" integer NOT NULL,
	"id_zona_Zonas" integer NOT NULL,
	CONSTRAINT "Ticket_pk" PRIMARY KEY (id_ticket)
);
ALTER TABLE public."Ticket" OWNER TO postgres;

ALTER TABLE public."Venta" ADD CONSTRAINT "Evento_fk"
FOREIGN KEY ("id_evento_Evento")
REFERENCES public."Evento" (id_evento)
MATCH FULL ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE public."Venta" ADD CONSTRAINT "Vendedor_presencial_fk"
FOREIGN KEY ("id_vendedor_presencial_Vendedor_presencial")
REFERENCES public."Vendedor_presencial" (id_vendedor_presencial)
MATCH FULL ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE public."Venta" ADD CONSTRAINT "Puntos_de_venta_presencial_fk"
FOREIGN KEY ("id_punto_venta_presencial_Puntos_de_venta_presencial")
REFERENCES public."Puntos_de_venta_presencial" (id_punto_venta_presencial)
MATCH FULL ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE public."Ticket" ADD CONSTRAINT "Venta_fk"
FOREIGN KEY ("id_venta_Venta")
REFERENCES public."Venta" (id_venta)
MATCH FULL ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE public."Ticket" ADD CONSTRAINT "Ticket_uq"
UNIQUE ("id_venta_Venta");

ALTER TABLE public."Ticket" ADD CONSTRAINT "Cliente_comprador_fk"
FOREIGN KEY ("id_cliente_comprador_Cliente_comprador")
REFERENCES public."Cliente_comprador" (id_cliente_comprador)
MATCH FULL ON DELETE RESTRICT ON UPDATE CASCADE;

-- ============================================================
-- Tabla: Zonas
-- ============================================================
CREATE TABLE public."Zonas" (
	id_zona integer NOT NULL,
	nombre varchar(30),
	descripcion varchar(50),
	precio smallint,
	CONSTRAINT "Zonas_pk" PRIMARY KEY (id_zona)
);
ALTER TABLE public."Zonas" OWNER TO postgres;

ALTER TABLE public."Ticket" ADD CONSTRAINT "Zonas_fk"
FOREIGN KEY ("id_zona_Zonas")
REFERENCES public."Zonas" (id_zona)
MATCH FULL ON DELETE RESTRICT ON UPDATE CASCADE;

-- ============================================================
-- Tabla: Horarios_Eventos
-- ============================================================
CREATE TABLE public."Horarios_Eventos" (
	id_horario_eventos integer NOT NULL,
	fecha_inicio date NOT NULL,
	hora_inicio timestamp NOT NULL,
	duracion smallint NOT NULL,
	"id_evento_Evento" integer NOT NULL,
	CONSTRAINT "Horarios_Eventos_pk" PRIMARY KEY (id_horario_eventos)
);
ALTER TABLE public."Horarios_Eventos" OWNER TO postgres;

ALTER TABLE public."Horarios_Eventos" ADD CONSTRAINT "Evento_fk"
FOREIGN KEY ("id_evento_Evento")
REFERENCES public."Evento" (id_evento)
MATCH FULL ON DELETE RESTRICT ON UPDATE CASCADE;

-- ============================================================
-- Tabla: Stock_Eventos_Zonas
-- ============================================================
CREATE TABLE public."Stock_Eventos_Zonas" (
	stock_inicial smallint,
	sock_vendido smallint,
	"id_evento_Evento" integer NOT NULL,
	"id_zona_Zonas" integer NOT NULL,
	id_evento_zonas smallint NOT NULL,
	"id_horario_eventos_Horarios_Eventos" integer NOT NULL,
	CONSTRAINT "Eventos_Zonas_pk" PRIMARY KEY (id_evento_zonas)
);
ALTER TABLE public."Stock_Eventos_Zonas" OWNER TO postgres;

ALTER TABLE public."Stock_Eventos_Zonas" ADD CONSTRAINT "Evento_fk"
FOREIGN KEY ("id_evento_Evento")
REFERENCES public."Evento" (id_evento)
MATCH FULL ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE public."Stock_Eventos_Zonas" ADD CONSTRAINT "Zonas_fk"
FOREIGN KEY ("id_zona_Zonas")
REFERENCES public."Zonas" (id_zona)
MATCH FULL ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE public."Stock_Eventos_Zonas" ADD CONSTRAINT "Horarios_Eventos_fk"
FOREIGN KEY ("id_horario_eventos_Horarios_Eventos")
REFERENCES public."Horarios_Eventos" (id_horario_eventos)
MATCH FULL ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE public."Descuento" ADD CONSTRAINT "Horarios_Eventos_fk"
FOREIGN KEY ("id_horario_eventos_Horarios_Eventos")
REFERENCES public."Horarios_Eventos" (id_horario_eventos)
MATCH FULL ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE public."Descuento" ADD CONSTRAINT "Descuento_uq"
UNIQUE ("id_horario_eventos_Horarios_Eventos");

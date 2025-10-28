# Imagen base oficial de Node.js
FROM node:20-alpine

# Crear el directorio de trabajo
WORKDIR /app

# Copiar dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del proyecto
COPY . .

# Exponer el puerto configurado en tu .env
EXPOSE 3001

# Comando de inicio
CMD ["npm", "run", "dev"]

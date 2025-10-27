# ---- Etapa base ----
FROM node:20-alpine

# Crear directorio dentro del contenedor
WORKDIR /usr/src/app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código
COPY . .

# Exponer el puerto
EXPOSE 3001

# Comando para iniciar la app
CMD ["npm", "start"]

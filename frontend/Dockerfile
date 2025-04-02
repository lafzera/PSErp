FROM node:20-alpine

WORKDIR /app

# Copiar arquivos de configuração
COPY package*.json .npmrc ./

# Instalar dependências
RUN npm install -g date-fns@2.30.0
RUN npm install

# Copiar o resto dos arquivos
COPY . .

EXPOSE 3000

# Iniciar em modo de desenvolvimento
CMD ["npm", "run", "dev", "--", "--hostname", "0.0.0.0"] 
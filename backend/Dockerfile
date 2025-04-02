FROM node:20-alpine

WORKDIR /app

# Copiar arquivos de configuração
COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependências
RUN npm install

# Copiar o resto dos arquivos
COPY . .

# Gerar o Prisma Client
RUN npx prisma generate

EXPOSE 3001

CMD ["npm", "run", "dev"] 
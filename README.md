# PhotoStudioERP

Sistema de Gestão para Estúdios Fotográficos desenvolvido com Next.js e Node.js.

## Funcionalidades

- Gestão de Clientes
- Agendamento de Sessões
- Gestão de Produtos
- Orçamentos
- Controle Financeiro
- Gestão de Usuários
- Perfil de Usuário
- Preferências do Sistema

## Tecnologias Utilizadas

- Frontend:
  - Next.js
  - React
  - Chakra UI
  - React Query
  - TypeScript

- Backend:
  - Node.js
  - Express
  - Prisma
  - PostgreSQL
  - JWT

## Requisitos

- Node.js 18+
- PostgreSQL 14+
- npm ou yarn

## Instalação

1. Clone o repositório:
```bash
git clone [URL_DO_REPOSITÓRIO]
```

2. Instale as dependências do frontend:
```bash
cd frontend
npm install
```

3. Instale as dependências do backend:
```bash
cd ../backend
npm install
```

4. Configure as variáveis de ambiente:
- Copie o arquivo `.env.example` para `.env` no diretório frontend e backend
- Preencha as variáveis necessárias

5. Execute as migrações do banco de dados:
```bash
cd backend
npx prisma migrate dev
```

6. Inicie o servidor de desenvolvimento:
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## Estrutura do Projeto

```
projeto_novo/
├── frontend/           # Aplicação Next.js
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── types/
│   └── public/
└── backend/           # API Node.js
    ├── src/
    │   ├── controllers/
    │   ├── models/
    │   ├── routes/
    │   └── services/
    └── prisma/
```

## Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes. 
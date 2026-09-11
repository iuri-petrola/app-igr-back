# posso-orar-por-voce-backNodeJS

API Node/Express em TypeScript, com estrutura em camadas:
- `src/routes`
- `src/controllers`
- `src/services`
- `src/lib`

Com Prisma + Postgres.

## Requisitos
- Node v18.20.8 (veja `.nvmrc`)
- npm


## Rodar local
```bash
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

## Build e producao
```bash
npm run build
npm start
```

## Endpoints
- `GET /health`
- `POST /api/admin/login`
- `GET /api/fotos`
- `POST /api/fotos`
- `PUT /api/fotos/:id`
- `DELETE /api/fotos/:id`
- `GET /api/videos`
- `POST /api/videos`
- `PUT /api/videos/:id`
- `DELETE /api/videos/:id`
- `GET /api/palavra-do-dia`

Observacao:
- `POST/PUT/DELETE` de fotos e videos exigem token JWT no header `Authorization: Bearer <token>`.
- Login admin usa usuario/senha salvos no banco (`admin_users`), nao mais no `.env`.

## Admin (banco)
# Depois de rodar migrate/generate,
    npm run prisma:generate
    npm run prisma:migrate -- --name add-admin-user
# OU em caso de error no migrate 
    npx prisma db push

# crie ou atualize o admin:

npm run prisma:admin:upsert -- --username=admin --password=suaSenhaForte

## Midias locais
- Diretorio de fotos (exemplo): `/mnt/files-igr`
- URL publica padrao: `/uploads`

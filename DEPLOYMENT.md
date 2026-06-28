# Guia de Deploy - Cyzor Platform

Este documento detalha o processo completo para implantar (deploy) a Plataforma Cyzor em um ambiente de produção.

## 1. Visão Geral da Arquitetura

A aplicação Cyzor é uma solução Full-Stack em um único repositório (*monorepo*):
- **Frontend:** React + Vite
- **Backend:** Node.js (Express) encapsulado no `server.ts`
- **Banco de Dados:** SQLite (`better-sqlite3` + Drizzle ORM)
- **Autenticação:** Firebase

> ⚠️ **ATENÇÃO - Bando de Dados SQLite:** 
> Como a plataforma utiliza o SQLite, **todos os dados são salvos localmente no disco** (por padrão no arquivo `database/database.sqlite`). 
> **Não** utilize serviços de hospedagem efêmeros sem disco persistente (como Heroku padrão, Cloud Run sem volume, ou Vercel), pois os dados e backups serão perdidos a cada reinicialização.
>
> **Recomendação:** Utilize uma VPS (DigitalOcean, AWS EC2, Hetzner, etc) ou garanta a configuração de um Volume/Persistent Disk se utilizar Docker/PaaS.

---

## 2. Pré-requisitos do Servidor

Para rodar a aplicação nativamente em uma VPS (ex: Ubuntu 22.04/24.04):
- **Node.js**: v18.x ou superior (Recomendado v20.x)
- **NPM**: v9.x ou superior
- **PM2**: (Gerenciador de processos do Node) - `npm install -g pm2`
- **Nginx**: Para Proxy Reverso e SSL.

---

## 3. Configuração de Domínios Customizados (Vite)

Se você utilizar um domínio customizado (ex: `painel.cyzor.com.br`), o Vite precisa que este host seja autorizado.

Abra o arquivo `vite.config.ts` e adicione seu domínio dentro da chave `server.allowedHosts` e `preview.allowedHosts`:

```ts
// vite.config.ts
export default defineConfig(() => {
  return {
    server: {
      allowedHosts: ["painel.cyzor.com.br", "seu-outro-dominio.com"],
    },
    preview: {
      allowedHosts: ["painel.cyzor.com.br", "seu-outro-dominio.com"],
    },
    // ...resto da configuração
  }
});
```

---

## 4. Passo a Passo do Deploy (Nativo na VPS)

### Passo 1: Clonar e instalar
```bash
# Clone seu repositório ou baixe os arquivos da aplicação
git clone <seu-repositorio> cyzor-platform
cd cyzor-platform

# Instale as dependências
npm install
```

### Passo 2: Configurar Variáveis de Ambiente
Crie o arquivo `.env` na raiz do projeto copiando do `.env.example`:

```bash
cp .env.example .env
nano .env
```

Preencha os valores necessários (principalmente `GEMINI_API_KEY` se utilizar IA e mantenha o `DATABASE_PATH=database/database.sqlite`).

### Passo 3: Build da Aplicação
O comando de build compila o Frontend (React/Vite) para a pasta `dist` e também transpila o Backend (`server.ts`) para `dist/server.cjs`.

```bash
npm run build
```

### Passo 4: Rodar Migrações do Banco de Dados
A aplicação cria o banco e as tabelas automaticamente ao iniciar. Caso você possua novas migrações feitas via Drizzle:
```bash
npx drizzle-kit generate --config src/db/drizzle.config.ts
npx drizzle-kit push --config src/db/drizzle.config.ts
```

### Passo 5: Iniciar o Servidor com PM2
O PM2 garante que sua aplicação rodará em segundo plano e reiniciará automaticamente em caso de falha ou reboot do servidor.

```bash
# Iniciar a aplicação
pm2 start npm --name "cyzor-platform" -- run start

# Salvar a lista do PM2 para iniciar com o servidor
pm2 save
pm2 startup
```

---

## 5. Proxy Reverso com Nginx e SSL (HTTPS)

Como a aplicação roda por padrão na porta `3000`, você precisará do Nginx para escutar na porta 80/443 e repassar o tráfego.

**Crie o arquivo de configuração do Nginx:**
```bash
sudo nano /etc/nginx/sites-available/cyzor.conf
```

**Adicione a seguinte configuração (substitua pelo seu domínio):**
```nginx
server {
    listen 80;
    server_name painel.cyzor.com.br;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

**Ativar o site e reiniciar o Nginx:**
```bash
sudo ln -s /etc/nginx/sites-available/cyzor.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

**Gerar certificado SSL gratuito (Certbot/Let's Encrypt):**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d painel.cyzor.com.br
```

---

## 6. Backups e Manutenção

A aplicação gera e trabalha com dois diretórios importantes de estado que **não devem ser perdidos**:
1. `database/` - Onde fica o `database.sqlite` (banco principal) e os arquivos de WAL.
2. `backups/` - Onde os backups agendados automatizados via API nativa do SQLite são salvos.

**Recomendação de Backup Externo (Ex: S3, Google Drive, ou outro servidor):**
Crie um Cron Job (tarefa agendada) no Linux que compacte a pasta `backups/` e envie para um serviço de Cloud Storage periodicamente, garantindo que você tenha cópias externas do seu banco de dados caso ocorra uma falha catastrófica no servidor.

```bash
# Exemplo compactando e enviando para o S3 via AWS CLI diariamente
0 2 * * * cd /caminho/do/projeto && tar -czf cyzor-backup-$(date +\%F).tar.gz backups/ && aws s3 cp cyzor-backup-$(date +\%F).tar.gz s3://seu-bucket-de-backups/
```

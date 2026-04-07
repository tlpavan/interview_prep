# InterviewPrep AI - Deployment Guide

## Table of Contents
1. [Quick Start (Docker)](#quick-start-docker)
2. [Manual Deployment](#manual-deployment)
3. [Environment Configuration](#environment-configuration)
4. [Database Setup](#database-setup)
5. [Monitoring & Logging](#monitoring--logging)
6. [SSL/TLS Configuration](#ssltls-configuration)
7. [Backup & Recovery](#backup--recovery)
8. [Troubleshooting](#troubleshooting)
9. [Cloud Deployment](#cloud-deployment)

---

## Quick Start (Docker)

### Prerequisites
- Docker Engine 20+ and Docker Compose v2.0+

### Steps

**1. Clone and configure**
```bash
git clone <your-repo>
cd interview_prep
cp .env.production.example .env.production
# Edit .env.production and fill in required values (at least GEMINI_API_KEY)
```

**2. Start the stack**
```bash
docker-compose up -d
```

This will start:
- Backend service on `http://localhost:5000`
- MongoDB instance on `localhost:27017` (if DATABASE_URL is set)

**3. Verify**
```bash
curl http://localhost:5000/health
# Expected: {"status":"healthy",...}
```

Open browser: `http://localhost:5000`

**4. Stop**
```bash
docker-compose down
# To also remove persistent volumes:
docker-compose down -v
```

---

## Manual Deployment

### Prerequisites
- Node.js 18+ (LTS)
- npm or yarn
- MongoDB (optional, for production persistence)

### Steps

**1. Install dependencies**
```bash
cd backend
npm ci --only=production
```

**2. Configure environment**
```bash
cp .env.production.example .env
# Edit .env with your values
```

**3. Create data directory (if using JSON fallback)**
```bash
mkdir -p data
```

**4. Start the server**
```bash
node server.js
# Or use a process manager like PM2:
pm2 start server.js --name "interview-prep"
pm2 save
pm2 startup
```

**5. Verify**
```bash
curl http://localhost:5000/health
```

**6. (Optional) Setup Nginx reverse proxy**
See [SSL/TLS Configuration](#ssltls-configuration) section.

---

## Environment Configuration

### Required Variables

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: `5000`) |
| `NODE_ENV` | Environment: `development` or `production` |
| `GEMINI_API_KEY` | Google Gemini API key (required for AI features) |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | MongoDB connection URI. If not set, uses JSON file fallback. | - |
| `CORS_ORIGIN` | Comma-separated list of allowed CORS origins. Use `*` for any. | `http://localhost:8080,http://localhost:3000` |
| `OPENAI_API_KEY` | OpenAI API key (if using OpenAI features) | - |
| `VAPI_API_KEY` | VAPI voice API key (if using voice interviews) | - |
| `LOG_LEVEL` | Winston log level: `error`, `warn`, `info`, `debug` | `info` (prod), `debug` (dev) |

### Firebase Configuration

Firebase is configured on the frontend in `js/auth.js`. If using custom Firebase config, update that file. No backend env needed for standard Firebase Auth.

---

## Database Setup

### Option 1: JSON File Fallback (Default)

If `DATABASE_URL` is not set, the application stores data in `backend/data/interviews.json`.

**Initialize:**
```bash
mkdir -p backend/data
# The file will be created automatically on first write.
```

**Pros:**
- Zero external dependencies
- Easy to backup (single file)

**Cons:**
- Not suitable for high concurrency
- No built-in replication

### Option 2: MongoDB (Recommended for Production)

**1. Install MongoDB**
- Local: Use package manager or Docker
- Cloud: MongoDB Atlas (https://www.mongodb.com/cloud/atlas)

**2. Set connection string**
```env
DATABASE_URL=mongodb://username:password@host:port/database?authSource=admin
# Or Atlas:
DATABASE_URL=mongodb+srv://user:pass@cluster.mongodb.net/dbname
```

**3. The application will automatically connect on startup.** Check logs:
```
✅ Connected to MongoDB successfully
```

**Indexes (created automatically by Mongoose)**
- `userId+createdAt`
- `type+createdAt`
- `module+createdAt`

---

## Monitoring & Logging

### Application Logs

The application uses Winston for structured logging.

**Log levels:**
- `error`: Unexpected failures
- `warn`: Recoverable issues
- `info`: Startup, shutdown, important events
- `debug`: Detailed request/response data (dev only)

**Production log output:**
- JSON format to console (stdout/stderr)
- Recommended to capture via Docker or process manager

**Example (PM2):**
```bash
pm2 logs interview-prep
```

### Health Checks

**Endpoint:** `GET /health`

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-04-06T...",
  "uptime": 123.45,
  "environment": "production"
}
```

**Status codes:**
- `200 OK`: Healthy
- `503 Service Unavailable`: Not ready (should not happen; app crashes on fatal errors)

Use this endpoint for Kubernetes/load balancer health checks.

### Request Logging

Each request logs at debug level:
```
method path ip userAgent
```

---

## SSL/TLS Configuration

The application does not serve HTTPS directly; use a reverse proxy like Nginx.

### Nginx Reverse Proxy with SSL

**1. Install Nginx and Certbot**
```bash
sudo apt update
sudo apt install -y nginx certbot python3-certbot-nginx
```

**2. Create Nginx site configuration** (`/etc/nginx/sites-available/interview-prep`)
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # Let's Encrypt certificates
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # SSL settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;

    # Security headers (Helmet also sets these)
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";

    # Proxy to Node.js
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_buffering off;
    }

    # Increase timeout for long Gemini requests
    proxy_read_timeout 300s;
    proxy_connect_timeout 75s;
}
```

**3. Enable site and test**
```bash
sudo ln -s /etc/nginx/sites-available/interview-prep /etc/nginx/sites-enabled/
sudo nginx -t  # Should return: syntax ok
sudo systemctl reload nginx
```

**4. Obtain SSL certificate**
```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

**5. Auto-renewal**
```bash
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

---

## Backup & Recovery

### JSON File Database

**Manual backup:**
```bash
cp backend/data/interviews.json /backup/interviews-$(date +%Y%m%d).json
```

**Automated (cron):**
```bash
0 2 * * * cp /path/to/backend/data/interviews.json /backup/interviews-$(date +\%Y\%m\%d).json
```

### MongoDB

**Backup:**
```bash
mongodump --uri "$DATABASE_URL" --out ./mongodb-backup-$(date +%Y%m%d)
```

**Restore:**
```bash
mongorestore --uri "$DATABASE_URL" ./mongodb-backup-YYYYMMDD
```

### Application Backup

**Full backup (excluding node_modules, .env, .git):**
```bash
tar --exclude='node_modules' --exclude='.env' --exclude='.git' -czf backup-$(date +%Y%m%d).tar.gz .
```

---

## Troubleshooting

### Server fails to start: "Missing parameter name" route error
**Cause:** Express 5 compatibility issue with wildcard route.

**Fix:** Ensure the SPA fallback route in `backend/server.js` uses regex:
```javascript
app.get(/^\/(?!api\/).*$/, (_req, res) => {
  res.sendFile(path.join(clientRoot, "index.html"));
});
```

### Port already in use
```bash
# Find and kill process
lsof -i :5000
kill -9 <PID>
# Or change PORT in .env
```

### Gemini API errors
- Verify API key is set and valid
- Check quota: https://console.cloud.google.com/ai/gemini
- Increase timeout if needed (set `GEMINI_TIMEOUT=40000`)

### MongoDB connection fails
- Verify `DATABASE_URL` is correct
- Ensure MongoDB is running and accessible
- Check firewall/network rules for cloud databases
- If using Atlas, whitelist your IP in Atlas UI

### CORS errors in browser
- Set `CORS_ORIGIN` to your frontend domain (not `*` in production)
- Restart server after changing env vars

### Static files not loading
- Ensure `index.html` and `css/`, `js/` folders exist in the working directory of `server.js`
- Check file permissions

### High memory usage
- If using JSON fallback with many sessions, consider migrating to MongoDB
- Use process manager (PM2) with memory limits

---

## Cloud Deployment

### AWS Elastic Beanstalk

**1. Install EB CLI**
```bash
pip install awsebcli --upgrade --user
```

**2. Initialize**
```bash
eb init -p node.js-18 interview-prep-ai
```

**3. Create environment**
```bash
eb create interview-prep-production \
  --cname your-subdomain \
  --elb-type application \
  --scale 1
```

**4. Set environment variables**
```bash
eb setenv \
  NODE_ENV=production \
  PORT=5000 \
  GEMINI_API_KEY=your_key \
  DATABASE_URL=your_mongodb_uri
```

**5. Deploy**
```bash
eb deploy
```

**6. Open**
```bash
eb open
```

**Notes:**
- Elastic Beanstalk listens on `PORT` provided by the platform (usually 8080). To handle this, we rely on the `PORT` env var passed by EB. Our app uses `PORT` from env, so it works automatically. You may need to configure the proxy server (nginx) to forward to that port. The EB Node.js platform sets `PORT` to the application port; typically you don't need to change anything.
- MongoDB should be external (Atlas) or in the same VPC.

### Google Cloud Run

**1. Install gcloud CLI**

**2. Build and deploy**
```bash
gcloud run deploy interview-prep \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars GEMINI_API_KEY=your_key,DATABASE_URL=your_mongodb_uri,NODE_ENV=production \
  --port 5000
```

**Notes:**
- Cloud Run expects the container to listen on port 8080 by default, but we set `--port 5000`. Alternatively, configure the app to read `PORT` env (it already does). Cloud Run sets `PORT=8080`, but we can override. To be compatible, consider updating `server.js` to use `process.env.PORT || 5000`. It already does. So container port should be 8080? Actually Cloud Run sets `$PORT` to 8080 and expects the container to listen on that port. Our app uses `PORT` from env; if we don't set it, Node will use 5000. Cloud Run will still route to the port it expects; the container must listen on the port specified by `$PORT`. To comply, set `PORT` from env; if not set, Cloud Run will inject its own `PORT=8080`. Our code uses `Number(env.PORT) || 5000`, so it will use 8080 if provided. So we should not set `--port 5000`; let Cloud Run set PORT. Deploy without `--port` or just ensure the container listens on PORT env. It does. So:
```bash
gcloud run deploy interview-prep --source . --region us-central1 --allow-unauthenticated --set-env-vars GEMINI_API_KEY=...,DATABASE_URL=...
```

### Heroku

**1. Create Procfile** (already in repo? If not, add at project root):
```
web: cd backend && node server.js
```

**2. Deploy**
```bash
heroku create interview-prep-ai
git push heroku main
```

**3. Set config vars**
```bash
heroku config:set NODE_ENV=production GEMINI_API_KEY=your_key DATABASE_URL=your_mongodb_uri
```

**4. Open**
```bash
heroku open
```

---

## Maintenance

### Updating the Application

**Docker:**
```bash
docker-compose pull   # if using images from registry
docker-compose up -d --build
```

**PM2:**
```bash
pm2 stop interview-prep
git pull origin main
cd backend && npm ci --only=production
pm2 restart interview-prep
pm2 save
```

### Rotating API Keys

1. Generate new key from provider (Google AI Studio, etc.)
2. Update environment variable (`.env` or Docker secrets)
3. Restart application
4. Verify `/health` and a test API call
5. Revoke old key

---

**Deployment Guide Version**: 2.0.0  
**Last Updated**: 2025-04-06  
**Status**: Active

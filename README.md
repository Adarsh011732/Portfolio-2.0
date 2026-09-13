# Adarsh's Developer Portfolio & Interactive Terminal

A high-performance, responsive personal portfolio with live platform sync (GitHub, LeetCode, Codeforces, Codolio), 3D graphics, resume intelligence parser, and owner administration security.

---

## 📁 Repository Structure

```
Portfolio/
├── frontend/               # React 19 + Vite + Tailwind CSS Frontend
│   ├── public/             # Static assets & avatar images
│   ├── src/                # React application source code
│   │   ├── components/     # UI Sections, Modals, Terminal, Visualizers
│   │   ├── context/        # Portfolio & Theme state management
│   │   ├── data/           # Default portfolio data & fallbacks
│   │   ├── services/       # API integration & data processing
│   │   └── index.css       # Tailwind CSS design system
│   ├── index.html          # HTML entry point
│   ├── vite.config.js      # Vite configuration & dev proxy
│   ├── package.json        # Frontend dependencies & build scripts
│   └── .env.example        # Frontend environment documentation
│
├── backend/                # Standalone Node.js Proxy & Security Daemon
│   ├── server.js           # API server, Nodemailer OTP auth, caching & PDF parsing
│   ├── scripts/            # Helper utilities (e.g. test-mail.js)
│   ├── package.json        # Backend dependencies
│   ├── .env                # Local secrets (ignored by git)
│   └── .env.example        # Sanitized environment template
│
├── package.json            # Root workspace & convenience orchestration scripts
├── .gitignore              # Multi-tier secret & build artifact protection
└── README.md               # Project & deployment documentation
```

---

## 🚀 Quick Start (Local Development)

### 1. Install Dependencies
```bash
# Install both frontend and backend dependencies
npm run install:all
```

### 2. Configure Environment Secrets
Copy the example files and configure your values:
```bash
cp backend/.env.example backend/.env
```
In `backend/.env`, configure:
- `PORT=3001`
- `OWNER_EMAIL=your_email@gmail.com`
- `OWNER_PASSKEY=your_secret_pin`
- `EMAIL_USER=your_email@gmail.com`
- `EMAIL_PASS=your_gmail_app_password`

### 3. Start Development Servers
```bash
# Start Frontend (http://localhost:5173 with proxy to backend)
npm run dev

# Start Backend Daemon (http://localhost:3001) in a separate terminal
npm run dev:backend
```

---

## 🌐 Production Deployment Guide

You can deploy the portfolio in one of two ways:

### 🌟 Option 1: All-in-One Vercel Deployment (Serverless + Frontend on Single Domain)
This repository is pre-configured with `vercel.json` and a serverless `api/` directory so you can deploy **both the frontend and backend to Vercel on a single domain**.

1. **Database Setup (Free MongoDB Atlas)**:
   - Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
   - Create a database user and get your connection string: `mongodb+srv://<user>:<password>@cluster.mongodb.net/portfolio?retryWrites=true&w=majority`.
   - Seed your initial portfolio data:
     ```bash
     MONGODB_URI="your_connection_string" npm run db:seed
     ```

2. **Deploy on Vercel**:
   - Push this repository to GitHub.
   - Import the repository in [Vercel Dashboard](https://vercel.com/new).
   - Leave Root Directory as `./` (Root).
   - In **Settings → Environment Variables**, add:
     - `MONGODB_URI`: `mongodb+srv://...`
     - `OWNER_EMAIL`: Your email address (e.g. `adarshsingh98635@gmail.com`)
     - `OWNER_PASSKEY`: Your secure owner passkey (default: `9369`)
     - `EMAIL_USER`: (Optional) Your Gmail address for sending OTP emails
     - `EMAIL_PASS`: (Optional) 16-character Google App Password
     - `EMAIL_SERVICE`: `gmail`
   - Click **Deploy**!
   - Everything (SPA frontend + all `/api/*` serverless functions) will be live under your Vercel URL with 0 additional backend hosts needed.

---

### 🚀 Option 2: Split Deployment (Independent Backend on Render/Railway + Frontend on Vercel)

#### 🅰️ Deploy Backend (Render or Railway)
1. **Host**: Recommended on [Render](https://render.com) (Web Service) or [Railway](https://railway.app).
2. **Root Directory**: `backend`
3. **Build Command**: `npm install`
4. **Start Command**: `npm start`
5. **Environment Variables**:
   - `PORT`: `3001`
   - `FRONTEND_URL`: Your deployed frontend URL or `*`
   - `OWNER_EMAIL`: Your registered email for 2-Step OTP
   - `OWNER_PASSKEY`: Your master PIN / passkey
   - `EMAIL_USER`: Your Gmail address
   - `EMAIL_PASS`: 16-character Google App Password
   - `EMAIL_SERVICE`: `gmail`

#### 🅱️ Deploy Frontend (Vercel)
1. **Root Directory**: `frontend`
2. **Framework Preset**: `Vite`
3. **Environment Variable**: `VITE_API_BASE_URL` = your deployed backend URL (e.g. `https://your-backend.onrender.com`).

---

## 🔒 Security Best Practices

- All `.env`, `.env.*`, and secret credential files across root, `frontend/`, and `backend/` are strictly excluded from git via [.gitignore](.gitignore).
- Master passkeys and SMTP credentials remain exclusively on the server backend and are never exposed to client-side bundles.
- Nodemailer sends single-use time-limited OTPs (5 minutes) for owner authorization and passkey resetting.

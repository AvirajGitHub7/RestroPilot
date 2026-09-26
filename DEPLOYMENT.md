# 🚀 RestroPilot Deployment Guide (Vercel + Render)

This guide walks you through deploying **RestroPilot** seamlessly to **Render** (Server) and **Vercel** (Client).

---

## 📋 Pre-Flight Checklist

- [x] **Branding Updated**: Brand name set to **RestroPilot** across client and server.
- [x] **Mobile QR Code Scanning**: QR codes dynamically encode active domain (or configured `CLIENT_URL`) so mobile phone cameras directly load the digital menu.
- [x] **Printable Table Stand Generator**: High-resolution downloadable stand cards with Restaurant Name, Table Number, and clear instructions.
- [x] **DiceBear Avatars**: Interactive avatar studio in Profile with live preview, randomizer 🎲, and multiple style packs.
- [x] **Multi-Tenant Isolation**: Complete isolation per `restaurantId` across Tables, Menus, Orders, and Monthly Reports. Auto-seeds 5 tables upon registration.
- [x] **CORS & SPA Routing**: Robust CORS handling Render/Vercel domains; `vercel.json` rewrite configured for client deep routing.
- [x] **Security**: `.gitignore` files configured to prevent committing `.env` and `node_modules`.

---

## 1. 🖥️ Backend Deployment on Render

1. **Push your code to GitHub / GitLab / Bitbucket**.
2. Go to [Render Dashboard](https://dashboard.render.com/) and click **New + > Web Service**.
3. Connect your repository.
4. Set the following settings:
   - **Name**: `restropilot-server` (or your preferred name)
   - **Root Directory**: `server`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Under **Environment Variables**, add:
   | Key | Value | Notes |
   |---|---|---|
   | `PORT` | `5000` | Render assigns port automatically, but 5000 is safe default |
   | `MONGO_URI` | `mongodb+srv://...` | Your MongoDB Atlas connection URI |
   | `JWT_SECRET` | `restropilot_secure_jwt_secret_key_2026` | Any strong secret string |
   | `CLIENT_URL` | `https://your-frontend.vercel.app` | Your Vercel frontend URL (set after step 2, or comma-separated) |
6. Click **Deploy Web Service**.
7. Copy your live Render URL (e.g., `https://restropilot-server.onrender.com`).

---

## 2. 🌐 Frontend Deployment on Vercel

1. Go to [Vercel Dashboard](https://vercel.com/new).
2. Import your GitHub repository.
3. In the project setup screen:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click edit and select `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Under **Environment Variables**, add:
   | Key | Value |
   |---|---|
   | `VITE_API_BASE_URL` | `https://your-render-service.onrender.com/api` |
   *(Ensure you include the `/api` path and your Render URL from Step 1)*
5. Click **Deploy**.
6. Once deployed, copy your Vercel URL (e.g., `https://restropilot.vercel.app`).

---

## 3. 🔄 Final Connection & QR Sync

1. Go back to your **Render Dashboard** for `restropilot-server`.
2. Update the `CLIENT_URL` environment variable with your live Vercel URL:
   ```
   CLIENT_URL=https://your-restropilot-frontend.vercel.app
   ```
3. In your RestroPilot owner dashboard:
   - Open **Tables & QR** (`/owner/tables`).
   - Download table QR codes and test scanning with your phone camera.
   - The digital menu will instantly open on your phone!

---

## 4. 🛡️ Verification & Security
- Ensure `.env` is listed in `.gitignore` so secrets are never pushed to version control.
- Use strong, randomly generated JWT secrets in production.
- Enable IP access whitelist on MongoDB Atlas to allow Render's outbound traffic (or `0.0.0.0/0` with strong password authentication).


# 🍽️ RestroPilot

> **Smart QR-Powered Contactless Restaurant Ordering & Table POS SaaS**  
> Streamline dine-in ordering, eliminate wait times, track live table orders, and manage kitchen status with ease.

---

## 📸 Application Preview

<div align="center">
  <h3>📊 Owner Dashboard — Real-Time Overview & Active Dining Tables</h3>
  <img src="docs/screenshots/02_dashboard.png" alt="RestroPilot Owner Dashboard" width="900" style="border-radius: 12px; box-shadow: 0 8px 30px rgba(0,0,0,0.12);" />
</div>

<br/>

<div align="center">
  <table width="100%">
    <tr>
      <td width="50%" align="center">
        <h4>📱 Customer Mobile Menu (Scan & Order)</h4>
        <img src="docs/screenshots/05_customer_menu.png" alt="Customer Mobile Menu View" width="380" style="border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);" />
      </td>
      <td width="50%" align="center">
        <h4>🖨️ Table & QR Code Manager</h4>
        <img src="docs/screenshots/04_table_manager.png" alt="Table & QR Manager" width="450" style="border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);" />
      </td>
    </tr>
    <tr>
      <td width="50%" align="center">
        <h4>🍽️ Menu Management (100+ Dishes)</h4>
        <img src="docs/screenshots/03_menu_manager.png" alt="Menu Manager" width="450" style="border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);" />
      </td>
      <td width="50%" align="center">
        <h4>🔐 Secure Authentication Portal</h4>
        <img src="docs/screenshots/01_login.png" alt="Login & Role Portal" width="450" style="border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);" />
      </td>
    </tr>
  </table>
</div>

---

## ✨ Key Features

- **📱 Contactless Mobile QR Ordering (No App Required)**: Diners scan table QR codes using any smartphone camera to browse the menu and send orders directly to the kitchen.
- **⚡ Streamlined Kitchen & Dining Order Flow**: 1-click order progress tracking: `Pending` ➔ `Served` ➔ `Paid`.
- **💰 Live Collection Register**: Real-time aggregation of settled table payments without unnecessary clutter.
- **🧹 Instant Table Clearing & Minimal Storage**: Free up tables and clear settled order records with one click to keep the database lightweight.
- **📱 Clean QR Code Manager**: Effortlessly create tables and download crisp, high-contrast QR codes ready for table placement.
- **🎲 Interactive DiceBear Avatar Studio**: Customizable avatar styles for restaurant owners with a 1-tap **"🎲 Roll Dice"** randomizer.
- **🏢 Multi-Tenant Restaurant Isolation**: Strict data isolation per `restaurantId` across Tables, Menus, Orders, and Settings.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | [React 19](https://react.dev/) + [Vite 8](https://vitejs.dev/) |
| **Styling & UI** | [Tailwind CSS 3](https://tailwindcss.com/) + Custom Glassmorphism |
| **Routing** | [React Router v7](https://reactrouter.com/) |
| **QR Engine** | [qrcode](https://www.npmjs.com/package/qrcode) (Client Canvas + Server) |
| **Avatars** | [DiceBear API v9](https://www.dicebear.com/) |
| **Backend Runtime** | [Node.js](https://nodejs.org/) + [Express 4](https://expressjs.com/) |
| **Database & ODM** | [MongoDB Atlas](https://www.mongodb.com/atlas) + [Mongoose 8](https://mongoosejs.com/) |
| **Authentication** | JWT (JSON Web Tokens) + [bcryptjs](https://www.npmjs.com/package/bcryptjs) |
| **Deployment** | [Render](https://render.com) (Backend) + [Vercel](https://vercel.com) (Frontend) |

---

## 📁 Project Structure

```text
Food SaaS/
├── client/                     # Frontend Application (React + Vite + Tailwind)
│   ├── public/                 # Static assets, favicon.svg
│   ├── src/
│   │   ├── api/                # Axios instance with dynamic base URL
│   │   ├── components/         # Navbar, Sidebar, Logo, ProtectedRoute
│   │   ├── context/            # AuthContext (user, login, logout, avatar sync)
│   │   ├── pages/
│   │   │   ├── auth/           # Login & Restaurant Registration (with culinary showcase)
│   │   │   ├── customer/       # Mobile MenuView, Cart, OrderConfirmation
│   │   │   ├── owner/          # Dashboard, Orders, MenuManager, TableManager, Profile
│   │   │   └── superAdmin/     # Platform Management & Restaurant Approvals
│   │   ├── App.jsx             # Client Routing & Layouts
│   │   └── index.css           # Design tokens, gradients & typography
│   ├── vercel.json             # Vercel SPA rewrite configuration
│   └── package.json
│
├── server/                     # Backend API (Node.js + Express + Mongoose)
│   ├── config/
│   │   └── db.js               # MongoDB Atlas connection with SRV DNS resolver
│   ├── controllers/            # Auth, Orders, Menu, Tables, Restaurant, Admin
│   ├── middleware/             # JWT auth & roleCheck middleware
│   ├── models/                 # User, Restaurant, MenuItem, Table, Order
│   ├── routes/                 # Express API routes
│   ├── seedAll.js              # Seeds sample data & menus for testing
│   ├── server.js               # Express application entry & multi-origin CORS
│   └── package.json
│
├── docs/
│   └── screenshots/            # High-resolution screenshots of the application
├── DEPLOYMENT.md               # Step-by-step production deployment guide
└── README.md                   # Project documentation
```

---

## 🚀 Quick Start & Local Setup

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [MongoDB Atlas](https://www.mongodb.com/atlas) cluster (or local MongoDB)

### 2. Clone the Repository
```bash
git clone https://github.com/your-username/restropilot.git
cd restropilot
```

### 3. Server Setup
```bash
cd server
npm install
```

Create a `.env` file in the `server` directory (reference `.env.example`):
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
JWT_SECRET=your_secure_jwt_secret_key
CLIENT_URL=http://localhost:5173
```

Seed the initial database with sample restaurants and menus:
```bash
npm run seed
```

Start the backend development server:
```bash
npm run dev
```

### 4. Client Setup
Open a new terminal window:
```bash
cd client
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 👥 Account Access & Onboarding

- **New Restaurant Registration**: Navigate to `/register` in your browser to register your restaurant and immediately generate dining tables with QR codes.
- **Admin Access**: Super Administrator accounts manage approvals across the platform.
- **Demo Data**: When seeded with `npm run seed`, demo restaurants and complete menus are populated for instant evaluation.

---

## 🌐 Production Deployment

Deploy the server to **Render** first, then deploy the client to **Vercel**. Detailed step-by-step guides are documented in [DEPLOYMENT.md](DEPLOYMENT.md).

### Quick Summary:
1. **Deploy Backend to Render First**:
   - Repository Root: `server`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Environment Variables: `PORT`, `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`
   - Note your Render service URL (e.g. `https://your-service.onrender.com`).

2. **Deploy Frontend to Vercel**:
   - Framework Preset: `Vite`
   - Root Directory: `client`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Environment Variable: `VITE_API_BASE_URL=https://your-service.onrender.com/api`

3. **Update CORS in Render**:
   - Set `CLIENT_URL` in your Render service environment variables to your production Vercel domain.

---

## 📄 License

This project is licensed under the MIT License — feel free to customize and deploy for your restaurant business.

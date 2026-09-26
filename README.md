# 🍽️ RestroPilot

> **Smart QR-Powered Contactless Restaurant Ordering & Table POS SaaS**  
> Streamline dine-in ordering, eliminate wait times, automate daily collection registers (Cash & UPI), and generate high-resolution printable table QR stand cards.

---

## 📸 Application Preview

<div align="center">
  <h3>📊 Owner Dashboard — Real-Time Collections & Active Dining Tables</h3>
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
        <h4>🖨️ Table & QR Stand Card Manager</h4>
        <img src="docs/screenshots/04_table_manager.png" alt="Table & QR Manager" width="450" style="border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);" />
      </td>
    </tr>
    <tr>
      <td width="50%" align="center">
        <h4>🍽️ Menu Management (100+ Dishes)</h4>
        <img src="docs/screenshots/03_menu_manager.png" alt="Menu Manager" width="450" style="border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);" />
      </td>
      <td width="50%" align="center">
        <h4>🔐 Secure Authentication & Portal</h4>
        <img src="docs/screenshots/01_login.png" alt="Login & Role Portal" width="450" style="border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);" />
      </td>
    </tr>
  </table>
</div>

---

## ✨ Key Features

- **📱 Contactless Mobile QR Ordering (No App Required)**: Diners scan the table QR code using their default phone camera to browse the menu, customize quantities, and place orders directly to the kitchen.
- **💰 Offline Payment Settlement (Cash / UPI / Card)**: Designed for real-world restaurants where diners pay offline. Admins can select **"Collect Paid"** (*Cash*, *UPI / QR (GPay, PhonePe, Paytm)*, or *Card*).
- **📈 Daily Collections & Sales Register**: Automatically builds daily sales aggregates with cash vs. UPI breakdown, order counts, and timestamped transaction history.
- **🧹 Auto-Clearing Tables & Lean Storage**: As soon as payment is settled, the active dining order is archived into the daily collection and the table is instantly freed up for the next arriving diners, preventing database bloat.
- **🖨️ High-Resolution Printable Table Stand Generator**: Automatically draws professional 1200×1600 px printable table cards on an HTML5 canvas featuring your Restaurant Name, Table Number, sharp QR code, and scan instructions.
- **🎲 Interactive DiceBear Avatar Studio**: 8 customizable avatar collections (*Adventurer, Personas, Robots, Lorelei, Fun Emoji, Micah, Notionist, Avataaars*) with a 1-tap **"🎲 Roll Dice"** randomizer.
- **🏢 Strict Multi-Tenant Restaurant Isolation**: Complete data isolation per `restaurantId` across Tables, Menus, Orders, and Collections.
- **🌐 1-Click Domain QR Sync**: Switch from localhost to production on Vercel and sync all table QR codes to your live domain with one click.

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
| **Deployment** | [Vercel](https://vercel.com) (Frontend) + [Render](https://render.com) (Backend) |

---

## 📁 Project Structure

```text
Food SaaS/
├── client/                     # Frontend Application (React + Vite + Tailwind)
│   ├── public/                 # Static assets & favicons
│   ├── src/
│   │   ├── api/                # Axios instance with dynamic base URL
│   │   ├── components/         # Navbar, Sidebar, Logo, ProtectedRoute
│   │   ├── context/            # AuthContext (user, login, logout, avatar sync)
│   │   ├── pages/
│   │   │   ├── auth/           # Login & Restaurant Registration
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
│   ├── models/                 # User, Restaurant, MenuItem, Table, Order, DailyCollection
│   ├── routes/                 # Express API routes
│   ├── seedAll.js              # Seeds Super Admin, Brotherhood, and RFC (107 dishes)
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
- [MongoDB Atlas](https://www.mongodb.com/atlas) account (or local MongoDB)

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

Create a `.env` file in the `server` directory:
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.lbk2snb.mongodb.net/restropilot?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=restropilot_secure_jwt_secret_key_2026
CLIENT_URL=http://localhost:5173
```

Seed the database with **Super Admin**, **Brotherhood Lounge**, and **RAJ FOOD CENTRE (RFC)** (107 dishes):
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

## 🔑 Pre-Seeded Demo Accounts

| Role | Restaurant | Email | Password | What's Included |
|---|---|---|---|---|
| **Owner** | **RAJ FOOD CENTRE (RFC)** | `rfc@restropilot.com` | `password123` | **107 dishes** (Starters, Tandoori, Curries, Biryani), Tables 1 to 10 |
| **Owner** | **Brotherhood Lounge & Dining** | `brotherhood@restropilot.com` | `password123` | Multi-Cuisine Chinese, Tandoori & Curries, Tables 1 to 5 |
| **Super Admin** | Platform Admin | `admin@restropilot.com` | `adminpassword123` | Manage and approve restaurant registrations |

---

## 🌐 Production Deployment

Complete step-by-step instructions with environment variable tables are documented in [DEPLOYMENT.md](DEPLOYMENT.md).

### Summary:
1. **Backend on Render**:
   - Root Directory: `server`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Environment Variables: `PORT`, `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`
2. **Frontend on Vercel**:
   - Root Directory: `client`
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Environment Variable: `VITE_API_BASE_URL=https://your-render-app.onrender.com/api`
3. **Synchronize QR Codes**:
   - Navigate to `/owner/tables` in production and click **"Sync with Current Domain"**. Download or print your table stand cards and scan with any smartphone camera!

---

## 📄 License

This project is licensed under the MIT License — feel free to customize and deploy for your restaurant business.

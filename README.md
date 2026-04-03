# Escobar — Custom Jersey Design Platform

A full-stack custom jersey design platform where users design their own jerseys, customize colors, add names, numbers, and logos, and place orders. Includes an admin panel and ready-made design marketplace.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite, Redux Toolkit |
| Design Editor | Fabric.js v5 |
| Backend | Node.js + Express (MVC) |
| Database | MongoDB + Mongoose |
| Image Storage | Cloudinary |
| Payments | Razorpay |
| Auth | JWT |

---

## Prerequisites

- **Node.js** v18 or higher (for native `fetch` in test script)
- **MongoDB** — local install **or** MongoDB Atlas free cluster
- **Cloudinary** account — [cloudinary.com](https://cloudinary.com) (free tier: 25GB)
- **Razorpay** account — [dashboard.razorpay.com](https://dashboard.razorpay.com) (test mode)

---

## 1 — Get Your API Keys

### MongoDB (local)
```
MONGO_URI=mongodb://localhost:27017/jersey_design
```
Or install MongoDB: https://www.mongodb.com/try/download/community

### MongoDB Atlas (cloud — no local install)
1. Create free cluster at https://cloud.mongodb.com
2. Database Access → Add User → username + password
3. Network Access → Add IP → 0.0.0.0/0 (allow all for dev)
4. Connect → Compass / Drivers → copy the connection string
```
MONGO_URI=mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/jersey_design
```

### Cloudinary
1. Sign up at https://cloudinary.com
2. Dashboard → copy **Cloud Name**, **API Key**, **API Secret**
```
CLOUDINARY_CLOUD_NAME=dxxxxxxxx
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Razorpay (Test Mode — no real money)
1. Sign up at https://dashboard.razorpay.com
2. Settings → API Keys → Generate Test Key
3. Copy **Key ID** (starts with `rzp_test_`) and **Key Secret**
```
RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXXXXXX
RAZORPAY_KEY_SECRET=XXXXXXXXXXXXXXXXXXXXXXXX
```

### JWT Secret
Generate a secure random secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## 2 — Environment Setup

```bash
# In the backend folder, create your .env from the template
cd backend
cp .env.example .env
```

Edit `backend/.env` and fill in **all** the values from Step 1:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/jersey_design

JWT_SECRET=<your_64_char_random_string>
JWT_EXPIRE=7d

CLOUDINARY_CLOUD_NAME=<your_cloud_name>
CLOUDINARY_API_KEY=<your_api_key>
CLOUDINARY_API_SECRET=<your_api_secret>

RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXXXXXX
RAZORPAY_KEY_SECRET=XXXXXXXXXXXXXXXXXXXXXXXX

CLIENT_URL=http://localhost:5173

ADMIN_NAME=Admin
ADMIN_EMAIL=admin@escobar.com
ADMIN_PASSWORD=Admin@123
```

---

## 3 — Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend (new terminal)
cd frontend
npm install
```

---

## 4 — Seed the Database

Creates admin user + 3 jersey templates + 2 ready-made designs:

```bash
cd backend
npm run seed
```

Output:
```
✅  MongoDB connected
✅  Admin created: admin@escobar.com  (role: admin)
✅  Jersey templates seeded: 3 new
✅  Ready-made designs seeded: 2 new

  Email   : admin@escobar.com
  Password: Admin@123
```

To wipe all data and re-seed from scratch:
```bash
npm run seed:clear
```

---

## 5 — Run the Project

Open **two terminals**:

**Terminal 1 — Backend**
```bash
cd backend
npm run dev
# Server running on port 5000
```

**Terminal 2 — Frontend**
```bash
cd frontend
npm run dev
# App running at http://localhost:5173
```

Open http://localhost:5173 in your browser.

---

## 6 — Test All APIs

With the backend running:

```bash
cd backend
npm run test:api
```

This runs `scripts/test-api.js` which tests:
- Health check
- Register + Login (admin & user)
- Jersey CRUD + auth guards
- Design save / update / delete
- Cart add / update / remove
- Orders list
- Payment key endpoint
- Admin stats / orders / users

Expected output: `Results: 22/22 passed`

> **Note:** The Razorpay `create-order` test may show a warning if your keys are not configured — that is expected. All other tests should pass.

---

## 7 — First-Time Admin Workflow

1. Log in at http://localhost:5173/login with `admin@escobar.com` / `Admin@123`
2. Go to **Admin Panel** → **Templates** → upload real jersey images (PNG/JPG with transparent background works best)
3. Go to **Ready-Made Designs** → upload pre-designed jerseys with a set price
4. The seeded templates use placeholder images — replace them after uploading real ones

---

## 8 — Key User Flows

| Flow | URL | Notes |
|---|---|---|
| Register | `/register` | Any email works |
| Browse templates | `/` | Seeded templates appear here |
| Open designer | `/designer/:jerseyId` | Fabric.js canvas |
| View cart | `/cart` | Add items from designer |
| Checkout | `/checkout` | Razorpay test mode |
| Order history | `/orders` | Status timeline |
| Admin dashboard | `/admin` | Requires admin role |

### Razorpay Test Card
When the Razorpay popup opens in test mode, use:
- **Card number:** `4111 1111 1111 1111`
- **Expiry:** Any future date
- **CVV:** Any 3 digits
- **OTP:** `1234` (if prompted)

---

## Project Structure

```
Escobar/
├── backend/
│   ├── config/          # DB + Cloudinary setup
│   ├── controllers/     # Business logic
│   ├── middleware/       # JWT auth guards
│   ├── models/          # Mongoose schemas
│   ├── routes/          # Express routers
│   ├── scripts/         # seed.js, test-api.js
│   ├── utils/           # generateToken.js
│   ├── .env.example
│   └── server.js
└── frontend/
    └── src/
        ├── api/         # Axios API layer
        ├── components/  # Navbar, guards
        ├── pages/       # All page components
        │   └── admin/   # Admin panel pages
        └── store/       # Redux slices
```

---

## Common Issues

| Problem | Fix |
|---|---|
| `ECONNREFUSED :5000` | Backend not running. Run `npm run dev` in `backend/` |
| `MongooseServerSelectionError` | MongoDB not running. Start it or check `MONGO_URI` |
| Cloudinary upload fails | Check `.env` credentials. Test at https://cloudinary.com/console |
| Razorpay popup doesn't open | Check browser console. Make sure `checkout.razorpay.com` script is loaded |
| Cart count not updating | Hard refresh the page once after login |
| `401 Unauthorized` on all requests | Token expired — log out and log in again |

# Maanak Labs

Premium full-stack seed testing laboratory website and request management platform for **Maanak Labs**.

**Tagline:** A Unit of Entorno Greens Seeds Private Limited

This repository includes:

- A premium, responsive public website
- User registration and login
- Online seed testing request system with multi-sample support
- Placeholder Razorpay-ready payment flow
- Branded PDF generation for request letter, sample slips, packing guide, and address label
- Admin dashboard for services, rates, requests, users, content, and blogs

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, React Router
- Backend: Node.js, Express
- Database: MongoDB with Mongoose
- Auth: JWT with password hashing
- Payments: Razorpay placeholder integration
- PDF: `pdf-lib`

## Key Features

### Public Pages

- Home
- About Maanak Labs
- Services
- Testing Process
- Rate List
- Sample Submission Guidelines
- Report Verification
- Blogs / Knowledge Center
- Contact Us
- Login / Register

### User Panel

- Register with business and billing details
- Login with email or mobile
- Create multi-sample testing requests
- Auto-generate request numbers like `ML-REQ-2026-0001`
- Auto-generate sample IDs like `ML-SMP-2026-0001-A`
- Calculate amounts from active service rates
- Complete payment in placeholder flow
- Download combined PDF after payment
- Track request lifecycle online
- Download final report after admin upload

### Admin Panel

- Secure admin login
- Dashboard metrics and revenue summary
- Request filtering and status updates
- Service and rate management
- User activation controls
- Report upload
- Website settings and blog management

## Sample Guidance Flow

The section **“How to Withdraw, Pack & Send Seed Samples”** is included on:

- Home page
- Sample Submission Guidelines page
- User dashboard
- PDF download page
- Generated PDF pack

Placeholder images are included at:

- `frontend/public/images/sample-withdrawal.jpg`
- `frontend/public/images/online-request.jpg`
- `frontend/public/images/print-sample-slip.jpg`
- `frontend/public/images/pack-sample-bag.jpg`
- `frontend/public/images/master-bag.jpg`
- `frontend/public/images/address-label.jpg`
- `frontend/public/images/courier-dispatch.jpg`
- `frontend/public/images/status-tracking.jpg`

## Compliance Note

The website intentionally does **not** claim accreditation. It uses placeholder language such as:

- `Accreditation in process / to be updated.`
- The lab follows scientific seed testing procedures and quality systems.

Reference context used for this wording:

- [NABL India - Introduction](https://nabl-india.org/introduction/)
- [ISO - ISO/IEC 17025 testing and calibration laboratories](https://www.iso.org/ISO-IEC-17025-testing-and-calibration-laboratories.html)
- [ISO/IEC 17025:2017 overview](https://www.iso.org/standard/66912.html)

## Project Structure

```text
.
├── backend
│   ├── src
│   ├── uploads/reports
│   ├── package.json
│   └── .env.example
├── frontend
│   ├── public/images
│   ├── src
│   ├── package.json
│   └── .env.example
├── API_ROUTES.md
├── DATABASE_SCHEMA.md
└── README.md
```

## Local Setup

### 1. Install dependencies

From the repository root:

```bash
npm install
npm run install:all
```

Or install per app:

```bash
cd backend && npm install
cd ../frontend && npm install
```

### 2. Configure environment variables

Backend:

```bash
cp backend/.env.example backend/.env
```

Frontend:

```bash
cp frontend/.env.example frontend/.env
```

Update values for:

- MongoDB connection string
- JWT secret
- Default admin credentials
- Razorpay keys
- Backend API URL in frontend env

### 3. Start development servers

Root:

```bash
npm run dev
```

Or separately:

```bash
cd backend && npm run dev
cd frontend && npm run dev
```

### 4. Default admin login

The backend bootstrap creates an admin from environment values:

- Email: value of `DEFAULT_ADMIN_EMAIL`
- Password: value of `DEFAULT_ADMIN_PASSWORD`

## Payment Integration Note

The current payment flow is a **placeholder scaffold**. Before production launch:

1. Replace `/api/payments/create-order` with official Razorpay order creation.
2. Replace `/api/payments/verify` with signature verification using Razorpay docs.
3. Save gateway transaction metadata and failure events.
4. Use webhooks for payment confirmation where appropriate.

## PDF Output

After payment, users can download a branded A4 PDF bundle containing:

1. Request Letter
2. Sample Bag Slips
3. Packing & Dispatch Instructions
4. Lab Address Label

## Deployment

### Frontend on Vercel

1. Import the repository in Vercel.
2. Set project root to `frontend`.
3. Add environment variable:
   - `VITE_API_URL=https://your-render-backend-url/api`
4. Use default Vite build settings:
   - Build command: `npm run build`
   - Output directory: `dist`

### Backend on Render

1. Create a new Web Service from the repository.
2. Set root directory to `backend`.
3. Build command:

```bash
npm install
```

4. Start command:

```bash
npm start
```

5. Configure environment variables:

- `PORT`
- `CLIENT_URL`
- `MONGODB_URI`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `DEFAULT_ADMIN_NAME`
- `DEFAULT_ADMIN_EMAIL`
- `DEFAULT_ADMIN_PASSWORD`
- `DEFAULT_ADMIN_MOBILE`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `LAB_CONTACT_MOBILE`
- `LAB_CONTACT_EMAIL`

6. Use MongoDB Atlas or another managed MongoDB instance for production.

## Verification Done

- Backend JavaScript syntax check passed with `node --check`
- Frontend production build passed with `npm run build`

## Notes

- The frontend includes simple, mobile-friendly UI with large readable controls.
- The backend seeds default services, rates, settings, blogs, and the default admin.
- Final report files are stored in `backend/uploads/reports`.
- For production, add stronger validation, official payment verification, centralized logging, and cloud file storage.

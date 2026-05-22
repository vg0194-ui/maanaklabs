# Azure Hosting Migration Guide

This app can move from Render to Azure with **minimal code changes**.

## Recommended Azure Architecture

### Frontend

- Service: **Azure Static Web Apps**
- Domain: `maanaklabs.com` or `www.maanaklabs.com`
- Build source: `frontend`

Why:

- best fit for React + Vite
- free SSL
- GitHub deployment integration
- SPA route fallback support through `staticwebapp.config.json`

### Backend

- Service: **Azure App Service (Linux, Node.js)**
- Domain: `api.maanaklabs.com`
- Runtime: Node.js 24
- Source: `backend`

Why:

- straightforward fit for Express
- easy environment variable management
- custom domain and TLS support

### Database

- Keep using **MongoDB Atlas** unless you explicitly want to migrate database hosting too.

## What Changes in This Repo

This repository now includes:

- `frontend/staticwebapp.config.json`
  - rewrites SPA routes to `index.html`
- `.github/workflows/azure-static-web-apps.yml`
  - deploys frontend to Azure Static Web Apps
- `.github/workflows/azure-backend-appservice.yml`
  - deploys backend to Azure App Service

## Azure Frontend Setup

Create an Azure Static Web App and connect this GitHub repo.

Use these values:

- App location: `frontend`
- Output location: `dist`
- Framework preset: `React`

Add frontend environment variable in Azure Static Web Apps:

```text
VITE_API_URL=https://api.maanaklabs.com/api
```

If you are using the auto-generated GitHub Action from Azure, make sure the deployment secret maps to:

```text
AZURE_STATIC_WEB_APPS_API_TOKEN_MAANAK
```

## Azure Backend Setup

Create an Azure App Service on Linux for Node.js.

Suggested values:

- App name: `maanaklabs-api`
- Runtime stack: Node 24 LTS
- Region: same region as your expected users or nearby

In Azure App Service configuration, add:

```text
SCM_DO_BUILD_DURING_DEPLOYMENT=true
WEBSITE_NODE_DEFAULT_VERSION=~24
```

Then add your backend app settings.

## Backend Environment Variables

Set these in Azure App Service > Environment variables:

```text
PORT=8080
CLIENT_URL=https://maanaklabs.com
CLIENT_URLS=https://www.maanaklabs.com
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
DEFAULT_ADMIN_NAME=Maanak Labs Admin
DEFAULT_ADMIN_EMAIL=your_admin_email
DEFAULT_ADMIN_PASSWORD=your_admin_password
DEFAULT_ADMIN_MOBILE=your_admin_mobile
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_razorpay_webhook_secret
LAB_CONTACT_MOBILE=your_lab_mobile
LAB_CONTACT_EMAIL=info@maanaklabs.com
SMTP_HOST=smtppro.zoho.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=info@maanaklabs.com
SMTP_PASS=your_zoho_password_or_app_password
MAIL_FROM=Maanak Labs <info@maanaklabs.com>
ADMIN_NOTIFICATION_EMAIL=info@maanaklabs.com
```

If you do not want SMTP right now, you can still deploy without the SMTP variables. The enquiry fallback will continue saving enquiries to MongoDB.

## Custom Domains

Recommended mapping:

- Frontend: `maanaklabs.com`
- Optional frontend alias: `www.maanaklabs.com`
- Backend: `api.maanaklabs.com`

Also update Razorpay webhook URL to:

```text
https://api.maanaklabs.com/api/payments/webhook
```

## Important File Storage Note

This app currently stores uploaded report and invoice files on the server filesystem under:

- `backend/uploads/reports`

That is acceptable for initial migration, but for stronger production durability you should later move these files to Azure Blob Storage.

## Deployment Order

1. Create Azure App Service for backend
2. Configure backend environment variables
3. Deploy backend
4. Test:
   - `GET /api/health`
   - login
   - request creation
5. Create Azure Static Web App for frontend
6. Set `VITE_API_URL`
7. Deploy frontend
8. Map domains
9. Update Razorpay webhook
10. Run full end-to-end test

## Recommended Validation Checklist

Before switching DNS fully:

1. Test admin login
2. Test user registration
3. Test request creation
4. Test PDF downloads
5. Test report upload/download
6. Test enquiry form
7. Test payment creation and webhook
8. Test frontend deep links like `/login`, `/about`, `/services/...`

## Official References

- Azure Static Web Apps deployment:
  - https://learn.microsoft.com/en-us/azure/static-web-apps/deploy-web-framework
- Azure Static Web Apps configuration:
  - https://learn.microsoft.com/en-us/azure/static-web-apps/configuration-overview
- Azure App Service for Node.js:
  - https://learn.microsoft.com/en-us/azure/app-service/configure-language-nodejs
- Azure App Service custom domains:
  - https://learn.microsoft.com/azure/app-service/app-service-web-tutorial-custom-domain
- Azure Static Web Apps custom domains:
  - https://learn.microsoft.com/en-us/azure/static-web-apps/custom-domain

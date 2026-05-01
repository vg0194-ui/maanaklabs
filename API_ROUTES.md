# API Route List

Base URL for local backend: `http://localhost:5000/api`

## Health

- `GET /health` - health check

## Authentication

- `POST /auth/register` - user registration
- `POST /auth/login` - user login with email or mobile
- `POST /auth/admin/login` - admin login
- `GET /auth/me` - fetch current authenticated user/admin

## Public Website Data

- `GET /public/content` - services, rates, settings, published blogs
- `GET /public/services/:slug` - single service detail
- `GET /public/blogs/:slug` - single blog detail
- `GET /public/report-verification/:code` - verify uploaded report code
- `GET /public/sample-packing-guide.pdf` - downloadable sample packing guide PDF

## User Request Flow

- `GET /requests` - list current user's requests
- `POST /requests` - create testing request with samples
- `GET /requests/:id` - request detail with samples and latest payment

## Payments

- `POST /payments/create-order` - create placeholder Razorpay order
- `POST /payments/verify` - mark payment complete in placeholder flow

## PDFs

- `GET /pdfs/requests/:requestId/combined` - combined branded PDF after successful payment

## Reports

- `GET /reports/:requestId/download` - download final report PDF
- `POST /reports/:requestId/upload` - admin upload of final report PDF

## Admin Dashboard

- `GET /admin/dashboard` - dashboard analytics cards
- `GET /admin/requests` - request list with filters
- `PATCH /admin/requests/:id/status` - update testing status

## Admin Services

- `GET /admin/services` - list all services
- `POST /admin/services` - create service
- `PATCH /admin/services/:id` - edit or activate/deactivate service

## Admin Rates

- `GET /admin/rates` - list current and historical rate records
- `POST /admin/rates` - create rate record
- `PATCH /admin/rates/:id` - update rate record

## Admin Users

- `GET /admin/users` - list users
- `PATCH /admin/users/:id/status` - activate/deactivate user

## Admin Website Content

- `GET /admin/settings` - fetch editable website settings
- `PATCH /admin/settings` - update homepage/about/contact/lab details/terms/compliance

## Admin Blogs

- `GET /admin/blogs` - list all blogs
- `POST /admin/blogs` - create blog
- `PATCH /admin/blogs/:id` - update blog
- `DELETE /admin/blogs/:id` - delete blog


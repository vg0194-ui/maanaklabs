# Maanak Labs Pre-Launch Checklist

## Payments

- Set `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, and `RAZORPAY_WEBHOOK_SECRET`.
- Configure Razorpay checkout in live mode.
- Subscribe a public HTTPS webhook for `payment.captured` and `order.paid`.
- Confirm payment capture settings in Razorpay Dashboard match your intended workflow.
- Run one complete live-mode test payment before launch.

## Security

- Set a strong `JWT_SECRET`.
- Restrict `CLIENT_URL` to the exact frontend origin.
- Replace bootstrap admin credentials immediately.
- Move report files to persistent cloud storage for production.
- Consider Redis-backed rate limiting and lockouts if you deploy multiple backend instances.

## Infrastructure

- Use managed MongoDB with backups and alerting.
- Verify Render/Vercel environment variables.
- Enable uptime monitoring and backend error alerting.
- Ensure HTTPS is enabled everywhere.

## Application Validation

- Test registration, login, request creation, payment, PDF download, report upload, and report download.
- Test admin login throttling and temporary lock behavior.
- Test report verification using real random tokens.
- Verify blog rendering with approved HTML only.
- Validate public and dashboard pages on mobile.

## Content and Compliance

- Replace placeholder contact/address content.
- Review live rates and sample guidance content.
- Keep NABL / ISO wording as placeholder until formally approved.
- Recheck generated PDFs for print layout and correct branding.

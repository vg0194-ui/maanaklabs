# Database Schema

This project uses MongoDB with Mongoose.

## User

- `name`
- `companyName`
- `mobile`
- `email`
- `gstNumber`
- `billingAddress`
- `passwordHash`
- `isActive`

## Admin

- `name`
- `email`
- `mobile`
- `passwordHash`
- `roleTitle`
- `isActive`
- `lastLoginAt`

## Service

- `name`
- `slug`
- `description`
- `sampleQuantity`
- `estimatedTestingTime`
- `rate`
- `isActive`
- `termsAndConditions`
- `icon`

## Rate

- `service`
- `crop`
- `amount`
- `gstPercentage`
- `effectiveDate`
- `isActive`

## TestingRequest

- `user`
- `requestNumber`
- `companyName`
- `contactName`
- `contactEmail`
- `contactMobile`
- `gstNumber`
- `billingAddressText`
- `totalSamples`
- `subtotalAmount`
- `gstAmount`
- `totalAmount`
- `paymentStatus`
- `requestStatus`
- `remarks`
- `generatedPdfPath`
- `latestReport`

## Sample

- `request`
- `sampleId`
- `crop`
- `variety`
- `lotNumber`
- `lotQuantity`
- `seedClass`
- `stage`
- `numberOfSamples`
- `selectedTests`
- `selectedTestNames`
- `remarks`
- `estimatedAmount`

## Payment

- `request`
- `user`
- `amount`
- `currency`
- `gateway`
- `razorpayOrderId`
- `razorpayPaymentId`
- `razorpaySignature`
- `status`
- `receiptNumber`
- `paidAt`

## Report

- `request`
- `uploadedByAdmin`
- `fileName`
- `filePath`
- `verificationCode`
- `status`

## WebsiteSettings

- `siteName`
- `siteTagline`
- `homeIntro`
- `aboutContent`
- `contactDetails`
- `termsAndConditions`
- `compliance`

## Blog

- `title`
- `slug`
- `excerpt`
- `content`
- `coverImage`
- `tags`
- `isPublished`
- `publishedAt`

## Counter

- `key`
- `year`
- `sequence`


# 🎯 Turnitin System - Quick Reference

## 📍 Routes

| Route | Purpose | Access |
|-------|---------|--------|
| `/turnitin/submit` | Submit documents for checking | Public |
| `/payment/gateway` | Select payment method | Public |
| `/payment/success` | Payment confirmation | Public |
| `/admin/turnitin-reports` | Upload reports to users | Admin Only |

---

## 🔧 Environment Variables

```env
# Email Service (Required for production)
VITE_RESEND_API_KEY=re_...

# File Upload (Required)
VITE_UPLOAD_BROKER_URL=https://upload-broker.yourworker.workers.dev

# Payment (Required)
VITE_STABLELINK_MERCHANT_ID=...
VITE_STABLELINK_API_KEY=...
```

---

## 📧 Email Notifications

| Trigger | Recipient | Template |
|---------|-----------|----------|
| User submits documents | Admin | "New Turnitin Submission" |
| User submits documents | User | "Submission Confirmed" |
| Payment successful | User | "Payment Receipt" |
| Payment successful | Admin | "Payment Received" |
| Admin uploads reports | User | "Reports Ready" (with download links) |

**Admin Email**: `admin@handywriterz.com` (hardcoded)

---

## 📁 File Validation Rules

| Rule | Value |
|------|-------|
| **Allowed Types** | `.doc`, `.docx`, `.md`, `.txt` ONLY |
| **Max Size** | 10MB per file |
| **Max Files** | 5 files per submission |
| **Storage** | Cloudflare R2 |
| **Link Expiry** | 30 days (for reports) |

---

## 💳 Payment Methods

| Method | Status | Fallback |
|--------|--------|----------|
| StableLink Credit Card | ✅ Full Integration | - |
| PayPal | ✅ Full Integration | - |
| Stripe/Paystack | 🟡 Partial (fallback to StableLink) | StableLink |
| Coinbase Commerce | 🟡 Redirect only | StableLink.xyz |

---

## 🗂️ Data Storage

| Data | Location | Key Format |
|------|----------|------------|
| Order Details | localStorage | `turnitin:{orderId}` |
| Uploaded Documents | R2 Bucket | `users/{userId}/turnitin/{timestamp}-{filename}` |
| Turnitin Reports | R2 Bucket | `reports/{orderId}/{reportNumber}.pdf` |

---

## 🎨 UI Components

### **Submission Form**
- Two-step flow: Form → Confirmation
- Gradient header (indigo-purple)
- Trust badges (Secure, Fast, Expert Support)
- File list with remove buttons

### **Payment Gateway**
- 4 payment method cards
- Hover effects (scale, shadow)
- Trust indicators (Lock, Shield, TrendingUp)
- Order summary display

### **Admin Reports**
- Order search input
- Submission details cards
- Dual PDF upload interface
- Success confirmations

---

## 🔐 Access Control

| Role | Access |
|------|--------|
| **Public** | Submission page, payment page |
| **Authenticated** | Dashboard + submission |
| **Admin** | All pages + reports management |

**Admin Check**: `useAuth().isAdmin` returns `true`

---

## 🚀 Quick Commands

```bash
# Start development server
cd apps/web && pnpm dev

# Start upload broker worker
cd workers/upload-broker && wrangler dev

# Type check
pnpm --filter web type-check

# Build for production
pnpm --filter web build

# Deploy
pnpm --filter web deploy
```

---

## 📊 Key Metrics

| Metric | Target |
|--------|--------|
| File upload time | < 5 seconds |
| Email delivery | < 10 seconds |
| Payment completion | < 30 seconds |
| Report upload | < 10 seconds |

---

## 🐛 Troubleshooting

### **Emails not sending**
→ Check `VITE_RESEND_API_KEY` is set and valid

### **File upload fails**
→ Check `VITE_UPLOAD_BROKER_URL` points to running worker

### **Payment fails**
→ Verify StableLink credentials in sandbox mode

### **Admin page blocked**
→ Check Clerk user metadata: `{ role: 'admin' }`

### **Order not found**
→ Check localStorage key: `turnitin:{orderId}`

---

## 📞 Support Contacts

**Email Service**: admin@handywriterz.com  
**Payment Support**: StableLink dashboard  
**File Storage**: Cloudflare R2 console  
**Auth Issues**: Clerk dashboard

---

## 🎓 Code Locations

| Feature | File Path |
|---------|-----------|
| Email Service | `apps/web/src/services/emailService.ts` |
| Submission Form | `apps/web/src/pages/TurnitinSubmission.tsx` |
| Payment Gateway | `apps/web/src/pages/payment/PaymentGateway.tsx` |
| Admin Reports | `apps/web/src/pages/admin/TurnitinReports.tsx` |
| Payment Success | `apps/web/src/pages/payment/success.tsx` |
| Router Config | `apps/web/src/router.tsx` |
| Environment | `apps/web/src/env.ts` |

---

## 📈 Analytics Events (TODO)

| Event | When | Data |
|-------|------|------|
| `turnitin_submission` | User submits | orderId, fileCount, email |
| `payment_completed` | Payment success | orderId, amount, method |
| `reports_uploaded` | Admin uploads | orderId, reportCount |
| `reports_downloaded` | User downloads | orderId, reportId |

---

## 🔄 User Flow Diagram

```
PUBLIC USER
  Homepage → /turnitin/submit → Upload Files
  → Confirmation → Submit → Email (admin + user)
  → /payment/gateway → Select Method → Pay
  → /payment/success → Email (admin + user)
  → Wait for Reports

ADMIN
  /admin/turnitin-reports → Search Order
  → View Details → Upload 2 PDFs
  → Submit → Email to User → Done
```

---

## ✅ Pre-Deployment Checklist

- [ ] All environment variables set
- [ ] Resend API key valid
- [ ] Upload broker deployed
- [ ] R2 bucket configured
- [ ] StableLink credentials valid
- [ ] PayPal credentials valid (optional)
- [ ] Admin users have correct Clerk metadata
- [ ] Email templates tested
- [ ] File upload tested (all file types)
- [ ] Payment flow tested (StableLink + PayPal)
- [ ] Admin workflow tested
- [ ] Error scenarios tested
- [ ] Mobile responsive tested
- [ ] Browser compatibility tested

---

## 📝 Quick Test Script

```bash
# 1. Navigate to submission
# Open: http://localhost:5173/turnitin/submit

# 2. Upload test file
# File: test.docx (under 10MB)
# Email: test@example.com

# 3. Submit and check emails
# Admin: admin@handywriterz.com
# User: test@example.com

# 4. Complete payment
# Use: StableLink test card

# 5. Admin upload reports
# Navigate: /admin/turnitin-reports
# Search: Order ID from step 2
# Upload: 2 PDFs

# 6. Verify user email
# Check: test@example.com inbox
# Verify: 2 download links work
```

---

**Last Updated**: December 2024  
**Version**: 1.0.0  
**Status**: Production Ready (95%)

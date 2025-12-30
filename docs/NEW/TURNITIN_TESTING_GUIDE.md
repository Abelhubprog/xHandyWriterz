# 🧪 Turnitin System - Testing Guide

## Quick Start Testing

### **Step 1: Start Development Server**
```bash
# Terminal 1: Start web app
cd apps/web
pnpm dev

# Terminal 2: Start upload broker worker (if not deployed)
cd workers/upload-broker
wrangler dev
```

### **Step 2: Set Environment Variables**
Create `apps/web/.env.local`:
```env
# Required for email functionality
VITE_RESEND_API_KEY=re_your_api_key_here

# Required for file uploads
VITE_UPLOAD_BROKER_URL=http://localhost:8787

# Existing payment variables
VITE_STABLELINK_MERCHANT_ID=your_merchant_id
VITE_STABLELINK_API_KEY=your_api_key
```

---

## 🎯 Test Scenario 1: Public User Submission

### **Navigation**
1. Open http://localhost:5173
2. Click "Check Turnitin" button in hero section
3. Should navigate to `/turnitin/submit`

### **File Upload**
1. Enter email: `test@example.com`
2. Click "Select Files" or drag & drop
3. ✅ Try valid file (.doc, .docx, .md, .txt) → Should accept
4. ❌ Try invalid file (.pdf, .jpg) → Should show error toast
5. Upload 2-3 files (under 10MB each)
6. Add notes: "This is a test submission"
7. Click "Continue to Confirmation"

### **Confirmation**
1. Review displayed details:
   - Email: test@example.com
   - Files: [list of uploaded files]
   - Notes: "This is a test submission"
   - Cost: $9.99 USD
2. Click "Submit & Proceed to Payment"

### **Expected Results**
- ✅ Success toast: "Submission received! Redirecting to payment..."
- ✅ Two emails sent (check console if no API key):
  - Admin email with submission details
  - User confirmation email
- ✅ Navigate to `/payment/gateway`
- ✅ Order stored in localStorage (key: `turnitin:{orderId}`)

---

## 💳 Test Scenario 2: Payment Selection

### **Payment Gateway Page**
1. Should see 4 payment method cards:
   - **StableLink Credit Card** (blue, "Most Popular" badge)
   - **PayPal** (PayPal blue, "Trusted" badge)
   - **Stripe/Paystack** (purple, "Fast" badge)
   - **Coinbase Commerce** (orange, "Crypto" badge)

2. Order summary displayed:
   - Order ID: `TURN-...`
   - Amount: $9.99 USD

3. Hover each card → Should scale up and glow

### **Test StableLink Payment**
1. Click "StableLink Credit Card" card
2. Should redirect to StableLink payment page
3. Complete test payment (use StableLink sandbox credentials)
4. On success, redirect to `/payment/success?order_id={orderId}&provider=stablelink`

### **Test PayPal Payment**
1. Click "PayPal" card
2. Should redirect to PayPal approval page
3. Approve payment
4. On success, redirect to `/payment/success?order_id={orderId}&provider=paypal&token={paypalOrderId}`

### **Expected Results**
- ✅ Success page displays "Payment Successful"
- ✅ Two more emails sent:
  - User payment confirmation
  - Admin payment received notification
- ✅ localStorage order cleared (to prevent duplicate emails)

---

## 👨‍💼 Test Scenario 3: Admin Report Upload

### **Prerequisites**
- Complete Scenario 1 & 2 first (need an order ID)
- Have 2 PDF files ready for upload

### **Admin Access**
1. Login as admin user (Clerk metadata: `role: 'admin'`)
2. Navigate to `/admin/turnitin-reports`
3. ❌ If not admin → Should redirect to `/dashboard` with error toast

### **Search Order**
1. Enter order ID from Scenario 1 (check confirmation email)
2. Click "Search Order"
3. Should display:
   - Customer email
   - Order ID
   - Timestamp
   - Amount ($9.99)
   - Submitted documents list
   - Customer notes

### **Upload Reports**
1. Click "Choose PDF File" for Report 1
2. ✅ Select PDF file → Should accept
3. ❌ Try non-PDF file → Should reject
4. Click "Choose PDF File" for Report 2
5. Select another PDF
6. Click "Upload & Send Reports"

### **Expected Results**
- ✅ Loading state shown during upload
- ✅ Both PDFs uploaded to R2
- ✅ Presigned download URLs generated (30-day expiry)
- ✅ Email sent to user with report links
- ✅ Success toast: "Reports sent successfully!"
- ✅ Form cleared (ready for next order)

### **Verify Email**
1. Check user email inbox (test@example.com)
2. Should receive "Turnitin Reports Ready" email
3. Email should contain:
   - Order ID
   - 2 download links (Report 1 & Report 2)
   - 30-day expiration notice
4. Click each link → PDF should download

---

## 📱 Test Scenario 4: Dashboard Navigation

### **From Dashboard**
1. Login and navigate to `/dashboard`
2. Scroll to services section
3. Find "Turnitin Check" card (🔍 icon)
4. Description: "Plagiarism detection & originality report"
5. Click card → Should navigate to `/turnitin/submit`

---

## 🏠 Test Scenario 5: Homepage Navigation

### **From Homepage**
1. Navigate to `/`
2. Find "Check Turnitin" button in hero section
3. Click button → Should navigate to `/turnitin/submit`
4. Scroll to tools/services section
5. Find "Plagiarism Checker" card
6. Click "Check Turnitin" link → Should navigate to `/turnitin/submit`

---

## ⚠️ Error Scenarios

### **Invalid File Types**
1. Go to `/turnitin/submit`
2. Try uploading:
   - ❌ .pdf → Error: "Invalid file type"
   - ❌ .jpg → Error: "Invalid file type"
   - ❌ .png → Error: "Invalid file type"
   - ❌ .exe → Error: "Invalid file type"
   - ✅ .doc → Success
   - ✅ .docx → Success
   - ✅ .md → Success
   - ✅ .txt → Success

### **File Size Limit**
1. Try uploading file > 10MB
2. Should show error: "File too large. Maximum size: 10MB"

### **Too Many Files**
1. Try uploading > 5 files
2. Should show error: "Maximum 5 files allowed"

### **Missing Required Fields**
1. Leave email empty → Click "Continue"
2. Should show validation error
3. Upload no files → Click "Continue"
4. Should show error: "Please select at least one file"

### **Missing Environment Variables**
1. Remove `VITE_RESEND_API_KEY` from env
2. Submit form
3. Should still work but log to console instead of sending emails
4. Remove `VITE_UPLOAD_BROKER_URL`
5. Should show alert on documents upload page

### **Admin Access Control**
1. Logout or login as non-admin user
2. Try navigating to `/admin/turnitin-reports`
3. Should redirect to `/dashboard` with error toast

### **Invalid Order ID**
1. Admin page: Search for non-existent order ID
2. Should show "No submission found" message

---

## 📊 Checklist Summary

### **Submission Flow** ✅
- [ ] Navigate to submission page from homepage
- [ ] Navigate to submission page from dashboard
- [ ] File type validation works
- [ ] File size validation works
- [ ] Multi-file upload works
- [ ] Email notifications sent (admin + user)
- [ ] Redirect to payment page works
- [ ] Order stored in localStorage

### **Payment Flow** ✅
- [ ] Payment gateway displays all 4 methods
- [ ] StableLink payment works
- [ ] PayPal payment works
- [ ] Payment success page works
- [ ] Payment confirmation emails sent

### **Admin Flow** ✅
- [ ] Admin can access reports page
- [ ] Non-admin redirected
- [ ] Order search works
- [ ] Submission details display
- [ ] PDF upload validation works
- [ ] Reports uploaded to R2
- [ ] User receives email with links
- [ ] Download links work

### **Navigation** ✅
- [ ] Homepage Turnitin links work
- [ ] Dashboard Turnitin card works
- [ ] All routes accessible

---

## 🐛 Common Issues & Solutions

### **Issue**: Emails not sending
**Solution**: 
- Check `VITE_RESEND_API_KEY` is set
- Verify API key is valid at resend.com
- Check console for fallback logs

### **Issue**: File upload fails
**Solution**:
- Check `VITE_UPLOAD_BROKER_URL` is set
- Verify upload broker worker is running
- Check R2 bucket configuration

### **Issue**: Payment redirect fails
**Solution**:
- Verify StableLink credentials
- Check payment gateway configuration
- Test in sandbox mode first

### **Issue**: Admin page not accessible
**Solution**:
- Check Clerk user metadata: `role: 'admin'`
- Verify `isAdmin` hook working
- Check console for auth errors

---

## 📝 Manual Testing Report Template

```markdown
## Test Report - Turnitin System

**Date**: [Date]
**Tester**: [Name]
**Environment**: [Local/Staging/Production]
**Browser**: [Chrome/Firefox/Safari/Edge]

### Submission Flow
- [ ] ✅ File upload works
- [ ] ✅ Validation works
- [ ] ✅ Emails sent
- [ ] ✅ Payment redirect works
- **Issues**: [None / List issues]

### Payment Flow
- [ ] ✅ StableLink payment works
- [ ] ✅ PayPal payment works
- [ ] ✅ Success page works
- **Issues**: [None / List issues]

### Admin Flow
- [ ] ✅ Reports page accessible
- [ ] ✅ Search works
- [ ] ✅ PDF upload works
- [ ] ✅ Email sent
- **Issues**: [None / List issues]

### Navigation
- [ ] ✅ All links work
- **Issues**: [None / List issues]

### Overall Status
- **Ready for Production**: [Yes / No]
- **Critical Issues**: [None / List]
- **Recommendations**: [List]
```

---

## 🚀 Next Steps After Testing

1. **Fix any issues found during testing**
2. **Deploy to staging environment**
3. **Test with real Resend API key**
4. **Test with real payment credentials**
5. **Get stakeholder approval**
6. **Deploy to production**
7. **Monitor for errors**
8. **Gather user feedback**

---

**Testing Time Estimate**: 1-2 hours for complete walkthrough  
**Recommended**: Test on multiple browsers and devices

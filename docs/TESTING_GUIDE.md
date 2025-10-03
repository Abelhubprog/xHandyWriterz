# UI/UX Testing Guide - HandyWriterz

## Quick Testing Checklist

### 1. Admin Login Page (`/admin-login`)

#### Visual Testing:
- [ ] Page loads with gradient background
- [ ] Animated blobs visible and moving smoothly
- [ ] Form centered and properly styled
- [ ] Password toggle icon switches between Eye/EyeOff
- [ ] Security notice displayed with Lock icon
- [ ] Features footer shows three badges

#### Dark Mode Testing:
- [ ] Toggle to dark mode (use theme switcher)
- [ ] Background changes to dark gray
- [ ] Text remains readable (white on dark)
- [ ] Form inputs have dark background
- [ ] Button gradients still visible
- [ ] Icons maintain proper colors

#### Functionality Testing:
- [ ] Email input accepts valid email format
- [ ] Password field masks input
- [ ] Password toggle reveals/hides password
- [ ] Submit button shows loading state
- [ ] Form validation prevents empty submission
- [ ] Error messages display properly

#### Responsive Testing:
- [ ] Mobile (375px): Single column, proper spacing
- [ ] Tablet (768px): Centered with adequate margins
- [ ] Desktop (1440px): Centered, not too wide

---

### 2. Dashboard Dark Mode (`/dashboard`)

#### Header Testing:
- [ ] Background switches white ↔ dark gray
- [ ] Logo visible in both modes
- [ ] User name readable
- [ ] Logout button has proper contrast
- [ ] Theme toggle icon changes (Sun/Moon)

#### Sidebar Testing:
- [ ] Background matches theme
- [ ] Navigation items readable
- [ ] Active tab highlighted properly
- [ ] Hover states work in both modes
- [ ] Icons visible and colored correctly

#### Main Content Testing:
- [ ] Welcome card styled correctly
- [ ] "No orders" empty state readable
- [ ] Service selection cards have proper contrast
- [ ] Order form inputs styled for dark mode
- [ ] Buttons maintain gradient in dark mode

---

### 3. New Order Flow (`/dashboard/new-order`)

#### Subject Area Selection:
- [ ] Six area cards displayed in grid
- [ ] Cards responsive (1 col mobile, 2 col tablet, 3 col desktop)
- [ ] Hover effects work
- [ ] Click navigates to service selection
- [ ] Icons and text clearly visible

#### Service Type Selection:
- [ ] Back button works
- [ ] Five service cards displayed
- [ ] Each card shows icon and description
- [ ] Hover effects applied
- [ ] Click navigates to order form
- [ ] Dark mode styling correct

#### Order Form:
- [ ] Back button returns to service selection
- [ ] All form fields present:
  - Word count (with validation 100-100,000)
  - Study level dropdown
  - Due date picker
  - Module field
  - Instructions textarea
  - File upload button
- [ ] Price calculator shows estimate
- [ ] Calculator icon shows/hides breakdown
- [ ] File upload accepts multiple files
- [ ] File list displays with sizes
- [ ] Remove file buttons work
- [ ] Submit button enabled only when valid
- [ ] Dark mode styling throughout

#### File Upload Testing:
- [ ] Click triggers file picker
- [ ] Multiple files can be selected
- [ ] Files over 100MB rejected
- [ ] More than 10 files rejected
- [ ] File list updates correctly
- [ ] File sizes formatted (KB/MB)
- [ ] Remove individual files works
- [ ] Upload progress shows (if implemented)

#### Price Calculation:
- [ ] Updates when word count changes
- [ ] Updates when study level changes
- [ ] Updates when due date changes
- [ ] Dissertation uses higher rate
- [ ] Level 7 uses higher rate
- [ ] Urgent (<2 days) uses higher rate
- [ ] Price displays in GBP format (£X.XX)

---

### 4. Text Contrast Testing

#### Light Mode:
- [ ] All text readable against backgrounds
- [ ] Minimum contrast ratio 4.5:1 (WCAG AA)
- [ ] Links distinguishable from regular text
- [ ] Disabled elements clearly different

#### Dark Mode:
- [ ] All text readable against dark backgrounds
- [ ] No eye strain from bright text
- [ ] Links visible but not glaring
- [ ] Form placeholders visible

#### Specific Elements to Check:
- [ ] Navigation item labels
- [ ] Form labels and helpers
- [ ] Button text
- [ ] Card descriptions
- [ ] Empty state messages
- [ ] Price displays
- [ ] File names in upload list

---

### 5. Responsive Design Testing

#### Mobile (375px - iPhone SE):
- [ ] Admin login form fits screen
- [ ] Dashboard sidebar converts to mobile menu (if implemented)
- [ ] Service cards stack vertically
- [ ] Order form inputs full width
- [ ] File upload area accessible
- [ ] No horizontal scrolling

#### Tablet (768px - iPad):
- [ ] Service cards 2 columns
- [ ] Order form comfortable width
- [ ] Sidebar and content balanced
- [ ] Touch targets adequate size (44x44px min)

#### Desktop (1440px+):
- [ ] Service cards 3 columns
- [ ] Content not too wide (max-w-7xl)
- [ ] Sidebar fixed width
- [ ] Whitespace balanced

---

### 6. Keyboard Navigation Testing

- [ ] Tab moves through all interactive elements
- [ ] Tab order logical (top to bottom, left to right)
- [ ] Focus indicators visible
- [ ] Enter submits forms
- [ ] Escape closes modals (if any)
- [ ] Arrow keys work in select dropdowns
- [ ] File upload accessible via keyboard

---

### 7. Error Handling Testing

#### Admin Login:
- [ ] Empty email shows validation
- [ ] Invalid email format rejected
- [ ] Empty password shows validation
- [ ] Network error handled gracefully
- [ ] Loading state prevents double submission

#### Order Form:
- [ ] Word count below 100 rejected
- [ ] Word count above 100,000 rejected
- [ ] Future date required for due date
- [ ] No files shows appropriate message
- [ ] File size limit enforced
- [ ] File count limit enforced
- [ ] Network errors show toast notification

---

### 8. Integration Testing

#### File Upload to R2:
- [ ] Files upload to Cloudflare R2
- [ ] Presigned URLs generated
- [ ] Upload progress tracked
- [ ] Success notification shown
- [ ] Files accessible via download link
- [ ] Admin receives notification

#### Payment Navigation:
- [ ] Order data passed correctly
- [ ] Payment page receives all details
- [ ] Price matches calculated amount
- [ ] File references included
- [ ] User can return to dashboard

#### Messaging Integration:
- [ ] Mattermost embed loads (if `VITE_MATTERMOST_URL` set)
- [ ] Or shows helpful alert if not configured
- [ ] Messages can be sent/received
- [ ] File attachments work in chat

---

### 9. Performance Testing

- [ ] Admin login page loads < 1 second
- [ ] Dashboard loads < 2 seconds
- [ ] Dark mode toggle instant response
- [ ] Form inputs responsive (no lag)
- [ ] File selection opens immediately
- [ ] Large files don't freeze UI
- [ ] Navigation transitions smooth
- [ ] No memory leaks during extended use

---

### 10. Browser Compatibility

#### Chrome (Latest):
- [ ] All features work
- [ ] Styling consistent
- [ ] No console errors

#### Firefox (Latest):
- [ ] All features work
- [ ] Dark mode styling correct
- [ ] Form validation works

#### Safari (Latest):
- [ ] Date picker styled correctly
- [ ] File upload works
- [ ] Gradients render properly

#### Edge (Latest):
- [ ] No IE-specific issues
- [ ] Modern features supported

---

## Automated Testing Commands

### Type Check:
```bash
pnpm --filter web type-check
# Should pass with 0 errors after fixes
```

### Lint:
```bash
pnpm --filter web lint
# Check for code quality issues
```

### Build:
```bash
pnpm --filter web build
# Ensure production build succeeds
```

### Development Server:
```bash
pnpm --filter web dev
# Starts dev server at http://localhost:5173
```

---

## Known Issues & Limitations

### Current Limitations:
1. Dark mode not complete throughout entire Dashboard (lines 1200-2036 pending)
2. Some text-gray-400 instances remain (7 found in grep)
3. File sharing end-to-end not fully tested with R2
4. Messaging center requires `VITE_MATTERMOST_URL` environment variable

### Workarounds:
1. Continue using dashboard in sections with dark mode complete
2. Temporarily use light mode for incomplete sections
3. Configure environment variables before testing messaging
4. Manual file upload testing until R2 fully configured

---

## Bug Reporting Template

When reporting issues, please include:

```
**Page/Component:** (e.g., Admin Login, Dashboard Order Form)
**Browser:** (e.g., Chrome 120.0)
**Device:** (e.g., iPhone 14, Desktop 1920x1080)
**Theme:** (Light/Dark)
**Steps to Reproduce:**
1.
2.
3.

**Expected Behavior:**

**Actual Behavior:**

**Screenshots:** (if applicable)

**Console Errors:** (if any)
```

---

## Success Criteria

### Minimum Viable Product (MVP):
- ✅ Admin login functional and styled
- ✅ Dashboard accessible and usable
- ✅ Order form accepts submissions
- ✅ Dark mode works in tested sections
- ✅ Text readable in both themes
- ✅ File upload validates correctly

### Full Release Criteria:
- [ ] Dark mode 100% complete
- [ ] All text contrast WCAG AA compliant
- [ ] End-to-end user flows tested
- [ ] File sharing verified with R2
- [ ] Cross-browser tested
- [ ] Mobile fully responsive
- [ ] No critical bugs remaining

---

## Testing Team Assignments

### Frontend QA:
- Admin login styling and functionality
- Dark mode visual consistency
- Responsive design across devices

### Integration QA:
- File upload to R2
- Order submission flow
- Payment navigation
- Messaging center

### Accessibility QA:
- Keyboard navigation
- Screen reader compatibility
- Color contrast validation
- ARIA attributes

### Performance QA:
- Page load times
- Animation smoothness
- Memory usage
- Network efficiency

---

**Testing Duration Estimate:** 4-6 hours for comprehensive testing
**Priority:** HIGH - User-facing improvements
**Status:** Ready for QA (sections completed), In Progress (sections pending)

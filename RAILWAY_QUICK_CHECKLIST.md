# Railway Deployment - Quick Checklist

## 🎯 IMMEDIATE ACTIONS REQUIRED

### Web Service (xHandyWriterz) - FIX 404 ERROR
```
1. Railway → handywriterz-production → xHandyWriterz → Settings
2. Source section → Root Directory
3. Change: /apps/web → .
4. Click: Update
5. Wait for auto-redeploy (or click Deploy → Redeploy)
```

**Expected**: https://xhandywriterz-production.up.railway.app/ shows your React app

---

### Mattermost Service - CONFIGURE NEW SERVICE
```
1. Railway → handywriterz-production → Mattermost service → Settings
2. Source section → Root Directory = .
3. Config-as-code section → Path = apps/mattermost/railway.json
4. Click: Apply changes
5. Add environment variables (DB, R2 credentials)
6. Deploy service
```

**Expected**: Mattermost login page accessible

---

## 📋 Simple Verification

### Web ✓
- [ ] Root Directory = `.` (not /apps/web)
- [ ] Redeploy completed
- [ ] Domain loads app (not 404 error)

### Mattermost ✓
- [ ] Root Directory = `.`
- [ ] Config path = `apps/mattermost/railway.json`
- [ ] Env vars set
- [ ] Deploy succeeded

---

## 🆘 If Still Stuck

**Web 404 persists**:
- Double-check Root Directory is exactly `.` (single dot, no slash)
- Force redeploy after changing setting
- Check build logs in Railway

**Mattermost won't start**:
- Verify Postgres connection string
- Check R2 credentials
- Review Mattermost container logs

---

**Files Ready**: All code committed (f18ba90)  
**Waiting On**: You to update Root Directory in Railway UI  
**Time Required**: ~5 minutes total

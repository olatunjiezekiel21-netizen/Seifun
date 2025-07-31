# 🚀 Seifu Manual Testing Guide

## 🌐 **Application Access**
- **Local Development**: http://localhost:8081
- **Production**: https://seifu-zeta.vercel.app (if deployed)

---

## 📋 **Test Checklist**

### ✅ **1. Application Loading & Branding**
- [ ] Application loads without errors
- [ ] Page title shows "Seifu Token Verifier & Launchpad Platform"
- [ ] Seifu logo and branding visible
- [ ] Navigation menu displays correctly

### ✅ **2. Navigation Updates (MemeHub → seifun.launch)**
- [ ] Navigation shows "seifun.launch" instead of "MemeHub"
- [ ] URL `/seifun-launch` works correctly
- [ ] Mobile navigation updated
- [ ] All internal links point to correct routes

### ✅ **3. Enhanced Wallet Connection**
**Desktop Testing:**
- [ ] Click "Connect Wallet" button
- [ ] Wallet selection dropdown appears
- [ ] Shows available wallet options:
  - [ ] Sei Wallet (if installed)
  - [ ] Compass Wallet (if installed) 
  - [ ] Keplr Wallet (if installed)
  - [ ] MetaMask (if installed)
- [ ] Each wallet option shows description
- [ ] Can switch between wallets
- [ ] Wallet type indicator appears when connected
- [ ] Disconnect functionality works

**Mobile Testing:**
- [ ] Wallet connection works on mobile
- [ ] Responsive wallet selection interface

### ✅ **4. Token Scanner - Real Sei Integration**
**Test Addresses:**
```
# Test with these sample addresses:
Valid ERC20: 0x1234567890123456789012345678901234567890
Wallet Address: 0x742d35Cc6634C0532925a3b8D2B2E3D4C3e3E3E3
Invalid: 0x123 (too short)
```

**Scanner Tests:**
- [ ] Enter valid token contract address
- [ ] Scanner shows "Analyzing..." progress
- [ ] Real token data displays (name, symbol, supply)
- [ ] Token logo loads (if available)
- [ ] Safety analysis shows real results
- [ ] Enter wallet address → Shows warning + balance
- [ ] Enter invalid address → Shows error message
- [ ] Scanner remembers scan history

### ✅ **5. Safety & Security Features**
**Risk Analysis:**
- [ ] Ownership analysis (renounced/multisig)
- [ ] Liquidity checks
- [ ] Honeypot detection
- [ ] Tax/fee analysis
- [ ] Blacklist function detection
- [ ] Verification status display
- [ ] Overall risk score calculation

**Visual Indicators:**
- [ ] Green checkmarks for safe features
- [ ] Yellow warnings for medium risk
- [ ] Red alerts for high risk
- [ ] Clear risk explanations

### ✅ **6. seifun.launch Page**
- [ ] Navigate to `/seifun-launch`
- [ ] Page loads with token grid
- [ ] Filter options work
- [ ] Token cards display real data
- [ ] Grid/list view toggle
- [ ] Search functionality
- [ ] Responsive on mobile

### ✅ **7. Real Token Data Display**
**Token Information:**
- [ ] Real token names (not "SampleToken")
- [ ] Actual token symbols
- [ ] Real market prices (from CoinGecko)
- [ ] Volume and market cap data
- [ ] Verified token badges
- [ ] Token logos from multiple sources

**Data Sources:**
- [ ] Sei blockchain RPC calls
- [ ] CoinGecko API integration
- [ ] Trust Wallet assets
- [ ] Fallback data handling

### ✅ **8. Mobile Responsiveness**
**Viewport Tests:**
- [ ] iPhone (375px): Navigation, scanner, wallet
- [ ] iPad (768px): Layout adjusts properly
- [ ] Desktop (1280px+): Full feature access

**Mobile Features:**
- [ ] Hamburger menu works
- [ ] Touch-friendly buttons
- [ ] Readable text sizes
- [ ] Proper spacing

### ✅ **9. Performance & Loading**
- [ ] Initial page load < 3 seconds
- [ ] Token scanning < 5 seconds
- [ ] Smooth animations
- [ ] No layout shifts
- [ ] Images load properly
- [ ] No console errors

### ✅ **10. Error Handling**
**Network Issues:**
- [ ] Offline mode handling
- [ ] API timeout handling
- [ ] Fallback data display
- [ ] User-friendly error messages

**Invalid Input:**
- [ ] Invalid addresses rejected
- [ ] Clear error messages
- [ ] Graceful recovery

---

## 🔍 **Detailed Test Scenarios**

### **Scenario A: New User Journey**
1. Visit homepage
2. See token scanner
3. Try scanning without wallet connection
4. Connect wallet
5. Scan a real token
6. Review safety analysis
7. Navigate to seifun.launch
8. Explore token listings

### **Scenario B: Token Analysis Flow**
1. Enter token address: `0x...` (real Sei token)
2. Watch scanning progress
3. Review token information
4. Check safety scores
5. View risk factors
6. Compare with known safe tokens

### **Scenario C: Wallet Integration**
1. Try connecting different wallets
2. Switch between wallets
3. Check wallet balance display
4. Test disconnect/reconnect
5. Verify persistent connection

---

## 🐛 **Common Issues to Check**

### **Potential Problems:**
- [ ] Wallet connection failures
- [ ] API rate limiting
- [ ] Token logo loading issues
- [ ] Mobile layout problems
- [ ] Scanner timeout errors

### **Performance Issues:**
- [ ] Slow initial load
- [ ] Memory leaks
- [ ] API response delays
- [ ] Image loading delays

---

## 📊 **Success Criteria**

### **Must Pass:**
- ✅ All navigation links work
- ✅ Wallet connection functional
- ✅ Token scanner returns real data
- ✅ Safety analysis provides insights
- ✅ Mobile responsive
- ✅ No critical console errors

### **Should Pass:**
- ✅ Fast loading times
- ✅ Smooth animations
- ✅ Real token logos display
- ✅ Comprehensive error handling
- ✅ Intuitive user experience

---

## 🚀 **Next Steps After Testing**

1. **Document Issues**: Note any bugs or improvements
2. **Performance Optimization**: If needed
3. **User Feedback**: Gather real user testing
4. **Production Deployment**: Deploy to live environment
5. **Monitoring**: Set up error tracking and analytics

---

## 📞 **Support**

If you encounter issues during testing:
1. Check browser console for errors
2. Verify wallet extensions are installed
3. Ensure network connectivity
4. Try different browsers
5. Test on different devices

**Test Environment:**
- Node.js version: Latest LTS
- Browser: Chrome/Firefox/Safari
- Network: Stable internet connection
- Wallets: Install test wallet extensions
# 🧪 **AI Transfer Testing Guide - Step by Step**

## 🎯 **How to Test the Robust AI Transfer System**

### **🚀 Prerequisites:**
1. **Dev Server Running**: `npm run dev`
2. **Browser Console Open**: F12 → Console tab
3. **Navigate to**: `http://localhost:5173/seilor`

---

## 📝 **Test Commands & Expected Results**

### **✅ Test 1: Valid Transfer Request**

**Command:**
```
Send 10 SEI to 0x1234567890123456789012345678901234567890
```

**Expected Console Output:**
```
🎯 SEND_TOKENS intent recognized!
📝 Message: Send 10 SEI to 0x1234567890123456789012345678901234567890
🔄 Normalized: send 10 sei to 0x1234567890123456789012345678901234567890
📊 Transfer entities: {recipient: "0x1234567890123456789012345678901234567890", transferAmount: 10}
🔍 ExecuteSendTokens called with entities: {recipient: "0x1234567890123456789012345678901234567890", transferAmount: 10}
✅ Validation passed, checking balance...
✅ Balance retrieved: [ACTUAL BALANCE]
```

**Expected AI Response:**
```
💸 Transfer Confirmation Required

📊 Transaction Details:
• Amount: 10 SEI
• Recipient: 0x1234567890123456789012345678901234567890
• Current Balance: [ACTUAL BALANCE] SEI
• After Transfer: [REMAINING] SEI

⚠️ Please confirm this transaction
Reply: "Yes, confirm" or "Cancel"

🔒 This will execute a real blockchain transaction
```

---

### **❌ Test 2: Insufficient Balance**

**Command:**
```
Send 10000 SEI to 0x1234567890123456789012345678901234567890
```

**Expected Console Output:**
```
🎯 SEND_TOKENS intent recognized!
🔍 ExecuteSendTokens called with entities: {recipient: "0x1234567890123456789012345678901234567890", transferAmount: 10000}
✅ Validation passed, checking balance...
✅ Balance retrieved: [ACTUAL BALANCE]
❌ Insufficient balance: {available: [NUMBER], requested: 10000}
```

**Expected AI Response:**
```
❌ Insufficient Balance

Available: [ACTUAL] SEI
Requested: 10000 SEI
Shortfall: [DIFFERENCE] SEI

💡 Try: A smaller amount or check your balance
```

---

### **❌ Test 3: Invalid Address**

**Command:**
```
Send 50 SEI to invalid_address
```

**Expected Console Output:**
```
🎯 SEND_TOKENS intent recognized!
📝 Message: Send 50 SEI to invalid_address
📊 Transfer entities: {transferAmount: 50}
🔍 ExecuteSendTokens called with entities: {transferAmount: 50}
❌ Missing transfer details: {transferAmount: 50, recipient: undefined}
```

**Expected AI Response:**
```
❌ Missing transfer details

Usage: "Send 50 SEI to 0x1234..."
Need: Amount and recipient address

Debug: Amount=50, Recipient=undefined
```

---

### **❌ Test 4: Missing Recipient**

**Command:**
```
Send 50 SEI
```

**Expected Console Output:**
```
🎯 SEND_TOKENS intent recognized!
📊 Transfer entities: {transferAmount: 50}
🔍 ExecuteSendTokens called with entities: {transferAmount: 50}
❌ Missing transfer details: {transferAmount: 50, recipient: undefined}
```

**Expected AI Response:**
```
❌ Missing transfer details

Usage: "Send 50 SEI to 0x1234..."
Need: Amount and recipient address

Debug: Amount=50, Recipient=undefined
```

---

### **✅ Test 5: Confirmation Flow**

**Step 1 - Send valid request:**
```
Send 5 SEI to 0x1234567890123456789012345678901234567890
```

**Step 2 - Confirm:**
```
Yes, confirm
```

**Expected Result:**
- Real blockchain transaction executed
- Transaction hash displayed
- Success confirmation

**Step 3 - Alternative cancellation:**
```
Cancel
```

**Expected Result:**
```
🚫 Transfer Cancelled

Amount: 5 SEI
Recipient: 0x1234567890123456789012345678901234567890

✅ Your funds remain safe in your wallet
```

---

## 🔍 **Debugging Checklist**

### **If Nothing Happens:**

1. **Check Console for Errors:**
   - Look for red error messages
   - Check if services loaded properly

2. **Verify Intent Recognition:**
   - Should see: `🎯 SEND_TOKENS intent recognized!`
   - If not, check pattern matching

3. **Check Balance Service:**
   - Should see: `✅ Balance retrieved: [NUMBER]`
   - If error, check CambrianSeiAgent connection

4. **Verify Entity Extraction:**
   - Should see: `📊 Transfer entities: {...}`
   - Check if amount and recipient extracted correctly

---

## 🛠️ **Common Issues & Solutions**

### **❌ Issue: "Intent not recognized"**
**Solution:** Check message format - use exact pattern like "Send 10 SEI to 0x..."

### **❌ Issue: "Balance check failed"**
**Solution:** Check network connection and CambrianSeiAgent initialization

### **❌ Issue: "Missing transfer details"**
**Solution:** Ensure both amount and valid address are provided

### **❌ Issue: "No response from AI"**
**Solution:** Check browser console for errors, refresh page

---

## 🎯 **Success Indicators**

### **✅ Working Correctly When:**

1. **Console shows all debug messages**
2. **Intent recognition works** (`🎯 SEND_TOKENS intent recognized!`)
3. **Balance checking succeeds** (`✅ Balance retrieved`)
4. **Proper validation occurs** (address format, sufficient funds)
5. **Confirmation requests appear**
6. **Follow-up responses work** (Yes/Cancel)

---

## 📊 **Test Results Template**

Copy and fill this out:

```
🧪 AI Transfer Test Results

✅ Test 1 (Valid Transfer): [PASS/FAIL]
❌ Test 2 (Insufficient Balance): [PASS/FAIL] 
❌ Test 3 (Invalid Address): [PASS/FAIL]
❌ Test 4 (Missing Recipient): [PASS/FAIL]
✅ Test 5 (Confirmation Flow): [PASS/FAIL]

Console Debug Messages: [VISIBLE/NOT VISIBLE]
Balance Checking: [WORKING/FAILING]
Entity Extraction: [WORKING/FAILING]
Confirmation System: [WORKING/FAILING]

Overall Status: [FULLY FUNCTIONAL/NEEDS DEBUGGING]
```

---

## 🚀 **Next Steps After Testing**

### **If All Tests Pass:**
- Remove debug console.log statements
- Test with real small amounts
- Deploy to production

### **If Tests Fail:**
- Check browser console for specific errors
- Verify all services are imported correctly
- Test individual components (ActionBrain, ChatBrain, CambrianSeiAgent)
- Report specific error messages for debugging

**🎉 Your AI transfer system should now be fully functional with complete debugging visibility!**
# 🚀 **AI Setup Guide - ChatGPT-Level Intelligence for Seilor 0**

## 🔑 **Required: OpenAI API Key Setup**

### **Step 1: Get Your OpenAI API Key**
1. Visit: https://platform.openai.com/api-keys
2. Sign in to your OpenAI account (or create one)
3. Click "Create new secret key"
4. Copy your API key (starts with `sk-...`)

### **Step 2: Add API Key to Environment**

#### **Option A: Environment Variables (Recommended)**
```bash
# Linux/Mac
export OPENAI_API_KEY="sk-your-actual-api-key-here"
export VITE_OPENAI_API_KEY="sk-your-actual-api-key-here"

# Windows PowerShell
$env:OPENAI_API_KEY="sk-your-actual-api-key-here"
$env:VITE_OPENAI_API_KEY="sk-your-actual-api-key-here"
```

#### **Option B: .env File**
```bash
# Copy .env.example to .env
cp .env.example .env

# Edit .env file and replace:
OPENAI_API_KEY=sk-your-actual-api-key-here
VITE_OPENAI_API_KEY=sk-your-actual-api-key-here
```

### **Step 3: Restart Development Server**
```bash
npm run dev
```

---

## 🧪 **Testing Your AI Setup**

### **✅ With OpenAI API Key (Full Intelligence):**
Navigate to Seilor 0 and try:
- "Hello, how are you today?"
- "I want to learn about DeFi on Sei"
- "Can you help me understand token swapping?"
- "What's the safest way to transfer tokens?"

**Expected**: ChatGPT-level intelligent responses with blockchain expertise

### **⚠️ Without OpenAI API Key (Fallback Mode):**
You'll see:
- "🔑 **OpenAI API key required for advanced AI features.**"
- Basic command suggestions
- ActionBrain fallback system still works

---

## 🎯 **AI System Architecture**

### **🧠 Primary System: LangChain + OpenAI**
- **Model**: GPT-3.5-turbo
- **Features**: Natural conversation, context awareness, blockchain expertise
- **Activation**: Requires valid OpenAI API key
- **Performance**: ChatGPT-level intelligence

### **🔄 Fallback System: ActionBrain**
- **Model**: Rule-based intent recognition
- **Features**: All blockchain operations work
- **Activation**: Always available
- **Performance**: Reliable command execution

### **🛡️ Safety Features**
- **Graceful degradation**: No functionality loss without API key
- **Error handling**: Comprehensive error messages
- **Validation**: Input validation and safety checks
- **Logging**: Debug information for troubleshooting

---

## 🚀 **Advanced Configuration**

### **Optional Environment Variables:**
```bash
# AI Model Configuration
OPENAI_MODEL=gpt-3.5-turbo  # or gpt-4 for even better performance
OPENAI_MAX_TOKENS=1000      # Response length limit
OPENAI_TEMPERATURE=0.1      # Creativity level (0-1)

# Sei MCP Server (Phase 2 - Coming Soon)
VITE_SEI_MCP_ENABLED=false
SEI_PRIVATE_KEY=<your-private-key>
SEI_RPC_URL=https://evm-rpc.sei-apis.com
```

---

## 🎉 **What You Get With Full AI Setup**

### **🤖 ChatGPT-Level Conversations:**
- Natural language understanding
- Context-aware responses
- Blockchain expertise integration
- Safety-focused guidance

### **🔧 Blockchain Operations:**
- Balance checking with AI guidance
- Safe token transfers with validation
- Intelligent swap recommendations
- Staking and lending explanations
- Token scanning and analysis

### **💡 Enhanced User Experience:**
- Conversational interface like ChatGPT
- Intelligent error handling
- Educational responses
- Professional blockchain advice

---

## 🔧 **Troubleshooting**

### **Issue: "OpenAI API key required"**
**Solution**: 
1. Verify API key is correctly set in environment
2. Restart development server
3. Check API key validity at OpenAI platform

### **Issue: "LangChain processing error"**
**Solution**:
1. Check internet connection
2. Verify OpenAI API key has credits
3. Check console for detailed error messages

### **Issue: Getting both old and new responses**
**Solution**: 
- This shouldn't happen - the system uses smart fallback
- If it does, clear browser cache and restart

---

## 📊 **Cost Information**

### **OpenAI API Pricing (GPT-3.5-turbo):**
- **Input**: $0.0015 per 1K tokens
- **Output**: $0.002 per 1K tokens
- **Average cost per conversation**: $0.01-0.05
- **Monthly estimate for active use**: $5-20

### **Free Tier:**
- $5 in free credits for new accounts
- Plenty for testing and evaluation

---

## 🎯 **Next Steps After Setup**

1. **Test basic AI conversations**
2. **Try blockchain operations with AI guidance**
3. **Experience the enhanced user experience**
4. **Prepare for Phase 2: Sei MCP Server integration**
5. **Plan for Phase 3: ML prediction models**

**🚀 Ready to experience the future of AI trading agents!**
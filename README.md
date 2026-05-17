# 🌾 AlignAI v2.0 - AI-Powered Agricultural Platform

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

> **Intelligent harvest forecasting, logistics optimization, and agricultural advisory powered by Google Gemini AI**

## ✨ Features

- 🤖 **AI-Powered Natural Language Queries** - Ask agricultural questions in plain English
- 📊 **Harvest Volume Forecasting** - Predict crop yields with ML models
- 🚛 **Logistics Stress Analysis** - Optimize transportation and distribution
- 📦 **Storage Allocation** - Smart warehouse and cold storage management
- ⚡ **Real-time AI Insights** - Actionable recommendations powered by Gemini 2.5 Flash
- 🔒 **Production-Ready** - Security, logging, rate limiting, and monitoring built-in

## 🚀 Quick Start

### Local Development

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Add your GEMINI_API_KEY

# Start server
npm run dev

# Test AI
node test-debug.js
```

Server runs on http://localhost:3000

### 🌐 Deploy to Production (FREE)

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin YOUR-REPO-URL
   git push -u origin main
   ```

2. **Deploy on Render.com**:
   - Sign up at https://render.com
   - Click "New +" → "Web Service"
   - Connect your repository
   - Add environment variables (see below)
   - Deploy!

**📖 Full deployment guide:** See `DEPLOY_NOW.md`

## 🔑 Environment Variables

Required for deployment:

```env
NODE_ENV=production
LLM_PROVIDER=gemini
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
VECTOR_DB_PROVIDER=none
REDIS_URL=disabled
```

Get your free Gemini API key: https://aistudio.google.com/app/apikey

## 📡 API Endpoints

### Health Check
```bash
GET /health
```

### AI Natural Language Query
```bash
POST /api/ai-forecast/query
Content-Type: application/json

{
  "question": "What are best practices for harvest timing?"
}
```

### Harvest Forecast Dashboard
```bash
POST /api/forecast/dashboard
Content-Type: application/json

{
  "date": "2024-02-15",
  "region": "Kalaburagi"
}
```

### AI-Enhanced Dashboard
```bash
POST /api/ai-forecast/dashboard
Content-Type: application/json

{
  "date": "2024-02-15",
  "region": "Kalaburagi",
  "enable_ai": true
}
```

## 🧪 Testing

```bash
# Test health endpoint
curl http://localhost:3000/health

# Test AI (requires server running)
node test-debug.js

# Run all tests
node test-ai.js
```

## 📚 Documentation

- **`GET_STARTED.md`** - Complete setup guide
- **`DEPLOY_NOW.md`** - Step-by-step deployment
- **`HOSTING_GUIDE.md`** - Multiple hosting options
- **`API_EXAMPLES.md`** - API usage examples
- **`SUCCESS.md`** - Feature overview
- **`PRODUCTION_CHECKLIST.md`** - Pre-launch checklist

## 🛠️ Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **AI**: Google Gemini 2.5 Flash
- **Database**: PostgreSQL (optional)
- **Cache**: Redis (optional)
- **Vector DB**: Pinecone (optional)
- **Security**: Helmet, CORS, Rate Limiting
- **Logging**: Pino

## 📊 Project Stats

- **27+** Files
- **5,000+** Lines of Code
- **10+** API Endpoints
- **466** NPM Packages
- **100%** AI-Powered

## 🏗️ Project Structure

```
CENTILLION_POWERED_BY_ALIGN-main/
├── config/              # Configuration files
│   ├── llm.config.js    # Gemini AI setup
│   ├── vectordb.config.js
│   └── cache.config.js
├── routes/              # API endpoints
│   ├── forecast.js      # Traditional forecasting
│   └── aiForecast.js    # AI-powered endpoints
├── services/            # Business logic
│   ├── rag.service.js   # RAG implementation
│   ├── aiForecast.service.js
│   └── logger.js
├── middleware/          # Express middleware
└── server.js            # Entry point
```

## 🤝 Contributing

This is a hackathon project. Feel free to fork and improve!

## 📝 License

MIT License - see LICENSE file for details

## 🎯 Use Cases

- 🌾 Harvest coordination across multiple farmers
- 🚛 Logistics and transportation optimization
- 📦 Storage capacity planning
- 🌡️ Weather-based adjustments
- 💬 Natural language agricultural advisory
- 📊 Data-driven decision making

## 🌟 Why AlignAI?

Traditional agricultural platforms lack:
- Real-time intelligence
- Natural language interfaces
- Predictive analytics
- Holistic optimization

**AlignAI solves all of this with cutting-edge AI.**

## 📞 Support

- Documentation: See `docs/` folder
- Issues: GitHub Issues
- Questions: Open a discussion

---

**Built with ❤️ for agricultural innovation**

**Powered by Google Gemini AI** 🤖

---

## 🚀 Deploy Now

Click the button at the top or follow `DEPLOY_NOW.md` for instructions!

Your API will be live at: `https://your-app.onrender.com`

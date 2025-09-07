# 🚀 Deployment Guide for MedHelp

This guide covers deploying MedHelp to various platforms, with a focus on Render.

## 📋 Prerequisites

Before deploying, ensure you have:
- A GitHub repository with your code
- A Google Gemini API key ([Get one here](https://makersuite.google.com/app/apikey))
- A MongoDB database (Atlas recommended for production)

## 🌐 Deploy to Render (Recommended)

Render is the easiest way to deploy MedHelp with automatic deployments from GitHub.

### Option 1: One-Click Deploy (Easiest)

1. **Fork this repository** to your GitHub account
2. **Click the Deploy button** (if available) or follow manual steps below

### Option 2: Manual Render Setup

1. **Create a Render account** at [render.com](https://render.com)

2. **Connect your GitHub repository**:
   - Go to Render Dashboard
   - Click "New +" → "Web Service"
   - Connect your GitHub account
   - Select the `med-help` repository

3. **Configure the service**:
   ```
   Name: medhelp (or your preferred name)
   Environment: Node
   Build Command: npm install
   Start Command: npm start
   ```

4. **Set environment variables**:
   ```
   NODE_ENV=production
   MONGODB_URI=your-mongodb-connection-string
   JWT_SECRET=your-super-secret-jwt-key
   GEMINI_API_KEY=your-gemini-api-key
   GEMINI_MODEL=gemini-1.5-flash
   ```

5. **Deploy**: Click "Create Web Service"

### MongoDB Setup for Render

**Option A: MongoDB Atlas (Recommended)**
1. Create account at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create a free cluster
3. Get connection string and add to `MONGODB_URI`

**Option B: Render PostgreSQL (Alternative)**
1. In Render dashboard, create a PostgreSQL database
2. Update your app to use PostgreSQL instead of MongoDB

## 🐳 Deploy with Docker

If you prefer containerized deployment:

```bash
# Build the image
docker build -t medhelp .

# Run locally
docker run -p 5000:5000 --env-file .env medhelp

# Deploy to any Docker-compatible platform
```

## ☁️ Other Deployment Options

### Vercel
```bash
npm install -g vercel
vercel --prod
```

### Heroku
```bash
# Install Heroku CLI
heroku create your-app-name
heroku config:set MONGODB_URI=your-connection-string
heroku config:set GEMINI_API_KEY=your-api-key
git push heroku main
```

### DigitalOcean App Platform
1. Connect GitHub repository
2. Set environment variables
3. Deploy with one click

### Railway
1. Connect GitHub repository
2. Add environment variables
3. Deploy automatically

## 🔧 Environment Variables Reference

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `NODE_ENV` | Environment mode | No | `production` |
| `PORT` | Server port | No | `5000` |
| `MONGODB_URI` | MongoDB connection string | Yes | `mongodb+srv://user:pass@cluster.mongodb.net/medhelp` |
| `JWT_SECRET` | JWT signing secret | Yes | `your-super-secret-key` |
| `GEMINI_API_KEY` | Google Gemini API key | Yes | `AIzaSy...` |
| `GEMINI_MODEL` | Gemini model to use | No | `gemini-1.5-flash` |

## 🔍 Health Check

After deployment, verify your app is working:
- Visit `https://your-app-url.com/health`
- Should return: `{"status":"OK","message":"MedHelp server is running"}`

## 🐛 Troubleshooting

### Common Issues

**1. Build Fails**
```bash
# Check Node.js version
node --version  # Should be >= 14

# Clear npm cache
npm cache clean --force
```

**2. Database Connection Issues**
- Verify MongoDB URI is correct
- Check if IP is whitelisted (for Atlas)
- Ensure database user has proper permissions

**3. AI Assistant Not Working**
- Verify `GEMINI_API_KEY` is set correctly
- Check API key permissions in Google AI Studio
- Monitor API usage limits

**4. Static Files Not Loading**
- Ensure `frontend/` directory is included in deployment
- Check server.js static file configuration
- Verify file paths are correct

### Logs and Debugging

**Render Logs:**
- Go to your service dashboard
- Click "Logs" tab
- Monitor real-time logs

**Local Debugging:**
```bash
# Run in development mode
npm run dev

# Check environment variables
node -e "console.log(process.env)"

# Test database connection
node -e "require('mongoose').connect(process.env.MONGODB_URI).then(() => console.log('DB OK'))"
```

## 📊 Performance Optimization

### For Production:
1. **Enable compression**: Add `compression` middleware
2. **Use CDN**: Serve static assets from CDN
3. **Database indexing**: Add proper MongoDB indexes
4. **Caching**: Implement Redis for session storage
5. **Monitoring**: Add error tracking (Sentry, LogRocket)

### Render-Specific:
- Use Render's built-in SSL certificates
- Enable auto-deploy from GitHub
- Set up health checks for reliability
- Use Render's environment variable management

## 🔒 Security Checklist

- [ ] Environment variables are set securely
- [ ] JWT secret is strong and unique
- [ ] Database has authentication enabled
- [ ] API keys are not exposed in client code
- [ ] HTTPS is enabled (automatic on Render)
- [ ] Input validation is implemented
- [ ] Rate limiting is configured

## 📈 Monitoring

After deployment, monitor:
- Application uptime
- Response times
- Error rates
- Database performance
- API usage (Gemini)

## 🆘 Support

If you encounter issues:
1. Check the logs first
2. Review this troubleshooting guide
3. Open an issue on GitHub
4. Contact support for your hosting platform

---

**🎉 Congratulations!** Your MedHelp application should now be live and accessible to users worldwide!
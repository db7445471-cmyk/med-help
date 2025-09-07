# 🏥 MedHelp - Medicine & Doctor Availability Tracker

A modern healthcare platform that connects users with nearby medicines and doctors in emergencies, featuring an AI-powered health assistant for instant medical guidance.

![MedHelp Banner](https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?auto=format&fit=crop&w=1200&q=80)

## ✨ Features

### 🤖 AI Health Assistant
- **Instant Health Guidance**: Ask health-related questions and get reliable medical information
- **Smart Filtering**: Only accepts health-related queries for safety
- **Powered by Google Gemini**: Advanced AI model for accurate responses
- **Quick Questions**: Pre-built common health questions for easy access

### 🔍 Medicine & Doctor Search
- **Real-time Availability**: Find medicines and doctors in your area
- **Emergency Ready**: Quick access to nearby hospitals and emergency services
- **Location-based Search**: Get results based on your current location
- **Specialist Matching**: AI-powered specialist recommendations

### 🎨 Modern Design
- **Responsive Design**: Works perfectly on all devices
- **Intuitive Interface**: Clean, modern UI with smooth animations
- **Accessibility**: Built with accessibility best practices
- **Fast Loading**: Optimized for performance

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- Google Gemini API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/db7445471-cmyk/med-help.git
   cd med-help
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your configuration:
   ```env
   MONGODB_URI=mongodb://localhost:27017/medhelp
   JWT_SECRET=your-super-secret-jwt-key-here
   GEMINI_API_KEY=your-gemini-api-key-here
   GEMINI_MODEL=gemini-1.5-flash
   PORT=3000
   NODE_ENV=development
   ```

4. **Get your Gemini API key**
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Add it to your `.env` file

5. **Start the application**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

6. **Access the application**
   - Open your browser and go to `http://localhost:3000`
   - The AI Health Assistant will be available at `http://localhost:3000/health-ai.html`

## 🏗️ Project Structure

```
med-help/
├── backend/
│   ├── middleware/          # Authentication middleware
│   ├── models/             # Database models
│   ├── routes/             # API routes
│   │   ├── aiRoutes.js     # AI assistant endpoints
│   │   ├── authRoutes.js   # Authentication
│   │   ├── doctorRoutes.js # Doctor management
│   │   └── medicineRoutes.js # Medicine search
│   ├── seed.js             # Database seeding
│   └── server.js           # Express server
├── frontend/
│   ├── index.html          # Homepage
│   ├── health-ai.html      # AI assistant page
│   ├── find-doctors.html   # Doctor search
│   ├── find-medicine.html  # Medicine search
│   ├── style.css           # Modern CSS styles
│   └── script.js           # Frontend JavaScript
├── scripts/                # Utility scripts
├── .env.example           # Environment template
├── package.json           # Dependencies
└── README.md              # This file
```

## 🔧 API Endpoints

### AI Assistant
- `GET /api/ai/status` - Check AI service status
- `POST /api/ai/query` - Ask health questions
- `GET /api/ai/suggest-specialist` - Get specialist recommendations

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Medicine & Doctors
- `GET /api/medicines` - Search medicines
- `GET /api/doctors` - Find doctors
- `GET /api/location` - Location services

## 🤖 AI Assistant Usage

The AI Health Assistant is designed to provide safe, reliable health information:

### Supported Queries
- Symptom information
- Treatment guidance
- Medication questions
- Health tips and advice
- Emergency care guidance

### Safety Features
- **Health-only filtering**: Only accepts health-related questions
- **Professional disclaimer**: Always recommends consulting healthcare professionals
- **Safe responses**: Trained to provide responsible medical information
- **Error handling**: Graceful handling of API failures

### Example Queries
```
"What are the symptoms of dehydration?"
"How to treat a minor headache?"
"What should I do for a small cut?"
"Signs of high blood pressure?"
```

## 🎨 Design Features

### Modern UI/UX
- **Clean Design**: Minimalist, professional healthcare aesthetic
- **Smooth Animations**: Subtle transitions and hover effects
- **Responsive Layout**: Mobile-first design approach
- **Accessibility**: WCAG compliant with proper ARIA labels

### Color Scheme
- **Primary**: Blue (#3b82f6) - Trust and reliability
- **Secondary**: Green (#10b981) - Health and wellness
- **Accent**: Amber (#f59e0b) - Attention and warmth
- **Neutral**: Gray scale for text and backgrounds

### Typography
- **Font**: Inter - Modern, readable sans-serif
- **Hierarchy**: Clear heading structure
- **Readability**: Optimized line heights and spacing

## 🔒 Security Features

- **Input Validation**: All user inputs are validated and sanitized
- **Health Query Filtering**: AI only responds to health-related questions
- **Rate Limiting**: API endpoints are rate-limited
- **Environment Variables**: Sensitive data stored securely
- **HTTPS Ready**: SSL/TLS support for production

## 🚀 Deployment

### Environment Setup
1. Set `NODE_ENV=production`
2. Use a production MongoDB instance
3. Configure proper JWT secrets
4. Set up SSL certificates

### Recommended Platforms
- **Vercel**: Easy deployment with automatic HTTPS
- **Heroku**: Simple container deployment
- **DigitalOcean**: Full control with droplets
- **AWS**: Scalable cloud infrastructure

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check this README and code comments
- **Issues**: Report bugs via GitHub Issues
- **Email**: support@medhelp.example
- **Emergency**: Always call your local emergency services for medical emergencies

## 🙏 Acknowledgments

- **Google Gemini AI**: For powering our health assistant
- **Font Awesome**: For beautiful icons
- **Unsplash**: For high-quality healthcare images
- **Inter Font**: For excellent typography

---

**⚠️ Medical Disclaimer**: This application provides general health information only and is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of qualified healthcare providers with questions about medical conditions.
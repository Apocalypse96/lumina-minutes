# 🌟 **LuminaMinutes - AI-Powered Meeting Notes Summarizer**

> **Transform your meeting transcripts into intelligent, structured summaries with AI-powered insights. Share seamlessly with your team via email - all for free!**

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.3-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![AI Powered](https://img.shields.io/badge/AI-Powered-FF6B6B?style=for-the-badge&logo=openai)](https://ai.google.dev/)

## ✨ **Latest Features (v2.0)**

### 🌙 **Dark Theme System**
- **Automatic Theme Detection**: Follows your OS preference
- **Three Theme Options**: Light, Dark, and System
- **Smooth Transitions**: Beautiful animations between themes
- **Persistent Preferences**: Remembers your choice across sessions

### 🚀 **Performance Optimizations**
- **Dynamic Imports**: Code splitting for better performance
- **API Caching**: Intelligent caching for repeated requests
- **Rate Limiting**: Protection against API abuse
- **Error Boundaries**: Robust error handling and recovery

### 🔒 **Security Enhancements**
- **Input Validation**: Comprehensive sanitization and validation
- **Security Headers**: CSP, XSS protection, and CORS
- **Rate Limiting**: Per-endpoint request throttling
- **Error Sanitization**: Safe error messages without information leakage

## 🎯 **Core Features**

### 📤 **Smart Upload System**
- **File Upload**: Support for `.txt` files
- **Direct Input**: Paste transcript text directly
- **Custom Instructions**: Tailor AI summaries to your needs
- **Real-time Validation**: Instant feedback on input quality

### 🤖 **AI-Powered Summarization**
- **Google Gemini AI**: Advanced language model integration
- **Structured Output**: Organized summaries with key insights
- **Custom Prompts**: Specific instructions for different use cases
- **Intelligent Caching**: Avoid redundant API calls

### 📧 **Professional Email Sharing**
- **HTML Formatting**: Beautiful, formatted emails
- **Multi-recipient Support**: Send to multiple team members
- **Markdown Rendering**: Rich text formatting in emails
- **Delivery Confirmation**: Track email success rates

### 📱 **Responsive Design**
- **Mobile-First**: Optimized for all devices
- **Touch-Friendly**: Intuitive mobile interactions
- **Progressive Enhancement**: Works on all browsers
- **Accessibility**: ARIA support and keyboard navigation

## 🛠️ **Tech Stack**

### **Frontend**
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **TailwindCSS**: Utility-first CSS framework
- **shadcn/ui**: Professional UI components

### **Backend & APIs**
- **Server Actions**: Seamless client-server communication
- **API Routes**: RESTful endpoints for external services
- **Google Gemini AI**: Advanced language model
- **Resend API**: Reliable email delivery

### **Performance & Security**
- **Rate Limiting**: Request throttling and abuse prevention
- **Input Validation**: Comprehensive sanitization
- **Error Handling**: Centralized error management
- **Performance Monitoring**: Core Web Vitals tracking

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js 18+ 
- npm or yarn
- Google Gemini API key
- Resend API key (for email functionality)

### **Installation**

```bash
# Clone the repository
git clone https://github.com/yourusername/lumina-minutes.git
cd lumina-minutes

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API keys

# Run development server
npm run dev

# Build for production
npm run build
npm start
```

### **Environment Variables**

```bash
# Required
GEMINI_API_KEY=your_gemini_api_key_here
RESEND_API_KEY=your_resend_api_key_here

# Optional (SMTP fallback)
SMTP_HOST=your_smtp_host
SMTP_PORT=your_smtp_port
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
```

## 📖 **Usage Guide**

### **1. Upload Transcript**
- Visit `/upload` page
- Upload `.txt` file or paste transcript text
- Add custom instructions (optional)
- Click "Generate Summary"

### **2. Review & Edit**
- AI generates structured summary
- Edit content directly in the interface
- Save changes to localStorage
- Copy or download summary

### **3. Share with Team**
- Click "Share via Email"
- Enter recipient email addresses
- Send professional HTML emails
- Track delivery status

## 🔧 **API Endpoints**

### **POST /api/summarize**
Generate AI-powered summaries from transcripts.

```json
{
  "transcript": "Meeting transcript text...",
  "instruction": "Focus on action items and decisions"
}
```

### **POST /api/send-email**
Send formatted summaries via email.

```json
{
  "recipients": ["user@example.com"],
  "summary": "Formatted summary content",
  "instruction": "Custom instruction used",
  "timestamp": "2024-12-15T10:00:00Z"
}
```

## 🎨 **Customization**

### **Themes**
- **Light Mode**: Clean, professional appearance
- **Dark Mode**: Easy on the eyes, modern aesthetic
- **System Mode**: Automatically follows OS preference

### **Styling**
- **TailwindCSS**: Easy color and spacing customization
- **CSS Variables**: Consistent theming across components
- **Component Library**: shadcn/ui for consistent design

## 🚀 **Deployment**

### **Vercel (Recommended)**
```bash
npm install -g vercel
vercel --prod
```

### **Netlify**
```bash
npm run build
# Deploy dist folder
```

### **Docker**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🔒 **Security Features**

- **Input Sanitization**: XSS and injection prevention
- **Rate Limiting**: API abuse protection
- **CORS Configuration**: Secure cross-origin requests
- **Security Headers**: CSP, XSS protection, and more
- **Error Sanitization**: Safe error responses

## 📊 **Performance Features**

- **Code Splitting**: Dynamic imports for better loading
- **API Caching**: Intelligent request caching
- **Image Optimization**: Next.js built-in optimization
- **Bundle Analysis**: Performance monitoring tools
- **Core Web Vitals**: LCP, FID, and CLS tracking

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 **Acknowledgments**

- **Google Gemini AI** for powerful language processing
- **Resend** for reliable email delivery
- **shadcn/ui** for beautiful UI components
- **Next.js Team** for the amazing framework
- **TailwindCSS** for utility-first styling

## 📞 **Support**

- **Issues**: [GitHub Issues](https://github.com/yourusername/lumina-minutes/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/lumina-minutes/discussions)
- **Email**: support@luminaminutes.com

---

**Built with ❤️ for productive teams everywhere**

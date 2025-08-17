# 🚀 **LuminaMinutes - AI-Powered Meeting Notes Summarizer**

> **Transform your meeting transcripts into professional summaries with AI and share them instantly via email.**

## ✨ **Features**

- 🤖 **AI-Powered Summarization** using Google Gemini 1.5-flash
- 📧 **Professional Email Sharing** via Gmail SMTP (no domain required)
- 🎨 **Beautiful Dark/Light Theme** with smooth transitions
- 📱 **Responsive Design** optimized for all devices
- ⚡ **Real-time Processing** with loading states and error handling
- 🔒 **Secure & Private** with rate limiting and input validation
- 💾 **Local Storage** for recent summaries (no database required)

## 🛠️ **Tech Stack**

- **Framework**: Next.js 14 (App Router, TypeScript, Server Actions)
- **Styling**: TailwindCSS + shadcn/ui components
- **AI**: Google Gemini API (`@google/generative-ai`)
- **Email**: Nodemailer with Gmail SMTP
- **Markdown**: `react-markdown` + `marked` for HTML conversion
- **Performance**: Dynamic imports, caching, rate limiting
- **Security**: Input validation, sanitization, CORS protection

## 📋 **Prerequisites**

- Node.js 18+ and npm
- Google Gemini API key
- Gmail account with 2-factor authentication enabled

## 🚀 **Quick Start**

### **1. Clone & Install**
```bash
git clone https://github.com/Apocalypse96/lumina-minutes.git
cd lumina-minutes
npm install
```

### **2. Environment Setup**
```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:
```bash
# Gemini API Configuration
GEMINI_API_KEY=your_gemini_api_key_here

# Gmail SMTP Configuration
GMAIL_USER=your_gmail@gmail.com
GMAIL_APP_PASSWORD=your_gmail_app_password
```

### **3. Gmail App Password Setup**
1. **Enable 2-Factor Authentication** on your Google account
2. **Generate App Password**: Go to [Google Account Security](https://myaccount.google.com/security)
3. **Select "App passwords"** → "Mail" → "Other (Custom name)"
4. **Name it "LuminaMinutes"** and copy the 16-character password
5. **Add to `.env.local`** as `GMAIL_APP_PASSWORD`

### **4. Run Development Server**
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your app!

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
Send formatted summaries via Gmail SMTP.

```json
{
  "recipients": ["user@example.com"],
  "summary": "Formatted summary content",
  "instruction": "Custom instruction used",
  "timestamp": "2024-12-15T10:00:00Z"
}
```

## ⚠️ **Important Notes**

### **Email Configuration (Gmail SMTP)**
- **No Domain Required**: ✅ Uses your Gmail account with app password
- **Immediate Setup**: ✅ Works immediately after configuration
- **Daily Limit**: 500 emails per day
- **Rate Limit**: 20 emails per minute
- **Professional Delivery**: Excellent spam protection and deliverability

### **Environment Variables Required**
```bash
GEMINI_API_KEY=your_gemini_api_key_here
GMAIL_USER=your_gmail@gmail.com
GMAIL_APP_PASSWORD=your_gmail_app_password
```

**✅ Gmail SMTP**: No domain verification needed - works immediately!

### **Setup Requirements**
- **Gmail Account**: Your existing Gmail address
- **2-Factor Authentication**: Must be enabled on your Google account
- **App Password**: Generated specifically for LuminaMinutes
- **No Domain**: Gmail handles all the email infrastructure

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
npm run build
# Deploy to Vercel with environment variables
```

### **Other Platforms**
```bash
npm run build
npm start
```

## 🔒 **Security Features**

- **Rate Limiting**: API endpoints protected against abuse
- **Input Validation**: All user inputs sanitized and validated
- **CORS Protection**: Secure cross-origin request handling
- **Security Headers**: CSP, X-Frame-Options, and more
- **Error Handling**: Comprehensive error logging and user feedback

## 📊 **Performance Features**

- **Dynamic Imports**: Code splitting for faster initial loads
- **Caching**: In-memory caching for API responses
- **Optimized Bundles**: Tree shaking and minification
- **Loading States**: Skeleton loaders and progress indicators
- **Error Boundaries**: Graceful error handling with fallbacks

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 **Acknowledgments**

- **Google Gemini** for AI-powered summarization
- **Gmail SMTP** for reliable email delivery
- **shadcn/ui** for beautiful UI components
- **Next.js Team** for the amazing framework

---

**Built with ❤️ by [Your Name]**

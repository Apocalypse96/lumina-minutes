# 📧 **Gmail SMTP Setup Guide for LuminaMinutes**

## 🎯 **Why Gmail SMTP?**
✅ **No Domain Required**: Works with your existing Gmail account  
✅ **Immediate Setup**: No verification or waiting needed  
✅ **Reliable**: Gmail's infrastructure is rock-solid  
✅ **Free**: No additional costs beyond your Gmail account  
✅ **Professional**: Excellent deliverability and spam protection  

## 🔧 **Step-by-Step Setup**

### **1. Enable 2-Factor Authentication on Gmail**
- Go to [Google Account Security](https://myaccount.google.com/security)
- Enable "2-Step Verification" if not already enabled

### **2. Generate App Password**
- Go to [Google Account Security](https://myaccount.google.com/security)
- Click "App passwords" (under 2-Step Verification)
- Select "Mail" and "Other (Custom name)"
- Name it "LuminaMinutes" and click "Generate"
- **Copy the 16-character password** (e.g., `abcd efgh ijkl mnop`)

### **3. Update Environment Variables**
Edit your `.env.local` file:

```bash
# Gemini API Configuration
GEMINI_API_KEY=your_gemini_api_key_here

# Gmail SMTP Configuration
GMAIL_USER=your_actual_gmail@gmail.com
GMAIL_APP_PASSWORD=abcd efgh ijkl mnop
```

**Replace:**
- `your_actual_gmail@gmail.com` with your real Gmail address
- `abcd efgh ijkl mnop` with the app password you generated

### **4. Restart Your Development Server**
```bash
npm run dev
```

### **5. Test Email Functionality**
- Go to your app and generate a summary
- Send an email to any address
- **Emails will work immediately!** 🎉

## 📊 **Gmail Limits**
- **Daily**: 500 emails per day
- **Per minute**: 20 emails per minute
- **Per user**: 100 emails per user per day

## 🔍 **Troubleshooting**

### **If Emails Don't Send:**
1. **Check App Password**: Ensure you copied the 16-character password exactly
2. **Verify 2FA**: Make sure 2-factor authentication is enabled
3. **Check Gmail User**: Ensure `GMAIL_USER` is your complete Gmail address
4. **Restart Server**: After changing environment variables

### **Common Issues:**
- **"Invalid credentials"**: Double-check your app password
- **"Less secure app"**: You need 2FA + app password (not regular password)
- **"Quota exceeded"**: Wait for daily reset or reduce email frequency

## 🚀 **Benefits of Gmail SMTP**
- ✅ **No domain verification needed**
- ✅ **Works immediately after setup**
- ✅ **Professional email delivery**
- ✅ **Excellent spam protection**
- ✅ **No monthly costs**
- ✅ **High deliverability rates**

## 🎉 **You're All Set!**
Your LuminaMinutes app now uses Gmail SMTP and can send emails to anyone without any domain requirements!

## 🔄 **Migration from Resend**
If you were previously using Resend:
- **No more domain verification needed**
- **No more API key management**
- **Simpler setup process**
- **Better deliverability with Gmail**

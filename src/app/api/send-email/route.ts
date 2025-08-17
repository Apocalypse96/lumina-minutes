import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { marked } from "marked";
import { rateLimiters, rateLimit, validateEmail, sanitizeInput } from "@/lib/rate-limiter";

export async function POST(request: NextRequest) {
  try {
    console.log("🔍 Email API called - Starting email send process with Gmail SMTP...");
    
    // Rate limiting
    const rateLimitResult = await rateLimit(rateLimiters.email, request, null);
    if (!rateLimitResult.success) {
      console.log("❌ Rate limit exceeded:", rateLimitResult);
      return NextResponse.json(
        { 
          error: "Email rate limit exceeded. Please try again later.",
          retryAfter: Math.ceil(rateLimitResult.resetTime / 1000)
        },
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil(rateLimitResult.resetTime / 1000).toString(),
            'X-RateLimit-Remaining': rateLimitResult.remainingPoints.toString(),
            'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
          }
        }
      );
    }

    const { recipients, summary, instruction, timestamp } = await request.json();
    console.log("📧 Email request data:", { 
      recipientsCount: recipients?.length, 
      hasSummary: !!summary, 
      hasInstruction: !!instruction,
      timestamp 
    });

    // Enhanced input validation
    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      console.log("❌ Invalid recipients:", recipients);
      return NextResponse.json(
        { error: "Recipients are required and must be an array" },
        { status: 400 }
      );
    }

    if (!summary || typeof summary !== "string") {
      console.log("❌ Invalid summary:", typeof summary);
      return NextResponse.json(
        { error: "Summary is required and must be a string" },
        { status: 400 }
      );
    }

    if (recipients.length > 10) {
      console.log("❌ Too many recipients:", recipients.length);
      return NextResponse.json(
        { error: "Maximum 10 recipients allowed per request" },
        { status: 400 }
      );
    }

    // Check Gmail credentials
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      console.log("❌ Gmail credentials not configured");
      return NextResponse.json(
        { error: "Gmail credentials not configured. Please check your environment variables." },
        { status: 500 }
      );
    }

    console.log("✅ Gmail credentials found");

    // Create Gmail transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
      }
    });

    // Validate and sanitize email addresses
    const validRecipients = recipients
      .map(email => email.trim())
      .filter(email => validateEmail(email))
      .map(email => sanitizeInput(email));
    
    console.log("📧 Email validation results:", {
      original: recipients,
      valid: validRecipients,
      invalid: recipients.filter(email => !validateEmail(email.trim()))
    });
    
    if (validRecipients.length === 0) {
      console.log("❌ No valid email addresses after validation");
      return NextResponse.json(
        { error: "No valid email addresses provided" },
        { status: 400 }
      );
    }

    // Sanitize other inputs
    const sanitizedSummary = sanitizeInput(summary);
    const sanitizedInstruction = instruction ? sanitizeInput(instruction) : "";
    const sanitizedTimestamp = timestamp ? sanitizeInput(timestamp) : new Date().toISOString();

    console.log("📝 Sanitized inputs:", {
      summaryLength: sanitizedSummary.length,
      instructionLength: sanitizedInstruction.length,
      timestamp: sanitizedTimestamp
    });

    // Create email content
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Meeting Summary - LuminaMinutes</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
            .summary { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
            .summary h1 { font-size: 24px; font-weight: bold; color: #2c3e50; margin: 0 0 16px 0; }
            .summary h2 { font-size: 20px; font-weight: bold; color: #2c3e50; margin: 16px 0 12px 0; }
            .summary h3 { font-size: 18px; font-weight: bold; color: #2c3e50; margin: 12px 0 8px 0; }
            .summary p { margin: 8px 0; line-height: 1.5; }
            .summary ul { margin: 8px 0; padding-left: 20px; }
            .summary li { margin: 4px 0; line-height: 1.4; }
            .summary strong { font-weight: bold; color: #2c3e50; }
            .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; color: #6c757d; font-size: 14px; }
            .instruction { background: #e3f2fd; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #2196f3; }
            .timestamp { color: #6c757d; font-size: 14px; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 style="margin: 0; font-size: 28px;">📋 Meeting Summary</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Generated with LuminaMinutes AI</p>
          </div>
          
          <div class="content">
            ${sanitizedInstruction && sanitizedInstruction !== "Default summary" ? `
              <div class="instruction">
                <strong>Custom Instruction:</strong> ${sanitizedInstruction}
              </div>
            ` : ''}
            
            <div class="timestamp">
              <strong>Generated:</strong> ${new Date(sanitizedTimestamp).toLocaleString()}
            </div>
            
            <div class="summary">
              <h2 style="margin-top: 0; color: #2c3e50;">Summary</h2>
              <div style="line-height: 1.6;">${marked.parse(sanitizedSummary)}</div>
            </div>
            
            <div class="footer">
              <p>This summary was generated using LuminaMinutes, an AI-powered meeting notes summarizer.</p>
              <p>© 2024 LuminaMinutes. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    console.log("📧 Attempting to send emails to:", validRecipients);

    // Send emails to all recipients
    const emailPromises = validRecipients.map(async (email) => {
      try {
        console.log(`📤 Sending email to: ${email}`);
        
        const result = await transporter.sendMail({
          from: `"LuminaMinutes" <${process.env.GMAIL_USER}>`,
          to: email,
          subject: "Meeting Summary - Generated with LuminaMinutes",
          html: emailHtml,
        });
        
        console.log(`✅ Email sent successfully to ${email}:`, result);
        return { email, success: true, result };
      } catch (error) {
        console.error(`❌ Failed to send email to ${email}:`, error);
        return { email, success: false, error: error instanceof Error ? error.message : "Unknown error" };
      }
    });

    const results = await Promise.all(emailPromises);
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    console.log("📊 Email sending results:", { 
      successful: successful.length, 
      failed: failed.length,
      successfulEmails: successful.map(r => r.email),
      failedEmails: failed.map(r => ({ email: r.email, error: r.error }))
    });

    if (successful.length === 0) {
      console.log("❌ All emails failed to send");
      return NextResponse.json(
        { error: "Failed to send emails to all recipients", details: failed },
        { status: 500 }
      );
    }

    console.log("🎉 Email sending completed successfully");
    
    return NextResponse.json({
      message: `Emails sent successfully to ${successful.length} recipient(s)`,
      successful: successful.map(r => r.email),
      failed: failed.map(r => ({ email: r.email, error: r.error })),
      remainingRequests: rateLimitResult.remainingPoints
    });

  } catch (error) {
    console.error("💥 Error in send-email API:", error);
    
    if (error instanceof Error) {
      if (error.message.includes("authentication")) {
        return NextResponse.json(
          { error: "Gmail authentication failed. Please check your credentials." },
          { status: 401 }
        );
      }
      
      if (error.message.includes("quota") || error.message.includes("rate limit")) {
        return NextResponse.json(
          { error: "Gmail sending quota exceeded. Please try again later." },
          { status: 429 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to send email. Please try again." },
      { status: 500 }
    );
  }
}

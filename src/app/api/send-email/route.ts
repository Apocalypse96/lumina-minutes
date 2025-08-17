import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { marked } from "marked";
import { rateLimiters, rateLimit, validateEmail, sanitizeInput } from "@/lib/rate-limiter";

// Initialize Resend (will be initialized when needed)
let resend: Resend | null = null;

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await rateLimit(rateLimiters.email, request, null);
    if (!rateLimitResult.success) {
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

    // Enhanced input validation
    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json(
        { error: "Recipients are required and must be an array" },
        { status: 400 }
      );
    }

    if (!summary || typeof summary !== "string") {
      return NextResponse.json(
        { error: "Summary is required and must be a string" },
        { status: 400 }
      );
    }

    if (recipients.length > 10) {
      return NextResponse.json(
        { error: "Maximum 10 recipients allowed per request" },
        { status: 400 }
      );
    }

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { error: "Resend API key not configured" },
        { status: 500 }
      );
    }

    // Initialize Resend with API key
    if (!resend) {
      resend = new Resend(process.env.RESEND_API_KEY);
    }

    // Validate and sanitize email addresses
    const validRecipients = recipients
      .map(email => email.trim())
      .filter(email => validateEmail(email))
      .map(email => sanitizeInput(email));
    
    if (validRecipients.length === 0) {
      return NextResponse.json(
        { error: "No valid email addresses provided" },
        { status: 400 }
      );
    }

    // Sanitize other inputs
    const sanitizedSummary = sanitizeInput(summary);
    const sanitizedInstruction = instruction ? sanitizeInput(instruction) : "";
    const sanitizedTimestamp = timestamp ? sanitizeInput(timestamp) : new Date().toISOString();

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

    // Send emails to all recipients
    const emailPromises = validRecipients.map(async (email) => {
      try {
        if (!resend) {
          throw new Error("Resend not initialized");
        }
        await resend.emails.send({
          from: "LuminaMinutes <onboarding@resend.dev>",
          to: [email],
          subject: "Meeting Summary - Generated with LuminaMinutes",
          html: emailHtml,
        });
        return { email, success: true };
      } catch (error) {
        console.error(`Failed to send email to ${email}:`, error);
        return { email, success: false, error: error instanceof Error ? error.message : "Unknown error" };
      }
    });

    const results = await Promise.all(emailPromises);
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    console.log("Email sending results:", { successful, failed });

    if (successful.length === 0) {
      return NextResponse.json(
        { error: "Failed to send emails to all recipients", details: failed },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: `Emails sent successfully to ${successful.length} recipient(s)`,
      successful: successful.map(r => r.email),
      failed: failed.map(r => ({ email: r.email, error: r.error })),
      remainingRequests: rateLimitResult.remainingPoints
    });

  } catch (error) {
    console.error("Error in send-email API:", error);
    
    if (error instanceof Error) {
      if (error.message.includes("API key")) {
        return NextResponse.json(
          { error: "Invalid API key. Please check your Resend configuration." },
          { status: 401 }
        );
      }
      
      if (error.message.includes("quota") || error.message.includes("rate limit")) {
        return NextResponse.json(
          { error: "Email sending quota exceeded. Please try again later." },
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

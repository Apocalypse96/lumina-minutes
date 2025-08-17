import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { marked } from "marked";

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(_request: NextRequest) {
  try {
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { error: "Resend API key not configured" },
        { status: 500 }
      );
    }

    console.log("Testing Resend with API key:", process.env.RESEND_API_KEY.substring(0, 10) + "...");

    // Send a test email with Markdown
    const testMarkdown = `**Test Email - LuminaMinutes**

This is a test email to verify Resend configuration and Markdown rendering.

**Features:**
* Markdown to HTML conversion
* Proper formatting
* Bold text support
* Bullet points

**Status:** Working correctly!`;

    const result = await resend.emails.send({
      from: "LuminaMinutes <onboarding@resend.dev>",
      to: ["test@example.com"], // This will fail but we'll see the error
      subject: "Test Email - LuminaMinutes",
              html: marked.parse(testMarkdown) as string,
    });

    return NextResponse.json({
      message: "Test email sent successfully",
      result: result
    });

  } catch (error) {
    console.error("Test email error:", error);
    
    if (error instanceof Error) {
      return NextResponse.json({
        error: "Failed to send test email",
        details: error.message,
        type: error.constructor.name
      }, { status: 500 });
    }

    return NextResponse.json(
      { error: "Unknown error occurred" },
      { status: 500 }
    );
  }
}

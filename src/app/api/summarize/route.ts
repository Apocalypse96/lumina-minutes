import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { rateLimiters, rateLimit, sanitizeInput, validateTranscript, validateInstruction } from "@/lib/rate-limiter";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Cache for repeated requests (simple in-memory cache)
const requestCache = new Map<string, { summary: string; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await rateLimit(rateLimiters.summarize, request, null);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { 
          error: "Rate limit exceeded. Please try again later.",
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

    const { transcript, instruction } = await request.json();

    // Input validation and sanitization
    if (!transcript || typeof transcript !== "string") {
      return NextResponse.json(
        { error: "Transcript is required and must be a string" },
        { status: 400 }
      );
    }

    if (!validateTranscript(transcript)) {
      return NextResponse.json(
        { error: "Transcript must be between 10 and 50,000 characters" },
        { status: 400 }
      );
    }

    if (instruction && !validateInstruction(instruction)) {
      return NextResponse.json(
        { error: "Instruction must be 500 characters or less" },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Gemini API key not configured" },
        { status: 500 }
      );
    }

    // Sanitize inputs
    const sanitizedTranscript = sanitizeInput(transcript);
    const sanitizedInstruction = instruction ? sanitizeInput(instruction) : "";

    // Check cache for identical requests
    const cacheKey = `${sanitizedTranscript}:${sanitizedInstruction}`;
    const cachedResult = requestCache.get(cacheKey);
    if (cachedResult && Date.now() - cachedResult.timestamp < CACHE_DURATION) {
      return NextResponse.json({ 
        summary: cachedResult.summary,
        cached: true,
        remainingRequests: rateLimitResult.remainingPoints
      });
    }

    // Get the model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Create the prompt
    const prompt = `You are an AI meeting summarizer. Your task is to create a clear, structured summary of the following meeting transcript.

Transcript:
${sanitizedTranscript}

User Instruction: ${sanitizedInstruction || "Please provide a clear, structured summary of this meeting transcript."}

Please generate a comprehensive summary that includes:
- Key topics discussed
- Important decisions made
- Action items and next steps
- Any deadlines or important dates mentioned
- Key insights or conclusions

Format the summary in a clear, professional manner that would be useful for team members who couldn't attend the meeting.`;

    // Generate content with timeout and retry logic
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("Request timeout")), 30000) // 30 second timeout
    );

    const generatePromise = model.generateContent(prompt);
    const result = await Promise.race([generatePromise, timeoutPromise]) as any;
    const summary = result.response.text();

    if (!summary) {
      throw new Error("Failed to generate summary");
    }

    // Cache the result
    requestCache.set(cacheKey, { summary, timestamp: Date.now() });

    // Clean up old cache entries
    if (requestCache.size > 100) { // Keep cache under 100 entries
      const now = Date.now();
      for (const [key, value] of requestCache.entries()) {
        if (now - value.timestamp > CACHE_DURATION) {
          requestCache.delete(key);
        }
      }
    }

    return NextResponse.json({ 
      summary,
      remainingRequests: rateLimitResult.remainingPoints
    });
  } catch (error) {
    console.error("Error in summarize API:", error);
    
    if (error instanceof Error) {
      if (error.message.includes("Request timeout")) {
        return NextResponse.json(
          { error: "Request timed out. Please try again." },
          { status: 408 }
        );
      }
      
      if (error.message.includes("API key")) {
        return NextResponse.json(
          { error: "Invalid API key. Please check your Gemini API configuration." },
          { status: 401 }
        );
      }
      
      if (error.message.includes("quota")) {
        return NextResponse.json(
          { error: "API quota exceeded. Please try again later." },
          { status: 429 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to generate summary. Please try again." },
      { status: 500 }
    );
  }
}

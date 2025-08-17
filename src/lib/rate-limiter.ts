import { RateLimiterMemory } from 'rate-limiter-flexible';

// Rate limiter configuration for different endpoints
export const rateLimiters = {
  // Summarize API: 10 requests per minute per IP
  summarize: new RateLimiterMemory({
    points: 10, // Number of requests
    duration: 60, // Per 60 seconds
    blockDuration: 60 * 2, // Block for 2 minutes if exceeded
  }),

  // Email API: 5 requests per minute per IP
  email: new RateLimiterMemory({
    points: 5, // Number of requests
    duration: 60, // Per 60 seconds
    blockDuration: 60 * 5, // Block for 5 minutes if exceeded
  }),

  // General API: 100 requests per minute per IP
  general: new RateLimiterMemory({
    points: 100, // Number of requests
    duration: 60, // Per 60 seconds
    blockDuration: 60, // Block for 1 minute if exceeded
  }),
};

// Rate limiting middleware
export async function rateLimit(
  limiter: RateLimiterMemory,
  req: any,
  _res: any
): Promise<{ success: boolean; remainingPoints: number; resetTime: number }> {
  try {
    const result = await limiter.consume(req.ip || 'unknown');
    return {
      success: true,
      remainingPoints: result.remainingPoints,
      resetTime: result.msBeforeNext,
    };
  } catch (rejRes: any) {
    return {
      success: false,
      remainingPoints: 0,
      resetTime: rejRes.msBeforeNext,
    };
  }
}

// Input validation and sanitization
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .substring(0, 10000); // Limit length to 10KB
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim()) && email.length <= 254;
}

export function validateTranscript(transcript: string): boolean {
  return transcript.trim().length > 10 && transcript.trim().length <= 50000; // 10 chars to 50KB
}

export function validateInstruction(instruction: string): boolean {
  return instruction.trim().length <= 500; // Max 500 chars
}

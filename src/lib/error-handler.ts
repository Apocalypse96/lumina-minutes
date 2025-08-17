// Centralized error handling and logging

export interface AppError {
  message: string;
  code?: string;
  statusCode?: number;
  details?: unknown;
  timestamp: string;
  userAgent?: string | undefined;
  url?: string | undefined;
}

export class LuminaError extends Error {
  public code: string;
  public statusCode: number;
  public details?: unknown;

  constructor(message: string, code: string = 'UNKNOWN_ERROR', statusCode: number = 500, details?: unknown) {
    super(message);
    this.name = 'LuminaError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

// Error codes for consistent error handling
export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  API_ERROR: 'API_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

// Error messages for consistent user feedback
export const ERROR_MESSAGES = {
  [ERROR_CODES.VALIDATION_ERROR]: 'Invalid input provided. Please check your data and try again.',
  [ERROR_CODES.RATE_LIMIT_EXCEEDED]: 'Too many requests. Please wait a moment and try again.',
  [ERROR_CODES.API_ERROR]: 'Service temporarily unavailable. Please try again later.',
  [ERROR_CODES.NETWORK_ERROR]: 'Network connection issue. Please check your internet connection.',
  [ERROR_CODES.AUTHENTICATION_ERROR]: 'Authentication failed. Please check your credentials.',
  [ERROR_CODES.AUTHORIZATION_ERROR]: 'Access denied. You don\'t have permission for this action.',
  [ERROR_CODES.NOT_FOUND]: 'The requested resource was not found.',
  [ERROR_CODES.INTERNAL_ERROR]: 'An unexpected error occurred. Please try again later.',
} as const;

// Create user-friendly error messages
export function createUserFriendlyError(error: unknown): string {
  if (error instanceof LuminaError) {
    return ERROR_MESSAGES[error.code as keyof typeof ERROR_MESSAGES] || error.message;
  }
  
  // Type guard to check if error has a code property
  if (typeof error === 'object' && error !== null && 'code' in error && typeof (error as { code: unknown }).code === 'string') {
    const errorCode = (error as { code: string }).code;
    if (ERROR_MESSAGES[errorCode as keyof typeof ERROR_MESSAGES]) {
      return ERROR_MESSAGES[errorCode as keyof typeof ERROR_MESSAGES];
    }
  }
  
  // Handle common error patterns
  if (typeof error === 'object' && error !== null && 'message' in error && typeof (error as { message: unknown }).message === 'string') {
    const errorMessage = (error as { message: string }).message;
    
    if (errorMessage.includes('rate limit')) {
      return ERROR_MESSAGES[ERROR_CODES.RATE_LIMIT_EXCEEDED];
    }
    
    if (errorMessage.includes('validation')) {
      return ERROR_MESSAGES[ERROR_CODES.VALIDATION_ERROR];
    }
    
    if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
      return ERROR_MESSAGES[ERROR_CODES.NETWORK_ERROR];
    }
  }
  
  return ERROR_MESSAGES[ERROR_CODES.INTERNAL_ERROR];
}

// Log errors for debugging and monitoring
export function logError(error: unknown, context?: { userAgent?: string; url?: string; userId?: string }) {
  // Type guard to safely access error properties
  const errorMessage = typeof error === 'object' && error !== null && 'message' in error && typeof (error as { message: unknown }).message === 'string' 
    ? (error as { message: string }).message 
    : 'Unknown error';
    
  const errorCode = typeof error === 'object' && error !== null && 'code' in error && typeof (error as { code: unknown }).code === 'string'
    ? (error as { code: string }).code
    : 'UNKNOWN';
    
  const errorStatusCode = typeof error === 'object' && error !== null && 'statusCode' in error && typeof (error as { statusCode: unknown }).statusCode === 'number'
    ? (error as { statusCode: number }).statusCode
    : 500;
    
  const errorDetails = typeof error === 'object' && error !== null && 'details' in error
    ? (error as { details: unknown }).details
    : (typeof error === 'object' && error !== null && 'stack' in error ? (error as { stack: unknown }).stack : undefined);
    
  const errorInfo: AppError = {
    message: errorMessage,
    code: errorCode,
    statusCode: errorStatusCode,
    details: errorDetails,
    timestamp: new Date().toISOString(),
    userAgent: context?.userAgent,
    url: context?.url,
  };

  // In development, log to console
  if (process.env.NODE_ENV === 'development') {
    console.error('🚨 Error logged:', errorInfo);
    if (typeof error === 'object' && error !== null && 'stack' in error && typeof (error as { stack: unknown }).stack === 'string') {
      console.error('Stack trace:', (error as { stack: string }).stack);
    }
  }

  // In production, you could send to external logging service
  if (process.env.NODE_ENV === 'production') {
    // Example: Send to external logging service
    // logToExternalService(errorInfo);
    console.error('Production error:', errorInfo);
  }

  return errorInfo;
}

// Handle API errors consistently
export function handleAPIError(error: unknown, defaultMessage: string = 'An error occurred'): AppError {
  let appError: AppError;

  if (error instanceof LuminaError) {
    appError = {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      details: error.details,
      timestamp: new Date().toISOString(),
    };
  } else {
    const errorMessage = typeof error === 'object' && error !== null && 'message' in error && typeof (error as { message: unknown }).message === 'string'
      ? (error as { message: string }).message
      : defaultMessage;
      
    const errorStack = typeof error === 'object' && error !== null && 'stack' in error && typeof (error as { stack: unknown }).stack === 'string'
      ? (error as { stack: string }).stack
      : undefined;
      
    appError = {
      message: errorMessage,
      code: ERROR_CODES.INTERNAL_ERROR,
      statusCode: 500,
      details: errorStack,
      timestamp: new Date().toISOString(),
    };
  }

  logError(appError);
  return appError;
}

// Validate and sanitize error responses
export function sanitizeErrorResponse(error: AppError): Partial<AppError> {
  const { code, statusCode } = error;
  
  // Only expose safe error information to clients
  const result: Partial<AppError> = {
    message: createUserFriendlyError(error),
  };
  
  if (code) result.code = code;
  if (statusCode) result.statusCode = statusCode;
  
  return result;
}

// Centralized error handling and logging

export interface AppError {
  message: string;
  code?: string;
  statusCode?: number;
  details?: any;
  timestamp: string;
  userAgent?: string | undefined;
  url?: string | undefined;
}

export class LuminaError extends Error {
  public code: string;
  public statusCode: number;
  public details?: any;

  constructor(message: string, code: string = 'UNKNOWN_ERROR', statusCode: number = 500, details?: any) {
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
export function createUserFriendlyError(error: any): string {
  if (error instanceof LuminaError) {
    return ERROR_MESSAGES[error.code as keyof typeof ERROR_MESSAGES] || error.message;
  }
  
  if (error.code && ERROR_MESSAGES[error.code as keyof typeof ERROR_MESSAGES]) {
    return ERROR_MESSAGES[error.code as keyof typeof ERROR_MESSAGES];
  }
  
  // Handle common error patterns
  if (error.message?.includes('rate limit')) {
    return ERROR_MESSAGES[ERROR_CODES.RATE_LIMIT_EXCEEDED];
  }
  
  if (error.message?.includes('validation')) {
    return ERROR_MESSAGES[ERROR_CODES.VALIDATION_ERROR];
  }
  
  if (error.message?.includes('network') || error.message?.includes('fetch')) {
    return ERROR_MESSAGES[ERROR_CODES.NETWORK_ERROR];
  }
  
  return ERROR_MESSAGES[ERROR_CODES.INTERNAL_ERROR];
}

// Log errors for debugging and monitoring
export function logError(error: any, context?: { userAgent?: string; url?: string; userId?: string }) {
  const errorInfo: AppError = {
    message: error.message || 'Unknown error',
    code: error.code || 'UNKNOWN',
    statusCode: error.statusCode || 500,
    details: error.details || error.stack,
    timestamp: new Date().toISOString(),
    userAgent: context?.userAgent,
    url: context?.url,
  };

  // In development, log to console
  if (process.env.NODE_ENV === 'development') {
    console.error('🚨 Error logged:', errorInfo);
    if (error.stack) {
      console.error('Stack trace:', error.stack);
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
export function handleAPIError(error: any, defaultMessage: string = 'An error occurred'): AppError {
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
    appError = {
      message: error.message || defaultMessage,
      code: ERROR_CODES.INTERNAL_ERROR,
      statusCode: 500,
      details: error.stack,
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

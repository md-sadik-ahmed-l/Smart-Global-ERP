import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Input sanitization utilities
export class InputSanitizer {
  // Sanitize string values to prevent XSS, SQL injection, and other attacks
  static sanitizeString(value: any): string {
    if (typeof value !== 'string') return '';
    
    const sanitized = value
      // 1. Escape HTML special characters (XSS protection)
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/\'/g, '&#x27;')
      .replace(/`/g, '&#x60;')
      
      // 2. Escape additional control characters and dangerous symbols
      .replace(/&/g, '&amp;')
      .replace(/=/g, '&#x3D;')
      .replace(/!/g, '&#x21;')
      .replace(/@/g, '&#64;')
      .replace(/#/g, '&#35;')
      .replace(/\$/g, '&#36;')
      .replace(/%/g, '&#37;')
      .replace(/\?/g, '&#63;')
      .replace(/\*/g, '&#42;')
      .replace(/\/g, '&#92;')
      .replace(/;/g, '&#59;')
      .replace(/,/g, '&#44;')
      .replace(/\+/g, '&#43;')
      .replace(/-/g, '&#45;')
      .replace(/\./g, '&#46;')
      .replace(/_/g, '&#95;')
      .replace(/\[/g, '&#91;')
      .replace(/\]/g, '&#93;')
      .replace(/\{/g, '&#123;')
      .replace(/\}/g, '&#125;')
      .replace(/\(/g, '&#40;')
      .replace(/\)/g, '&#41;')
      .replace(/\\/g, '&#92;')
      
      // 3. Remove or escape common SQL injection patterns
      .replace(/\\b(AND|OR|SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|JOIN)\b/gi, '')
      .replace(/\\b(%27|\\'|\"|;)(0x[0-9a-f]+)?/gi, '')
      .replace(/\\b(WAITFOR|DELAY|SYSDATE|SYSDATE\(\)|GETDATE|@@version|@@session|@@hostname)/gi, '')
      .replace(/\\b(--|#|\/\*|\*\/|;)/g, '')
      
      // 4. Remove script tags and malicious patterns
      .replace(/<script[^>]*>.*?(?:\/script>|$)/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/vbscript:/gi, '')
      .replace(/onload\s*=/gi, '')
      .replace(/onerror\s*=/gi, '')
      .replace(/onclick\s*=/gi, '')
      
      // 5. Remove JSON injection patterns
      .replace(/\"\\s*:\\s*\{.*/g, '')
      .replace(/\\b(JSON|JSONP)\(/gi, '')
      
      // 6. Remove file path traversal patterns
      .replace(/\\b(\.{2}\/|\.{2}\\)/gi, '')
      .replace(/\\b(\/{2,}|\\\\\\/\\/)/g, '/')
      .replace(/[^\\x20-\\x7E]/g, '')
      
      // 7. Remove potential XSS event handlers
      .replace(/on\\w+\\s*=/gi, '')
      
      // 8. Normalize whitespace
      .replace(/\\s+/g, ' ')
      .trim();
      
    return sanitized;
  }

  // Sanitize object values recursively
  static sanitizeObject<T extends Record<string, any>>(obj: T): T {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        sanitized[key] = this.sanitizeString(value);
      } else if (Array.isArray(value)) {
        sanitized[key] = value.map(item => 
          typeof item === 'string' ? this.sanitizeString(item) : item
        );
      } else if (value && typeof value === 'object') {
        sanitized[key] = this.sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;

  // Sanitize Prisma where clauses
  static sanitizeWhereClause<T>(clause: any): T {
    if (typeof clause !== 'object' || clause === null) return clause;
    
    if (Array.isArray(clause)) {
      return clause.map(item => this.sanitizeWhereClause(item)) as any;
    }
    
    const sanitized: any = {};
    for (const [key, value] of Object.entries(clause)) {
      if (key.startsWith('$')) {
        // Special Prisma operators, sanitize their values
        sanitized[key] = this.sanitizeWhereClause(value);
      } else if (typeof value === 'string') {
        sanitized[key] = this.sanitizeString(value);
      } else {
        sanitized[key] = this.sanitizeWhereClause(value);
      }
    }
    return sanitized;
  }
}

// API middleware for validation and sanitization
export function createValidationMiddleware<T>(schema: z.ZodSchema<T>) {
  return async (req: NextRequest): Promise<{ success: true; data: T } | { success: false; error: string }> => {
    try {
      // Clone request to avoid consumption
      const clonedReq = new NextRequest(req.url, req);
      const body = await clonedReq.json();
      
      // Sanitize input data
      const sanitizedData = InputSanitizer.sanitizeObject(body);
      
      // Validate against schema
      const validatedData = schema.parse(sanitizedData);
      
      return { success: true, data: validatedData };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const message = error.errors.map(err => err.message).join(', ');
        return { success: false, error: message };
      }
      return { success: false, error: 'Invalid input data' };
    }
  };
}

// Sanitized API route wrapper
export function sanitizedApiRoute<T>(
  handler: (data: T, req: NextRequest) => Promise<NextResponse>,
  schema: z.ZodSchema<T>
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const validation = await createValidationMiddleware(schema)(req);
    
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }
    
    return await handler(validation.data, req);
  };
}
import crypto from 'crypto';

/**
 * Generate a secure random string for use as JWT_SECRET
 * @param length The length of the secret (default: 64)
 * @returns A secure random string
 */
export function generateSecureSecret(length: number = 64): string {
  return crypto.randomBytes(length).toString('hex');
}

// Helper function to check if the secret is secure enough
function isSecureSecret(secret: string): boolean {
  return secret !== 'your_jwt_secret_key' && secret.length >= 32;
}

// Get the secret key from environment or use the default (with warning)
const JWT_SECRET = import.meta.env.VITE_SESSION_SECRET;

// Log warning if using the default secret
if (!isSecureSecret(JWT_SECRET)) {
  console.warn(
    'WARNING: Using default or weak JWT_SECRET. This is insecure! ' +
    'Generate a secure secret with generateSecureSecret() and set it as an environment variable.'
  );
}

export interface TokenPayload {
  userId: number;
  isAdmin?: boolean;
}

/**
 * Base64Url encode a string or buffer
 */
function base64UrlEncode(data: string | Buffer): string {
  let str = typeof data === 'string' ? data : data.toString('base64');
  return str
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Base64Url decode to string
 */
function base64UrlDecode(str: string): string {
  // Add padding if needed
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) {
    str += '=';
  }
  return Buffer.from(str, 'base64').toString('utf8');
}

/**
 * Generate an access token for a user
 * @param userId - The user's ID
 * @param isAdmin - Whether the user is an admin
 * @returns The generated JWT token
 */
export function generateAccessToken(userId: number, isAdmin: boolean = false): string {
  // Create JWT header
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };
  
  // Create payload with user information (no expiration)
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    userId,
    isAdmin,
    iat: now
  };
  
  // Encode header and payload
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  
  // Create signature
  const signatureInput = `${encodedHeader}.${encodedPayload}`;
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(signatureInput)
    .digest('base64');
  
  // Combine all parts to form the JWT
  return `${encodedHeader}.${encodedPayload}.${base64UrlEncode(signature)}`;
}

/**
 * Validate if an access token exists and is valid
 * @param token - The JWT token to validate
 * @returns The decoded token payload if valid, null otherwise
 */
export function validateAccessToken(token: string | null | undefined): TokenPayload | null {
  // Check if token exists
  if (!token) {
    return null;
  }
  
  try {
    // Split the token into parts
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }
    
    const [encodedHeader, encodedPayload, encodedSignature] = parts;
    
    // Verify signature
    const signatureInput = `${encodedHeader}.${encodedPayload}`;
    const expectedSignature = base64UrlEncode(
      crypto
        .createHmac('sha256', JWT_SECRET)
        .update(signatureInput)
        .digest('base64')
    );
    
    if (encodedSignature !== expectedSignature) {
      return null;
    }
    
    // Decode payload
    const payload: TokenPayload = JSON.parse(base64UrlDecode(encodedPayload));
    
    return payload;
  } catch (error) {
    return null;
  }
}

/**
 * Extract token from the Authorization header
 * @param authHeader - The Authorization header value
 * @returns The extracted token or null if not found
 */
export function extractTokenFromHeader(authHeader?: string): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  return authHeader.substring(7); // Remove 'Bearer ' prefix
}

/**
 * Get user ID from authorization header
 * @param authHeader - The Authorization header value
 * @returns The user ID if token is valid, null otherwise
 */
export function getUserIdFromAuthHeader(authHeader?: string): number | null {
  const token = extractTokenFromHeader(authHeader);
  const payload = validateAccessToken(token);
  
  return payload ? payload.userId : null;
}

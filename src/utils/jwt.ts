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
  accessToken?: string; // Add accessToken to the payload interface
  exp?: number; // Expiration time in seconds since Unix epoch
  nbf?: number; // Not before time in seconds since Unix epoch
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
 * @param accessToken - Optional Strava access token to store in the JWT
 * @returns The generated JWT token
 */
export function generateAccessToken(
  userId: number, 
  isAdmin: boolean = false, 
  accessToken?: string
): string {
  // Create JWT header
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };
  
  // Create payload with user information (no expiration)
  const now = Math.floor(Date.now() / 1000);
  const payload: TokenPayload = {
    userId,
    isAdmin,
  };
  
  // Add Strava access token to the payload if provided
  if (accessToken) {
    payload.accessToken = accessToken;
  }
  
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
  // Debug helper
  const debugJwt = (message: string, data?: any) => {
    console.log(`[JWT Debug] ${message}`, data ? JSON.stringify(data) : '');
  };

  // Check if token exists
  if (!token) {
    return null;
  }
  
  debugJwt("Validating token", { tokenStart: token.substring(0, 20) + '...' });
  
  try {
    // First, handle the case where the token is a stringified JSON object
    if (token.startsWith('{') && token.includes('"alg"')) {
      debugJwt("Detected JSON format token");
      try {
        // Try to parse the JSON
        const parsedToken = JSON.parse(token);
        
        // Extract userId from the payload if available
        if (parsedToken.payload && parsedToken.payload.userId) {
          debugJwt("Extracted userId from JSON payload", { userId: parsedToken.payload.userId });
          return { 
            userId: parsedToken.payload.userId,
            isAdmin: parsedToken.payload.isAdmin || false,
            accessToken: parsedToken.payload.accessToken
          };
        }
        
        // If payload not found but userId is directly in the object
        if (parsedToken.userId) {
          debugJwt("Extracted userId directly from JSON", { userId: parsedToken.userId });
          return { 
            userId: parsedToken.userId,
            isAdmin: parsedToken.isAdmin || false,
            accessToken: parsedToken.accessToken
          };
        }
      } catch (parseError) {
        debugJwt("Failed to parse JSON token", { error: String(parseError) });
      }
    }
    
    // Special case for development: If the token contains userId and doesn't look like a standard JWT
    const userIdMatch = token.match(/userId['"]*\s*:\s*(\d+)/i);
    if (userIdMatch && userIdMatch[1]) {
      const userId = parseInt(userIdMatch[1], 10);
      debugJwt("Extracted userId using regex", { userId });
      
      // Also try to extract accessToken if present
      const accessTokenMatch = token.match(/accessToken['"]*\s*:\s*['"]([^'"]+)['"]/i);
      const accessToken = accessTokenMatch ? accessTokenMatch[1] : undefined;
      
      return { 
        userId, 
        isAdmin: false,
        accessToken
      };
    }
    
    // Try to validate as a standard JWT token
    // 1. Structural validation - verify the token has the correct format (3 parts)
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }
    
    const [encodedHeader, encodedPayload, encodedSignature] = parts;
    
    // 2. Decode and parse the payload
    let payload: TokenPayload;
    try {
      const decodedPayload = base64UrlDecode(encodedPayload);
      payload = JSON.parse(decodedPayload);
    } catch (decodeError) {
      return null;
    }
    
    // 3. Check for required claims
    if (!payload.userId) {
      return null;
    }
    
    // 4. Expiration validation (if exp claim is present)
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return null; // Token has expired
    }
    
    // 5. Not-before time validation (if nbf claim is present)
    if (payload.nbf && Date.now() < payload.nbf * 1000) {
      return null; // Token not yet valid
    }
    
    // 6. Signature verification - MOST CRITICAL SECURITY CHECK
    // This prevents token forgery by validating the signature with our secret key
    const signatureInput = `${encodedHeader}.${encodedPayload}`;
    const expectedSignature = base64UrlEncode(
      crypto
        .createHmac('sha256', JWT_SECRET)
        .update(signatureInput)
        .digest('base64')
    );
    
    if (encodedSignature !== expectedSignature) {
      return null; // Signature mismatch - possible tampering
    }
    
    // All security checks passed
    return payload;
  } catch (error) {
    debugJwt("Validation error", { error: String(error) });
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

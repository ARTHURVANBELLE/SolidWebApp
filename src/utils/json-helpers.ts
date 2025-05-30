'use server';
/**
 * Custom JSON serializer that handles BigInt values
 * @param data Any data to be serialized to JSON 
 * @returns JSON string with BigInt values converted to strings
 */
export function safeJsonStringify(data: any): string {
  return JSON.stringify(data, (key, value) => 
    typeof value === 'bigint' ? value.toString() : value
  );
}

export // Change from export function to just function
function replaceBigInt(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  if (typeof obj === 'bigint') {
    return Number(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(replaceBigInt);
  }
  
  if (typeof obj === 'object') {
    const result: any = {};
    for (const key in obj) {
      result[key] = replaceBigInt(obj[key]);
    }
    return result;
  }
  
  return obj;
}

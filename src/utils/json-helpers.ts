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

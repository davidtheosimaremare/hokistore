import CryptoJS from 'crypto-js';

const SECRET_KEY = 'NqS1k5iqrOEWIAzXnsN8kKEpYOkDdPDekxhF5yVOKkC0O4q6XBo89GRnpNvat1JS';

export function generateTimestamp(): string {
  // Use Asia/Jakarta timezone to match Accurate API server
  const now = new Date();
  const jakartaTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Jakarta"}));
  
  const day = String(jakartaTime.getDate()).padStart(2, '0');
  const month = String(jakartaTime.getMonth() + 1).padStart(2, '0');
  const year = jakartaTime.getFullYear();
  const hours = String(jakartaTime.getHours()).padStart(2, '0');
  const minutes = String(jakartaTime.getMinutes()).padStart(2, '0');
  const seconds = String(jakartaTime.getSeconds()).padStart(2, '0');
  
  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
}

export function generateSignature(timestamp: string): string {
  // Generate HMAC-SHA256 and explicitly convert to hex
  const hash = CryptoJS.HmacSHA256(timestamp, SECRET_KEY);
  return hash.toString(CryptoJS.enc.Hex);
}

export function getApiHeaders() {
  const timestamp = generateTimestamp();
  const signature = generateSignature(timestamp);
  
  return {
    'Authorization': 'Bearer aat.NTA.eyJ2IjoxLCJ1Ijo1NDk3NjksImQiOjk3NjgxNywiYWkiOjU1NjA5LCJhayI6IjIyYzMxYzc1LTNhZjctNGRmZS04NzcwLTNiOWExMmNjMzAwYSIsImFuIjoiV2ViIEFwaSIsImFwIjoiYTNkYmJmY2MtMmU2Ny00YjQ5LTljNDQtNjNjZTlkNjk3ODllIiwidCI6MTc0NzIxOTgyNDI2M30.10JQiTa7Q3cwGX05diQxsXpOwL/NEe4zFfuStrupwrG5a+vbUhh79qIEh+yMct9YG0qtsLt8E6aMzcP62qBTMTiQjzvpAM8qXxFsvbhw6KZSVm9ToIvWF6a4xxI6/ZwqahtuKYyTG9/siqVc6xQlkCvd8Kb0Aawf0R+3qbWWM3gpt7lsM35lQRefpWmD1jqKqpPFeaFOcXIkJJYfVh9L/w==.YfeJD4hHsaPidTOmY40RwuADLVSauKlIVSlpf3teZDg',
    'X-Api-Timestamp': timestamp,
    'X-Api-Signature': signature,
    'Content-Type': 'application/json'
  };
}

/**
 * Test function to display API headers in console
 * @returns Object containing headers and debug info
 */
export function testApiHeaders() {
  const timestamp = generateTimestamp();
  const signature = generateSignature(timestamp);
  const headers = getApiHeaders();
  
  // Additional debug info for hex verification
  const hashObject = CryptoJS.HmacSHA256(timestamp, SECRET_KEY);
  const hexSignature = hashObject.toString(CryptoJS.enc.Hex);
  const base64Signature = hashObject.toString(CryptoJS.enc.Base64);
  
  const debugInfo = {
    timestamp: timestamp,
    signature: signature,
    secretKey: SECRET_KEY,
    headers: headers,
    signatureGeneration: {
      input: timestamp,
      secretKey: SECRET_KEY,
      algorithm: 'HMAC-SHA256',
      outputHex: hexSignature,
      outputBase64: base64Signature,
      usedOutput: signature
    }
  };
  
  console.log('=== API HEADERS DEBUG ===');
  console.log('Timestamp:', timestamp);
  console.log('Secret Key:', SECRET_KEY);
  console.log('Signature Input:', timestamp);
  console.log('Generated Signature (HEX):', hexSignature);
  console.log('Generated Signature (Base64):', base64Signature);
  console.log('Used Signature:', signature);
  console.log('');
  console.log('Complete Headers:');
  console.log(JSON.stringify(headers, null, 2));
  console.log('');
  console.log('Full Debug Info:');
  console.log(JSON.stringify(debugInfo, null, 2));
  console.log('========================');
  
  return debugInfo;
} 
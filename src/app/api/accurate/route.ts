import { NextRequest, NextResponse } from 'next/server';
import { getApiHeaders } from '@/utils/crypto';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const endpoint = searchParams.get('endpoint') || 'item/list.do';
    
    console.log('🔄 API Route called with endpoint:', endpoint);
    console.log('🔄 Full search params:', Object.fromEntries(searchParams.entries()));
    
    // Forward all query parameters except 'endpoint'
    const forwardParams = new URLSearchParams();
    searchParams.forEach((value, key) => {
      if (key !== 'endpoint') {
        forwardParams.append(key, value);
      }
    });
    
    const headers = getApiHeaders();
    const accurateUrl = `http://zeus.accurate.id/accurate/api/${endpoint}?${forwardParams.toString()}`;
    
    console.log('🔗 Proxying request to:', accurateUrl);
    console.log('📤 Request Headers:', headers);
    
    const response = await fetch(accurateUrl, {
      method: 'GET',
      headers: headers,
    });
    
    console.log('📥 Response Status:', response.status, response.statusText);
    console.log('📥 Response Headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error Details:', response.status, response.statusText, errorText);
      
      return NextResponse.json(
        { 
          error: `Accurate API error: ${response.status} ${response.statusText}`,
          details: errorText,
          success: false,
          url: accurateUrl
        },
        { 
          status: response.status,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          }
        }
      );
    }
    
    const data = await response.json();
    console.log('✅ API Response Success, data length:', data?.d?.length || 'No data array');
    console.log('✅ API Response structure:', { s: data.s, hasData: !!data.d, messageExists: !!data.message });
    
    return NextResponse.json(data, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });
    
  } catch (error) {
    console.error('❌ Proxy Critical Error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch from Accurate API',
        details: errorMessage,
        success: false 
      },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      }
    );
  }
} 
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { folder = 'properties', resource_type = 'image' } = body;

    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

    if (!apiSecret || !apiKey || !cloudName) {
      return NextResponse.json(
        { error: 'Cloudinary configuration missing' },
        { status: 500 }
      );
    }

    const timestamp = Math.round(new Date().getTime() / 1000);
    
    // Only include parameters that will be sent to Cloudinary in the signature
    // The signature must include ALL parameters that are sent (except file, signature, api_key, timestamp itself)
    // But for folder-based uploads, we need to include folder in signature
    const params: Record<string, string> = {
      timestamp: timestamp.toString(),
    };
    
    // Only add folder if provided (required for signature if sent in upload)
    if (folder) {
      params.folder = folder;
    }

    // Generate signature - sort keys alphabetically
    const sortedParams = Object.keys(params)
      .sort()
      .map((key) => `${key}=${params[key]}`)
      .join('&');

    const stringToSign = `${sortedParams}${apiSecret}`;
    const signature = crypto.createHash('sha1').update(stringToSign).digest('hex');
    
    console.log('Generated Cloudinary signature:', {
      params,
      stringToSign: sortedParams,
      signatureLength: signature.length,
    });

    return NextResponse.json({
      signature,
      timestamp,
      api_key: apiKey,
      folder,
    });
  } catch (error) {
    console.error('Error generating Cloudinary signature:', error);
    return NextResponse.json(
      { error: 'Failed to generate signature' },
      { status: 500 }
    );
  }
}





















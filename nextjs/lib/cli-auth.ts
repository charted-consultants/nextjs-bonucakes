import { NextRequest, NextResponse } from 'next/server';

export function checkCliAuth(request: NextRequest): boolean {
  const key =
    request.headers.get('x-api-key') ||
    request.headers.get('authorization')?.replace('Bearer ', '');
  return !!key && key === process.env.CLI_API_KEY;
}

export function unauthorizedCliResponse() {
  return NextResponse.json({ error: 'Invalid or missing API key' }, { status: 401 });
}

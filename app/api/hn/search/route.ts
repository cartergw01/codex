import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q') ?? '';
  const res = await fetch(`https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(q)}`);
  return NextResponse.json(await res.json());
}

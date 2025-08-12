export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - livekit-server-sdk has no types but works at runtime
import { AccessToken } from 'livekit-server-sdk';

const LIVEKIT_URL   = process.env.LIVEKIT_URL as string;
const LIVEKIT_API_KEY    = process.env.LIVEKIT_API_KEY as string;
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET as string;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const room = searchParams.get('room') ?? 'test-room';
  const name = searchParams.get('name') ?? 'guest';

  const at = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, { identity: name, name });
  at.addGrant({ roomJoin: true, room });

  // toJwt may be async in newer SDK versions; await to ensure we send a string
  const jwt: string = await at.toJwt();

  return NextResponse.json({ token: jwt, url: LIVEKIT_URL });
} 
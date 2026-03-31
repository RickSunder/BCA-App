import { NextResponse } from 'next/server';

export const ok = (body: unknown) => NextResponse.json(body);

export const created = (body: unknown) => NextResponse.json(body, { status: 201 });

export const noContent = () => new NextResponse(null, { status: 204 });

export const notFound = (msg = 'Not found') =>
  NextResponse.json({ error: msg }, { status: 404 });

export const badRequest = (msg: string) =>
  NextResponse.json({ error: msg }, { status: 400 });

export const internalError = (err: unknown) =>
  NextResponse.json(
    { error: err instanceof Error ? err.message : 'Internal server error' },
    { status: 500 }
  );

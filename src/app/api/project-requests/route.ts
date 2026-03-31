import { NextRequest } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getPool } from '@/lib/db';
import { ok, created, badRequest, internalError } from '@/lib/response';

export async function GET() {
  try {
    const pool = await getPool();
    const result = await pool
      .request()
      .query(`SELECT * FROM ProjectRequest ORDER BY createdAt DESC`);
    return ok(result.recordset);
  } catch (err) {
    return internalError(err);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, crop, requestType, requestedBy, parentLine, traitOfInterest } = body;

    if (!title || !crop || !requestType || !requestedBy) {
      return badRequest('title, crop, requestType, requestedBy are required');
    }

    const id = uuidv4();
    const pool = await getPool();
    await pool
      .request()
      .input('id', id)
      .input('title', title)
      .input('crop', crop)
      .input('requestType', requestType)
      .input('requestedBy', requestedBy)
      .input('parentLine', parentLine ?? '')
      .input('traitOfInterest', traitOfInterest ?? '')
      .query(`
        INSERT INTO ProjectRequest (id, title, crop, requestType, requestedBy, parentLine, traitOfInterest)
        VALUES (@id, @title, @crop, @requestType, @requestedBy, @parentLine, @traitOfInterest)
      `);

    const row = await pool.request().input('id', id).query(
      `SELECT * FROM ProjectRequest WHERE id = @id`
    );
    return created(row.recordset[0]);
  } catch (err) {
    return internalError(err);
  }
}

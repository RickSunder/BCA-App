import { NextRequest } from 'next/server';
import { getPool } from '@/lib/db';
import { ok, noContent, notFound, internalError } from '@/lib/response';

type Params = { params: { id: string } };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = params;
    const pool = await getPool();
    const result = await pool.request().input('id', id).query(
      `SELECT * FROM ProjectRequest WHERE id = @id`
    );
    if (!result.recordset.length) return notFound();
    return ok(result.recordset[0]);
  } catch (err) {
    return internalError(err);
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const { id } = params;
    const body = await request.json();
    const pool = await getPool();

    const existing = await pool.request().input('id', id).query(
      `SELECT * FROM ProjectRequest WHERE id = @id`
    );
    if (!existing.recordset.length) return notFound();
    const cur = existing.recordset[0];

    await pool
      .request()
      .input('id', id)
      .input('title', body.title ?? cur.title)
      .input('crop', body.crop ?? cur.crop)
      .input('requestType', body.requestType ?? cur.requestType)
      .input('requestedBy', body.requestedBy ?? cur.requestedBy)
      .input('parentLine', body.parentLine ?? cur.parentLine)
      .input('traitOfInterest', body.traitOfInterest ?? cur.traitOfInterest)
      .input('status', body.status ?? cur.status)
      .query(`
        UPDATE ProjectRequest
        SET title = @title, crop = @crop, requestType = @requestType,
            requestedBy = @requestedBy, parentLine = @parentLine,
            traitOfInterest = @traitOfInterest, status = @status,
            updatedAt = GETUTCDATE()
        WHERE id = @id
      `);

    const updated = await pool.request().input('id', id).query(
      `SELECT * FROM ProjectRequest WHERE id = @id`
    );
    return ok(updated.recordset[0]);
  } catch (err) {
    return internalError(err);
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { id } = params;
    const pool = await getPool();
    const existing = await pool.request().input('id', id).query(
      `SELECT id FROM ProjectRequest WHERE id = @id`
    );
    if (!existing.recordset.length) return notFound();
    await pool.request().input('id', id).query(
      `DELETE FROM ProjectRequest WHERE id = @id`
    );
    return noContent();
  } catch (err) {
    return internalError(err);
  }
}

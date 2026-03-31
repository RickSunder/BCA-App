import { NextRequest } from 'next/server';
import { getPool } from '@/lib/db';
import { ok, noContent, notFound, internalError } from '@/lib/response';

type Params = { params: { id: string; itemId: string } };

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const { itemId } = params;
    const body = await request.json();
    const pool = await getPool();
    const existing = await pool.request().input('id', itemId).query(
      `SELECT * FROM TransplantListItem WHERE id = @id`
    );
    if (!existing.recordset.length) return notFound();
    const cur = existing.recordset[0];
    await pool
      .request()
      .input('id', itemId)
      .input('fromLocation', body.fromLocation ?? cur.fromLocation)
      .input('toLocation', body.toLocation ?? cur.toLocation)
      .input('count', body.count ?? cur.count)
      .query(`
        UPDATE TransplantListItem
        SET fromLocation = @fromLocation, toLocation = @toLocation, count = @count
        WHERE id = @id
      `);
    const updated = await pool.request().input('id', itemId).query(
      `SELECT * FROM TransplantListItem WHERE id = @id`
    );
    return ok(updated.recordset[0]);
  } catch (err) {
    return internalError(err);
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { itemId } = params;
    const pool = await getPool();
    const existing = await pool.request().input('id', itemId).query(
      `SELECT id FROM TransplantListItem WHERE id = @id`
    );
    if (!existing.recordset.length) return notFound();
    await pool.request().input('id', itemId).query(
      `DELETE FROM TransplantListItem WHERE id = @id`
    );
    return noContent();
  } catch (err) {
    return internalError(err);
  }
}

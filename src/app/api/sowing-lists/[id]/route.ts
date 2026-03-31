import { NextRequest } from 'next/server';
import { getPool } from '@/lib/db';
import { ok, noContent, notFound, internalError } from '@/lib/response';

type Params = { params: { id: string } };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = params;
    const pool = await getPool();
    const listRes = await pool.request().input('id', id).query(
      `SELECT * FROM SowingList WHERE id = @id`
    );
    if (!listRes.recordset.length) return notFound();
    const itemsRes = await pool.request().input('id', id).query(
      `SELECT * FROM SowingListItem WHERE sowingListId = @id ORDER BY material ASC`
    );
    return ok({ ...listRes.recordset[0], items: itemsRes.recordset });
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
      `SELECT * FROM SowingList WHERE id = @id`
    );
    if (!existing.recordset.length) return notFound();
    await pool
      .request()
      .input('id', id)
      .input('name', body.name ?? existing.recordset[0].name)
      .query(`UPDATE SowingList SET name = @name WHERE id = @id`);
    const updated = await pool.request().input('id', id).query(
      `SELECT * FROM SowingList WHERE id = @id`
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
      `SELECT id FROM SowingList WHERE id = @id`
    );
    if (!existing.recordset.length) return notFound();
    await pool.request().input('id', id).query(`DELETE FROM SowingList WHERE id = @id`);
    return noContent();
  } catch (err) {
    return internalError(err);
  }
}

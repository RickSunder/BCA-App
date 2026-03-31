import { NextRequest } from 'next/server';
import { getPool } from '@/lib/db';
import { ok, noContent, notFound, internalError } from '@/lib/response';

type Params = { params: { id: string } };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = params;
    const pool = await getPool();
    const result = await pool.request().input('id', id).query(`
      SELECT p.*, pr.title AS requestTitle, pr.crop, pr.requestType
      FROM Project p
      LEFT JOIN ProjectRequest pr ON pr.id = p.projectRequestId
      WHERE p.id = @id
    `);
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
      `SELECT * FROM Project WHERE id = @id`
    );
    if (!existing.recordset.length) return notFound();
    const cur = existing.recordset[0];

    await pool
      .request()
      .input('id', id)
      .input('owner', body.owner ?? cur.owner)
      .input('stage', body.stage ?? cur.stage)
      .query(`
        UPDATE Project SET owner = @owner, stage = @stage, updatedAt = GETUTCDATE()
        WHERE id = @id
      `);

    const updated = await pool.request().input('id', id).query(
      `SELECT * FROM Project WHERE id = @id`
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
      `SELECT id FROM Project WHERE id = @id`
    );
    if (!existing.recordset.length) return notFound();
    await pool.request().input('id', id).query(`DELETE FROM Project WHERE id = @id`);
    return noContent();
  } catch (err) {
    return internalError(err);
  }
}

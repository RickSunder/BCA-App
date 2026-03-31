import { NextRequest } from 'next/server';
import { getPool } from '@/lib/db';
import { ok, notFound, badRequest, internalError } from '@/lib/response';

type Params = { params: { id: string } };

export async function POST(_req: NextRequest, { params }: Params) {
  try {
    const { id } = params;
    const pool = await getPool();
    const existing = await pool.request().input('id', id).query(
      `SELECT * FROM ProjectRequest WHERE id = @id`
    );
    if (!existing.recordset.length) return notFound();

    const current = existing.recordset[0];
    if (current.status !== 'Draft') {
      return badRequest(
        `Cannot submit a request with status '${current.status}'. Must be Draft.`
      );
    }

    await pool.request().input('id', id).query(`
      UPDATE ProjectRequest SET status = 'Submitted', updatedAt = GETUTCDATE()
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

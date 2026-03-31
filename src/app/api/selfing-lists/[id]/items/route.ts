import { NextRequest } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getPool } from '@/lib/db';
import { created, badRequest, internalError } from '@/lib/response';

type Params = { params: { id: string } };

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const selfingListId = params.id;
    const body = await request.json();
    const { plant, plannedCount } = body;
    if (!plant) return badRequest('plant is required');
    const itemId = uuidv4();
    const pool = await getPool();
    await pool
      .request()
      .input('id', itemId)
      .input('selfingListId', selfingListId)
      .input('plant', plant)
      .input('plannedCount', plannedCount ?? 0)
      .query(`
        INSERT INTO SelfingListItem (id, selfingListId, plant, plannedCount)
        VALUES (@id, @selfingListId, @plant, @plannedCount)
      `);
    const row = await pool.request().input('id', itemId).query(
      `SELECT * FROM SelfingListItem WHERE id = @id`
    );
    return created(row.recordset[0]);
  } catch (err) {
    return internalError(err);
  }
}

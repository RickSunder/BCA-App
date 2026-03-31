import { NextRequest } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getPool } from '@/lib/db';
import { created, badRequest, internalError } from '@/lib/response';

type Params = { params: { id: string } };

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const sowingListId = params.id;
    const body = await request.json();
    const { material, quantity, location } = body;
    if (!material) return badRequest('material is required');
    const itemId = uuidv4();
    const pool = await getPool();
    await pool
      .request()
      .input('id', itemId)
      .input('sowingListId', sowingListId)
      .input('material', material)
      .input('quantity', quantity ?? 0)
      .input('location', location ?? '')
      .query(`
        INSERT INTO SowingListItem (id, sowingListId, material, quantity, location)
        VALUES (@id, @sowingListId, @material, @quantity, @location)
      `);
    const row = await pool.request().input('id', itemId).query(
      `SELECT * FROM SowingListItem WHERE id = @id`
    );
    return created(row.recordset[0]);
  } catch (err) {
    return internalError(err);
  }
}

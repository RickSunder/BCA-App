import { NextRequest } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getPool } from '@/lib/db';
import { created, badRequest, internalError } from '@/lib/response';

type Params = { params: { id: string } };

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const transplantListId = params.id;
    const body = await request.json();
    const { fromLocation, toLocation, count } = body;
    if (!fromLocation) return badRequest('fromLocation is required');
    if (!toLocation) return badRequest('toLocation is required');
    const itemId = uuidv4();
    const pool = await getPool();
    await pool
      .request()
      .input('id', itemId)
      .input('transplantListId', transplantListId)
      .input('fromLocation', fromLocation)
      .input('toLocation', toLocation)
      .input('count', count ?? 0)
      .query(`
        INSERT INTO TransplantListItem (id, transplantListId, fromLocation, toLocation, count)
        VALUES (@id, @transplantListId, @fromLocation, @toLocation, @count)
      `);
    const row = await pool.request().input('id', itemId).query(
      `SELECT * FROM TransplantListItem WHERE id = @id`
    );
    return created(row.recordset[0]);
  } catch (err) {
    return internalError(err);
  }
}

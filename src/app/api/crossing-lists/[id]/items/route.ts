import { NextRequest } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getPool } from '@/lib/db';
import { created, badRequest, internalError } from '@/lib/response';

type Params = { params: { id: string } };

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const crossingListId = params.id;
    const body = await request.json();
    const { female, male, plannedCount } = body;
    if (!female) return badRequest('female is required');
    if (!male) return badRequest('male is required');
    const itemId = uuidv4();
    const pool = await getPool();
    await pool
      .request()
      .input('id', itemId)
      .input('crossingListId', crossingListId)
      .input('female', female)
      .input('male', male)
      .input('plannedCount', plannedCount ?? 0)
      .query(`
        INSERT INTO CrossingListItem (id, crossingListId, female, male, plannedCount)
        VALUES (@id, @crossingListId, @female, @male, @plannedCount)
      `);
    const row = await pool.request().input('id', itemId).query(
      `SELECT * FROM CrossingListItem WHERE id = @id`
    );
    return created(row.recordset[0]);
  } catch (err) {
    return internalError(err);
  }
}

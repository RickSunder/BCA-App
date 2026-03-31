import { NextRequest } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getPool } from '@/lib/db';
import { ok, created, badRequest, internalError } from '@/lib/response';

export async function GET(request: NextRequest) {
  try {
    const projectId = request.nextUrl.searchParams.get('projectId');
    if (!projectId) return badRequest('projectId query param required');
    const pool = await getPool();
    const result = await pool.request().input('pid', projectId).query(`
      SELECT sl.*,
        (SELECT id, plant, plannedCount
         FROM SelfingListItem WHERE selfingListId = sl.id
         FOR JSON PATH) AS itemsJson
      FROM SelfingList sl
      WHERE sl.projectId = @pid
      ORDER BY sl.createdAt ASC
    `);
    const rows = result.recordset.map((r) => ({
      ...r,
      items: r.itemsJson ? JSON.parse(r.itemsJson) : [],
      itemsJson: undefined,
    }));
    return ok(rows);
  } catch (err) {
    return internalError(err);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, name } = body;
    if (!projectId) return badRequest('projectId is required');
    const id = uuidv4();
    const pool = await getPool();
    await pool
      .request()
      .input('id', id)
      .input('projectId', projectId)
      .input('name', name ?? '')
      .query(`INSERT INTO SelfingList (id, projectId, name) VALUES (@id, @projectId, @name)`);
    const row = await pool.request().input('id', id).query(
      `SELECT * FROM SelfingList WHERE id = @id`
    );
    return created({ ...row.recordset[0], items: [] });
  } catch (err) {
    return internalError(err);
  }
}

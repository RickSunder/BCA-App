import { getPool } from '@/lib/db';
import { ok, internalError } from '@/lib/response';

export async function GET() {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT p.*, pr.title AS requestTitle, pr.crop, pr.requestType
      FROM Project p
      LEFT JOIN ProjectRequest pr ON pr.id = p.projectRequestId
      ORDER BY p.createdAt DESC
    `);
    return ok(result.recordset);
  } catch (err) {
    return internalError(err);
  }
}

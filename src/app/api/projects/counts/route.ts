import { getPool } from '@/lib/db';
import { ok, internalError } from '@/lib/response';

export async function GET() {
  try {
    const pool = await getPool();
    const reqCount = await pool
      .request()
      .query(`SELECT COUNT(*) AS total FROM ProjectRequest`);
    const projCount = await pool
      .request()
      .query(`SELECT COUNT(*) AS total FROM Project`);
    return ok({
      projectRequests: reqCount.recordset[0].total,
      projects: projCount.recordset[0].total,
    });
  } catch (err) {
    return internalError(err);
  }
}

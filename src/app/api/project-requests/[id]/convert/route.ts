import { NextRequest } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getPool } from '@/lib/db';
import { created, notFound, badRequest, internalError } from '@/lib/response';
import { generateProjectId } from '@/lib/projectId';

type Params = { params: { id: string } };

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { id } = params;
    const pool = await getPool();
    const existing = await pool.request().input('id', id).query(
      `SELECT * FROM ProjectRequest WHERE id = @id`
    );
    if (!existing.recordset.length) return notFound();

    const current = existing.recordset[0];
    if (!['Submitted', 'InReview'].includes(current.status)) {
      return badRequest(
        `Cannot convert a request with status '${current.status}'. Must be Submitted or InReview.`
      );
    }

    let owner = current.requestedBy;
    try {
      const body = await request.json();
      if (body?.owner) owner = body.owner;
    } catch {
      // body is optional
    }

    const projectId = await generateProjectId(current.requestType);
    const newProjectUuid = uuidv4();

    await pool
      .request()
      .input('pid', newProjectUuid)
      .input('projectId', projectId)
      .input('requestId', id)
      .input('owner', owner)
      .query(`
        INSERT INTO Project (id, projectId, projectRequestId, owner)
        VALUES (@pid, @projectId, @requestId, @owner)
      `);

    await pool.request().input('id', id).query(`
      UPDATE ProjectRequest SET status = 'Converted', updatedAt = GETUTCDATE()
      WHERE id = @id
    `);

    const updatedReq = await pool.request().input('id', id).query(
      `SELECT * FROM ProjectRequest WHERE id = @id`
    );
    const project = await pool.request().input('pid', newProjectUuid).query(
      `SELECT * FROM Project WHERE id = @pid`
    );

    return created({
      projectRequest: updatedReq.recordset[0],
      project: project.recordset[0],
    });
  } catch (err) {
    return internalError(err);
  }
}

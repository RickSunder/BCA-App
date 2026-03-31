import { getPool } from './db';

export async function generateProjectId(requestType: string): Promise<string> {
  const pool = await getPool();
  const transaction = pool.transaction();
  await transaction.begin();

  try {
    const year = new Date().getFullYear();

    await transaction
      .request()
      .input('rt', requestType)
      .input('yr', year)
      .query(`
        IF NOT EXISTS (
          SELECT 1 FROM Counter WHERE requestType = @rt AND year = @yr
        )
        INSERT INTO Counter (requestType, year, currentValue)
        VALUES (@rt, @yr, 0)
      `);

    const result = await transaction
      .request()
      .input('rt2', requestType)
      .input('yr2', year)
      .query(`
        UPDATE Counter
        SET currentValue = currentValue + 1
        OUTPUT INSERTED.currentValue
        WHERE requestType = @rt2 AND year = @yr2
      `);

    await transaction.commit();

    const n: number = result.recordset[0].currentValue;
    return `NL_${requestType}_${String(n).padStart(4, '0')}`;
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
}

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    // Use service role so ANY visitor (logged in or not) can read/update
    const records = await base44.asServiceRole.entities.VisitorCount.list();

    if (records && records.length > 0) {
      const rec = records[0];
      const newCount = (rec.count || 0) + 1;
      await base44.asServiceRole.entities.VisitorCount.update(rec.id, { count: newCount });
      return Response.json({ count: newCount });
    }

    // If no record exists, create one
    const created = await base44.asServiceRole.entities.VisitorCount.create({ count: 1 });
    return Response.json({ count: 1 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

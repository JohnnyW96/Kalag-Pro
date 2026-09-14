import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { warehouse, items, pluga, expected_return_date, notes } = body;

    if (!warehouse || !items || !items.length || !pluga) {
      return Response.json({ error: 'חסרים פרטים (מחסן, פריטים, פלוגה)' }, { status: 400 });
    }

    const today = new Date().toISOString().split('T')[0];

    // Fetch warehouse items and validate availability
    const warehouseItems = await base44.entities.WarehouseItem.filter({ warehouse });
    const updates = [];
    for (const item of items) {
      const wi = warehouseItems.find((w) => w.name === item.name);
      if (!wi) {
        return Response.json({ error: `פריט "${item.name}" לא נמצא במחסן` }, { status: 400 });
      }
      if (wi.quantity < item.quantity) {
        return Response.json({ error: `אין מספיק "${item.name}" במלאי (יש ${wi.quantity}, ביקשת ${item.quantity})` }, { status: 400 });
      }
      updates.push({ id: wi.id, quantity: wi.quantity - item.quantity });
    }

    // Decrement inventory
    for (const u of updates) {
      await base44.entities.WarehouseItem.update(u.id, { quantity: u.quantity });
    }

    // Create withdrawal record
    const withdrawal = await base44.entities.WithdrawalRequest.create({
      warehouse,
      items: items.map((i) => ({ name: i.name, quantity: i.quantity, returnable: i.returnable })),
      requested_by_name: user.full_name || user.email,
      pluga,
      request_date: today,
      expected_return_date: expected_return_date || undefined,
      notes: notes || undefined,
    });

    // Track returnable equipment
    const returnableItems = items.filter((i) => i.returnable);
    if (returnableItems.length > 0) {
      await base44.entities.EquipmentHolding.bulkCreate(
        returnableItems.map((i) => ({
          item_name: i.name,
          warehouse,
          quantity: i.quantity,
          pluga,
          held_by_name: user.full_name || user.email,
          withdrawal_date: today,
          expected_return_date: expected_return_date || undefined,
        }))
      );
    }

    // Send email notification to all subscribers
    const settings = await base44.entities.EquipmentSettings.list();
    const emails = settings[0]?.notification_emails || [];
    if (emails.length > 0) {
      const itemsList = items.map((i) =>
        `<li>${i.name} - כמות: ${i.quantity}${i.returnable ? ' (להחזרה)' : ''}</li>`
      ).join('');
      const html = `
        <div dir="rtl" style="font-family: sans-serif; line-height: 1.6;">
          <h2>התראת משיכת ציוד חדשה</h2>
          <p><strong>מבקש:</strong> ${user.full_name || user.email}</p>
          <p><strong>פלוגה:</strong> ${pluga}</p>
          <p><strong>מחסן:</strong> ${warehouse}</p>
          <p><strong>תאריך:</strong> ${today}</p>
          ${expected_return_date ? `<p><strong>תאריך החזרה צפוי:</strong> ${expected_return_date}</p>` : ''}
          <h3>פריטים שנמשכו:</h3>
          <ul>${itemsList}</ul>
          ${notes ? `<p><strong>הערות:</strong> ${notes}</p>` : ''}
        </div>
      `;
      for (const email of emails) {
        try {
          await base44.asServiceRole.integrations.Core.SendEmail({
            to: email,
            subject: `משיכת ציוד חדשה - ${pluga}`,
            html,
          });
        } catch (e) {
          // Email failure shouldn't block the withdrawal
        }
      }
    }

    return Response.json({ success: true, withdrawal });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
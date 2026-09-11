import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const email = (body?.email || "").toString().trim().toLowerCase();
    const full_name = (body?.full_name || "").toString().trim();

    if (!email || !email.includes("@")) {
      return Response.json({ error: "נדרש אימייל תקין" }, { status: 400 });
    }

    // Check for existing request with same email
    const existing = await base44.asServiceRole.entities.AccessRequest.filter({ email });
    if (existing.length > 0) {
      const pending = existing.find((r) => r.status === "pending");
      if (pending) {
        return Response.json({ error: "הבקשה כבר נשלחה וממתינה לאישור" }, { status: 409 });
      }
      return Response.json({ error: "כבר הוגשה בקשה עם אימייל זה" }, { status: 409 });
    }

    await base44.asServiceRole.entities.AccessRequest.create({
      email,
      full_name,
      status: "pending",
    });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
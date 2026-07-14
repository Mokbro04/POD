import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Resend } from "resend";
import { createAdminClient } from "@/lib/supabase/server";
import { formatDZD } from "@/lib/utils";

export const runtime = "nodejs";

const orderItemSchema = z.object({
  product_id: z.string(),
  product_name: z.string(),
  quantity: z.number().int().positive(),
  unit_price: z.number().nonnegative(),
  size: z.string(),
  color: z.string(),
  custom_design_url: z.string().nullable(),
});

const orderSchema = z.object({
  first_name: z.string().min(2),
  last_name: z.string().min(2),
  phone: z.string().regex(/^0[5-7][0-9]{8}$/),
  wilaya_code: z.string(),
  wilaya_name: z.string(),
  commune_name: z.string(),
  address_line: z.string().nullable(),
  items: z.array(orderItemSchema).min(1),
  subtotal: z.number().nonnegative(),
  shipping_fee: z.number().nonnegative(),
  total: z.number().nonnegative(),
  notes: z.string().nullable().optional(),
});

export async function POST(req: NextRequest) {
  let payload;
  try {
    payload = orderSchema.parse(await req.json());
  } catch (err) {
    return NextResponse.json(
      { error: "Invalid order data", details: err instanceof z.ZodError ? err.issues : undefined },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  const { data: order, error: dbError } = await supabase
    .from("orders")
    .insert({
      status: "pending",
      first_name: payload.first_name,
      last_name: payload.last_name,
      phone: payload.phone,
      wilaya_code: payload.wilaya_code,
      wilaya_name: payload.wilaya_name,
      commune_name: payload.commune_name,
      address_line: payload.address_line,
      delivery_type: "home",
      items: payload.items,
      subtotal: payload.subtotal,
      shipping_fee: payload.shipping_fee,
      total: payload.total,
      notes: payload.notes ?? null,
    })
    .select()
    .single();

  if (dbError) {
    console.error("Supabase insert error:", dbError);
    return NextResponse.json({ error: "Could not save order" }, { status: 500 });
  }

  // Fire-and-forget admin notification — a failed email should never block
  // the customer's order confirmation, so errors are only logged.
  try {
    await notifyAdmin(order);
  } catch (emailError) {
    console.error("Resend notification failed:", emailError);
  }

  return NextResponse.json({ order }, { status: 201 });
}

async function notifyAdmin(order: any) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not set — skipping admin email");
    return;
  }
  const resend = new Resend(process.env.RESEND_API_KEY);

  const itemsHtml = order.items
    .map(
      (i: any) =>
        `<tr>
          <td style="padding:4px 8px;border-bottom:1px solid #eee">${i.product_name}</td>
          <td style="padding:4px 8px;border-bottom:1px solid #eee">${i.size} / ${i.color}</td>
          <td style="padding:4px 8px;border-bottom:1px solid #eee">x${i.quantity}</td>
          <td style="padding:4px 8px;border-bottom:1px solid #eee">${formatDZD(i.unit_price * i.quantity)}</td>
        </tr>`
    )
    .join("");

  await resend.emails.send({
    from: process.env.STORE_FROM_EMAIL ?? "orders@resend.dev",
    to: process.env.ADMIN_NOTIFICATION_EMAIL ?? "admin@example.com",
    subject: `New order #${order.id} — ${order.first_name} ${order.last_name}`,
    html: `
      <h2>New order received</h2>
      <p><strong>${order.first_name} ${order.last_name}</strong> — ${order.phone}</p>
      <p>${order.commune_name}, ${order.wilaya_name} (${order.wilaya_code})</p>
      ${order.address_line ? `<p>${order.address_line}</p>` : ""}
      <table style="border-collapse:collapse;width:100%;font-family:sans-serif;font-size:14px">
        <thead>
          <tr>
            <th align="left" style="padding:4px 8px">Item</th>
            <th align="left" style="padding:4px 8px">Variant</th>
            <th align="left" style="padding:4px 8px">Qty</th>
            <th align="left" style="padding:4px 8px">Price</th>
          </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
      </table>
      <p>Subtotal: ${formatDZD(order.subtotal)}<br/>
         Delivery: ${formatDZD(order.shipping_fee)}<br/>
         <strong>Total: ${formatDZD(order.total)}</strong></p>
    `,
  });
}

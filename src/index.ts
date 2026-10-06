import { Hono } from "hono";
import type { D1Database } from "@cloudflare/workers-types";

type Bindings = {
  DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>().basePath("/api");

app.get("/", (context) =>
  context.json({
    name: "Campus Equipment Booking API",
    health: "/api/health",
    equipment: "/api/equipment",
    bookings: "/api/bookings",
  }),
);

app.get("/health", (context) => context.json({ ok: true }));

app.get("/equipment", async (c) => {
  const { results } = await c.env.DB.prepare(
    "SELECT id, name, location FROM equipment ORDER BY id",
  ).all();

  return c.json(results);
});

app.get("/bookings", async (context) => {
  const { results: bookings } = await context.env.DB.prepare(
    `
      SELECT
        id,
        equipment_id AS equipmentId,
        borrower_name AS borrowerName,
        start_at AS startAt,
        end_at AS endAt,
        purpose
      FROM bookings
      ORDER BY start_at
    `,
  ).all();

  return context.json(bookings);
});

app.get("/bookings/:id", async (context) => {
  const booking = await context.env.DB.prepare(
    `
      SELECT
        id,
        equipment_id AS equipmentId,
        borrower_name AS borrowerName,
        start_at AS startAt,
        end_at AS endAt,
        purpose
      FROM bookings
      WHERE id = ?
    `,
  )
    .bind(context.req.param("id"))
    .first();

  if (!booking) {
    return context.json({ error: "Booking not found" }, 404);
  }

  return context.json(booking);
});

app.post("/bookings", async (context) => {
  const body = await context.req.json();

  const { equipmentId, borrowerName, startAt, endAt, purpose } = body;

  if (
    typeof equipmentId !== "string" ||
    typeof borrowerName !== "string" ||
    typeof startAt !== "string" ||
    typeof endAt !== "string" ||
    typeof purpose !== "string"
  ) {
    return context.json({ error: "Invalid booking data" }, 400);
  }

  const startTime = Date.parse(startAt);
  const endTime = Date.parse(endAt);

  if (
    Number.isNaN(startTime) ||
    Number.isNaN(endTime) ||
    startTime >= endTime
  ) {
    return context.json({ error: "startAt must be before endAt" }, 400);
  }

  const equipment = await context.env.DB.prepare(
    "SELECT id FROM equipment WHERE id = ?",
  )
    .bind(equipmentId)
    .first();

  if (!equipment) {
    return context.json({ error: "Equipment not found" }, 400);
  }

  const conflict = await context.env.DB.prepare(
    `
      SELECT id
      FROM bookings
      WHERE equipment_id = ?
        AND start_at < ?
        AND end_at > ?
      LIMIT 1
    `,
  )
    .bind(equipmentId, endAt, startAt)
    .first();

  if (conflict) {
    return context.json(
      { error: "Booking time conflicts with an existing booking" },
      409,
    );
  }

  const id = crypto.randomUUID();

  await context.env.DB.prepare(
    `
    INSERT INTO bookings
      (id, equipment_id, borrower_name, start_at, end_at, purpose)
    VALUES (?, ?, ?, ?, ?, ?)
  `,
  )
    .bind(id, equipmentId, borrowerName, startAt, endAt, purpose)
    .run();

  return context.json(
    { id, equipmentId, borrowerName, startAt, endAt, purpose },
    201,
  );
});

app.patch("/bookings/:id", async (context) => {
  const id = context.req.param("id");

  const existing = await context.env.DB.prepare(
    "SELECT * FROM bookings WHERE id = ?",
  )
    .bind(id)
    .first();

  if (!existing) {
    return context.json({ error: "Booking not found" }, 404);
  }

  const body = await context.req.json();

  return context.json(
    { error: "PATCH validation and update not implemented" },
    501,
  );
});

app.delete("/bookings/:id", async (context) => {
  const result = await context.env.DB.prepare(
    "DELETE FROM bookings WHERE id = ?",
  )
    .bind(context.req.param("id"))
    .run();

  if (result.meta.changes === 0) {
    return context.json({ error: "Booking not found" }, 404);
  }

  return context.body(null, 204);
});

export default app;

# Campus Equipment Booking API

Starter project for the practical lab. It uses TypeScript, Hono, Node.js, and SQLite.

## Run

```sh
npm install
npm run dev
```

The API starts at `http://localhost:8787/api`.

Available starter endpoint:

```sh
curl http://localhost:8787/api/health
```

## Your implementation checklist

- Open SQLite and apply `schema.sql` when the server starts.
- Implement `GET /equipment`.
- Implement booking list, detail, create, update, and delete routes.
- Validate required fields, equipment existence, and `startAt < endAt`.
- Reject overlapping bookings with HTTP 409.
- Use bound SQL parameters for request values.
- Return `{ "error": "..." }` for every error response.
- Add tests and record your own curl evidence in the required submission files.

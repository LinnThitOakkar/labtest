# AI Assistance Log

> Review and edit this log so it accurately reflects my own work, decisions, and verification before submission.

## Project

Campus Equipment Booking API

## Assistance Used

### 1. Project setup

- **Prompt/topic:** Set up a TypeScript/Hono project for the equipment booking API.
- **Assistance used:** Created the initial Node.js, TypeScript, Hono, and SQLite project structure, dependencies, scripts, starter schema, and health route.
- **My verification:** Ran `npm run build` and checked `GET /api/health` with curl.

### 2. Equipment and booking GET routes

- **Prompt/topic:** Asked how to implement GET routes.
- **Assistance used:** Guidance on opening SQLite, selecting equipment, returning booking rows, and mapping database column names to the API response names.
- **My verification:** Tested `GET /api/equipment` and `GET /api/bookings` with curl and checked the JSON responses.

### 3. Booking creation and validation

- **Prompt/topic:** Asked for guidance on the POST route.
- **Assistance used:** Guidance on required-field validation, timestamp ordering, equipment existence, parameter binding, and the overlap rule.
- **My verification:** Tested a valid booking, an unknown equipment ID, and an overlapping booking. Observed `201`, `400`, and `409` responses.

### 4. Booking detail and delete routes

- **Prompt/topic:** Asked how to implement remaining CRUD routes.
- **Assistance used:** Guidance on `GET /bookings/:id`, `PATCH /bookings/:id`, and `DELETE /bookings/:id`, including JSON `404` responses and `204 No Content` for successful deletion.
- **My verification:** Tested a missing booking ID and checked the response format. I also tested deletion using curl and verified the record could no longer be retrieved.

### 5. Debugging

- **Prompt/topic:** Reported TypeScript and esbuild syntax errors.
- **Assistance used:** Identified shell commands accidentally pasted into the TypeScript source and an incomplete PATCH block that caused the parser to report an error at `export default app`.
- **My verification:** Removed the stray shell command, corrected the route structure, and ran `npm run build` successfully.

## Decisions I Made

- Used Hono with the Node server adapter.
- Used a local SQLite database through `better-sqlite3`.
- Stored timestamps as ISO 8601 text values.
- Used strict overlap comparisons so adjacent bookings are allowed.
- Used SQL parameter binding for request-derived values.

## Verification Still Required

- Confirm the final PATCH implementation returns `200` and applies partial updates correctly.
- Test PATCH validation, not-found, and overlap-conflict cases.
- Test successful DELETE returns `204` with no response body.
- Confirm all error responses use the required JSON format.
- Run the complete curl test matrix and record the actual outputs in the evidence file.

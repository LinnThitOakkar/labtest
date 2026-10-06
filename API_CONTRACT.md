# Campus Equipment Booking API Contract

> Update this document so it matches the final source code and your verified curl evidence before submission.

## Base URL

```text
http://localhost:8787/api
```

## Equipment

### List equipment

```http
GET /equipment
```

Returns `200 OK` and an array of equipment records.

Example response:

```json
[
  {
    "id": "eq-1",
    "name": "Projector A",
    "location": "Building 1"
  },
  {
    "id": "eq-2",
    "name": "Camera Kit B",
    "location": "Media Lab"
  }
]
```

## Bookings

All booking responses include at least:

```json
{
  "id": "booking-id",
  "equipmentId": "eq-1",
  "borrowerName": "Somchai Jaidee",
  "startAt": "2026-10-20T09:00:00.000Z",
  "endAt": "2026-10-20T11:00:00.000Z",
  "purpose": "Class presentation"
}
```

### List bookings

```http
GET /bookings
```

Returns `200 OK` and an array of bookings.

### Get one booking

```http
GET /bookings/:id
```

Returns `200 OK` when found. Returns `404 Not Found` when the booking does not exist.

### Create a booking

```http
POST /bookings
Content-Type: application/json
```

Request body:

```json
{
  "equipmentId": "eq-1",
  "borrowerName": "Somchai Jaidee",
  "startAt": "2026-10-20T09:00:00.000Z",
  "endAt": "2026-10-20T11:00:00.000Z",
  "purpose": "Class presentation"
}
```

Returns `201 Created` when successful.

Possible errors:

- `400 Bad Request` for missing or invalid data, or unknown equipment
- `409 Conflict` when the booking overlaps an existing booking for the same equipment

### Update a booking

```http
PATCH /bookings/:id
Content-Type: application/json
```

Accepts one or more booking fields and returns `200 OK` with the updated booking.

Possible errors:

- `400 Bad Request` for missing or invalid data
- `404 Not Found` when the booking does not exist
- `409 Conflict` when the updated time overlaps another booking for the same equipment

### Delete a booking

```http
DELETE /bookings/:id
```

Returns `204 No Content` when the booking is deleted. Returns `404 Not Found` when the booking does not exist.

## Error format

Every error response is JSON in this format:

```json
{
  "error": "A message understandable to a user or developer"
}
```

## Validation rules

- `equipmentId` must refer to an existing equipment record.
- Required booking fields must be non-empty strings.
- `startAt` and `endAt` must be valid timestamps.
- `startAt` must be before `endAt`.
- Bookings for the same equipment must not overlap.
- Adjacent bookings are allowed when one booking ends exactly when another begins.
- SQL queries use bound parameters for request values.

## Data model

### equipment

| Column     | Type | Rules       |
| ---------- | ---- | ----------- |
| `id`       | TEXT | Primary key |
| `name`     | TEXT | Required    |
| `location` | TEXT | Required    |

### bookings

| Column          | Type | Rules                               |
| --------------- | ---- | ----------------------------------- |
| `id`            | TEXT | Primary key                         |
| `equipment_id`  | TEXT | Required; references `equipment.id` |
| `borrower_name` | TEXT | Required                            |
| `start_at`      | TEXT | Required timestamp                  |
| `end_at`        | TEXT | Required timestamp                  |
| `purpose`       | TEXT | Required                            |

## Overlap rule

A new or updated booking conflicts when all of the following are true:

```text
the equipment IDs match
AND existing.startAt < requested.endAt
AND existing.endAt > requested.startAt
```

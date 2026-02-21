# QR Code Generator – API Documentation

Generate QR code images from any URL or text. Send a string, get back a PNG image (256×256) that encodes it. No sign-up on our side—just subscribe here on RapidAPI and start calling.

---

## What you get

- **Input:** A URL (e.g. `https://example.com`) or any text (up to 2000 characters).
- **Output:** A PNG image of the QR code. Scan it with a phone camera to open the link or read the text.

Use it for links on flyers, menus, business cards, or any app that needs QR codes on the fly.

---

## Authentication

All requests must include your RapidAPI credentials in the headers:

| Header | Description |
|--------|-------------|
| `X-RapidAPI-Key` | Your API key (shown after you subscribe to this API). |
| `X-RapidAPI-Host` | `qr-code-generator189.p.rapidapi.com` |

You can find your key and host on this API’s page after subscribing.

---

## Endpoints

### 1. Generate QR code (GET)

Pass the text to encode as a **query parameter**.

**Request**

- **Method:** `GET`
- **URL:** `https://qr-code-generator189.p.rapidapi.com/qr`
- **Query parameter:** `text` (required) – The URL or text to encode. Max 2000 characters.

**Example (curl)**

```bash
curl -o qr.png "https://qr-code-generator189.p.rapidapi.com/qr?text=https://example.com" \
  -H "X-RapidAPI-Key: YOUR_RAPIDAPI_KEY" \
  -H "X-RapidAPI-Host: qr-code-generator189.p.rapidapi.com"
```

**Example (Node.js – Axios)**

```javascript
const axios = require('axios');

const options = {
  method: 'GET',
  url: 'https://qr-code-generator189.p.rapidapi.com/qr',
  params: { text: 'https://example.com' },
  headers: {
    'X-RapidAPI-Key': 'YOUR_RAPIDAPI_KEY',
    'X-RapidAPI-Host': 'qr-code-generator189.p.rapidapi.com'
  },
  responseType: 'arraybuffer'  // important: response is binary PNG
};

const response = await axios.request(options);
require('fs').writeFileSync('qr.png', response.data);
console.log('Saved qr.png');
```

**Response**

- **Status:** `200 OK`
- **Content-Type:** `image/png`
- **Body:** Binary PNG data. Save it to a file (e.g. `qr.png`) to view or use the image.

---

### 2. Generate QR code (POST)

Pass the text to encode in the **request body** as JSON.

**Request**

- **Method:** `POST`
- **URL:** `https://qr-code-generator189.p.rapidapi.com/qr`
- **Headers:** `Content-Type: application/json`
- **Body:** `{ "text": "your URL or text here" }` – Max 2000 characters.

**Example (curl)**

```bash
curl -o qr.png -X POST "https://qr-code-generator189.p.rapidapi.com/qr" \
  -H "X-RapidAPI-Key: YOUR_RAPIDAPI_KEY" \
  -H "X-RapidAPI-Host: qr-code-generator189.p.rapidapi.com" \
  -H "Content-Type: application/json" \
  -d '{"text": "https://example.com"}'
```

**Example (Node.js – Axios)**

```javascript
const axios = require('axios');

const options = {
  method: 'POST',
  url: 'https://qr-code-generator189.p.rapidapi.com/qr',
  headers: {
    'X-RapidAPI-Key': 'YOUR_RAPIDAPI_KEY',
    'X-RapidAPI-Host': 'qr-code-generator189.p.rapidapi.com',
    'Content-Type': 'application/json'
  },
  data: { text: 'https://example.com' },
  responseType: 'arraybuffer'
};

const response = await axios.request(options);
require('fs').writeFileSync('qr.png', response.data);
console.log('Saved qr.png');
```

**Response**

- Same as GET: `200 OK`, `image/png`, body = PNG binary.

---

## Saving the image

The response body is **binary PNG data**, not JSON. To see the QR code:

- **curl:** Use `-o qr.png` (as in the examples above) to save the file, then open it.
- **Node.js:** Use `responseType: 'arraybuffer'` and write `response.data` to a file (e.g. with `fs.writeFileSync('qr.png', response.data)`).
- **Browser / frontend:** Use the blob/buffer from the response and create an object URL or set it as the `src` of an `<img>` (ideally via your own backend that calls the API so the key stays secret).

---

## Errors

On failure the API returns **JSON** with an `error` message and optional `code` and `details`.

| Status | Code | Meaning |
|--------|------|--------|
| 400 | `PARSE_ERROR` | Invalid JSON in POST body. |
| 400 | `VALIDATION_ERROR` | Invalid or missing `text` (e.g. empty or longer than 2000 characters). |
| 400 | `MISSING_TEXT` | No `text` provided in query or body. |
| 400 | `INVALID_TEXT` | Text not suitable for QR encoding. |
| 404 | `NOT_FOUND` | Request path does not exist. |
| 429 | `RATE_LIMIT_EXCEEDED` | Too many requests; try again later. |
| 500 | `INTERNAL_ERROR` | Server error; retry later. |

Example error body:

```json
{
  "error": "Invalid text in request body.",
  "code": "VALIDATION_ERROR",
  "details": { "details": [{ "field": "text", "message": "text is required" }] }
}
```

---

## Rate limits

- The QR endpoint is rate limited per IP (e.g. 100 requests per 15 minutes on the backend). RapidAPI may apply additional limits per plan.
- Response headers such as `x-ratelimit-remaining` and `cache-control: public, max-age=86400` can help you throttle and cache.

---

## Quick tips

- **URLs with special characters:** For GET, URL-encode the `text` parameter (e.g. `encodeURIComponent('https://example.com?foo=bar')`). For POST, send the raw string in the JSON body.
- **Long text:** Keep it under 2000 characters for best compatibility.
- **Caching:** Responses are cacheable; you can reuse the same image for the same `text` for 24 hours if you want to reduce calls.

Happy building.

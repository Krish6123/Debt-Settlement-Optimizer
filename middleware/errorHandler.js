/**
 * middleware/errorHandler.js
 * ---------------------------
 * Global Express error-handling middleware.
 *
 * Catches:
 *  - Malformed JSON bodies (thrown by express.json() during parsing)
 *  - Any synchronous/asynchronous exceptions forwarded via next(err)
 *
 * Always responds with a consistent, minimal JSON error shape so
 * clients never have to parse stack traces or inconsistent formats.
 *
 * NOTE: Must be registered LAST, after all routes, since Express
 * identifies error middleware by its 4-argument signature (err, req, res, next).
 */

function errorHandler(err, req, res, next) {
  // Log the full error server-side for debugging; never leak it to the client.
  console.error(err);

  // express.json() throws a SyntaxError with a `status`/`statusCode` of 400
  // when it fails to parse malformed JSON in the request body.
  if (err instanceof SyntaxError && (err.status === 400 || err.statusCode === 400)) {
    return res.status(400).json({ error: 'Malformed JSON in request body' });
  }

  // Fallback: any other unhandled exception becomes a generic 500.
  const statusCode = err.statusCode || 500;
  const message = statusCode === 500 ? 'Internal Server Error' : err.message;

  return res.status(statusCode).json({ error: message });
}

module.exports = errorHandler;

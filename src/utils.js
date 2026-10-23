class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const text = value => String(value ?? "").trim();

const isIsoDate = value =>
  /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value));

const isPositiveInt = n => Number.isInteger(n) && n > 0;

// Wraps async handlers: HttpError -> its status, anything else -> generic 500.
const handler = fn => (req, res, next) =>
  Promise.resolve(fn(req, res)).catch(next);

module.exports = { HttpError, text, isIsoDate, isPositiveInt, handler };

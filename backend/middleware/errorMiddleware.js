//No route matched mean 404 error
const notFound = (req, res, next) => {
    res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
};
// Every error ends up here
const errorHandler = (err, req, res, next) => {
  // 1. The model's rules failed (required, minlength, match, enum)
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ message: messages.join(', ') });
  }

  // 2. A duplicate value in a unique field (e.g. email)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({ message: `${field} already exists` });
  }

  // 3. An id in the wrong format
  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid id' });
  }

  // 4. Broken JSON in the request body
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Invalid JSON in request body' });
  }

  // 5. Anything else = our bug → log it for us, hide details from users
  console.error(err);
  res.status(500).json({ message: 'Server Error' });
};

module.exports = { notFound, errorHandler };

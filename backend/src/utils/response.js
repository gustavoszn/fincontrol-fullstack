function sendSuccess(res, statusCode = 200, payload = null, message = null) {
  return res.status(statusCode).json({
    success: true,
    message,
    data: payload,
  });
}

function sendError(res, statusCode = 500, message = 'Erro interno do servidor', details = null) {
  return res.status(statusCode).json({
    success: false,
    message,
    details,
  });
}

module.exports = { sendSuccess, sendError };

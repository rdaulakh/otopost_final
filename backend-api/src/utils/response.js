const { HTTP_STATUS } = require('./constants');

class ResponseHelper {
  static success(res, data = null, message = 'Success', statusCode = HTTP_STATUS.OK) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString()
    });
  }

  static error(res, message = 'Internal Server Error', statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR, errors = null) {
    return res.status(statusCode).json({
      success: false,
      message,
      errors,
      timestamp: new Date().toISOString()
    });
  }

  static created(res, data = null, message = 'Created successfully') {
    return this.success(res, data, message, HTTP_STATUS.CREATED);
  }

  static badRequest(res, message = 'Bad Request', errors = null) {
    return this.error(res, message, HTTP_STATUS.BAD_REQUEST, errors);
  }

  static unauthorized(res, message = 'Unauthorized') {
    return this.error(res, message, HTTP_STATUS.UNAUTHORIZED);
  }

  static forbidden(res, message = 'Forbidden') {
    return this.error(res, message, HTTP_STATUS.FORBIDDEN);
  }

  static notFound(res, message = 'Not Found') {
    return this.error(res, message, HTTP_STATUS.NOT_FOUND);
  }

  static conflict(res, message = 'Conflict', errors = null) {
    return this.error(res, message, HTTP_STATUS.CONFLICT, errors);
  }

  static paginated(res, data, pagination, message = 'Success') {
    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message,
      data,
      pagination,
      timestamp: new Date().toISOString()
    });
  }
}

module.exports = ResponseHelper;

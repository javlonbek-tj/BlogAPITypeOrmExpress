class ApiError extends Error {
  status: string;

  constructor(
    public statusCode: number,
    message: string,
    public errors: any[] = []
  ) {
    super(message);
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.statusCode = statusCode;
    this.errors = errors;
  }
  static UnauthenticatedError(): ApiError {
    return new ApiError(401, 'User not authenticated');
  }
  static UnauthorizedError(): ApiError {
    return new ApiError(403, 'You are not allowed to do this action');
  }
  static BadRequest(message: string, errors: any[] = []): ApiError {
    return new ApiError(400, message, errors);
  }
}

export default ApiError;

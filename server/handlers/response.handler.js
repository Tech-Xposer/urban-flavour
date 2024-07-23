class ApiResponse {
	static success(res, status = 200, message, data) {
		res.status(status).json({
			status: "success",
			message: message,
			data: data,
		});
	}

	static created(res, data) {
		res.status(201).json({
			status: "success",
			data: data,
		});
	}

	static noContent(res) {
		res.status(204).json({
			status: "success",
		});
	}
	static notModified(res) {
		res.status(304).json({
			status: "error",
			error: "Not modified",
		});
	}
	static badRequest(res, error) {
		res.status(400).json({
			status: "error",
			error: error,
		});
	}

	static unAuthorized(res, error) {
		res.status(401).json({
			status: "error",
			error: error,
		});
	}

	static forbidden(res, error) {
		res.status(403).json({
			status: "error",
			error: error,
		});
	}
	static notFound(res, message) {
		res.status(404).json({
			status: "error",
			error: "Not found",
			message:message
		});
	}
	static notAcceptable(res, error) {
		res.status(406).json({
			status: "error",
			error: error,
		});
	}
	static conflict(res, error) {
		res.status(409).json({
			status: "error",
			error: error,
		});
	}

	static unprocessableEntity(res, error) {
		res.status(422).json({
			status: "error",
			error: error,
		});
	}

	static preconditionFailed(res, error) {
		res.status(412).json({
			status: "error",
			error: error,
		});
	}

	static tooManyRequests(res, error) {
		res.status(429).json({
			status: "error",
			error: error,
		});
	}

	

	static internalServerError(res, error) {
		res.status(500).json({
			status: "error",
			error: error,
		});
	}
	static error(res, error, statusCode = 500) {
		res.status(statusCode).json({
			status: "error",
			error: error,
		});
	}
	static notImplemented(res, error) {
		res.status(501).json({
			status: "error",
			error: error,
		});
	}
	static badGateway(res, error) {
		res.status(502).json({
			status: "error",
			error: error,
		});
	}

	static serviceUnavailable(res, error) {
		res.status(503).json({
			status: "error",
			error: error,
		});
	}

	static gatewayTimeout(res, error) {
		res.status(504).json({
			status: "error",
			error: error,
		});
	}
}

export default ApiResponse;
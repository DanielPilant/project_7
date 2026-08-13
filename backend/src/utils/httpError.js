// How an expected failure travels from a service back out to HTTP.
//
// Services don't know about `res`, so when they need to reject a request for a
// business reason (not found, not yours, bad input) they throw an AppError
// carrying the status the API should answer with. Controllers hand that status
// straight to the client; anything else that escapes a service is an unexpected
// fault and still becomes a logged 500.

export class AppError extends Error {
  constructor(status, message) {
    super(message);
    this.name = "AppError";
    this.status = status;
  }
}

// The catch block every controller shares. `logLabel` + `fallback` keep the
// old per-handler 500 messages, so the client sees exactly what it used to.
export const respondWithError = (res, error, logLabel, fallback) => {
  if (error instanceof AppError) {
    return res.status(error.status).json({ error: error.message });
  }

  console.error(logLabel, error);
  res.status(500).json({ error: fallback });
};

import type { NextFunction, Request, Response } from "express";

type ProblemDetails = {
  type: string;
  title: string;
  status: number;
  detail?: string;
  instance?: string;
  errors?: string[];
};

type ProblemInit = Omit<ProblemDetails, "type"> & { type?: string };

type AppErrorArgs = {
  status: number;
  title: string;
  detail?: string;
  type?: string;
  errors?: string[];
};

const PROBLEM_CONTENT_TYPE = "application/problem+json";
const DEFAULT_PROBLEM_TYPE = "about:blank";

export class AppError extends Error {
  readonly status: number;
  readonly title: string;
  readonly detail?: string;
  readonly type: string;
  readonly errors?: string[];

  constructor({ status, title, detail, type, errors }: AppErrorArgs) {
    super(detail ?? title);
    this.status = status;
    this.title = title;
    if (detail !== undefined) {
      this.detail = detail;
    }
    this.type = type ?? DEFAULT_PROBLEM_TYPE;
    if (errors !== undefined) {
      this.errors = errors;
    }
  }
}

const isAppError = (error: unknown): error is AppError => error instanceof AppError;

const createProblemDetails = ({ type, title, status, detail, instance, errors }: ProblemInit): ProblemDetails => ({
  type: type ?? DEFAULT_PROBLEM_TYPE,
  title,
  status,
  ...(detail ? { detail } : {}),
  ...(instance ? { instance } : {}),
  ...(errors && errors.length > 0 ? { errors } : {}),
});

const sendProblem = (res: Response, problem: ProblemDetails): Response =>
  res.status(problem.status).type(PROBLEM_CONTENT_TYPE).json(problem);

export const notFoundHandler = (req: Request, res: Response): Response =>
  sendProblem(
    res,
    createProblemDetails({
      status: 404,
      title: "Not Found",
      detail: `Route ${req.method} ${req.path} not found.`,
      type: "https://httpstatuses.com/404",
      instance: req.originalUrl,
    })
  );

export const errorHandler = (
  error: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
): Response => {
  if (res.headersSent) {
    return res;
  }

  if (isAppError(error)) {
    const problem = createProblemDetails({
      status: error.status,
      title: error.title,
      type: error.type,
      instance: req.originalUrl,
      ...(error.detail !== undefined ? { detail: error.detail } : {}),
      ...(error.errors !== undefined ? { errors: error.errors } : {}),
    });

    return sendProblem(res, problem);
  }

  return sendProblem(
    res,
    createProblemDetails({
      status: 500,
      title: "Internal Server Error",
      detail: "An unexpected error occurred.",
      type: "https://httpstatuses.com/500",
      instance: req.originalUrl,
    })
  );
};

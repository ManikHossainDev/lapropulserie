import status from 'http-status-codes';
import { NextFunction, Request, Response } from 'express';
import { sendErrorResponse } from '../shared/sendResponse';

const notFound = (req: Request, res: Response, next: NextFunction) => {
  return sendErrorResponse(res, {
    code: status.NOT_FOUND,
    message: `The requested ${req.method} ${req.originalUrl} endpoint not found!`,
    errors: [
      {
        path: req.originalUrl,
        message: `The requested ${req.method} ${req.originalUrl} endpoint does not exist on this server.`,
      },
    ],
  });
};

export default notFound;

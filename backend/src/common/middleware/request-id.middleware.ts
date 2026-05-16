import { Injectable, NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const header = req.headers['x-request-id'];
    const requestId =
      typeof header === 'string' && header.length > 0 ? header : uuidv4();

    req.requestId = requestId;
    req.headers['x-request-id'] = requestId;
    res.setHeader('x-request-id', requestId);
    next();
  }
}

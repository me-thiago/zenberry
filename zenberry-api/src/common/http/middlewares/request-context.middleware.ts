// src/common/request-context.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ClsService } from 'nestjs-cls';

@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  constructor(private readonly cls: ClsService) {}
  use(req: Request, _res: Response, next: NextFunction) {
    this.cls.run(() => {
      this.cls.set('userId', (req as any).user?.id);
      next();
    });
  }
}

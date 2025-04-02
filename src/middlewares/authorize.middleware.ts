import { Request, Response, NextFunction } from 'express';

export function authorize(allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    console.debug(user, allowedRoles)
    if (!user || !allowedRoles.includes(user.role)) {
      res.status(403).json({ message: 'Access denied' });
    } else {
      next();
    }
  };
}

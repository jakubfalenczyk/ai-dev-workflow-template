import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.error(err);

    if (err instanceof ZodError) {
        return res.status(400).json({
            message: 'Validation Error',
            errors: err.issues,
        });
    }

    res.status(500).json({
        message: 'Internal Server Error',
    });
};

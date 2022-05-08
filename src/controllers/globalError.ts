import { ENV } from '@/config';
import {
    handleCastError,
    handleDulicateFieldsError,
    handleValidationError,
} from '@/services';
import { ApiResponse } from '@/types';
import { isCelebrateError } from 'celebrate';
import { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import mongoose from 'mongoose';

export const globalErrorHandler = (
    error: any,
    _req: Request,
    res: Response<ApiResponse>,
    next: NextFunction
) => {
    if (ENV === 'development') {
        console.log('-------------------------');
        console.log('Error 💥💥💥');
        console.error(error.name);
        console.error(error.code);
        console.error(error.message);
        console.error(error);
        console.log('-------------------------');
    }

    if (isCelebrateError(error)) {
        return next(error);
    }

    const errorClone = Object.create(error);

    switch (true) {
        case error.name === 'CastError': {
            error = handleCastError(errorClone);
            break;
        }
        case error.name === 'ValidationError': {
            error = handleValidationError(errorClone);
            break;
        }
        case error.name === 'JsonWebTokenError': {
            error = createHttpError(401, 'Invalid token!');
            break;
        }
        case error.name === 'TokenExpiredError': {
            error = createHttpError(401, 'Token has been expired!');
            break;
        }
        case error.code === 11000: {
            error = handleDulicateFieldsError(error);
            break;
        }
        case error.name === 'MongoServerError': {
            error = createHttpError(400, error.message);
            break;
        }
    }

    if (error instanceof createHttpError.HttpError) {
        res.status(error.statusCode).json({ message: error.message });
    } else {
        res.status(500).json({ message: 'Something went wrong!' });
    }
};

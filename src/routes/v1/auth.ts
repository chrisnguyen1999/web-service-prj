import { celebrate, Segments } from 'celebrate';
import { Router } from 'express';
import passport from 'passport';

import {
    forgotPassword,
    getMe,
    getMyAssignments,
    login,
    logout,
    refreshAccessToken,
    register,
    resetPassword,
    updateMe,
} from '@/controllers';
import { checkAuth } from '@/middlewares';
import { AuthType } from '@/types';
import {
    schemaAuthAuthorization,
    schemaAuthForgotPassword,
    schemaAuthLogin,
    schemaAuthRefreshToken,
    schemaAuthRegister,
    schemaAuthResetPassword,
    schemaAuthUpdate,
} from '@/validators';

export const authRouter = Router();

authRouter.post(
    '/register',
    celebrate({
        [Segments.BODY]: schemaAuthRegister,
    }),
    register
);

authRouter.post(
    '/login',
    celebrate({
        [Segments.BODY]: schemaAuthLogin,
    }),
    passport.authenticate(AuthType.LOCAL, { session: false }),
    login(AuthType.LOCAL)
);

authRouter.get(
    '/login-facebook',
    passport.authenticate(AuthType.FACEBOOK, { scope: ['email'] })
);

authRouter.get('/login-facebook/callback', login(AuthType.FACEBOOK));

authRouter.get(
    '/login-google',
    passport.authenticate(AuthType.GOOGLE, { scope: ['profile', 'email'] })
);

authRouter.get('/login-google/callback', login(AuthType.GOOGLE));

authRouter.post(
    '/refresh-token',
    celebrate({
        [Segments.BODY]: schemaAuthRefreshToken,
    }),
    refreshAccessToken
);

authRouter.post(
    '/forgot-password',
    celebrate({
        [Segments.BODY]: schemaAuthForgotPassword,
    }),
    forgotPassword
);

authRouter.post(
    '/reset-password',
    celebrate({
        [Segments.BODY]: schemaAuthResetPassword,
    }),
    resetPassword
);

authRouter.use(
    celebrate({
        [Segments.HEADERS]: schemaAuthAuthorization,
    }),
    checkAuth
);

authRouter
    .route('/me')
    .get(getMe)
    .patch(
        celebrate({
            [Segments.BODY]: schemaAuthUpdate,
        }),
        updateMe
    );

authRouter.get('/me/assignments', getMyAssignments);

authRouter.post('/logout', logout);

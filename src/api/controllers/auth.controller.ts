import { SwaggerDocs } from '../../decorators/swagger.decorator';
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { IUser, UserModel } from "../../core/models/user.model";
import crypto from "crypto";
import bcrypt from "bcrypt";
import { TokenModel } from "../../core/models/token";
import sendEmail from "../../utils/sendEmail";

const generateToken = (user: IUser) => {
    return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || "", { expiresIn: "30d" });
};

// Add this new function for refresh tokens
const generateRefreshToken = (id: string) => {
    return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET || "", { expiresIn: "1d" });
};

export class AuthController {
    @SwaggerDocs({
        '/api/auth/register': {
            post: {
                summary: 'Register a new user',
                tags: ['Authentication'],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['name', 'email', 'password'],
                                properties: {
                                    name: { type: 'string' },
                                    email: { type: 'string', format: 'email' },
                                    password: { type: 'string', format: 'password' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    201: {
                        description: 'User registered successfully',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        id: { type: 'string' },
                                        name: { type: 'string' },
                                        email: { type: 'string' },
                                        token: { type: 'string' }
                                    }
                                }
                            }
                        }
                    },
                    400: {
                        description: 'User already exists or invalid user data',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        message: { type: 'string' }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    })
    static async registerUser(req: Request, res: Response) {
        const { name, email, password } = req.body;

        const userExists = await UserModel.findOne({ email });
        if (userExists) {
            res.status(400).json({ message: "User already exists" });
        }

        const user = await UserModel.create({ name, email, password });

        if (user) {
            res.status(201).json({
                id: user._id,
                name: user.name,
                email: user.email,
                token: generateToken(user),
            });
        } else {
            res.status(400).json({ message: "Invalid user data" });
        }
    }

    @SwaggerDocs({
        '/api/auth/login': {
            post: {
                summary: 'Login user',
                tags: ['Authentication'],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['email', 'password'],
                                properties: {
                                    email: { type: 'string', format: 'email' },
                                    password: { type: 'string', format: 'password' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: {
                        description: 'User logged in successfully',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        id: { type: 'string' },
                                        name: { type: 'string' },
                                        email: { type: 'string' },
                                        token: { type: 'string' }
                                    }
                                }
                            }
                        }
                    },
                    401: {
                        description: 'Invalid email or password',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        message: { type: 'string' }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    })
    static async loginUser(req: Request, res: Response) {
        const { email, password } = req.body;

        const user = await UserModel.findOne({ email });
        console.debug({user})

        if (user && (await user.comparePassword(password))) {
            res.json({
                id: user._id,
                name: user.name,
                email: user.email,
                token: generateToken(user),
            });
        } else {
            res.status(401).json({ message: "Invalid email or password" });
        }
    }

    @SwaggerDocs({
        '/api/auth/request-password-reset': {
            post: {
                summary: 'Request password reset',
                tags: ['Authentication'],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['email'],
                                properties: {
                                    email: { type: 'string', format: 'email' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: {
                        description: 'Password reset link sent',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        message: { type: 'string' }
                                    }
                                }
                            }
                        }
                    },
                    404: {
                        description: 'User not found',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        message: { type: 'string' }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    })
    static async requestPasswordReset(req: Request, res: Response) {
        const { email } = req.body;

        const user = await UserModel.findOne({ email });

        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        let token = await TokenModel.findOne({ userId: user._id });
        if (token) await token.deleteOne();

        const resetToken = crypto.randomBytes(32).toString("hex");
        const hash = await bcrypt.hash(resetToken, 10);

        await new TokenModel({
            userId: user._id,
            token: hash,
            createdAt: Date.now(),
        }).save();

        const link = `${process.env.CLIENT_URL}/password-reset?token=${resetToken}&id=${user._id}`;

        sendEmail({
            to: user.email,
            subject: "Password Reset",
            html: "../template/requestResetPassword.handlebars",
        });

        res.json({ message: "Password reset link sent to your email" });
    }

    @SwaggerDocs({
        '/api/auth/reset-password': {
            post: {
                summary: 'Reset password',
                tags: ['Authentication'],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['userId', 'token', 'newPassword'],
                                properties: {
                                    userId: { type: 'string' },
                                    token: { type: 'string' },
                                    newPassword: { type: 'string', format: 'password' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: {
                        description: 'Password reset successful',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        message: { type: 'string' }
                                    }
                                }
                            }
                        }
                    },
                    400: {
                        description: 'Invalid or expired token',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        message: { type: 'string' }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    })
    static async resetPassword(req: Request, res: Response) {
        const { userId, token, newPassword } = req.body;

        const passwordResetToken = await TokenModel.findOne({ userId });
        if (!passwordResetToken) {
            res.status(400).json({ message: "Invalid or expired password reset token" });
            return;
        }

        const isValid = await bcrypt.compare(token, passwordResetToken.token);
        if (!isValid) {
            res.status(400).json({ message: "Invalid or expired password reset token" });
        }

        const hash = await bcrypt.hash(newPassword, 10);

        await UserModel.updateOne({ _id: userId }, { $set: { password: hash } }, { new: true });

        await passwordResetToken.deleteOne();

        res.json({ message: "Password has been reset successfully" });
    }

    @SwaggerDocs({
        '/api/auth/change-password': {
            post: {
                summary: 'Change password',
                tags: ['Authentication'],
                security: [{ BearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['currentPassword', 'newPassword'],
                                properties: {
                                    currentPassword: { type: 'string', format: 'password' },
                                    newPassword: { type: 'string', format: 'password' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: {
                        description: 'Password changed successfully',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        message: { type: 'string' }
                                    }
                                }
                            }
                        }
                    },
                    400: {
                        description: 'Current password is incorrect',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        message: { type: 'string' }
                                    }
                                }
                            }
                        }
                    },
                    404: {
                        description: 'User not found',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        message: { type: 'string' }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    })
    static async changePassword(req: Request, res: Response) {
        const { currentPassword, newPassword } = req.body;
        const userId = (req as any).user._id;

        const user = await UserModel.findById(userId);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            res.status(400).json({ message: "Current password is incorrect" });
        }

        const hash = await bcrypt.hash(newPassword, 10);
        user.password = hash;
        await user.save();

        res.json({ message: "Password changed successfully" });
    }

    @SwaggerDocs({
        '/api/auth/refresh': {
            post: {
                summary: 'Refresh access token',
                tags: ['Authentication'],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['refreshToken'],
                                properties: {
                                    refreshToken: { type: 'string' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: {
                        description: 'New access token generated',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        token: { type: 'string' }
                                    }
                                }
                            }
                        }
                    },
                    401: {
                        description: 'Invalid refresh token',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        message: { type: 'string' }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    })
    static async refreshToken(req: Request, res: Response) {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(401).json({ message: "Refresh token is required" });
        }

        try {
            // Use JWT_REFRESH_SECRET instead of JWT_SECRET for verifying refresh tokens
            const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || "") as { id: string };
            const user = await UserModel.findById(decoded.id);

            if (!user) {
                return res.status(401).json({ message: "Invalid refresh token" });
            }

            // Generate new access token
            const newToken = generateToken(user);
            
            res.json({
                token: newToken
            });
        } catch (error) {
            res.status(401).json({ message: "Invalid refresh token" });
        }
    }
}

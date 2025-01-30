import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { UserModel } from "../../core/models/user.model";
import crypto from "crypto";
import bcrypt from "bcrypt";
import { TokenModel } from "../../core/models/token";
import sendEmail from "../../utils/sendEmail";

const generateToken = (id: string) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || "", { expiresIn: "30d" });
};

export const registerUser = async (req: Request, res: Response) => {
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
            token: generateToken(user._id),
        });
    } else {
        res.status(400).json({ message: "Invalid user data" });
    }
};

export const loginUser = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const user = await UserModel.findOne({ email });

    if (user && (await user.comparePassword(password))) {
        res.json({
            id: user._id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id),
        });
    } else {
        res.status(401).json({ message: "Invalid email or password" });
    }
};

export const requestPasswordReset = async (req: Request, res: Response) => {
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
};

export const resetPassword = async (req: Request, res: Response) => {
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
};

export const changePassword = async (req: Request, res: Response) => {
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
};

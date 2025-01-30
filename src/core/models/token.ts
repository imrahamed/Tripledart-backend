import mongoose, { Schema, Document } from 'mongoose';

interface IToken extends Document {
  userId: mongoose.Types.ObjectId;
  token: string;
  createdAt: Date;
}

const TokenSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  token: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 3600 } // Token expires in 1 hour
});

export const TokenModel = mongoose.model<IToken>('Token', TokenSchema);

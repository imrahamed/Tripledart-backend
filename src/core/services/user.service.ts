import { UserModel, IUser } from '../models/user.model';
import bcrypt from 'bcrypt';

export class UserService {
  static async createUser(data: Partial<IUser>) {
    const user = new UserModel({
      email: data.email,
      password: data.password,
      role: data.role,
      name: data.name
    });
    return user.save();
  }

  static async getUserById(id: string) {
    return UserModel.findById(id);
  }

  static async updateUser(id: string, data: Partial<IUser>) {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    return UserModel.findByIdAndUpdate(id, data, { new: true });
  }

  static async deleteUser(id: string) {
    return UserModel.findByIdAndDelete(id);
  }

  static async listUsers() {
    return UserModel.find({});
  }
}

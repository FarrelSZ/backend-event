import { Request, Response } from "express";
import UserModel, { userDTO, userLoginDTO, userUpdatePasswordDTO } from "../models/user.model";
import { encrypt } from "../utils/encryption";
import { generateToken } from "../utils/jwt";
import { IReqUser } from "../utils/interface";
import response from "../utils/response";

export default {
  async updateProfile(req: IReqUser, res: Response) {
    try {
      const userId = req.user?.id;
      const { fullname, profilePicture } = req.body;

      const result = await UserModel.findByIdAndUpdate(userId, { fullname, profilePicture }, { new: true });

      if (!result) return response.notFound(res, "user not found");

      response.success(res, result, "success to update profile");
    } catch (error) {
      response.error(res, error, "failed to update profile");
    }
  },
  async updatePassword(req: IReqUser, res: Response) {
    try {
      const userId = req.user?.id;
      const { oldPassword, password, confirmPassword } = req.body;

      await userUpdatePasswordDTO.validate({ oldPassword, password, confirmPassword });

      const user = await UserModel.findById(userId);

      if (!user || user.password !== encrypt(oldPassword)) return response.notFound(res, "user not found");

      const result = await UserModel.findByIdAndUpdate(userId, { password: encrypt(password) }, { new: true });
      response.success(res, result, "success to update password");
    } catch (error) {
      response.error(res, error, "failed to update password");
    }
  },
  async register(req: Request, res: Response) {
    const { fullname, username, email, password, confirmPassword } = req.body;

    try {
      await userDTO.validate({
        fullname,
        username,
        email,
        password,
        confirmPassword,
      });
      const result = await UserModel.create({ fullname, username, email, password });

      response.success(res, result, "success registration");
    } catch (error) {
      response.error(res, error, "failed registration");
    }
  },

  async login(req: Request, res: Response) {
    try {
      const { identifier, password } = req.body;
      await userLoginDTO.validate({ identifier, password });
      // ambil data user berdasarkan identifier -> email & username
      const userByIdentifier = await UserModel.findOne({
        $or: [
          {
            email: identifier,
          },
          {
            username: identifier,
          },
        ],
        isActive: true,
      });
      if (!userByIdentifier) {
        return response.unauthorized(res, "user not found");
      }

      // Validasi password
      const validatePassword: boolean = encrypt(password) === userByIdentifier.password;
      if (!validatePassword) {
        return response.unauthorized(res, "user not found");
      }

      const token = generateToken({
        id: userByIdentifier._id,
        role: userByIdentifier.role,
      });

      response.success(res, token, "login success");
    } catch (error) {
      response.error(res, error, "login failed");
    }
  },

  async me(req: IReqUser, res: Response) {
    try {
      const user = req.user;
      const result = await UserModel.findById(user?.id);

      response.success(res, result, "success get user profile");
    } catch (error) {
      response.error(res, error, "failed get user profile");
    }
  },

  async activation(req: Request, res: Response) {
    try {
      const { code } = req.body as { code: string };

      const user = await UserModel.findOneAndUpdate(
        { activationCode: code }, // 📍 FILTER (cari yang mana)
        { isActive: true }, // ✏️ UPDATE (ubah apa)
        { new: true }
      );

      response.success(res, user, "user successfully activated");
    } catch (error) {
      response.error(res, error, "failed activation user");
    }
  },
};

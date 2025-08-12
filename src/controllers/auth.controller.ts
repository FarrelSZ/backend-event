import { Request, Response } from "express";
import * as Yup from "yup";
import UserModel from "../models/user.model";
import { encrypt } from "../utils/encryption";
import { generateToken } from "../utils/jwt";
import { IReqUser } from "../utils/interface";
import response from "../utils/response";

type TRegister = {
  fullname: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
};

type TLogin = {
  identifier: string;
  password: string;
};

const registerValidateSchema = Yup.object({
  fullname: Yup.string().required(),
  username: Yup.string().required(),
  email: Yup.string().required(),
  password: Yup.string()
    .required()
    .min(7, "Password must be at least 7 characters")
    .test("at-least-one-uppercase", "Password must contain at least one uppercase letter", (value) => {
      if (!value) return false;
      const regex = /^(?=.*[A-Z])/;
      return regex.test(value);
    })
    .test("at-least-one-number", "Password must contain at least one number", (value) => {
      if (!value) return false;
      const regex = /^(?=.*\d)/;
      return regex.test(value);
    }),
  confirmPassword: Yup.string()
    .required()
    .oneOf([Yup.ref("password"), "", "Password must be match"]),
});

export default {
  async register(req: Request, res: Response) {
    /**
     #swagger.tags = ['Auth']
     */
    const { fullname, username, email, password, confirmPassword } = req.body as unknown as TRegister;

    try {
      await registerValidateSchema.validate({
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
    /**
       #swagger.tags = ['Auth']
       #swagger.requestBody = {
       required: true,
       schema: {$ref: "#/components/schemas/LoginRequest"}
       }
    */
    const { identifier, password } = req.body as unknown as TLogin;
    try {
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
    /**
      #swagger.tags = ['Auth']
      #swagger.security = [{ "bearerAuth": [] }]
     */
    try {
      const user = req.user;
      const result = await UserModel.findById(user?.id);

      response.success(res, result, "success get user profile");
    } catch (error) {
      response.error(res, error, "failed get user profile");
    }
  },

  async activation(req: Request, res: Response) {
    /**
     #swagger.tags = ['Auth']
     #swagger.requestBody = {
     required: true,
     schema: {$ref: "#/components/schemas/ActivationRequest"}
     }
     */
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

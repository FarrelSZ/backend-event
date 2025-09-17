import mongoose from "mongoose";
import { encrypt } from "../utils/encryption";
import { renderMailHtml, sendEmail } from "../utils/mail/mail";
import { CLIENT_HOST, EMAIL_SMTP_USER } from "../utils/env";
import { ROLES } from "../utils/constant";
import * as Yup from "yup";

const validatePassword = Yup.string()
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
  });
const validateConfirmPassword = Yup.string()
  .required()
  .oneOf([Yup.ref("password"), "", "Password must be match"]);

export const USER_MODEL_NAME = "User";

export const userLoginDTO = Yup.object({
  identifier: Yup.string().required(),
  password: validatePassword,
});

export const userUpdatePasswordDTO = Yup.object({
  oldPassword: validatePassword,
  password: validatePassword,
  confirmPassword: validateConfirmPassword,
});

export const userDTO = Yup.object({
  fullname: Yup.string().required(),
  username: Yup.string().required(),
  email: Yup.string().required(),
  password: validatePassword,
  confirmPassword: validateConfirmPassword,
});

export type TypeUser = Yup.InferType<typeof userDTO>;

export interface User extends Omit<TypeUser, "confirmPassword"> {
  isActive: boolean;
  activationCode: string;
  role: string;
  profilePicture: string;
  createdAt: string;
}

const Schema = mongoose.Schema;

const UserSchema = new Schema<User>(
  {
    fullname: { type: Schema.Types.String, required: true },
    username: { type: Schema.Types.String, required: true, unique: true },
    email: { type: Schema.Types.String, required: true, unique: true },
    password: { type: Schema.Types.String, required: true },
    role: { type: Schema.Types.String, enum: [ROLES.ADMIN, ROLES.MEMBER], default: ROLES.MEMBER },
    profilePicture: { type: Schema.Types.String, default: "user.jpg" },
    isActive: { type: Schema.Types.Boolean, default: false },
    activationCode: { type: Schema.Types.String },
  },
  { timestamps: true }
);

UserSchema.pre("save", function (next) {
  const user = this;
  user.password = encrypt(user.password);
  user.activationCode = encrypt(user.id);
  next();
});

UserSchema.post("save", async function (doc, next) {
  try {
    const user = doc;
    console.log("Send Email to: ", user.email);

    const contentMail = await renderMailHtml("registration-success.ejs", {
      username: user.username,
      fullname: user.fullname,
      email: user.email,
      createdAt: user.createdAt,
      activationLink: `${CLIENT_HOST}/auth/activation?code=${user.activationCode}`,
    });

    await sendEmail({
      from: EMAIL_SMTP_USER,
      to: user.email,
      subject: "Activation your account",
      html: contentMail,
    });
  } catch (error) {
    console.log("Error > ", error);
  } finally {
    next();
  }
});

UserSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

const UserModel = mongoose.model<User>(USER_MODEL_NAME, UserSchema);

export default UserModel;

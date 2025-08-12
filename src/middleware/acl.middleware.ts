import { Response, NextFunction } from "express";
import { IReqUser } from "../utils/interface";
import response from "../utils/response";

// higher order function
export default (roles: string[]) => {
  return (req: IReqUser, res: Response, next: NextFunction) => {
    const role = req.user?.role;

    if (!role || !roles.includes(role)) {
      return response.unauthorized(res, "Forbidden");
    }
    next();
  };
};

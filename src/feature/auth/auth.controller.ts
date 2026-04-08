import { Request, Response } from "express";
import ErrorHandler from "../../utils/ErrorHandler";
import { LoginSchema, SignupSchema } from "./auth.schema";
import ResponseHandler from "../../utils/ResponseHandler";
import generateToken from "../../helpers/generateToken";
import prisma from "../../utils/prisma";
import {
  comparePassword,
  hashPassword,
} from "../../helpers/password-encryption";
import UserDTO from "./auth.dto";
import setCookies from "../../helpers/setCookies";

export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    const validateBody = SignupSchema.safeParse(req.body);

    if (!validateBody.success) {
      ErrorHandler.send(res, 400, validateBody.error.message);
      return;
    }

    const { name, email, password } = validateBody.data;

    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (existingUser) {
      ErrorHandler.send(res, 409, "Email already in use");
    }

    const hashedPassword = await hashPassword(password);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "USER",
      },
    });
    if (!newUser) {
      ErrorHandler.send(
        res,
        500,
        "An error occurred while creating your account",
      );
      return;
    }

    const token = await generateToken(newUser);

    setCookies(res, token);

    const userDTO = new UserDTO(newUser);

    ResponseHandler.send(res, 201, "Account created successfully", {
      newUser: userDTO,
      token,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      ErrorHandler.send(res, 500, `Internal Server Error: ${error.message}`);
    } else {
      ErrorHandler.send(res, 500, `An unknown error occurred: ${error}`);
    }
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const validateBody = LoginSchema.safeParse(req.body);
    if (!validateBody.success) {
      ErrorHandler.send(res, 400, validateBody.error.message);
      return;
    }

    const { email, password } = validateBody.data;

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      ErrorHandler.send(res, 404, "User not found");
      return;
    }

    const isPasswordMatch = await comparePassword(password, user.password);

    if (!isPasswordMatch) {
      ErrorHandler.send(res, 401, "Invalid credentials");
      return;
    }

    const token = await generateToken(user);

    setCookies(res, token);

    const userDTO = new UserDTO(user);

    ResponseHandler.send(res, 200, "Login successful", {
      user: userDTO,
      token,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      ErrorHandler.send(res, 500, `Internal Server Error: ${error.message}`);
    } else {
      ErrorHandler.send(res, 500, `An unknown error occurred: ${error}`);
    }
  }
};

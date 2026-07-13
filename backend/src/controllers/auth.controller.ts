import { Request, Response } from "express";
import axios from "axios";

import { User } from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";

export const googleLogin = (
  req: Request,
  res: Response
) => {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: `${process.env.BACKEND_URL}/auth/google/callback`,
    response_type: "code",
    scope: "profile email",
    access_type: "offline",
    prompt: "consent",
  });

  res.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  );
};

export const googleCallback = async (
  req: Request,
  res: Response
) => {
  try {
    const code = req.query.code as string;

    if (!code) {
      return res.status(400).send("Authorization code missing");
    }

    const tokenResponse = await axios.post(
      "https://oauth2.googleapis.com/token",
      new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        code,
        redirect_uri: `${process.env.BACKEND_URL}/auth/google/callback`,
        grant_type: "authorization_code",
      }),
      {
        headers: {
          "Content-Type":
            "application/x-www-form-urlencoded",
        },
      }
    );

    const { access_token } = tokenResponse.data;

    const userResponse = await axios.get(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    const { id, name, email, picture } =
      userResponse.data;

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        googleId: id,
        name,
        email,
        picture,
      });
    }

    const token = generateToken(user._id.toString());

    res.redirect(
      `${process.env.FRONTEND_URL}/login-success?token=${token}`
    );
  } catch (error) {
    console.error(error);
    res.status(500).send("Authentication failed");
  }
};

export const getCurrentUser = async (
  req: any,
  res: Response
) => {
  try {
    const user = await User.findById(req.user.id)
      .select("-__v");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json({ user });
  } catch {
    res.status(500).json({
      message: "Server error",
    });
  }
};
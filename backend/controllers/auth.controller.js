import Joi from "joi";
import {
  registerUser,
  loginUser,
  logoutUser,
  resolveAuthenticatedUser,
  getUserAccountOverview
} from "../services/auth.service.js";

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(128).required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(128).required()
});

function getToken(req) {
  const authHeader = req.headers.authorization || "";
  if (authHeader.toLowerCase().startsWith("bearer ")) {
    return authHeader.slice(7).trim();
  }
  return "";
}

export async function register(req, res) {
  try {
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: "Validation failed",
        details: error.details.map(detail => detail.message)
      });
    }

    const result = await registerUser(value);
    return res.status(201).json(result);
  } catch (error) {
    if (error.message === "EMAIL_ALREADY_EXISTS") {
      return res.status(409).json({ error: "Account already exists for this email" });
    }
    return res.status(500).json({ error: "Failed to create account" });
  }
}

export async function login(req, res) {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: "Validation failed",
        details: error.details.map(detail => detail.message)
      });
    }

    const result = await loginUser(value);
    return res.json(result);
  } catch (error) {
    if (error.message === "INVALID_CREDENTIALS") {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    return res.status(500).json({ error: "Failed to login" });
  }
}

export async function me(req, res) {
  try {
    const user = await resolveAuthenticatedUser(req);
    if (!user?.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const overview = await getUserAccountOverview(user.id);
    if (!overview) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json(overview);
  } catch (error) {
    return res.status(500).json({ error: "Failed to load account" });
  }
}

export async function logout(req, res) {
  try {
    const token = getToken(req);
    await logoutUser(token);
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ error: "Failed to logout" });
  }
}

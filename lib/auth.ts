
import jwt, { JwtPayload } from "jsonwebtoken";
import { NextRequest } from "next/server";

function getJWTSecret(): string {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error(
      "JWT_SECRET is missing. Please check your .env.local file."
    );
  }

  return secret;
}

export function createToken(userId: string) {
  return jwt.sign({ userId }, getJWTSecret(), {
    expiresIn: "7d",
  });
}

export function verifyToken(token: string): JwtPayload {
  const decoded = jwt.verify(token, getJWTSecret());

  if (typeof decoded === "string") {
    throw new Error("Invalid token");
  }

  return decoded;
}

export function getAuthenticatedUser(request: NextRequest) {
  const token = request.cookies.get("quickbook_token")?.value;

  if (!token) {
    throw new Error("Unauthorized");
  }

  return verifyToken(token);
}

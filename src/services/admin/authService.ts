import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "../../config";
import { prisma } from "../../lib/prisma";

type LoginInput = {
  username: string;
  password: string;
};

type LoginResult = {
  token: string;
  expiresIn: string;
};

export async function loginAdmin(input: LoginInput): Promise<LoginResult | null> {
  const adminUser = await prisma.adminUser.findUnique({
    where: { username: input.username }
  });

  if (!adminUser) {
    return null;
  }

  const passwordOk = await bcrypt.compare(input.password, adminUser.passwordHash);
  if (!passwordOk) {
    return null;
  }

  const signOptions: jwt.SignOptions = {
    expiresIn: config.jwt.expiresIn as jwt.SignOptions["expiresIn"]
  };
  const token = jwt.sign({ sub: adminUser.username, role: "admin" }, config.jwt.secret, signOptions);

  return { token, expiresIn: config.jwt.expiresIn };
}

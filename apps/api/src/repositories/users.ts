import { db } from "./db.js";
export const users = {
  byEmail: (email: string) => db.user.findUnique({ where: { email } }),
  create: (email: string, passwordHash: string) =>
    db.user.create({ data: { email, passwordHash, role: "USER" } }),
};

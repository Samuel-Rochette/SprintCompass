import { config } from "dotenv";
config();
export const secret = process.env.SECRET;
export const dburl = process.env.DBURL;
export const db = process.env.DB;
export const port = process.env.PORT;
export const saltRounds = Number(process.env.SALT_ROUNDS);

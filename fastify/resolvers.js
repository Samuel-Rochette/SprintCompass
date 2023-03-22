import * as dbRtns from "./db_routines.js";
import * as cfg from "./config.js";
import bcrypt from "bcrypt";

const resolvers = {
	validatetoken: () => {
		return "Token Valid!";
	},
};

export { resolvers };

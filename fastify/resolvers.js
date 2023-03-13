import * as dbRtns from "./db_routines.js";
import * as cfg from "./config.js";
import bcrypt from "bcrypt";

const resolvers = {
	registeruser: async ({ username, password }) => {
		const hash = await bcrypt.hash(password, cfg.saltRounds);
		let db = await dbRtns.getDBInstance();
		let user = { username, password: hash };
		let results = await dbRtns.addOne(db, cfg.userCollection, user);
		return results.acknowledged
			? "user successfully added"
			: "failed to add user";
	},
};

export { resolvers };

import * as dbRtns from "./db_routines.js";
import * as cfg from "./config.js";

const resolvers = {
	login: async ({ username, password }) => {},
	registeruser: async ({ username, password }) => {
		let db = await dbRtns.getDBInstance();
		let user = { username, password };
		let results = await dbRtns.addOne(db, cfg.userCollection, user);
		return results.acknowledged ? user : null;
	},
};
export { resolvers };

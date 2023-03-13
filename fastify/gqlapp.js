"use strict";
import * as dbRtns from "./db_routines.js";
import * as cfg from "./config.js";
import fastify from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import mercurius from "mercurius";
import bcrypt from "bcrypt";
import { schema } from "./schema.js";
import { resolvers } from "./resolvers.js";

const app = fastify();

app.register(cors, {});

app.register(jwt, { secret: cfg.secret });

app.decorate("authenticate", async (req, res) => {
	try {
		await req.jwtVerify();
	} catch (err) {
		res.send(err);
	}
});

// Test Route to validate jwt token
app.get(
	"/validateToken",
	{ onRequest: [app.authenticate] },
	async (req, res) => {
		return req.user;
	}
);

app.register(mercurius, {
	schema,
	resolvers: {
		...resolvers,
		login: async ({ username, password }) => {
			const data = { username };
			let db = await dbRtns.getDBInstance();
			let user = await dbRtns.findOne(db, cfg.userCollection, data);
			if (!(await bcrypt.compare(password, user.password))) return null;
			return app.jwt.sign(data);
		},
	},
	graphiql: true,
});

app.listen({ port: cfg.port });

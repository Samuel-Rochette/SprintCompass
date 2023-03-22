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

app.post("/register", async (req, res) => {
	const hash = await bcrypt.hash(req.body.password, cfg.saltRounds);
	const db = await dbRtns.getDBInstance();
	const user = { username: req.body.username, password: hash };
	const results = await dbRtns.addOne(db, cfg.userCollection, user);
	return results.acknowledged
		? "user successfully added"
		: "failed to add user";
});

app.post("/login", async (req, res) => {
	const data = { username: req.body.username };
	const db = await dbRtns.getDBInstance();
	const user = await dbRtns.findOne(db, cfg.userCollection, data);
	if (!(await bcrypt.compare(req.body.password, user.password)))
		res.send("Login Failed");
	res.send(app.jwt.sign(data));
});

app.decorate("authenticate", async (req, res) => {
	try {
		await req.jwtVerify();
	} catch (err) {
		res.send(err);
	}
});

app.addHook("onRoute", routeOptions => {
	if (routeOptions.url === "/graphql")
		routeOptions.preValidation = [app.authenticate];
});

app.register(mercurius, {
	schema,
	resolvers,
	graphiql: true,
});

app.listen({ port: cfg.port });

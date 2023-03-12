"use strict";
import * as cfg from "./config.js";
import * as dbRtns from "./db_routines.js";
import fastify from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import bcrypt from "bcrypt";
import crypto from "crypto";
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

app.post("/register", async (req, res) => {
	const hash = await bcrypt.hash(req.body.password, cfg.saltRounds);
	let db = await dbRtns.getDBInstance();
	let user = { username: req.body.username, password: hash };
	await dbRtns.addOne(db, cfg.userCollection, user);
	res.send(`User ${req.body.username} registered!`);
});

app.get("/generateToken/:name/:password", async (req, res) => {
	const data = { username: req.params.name };
	let db = await dbRtns.getDBInstance();
	let user = await dbRtns.findOne(db, cfg.userCollection, data);
	(await bcrypt.compare(
		crypto.publicEncrypt(cfg.publicKey, req.params.password),
		user.password
	)) && res.send({ msg: "password doesn't match" });
	const token = app.jwt.sign(data);
	res.send({ token });
});

app.get(
	"/validateToken",
	{ onRequest: [app.authenticate] },
	async (req, res) => {
		return req.user;
	}
);

// app.register(mercurius, {
// 	schema,
// 	resolvers,
// 	graphiql: true,
// });

app.listen({ port: cfg.port });

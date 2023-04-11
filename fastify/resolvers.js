import * as dbRtns from "./db_routines.js";
import { ObjectId } from "mongodb";

const resolvers = {
	getusers: async () => {
		const db = await dbRtns.getDBInstance();
		return await dbRtns.findAll(db, "appusers", {});
	},
	getprojectbyid: async ({ projectid }) => {
		const db = await dbRtns.getDBInstance();
		const results = await dbRtns.findOne(db, "projects", {
			_id: new ObjectId(projectid),
		});
		return results;
	},
	getprojectsforuser: async ({ userid }) => {
		const db = await dbRtns.getDBInstance();
		const results = (
			await dbRtns.aggregate(db, "userprojects", [
				{
					$lookup: {
						from: "projects",
						localField: "projectid",
						foreignField: "_id",
						as: "project",
					},
				},
				{
					$match: {
						userid: new ObjectId(userid),
					},
				},
			])
		).map(e => e.project[0]);
		return results;
	},
	getusersforproject: async ({ projectid }) => {
		const db = await dbRtns.getDBInstance();
		const results = (
			await dbRtns.aggregate(db, "userprojects", [
				{
					$lookup: {
						from: "appusers",
						localField: "userid",
						foreignField: "_id",
						as: "users",
					},
				},
				{
					$match: {
						projectid: new ObjectId(projectid),
					},
				},
			])
		)
			.map(userproject =>
				userproject.users.map(user => {
					return {
						_id: userproject._id,
						userid: userproject.userid,
						projectid: userproject.projectid,
						role: userproject.role,
						username: user.username,
					};
				})
			)
			.flat(1);
		return results;
	},
	getsprintsforproject: async ({ projectid }) => {
		const db = await dbRtns.getDBInstance();
		return await dbRtns.findAll(db, "sprints", {
			projectid: new ObjectId(projectid),
		});
	},
	getstoriesforsprint: async ({ sprintid }) => {
		const db = await dbRtns.getDBInstance();
		return await dbRtns.findAll(db, "stories", {
			sprintid: new ObjectId(sprintid),
		});
	},
	gettasksforstory: async ({ storyid }) => {
		const db = await dbRtns.getDBInstance();
		return await dbRtns.findAll(db, "tasks", {
			storyid: new ObjectId(storyid),
		});
	},
	createproject: async ({ userid, name, description }) => {
		const db = await dbRtns.getDBInstance();
		const newProject = { name, description };
		const { insertedId } = await dbRtns.addOne(db, "projects", newProject);
		const newJoin = {
			userid: new ObjectId(userid),
			projectid: insertedId,
			role: "Owner",
		};
		const { acknowledged } = await dbRtns.addOne(db, "userprojects", newJoin);
		return acknowledged ? { ...newProject, _id: insertedId } : null;
	},
	createsprint: async ({ projectid, name }) => {
		const db = await dbRtns.getDBInstance();
		const newSprint = {
			projectid: new ObjectId(projectid),
			name,
			status: "Planned",
		};
		const { acknowledged, insertedId } = await dbRtns.addOne(
			db,
			"sprints",
			newSprint
		);
		return acknowledged ? { ...newSprint, _id: insertedId } : null;
	},
	createstory: async ({ userid, sprintid, name, description }) => {
		const db = await dbRtns.getDBInstance();
		const newStory = {
			sprintid: new ObjectId(sprintid),
			userid: new ObjectId(userid),
			name,
			description,
			status: "Planned",
			hourslogged: 0,
		};
		const { acknowledged, insertedId } = await dbRtns.addOne(
			db,
			"stories",
			newStory
		);
		return acknowledged ? { ...newStory, _id: insertedId } : null;
	},
	createtask: async ({ storyid, name }) => {
		const db = await dbRtns.getDBInstance();
		const newTask = { storyid: new ObjectId(storyid), name, status: "Planned" };
		const { acknowledged, insertedId } = await dbRtns.addOne(
			db,
			"tasks",
			newTask
		);
		return acknowledged ? { ...newTask, _id: insertedId } : null;
	},
	addusertoproject: async ({ reqid, userid, projectid }) => {
		const db = await dbRtns.getDBInstance();
		const results = await dbRtns.findOne(db, "userprojects", {
			userid: new ObjectId(reqid),
			projectid: new ObjectId(projectid),
		});
		if (results.role !== "Owner") return false;
		const newJoin = {
			userid: new ObjectId(userid),
			projectid: new ObjectId(projectid),
			role: "Member",
		};
		const { acknowledged } = await dbRtns.addOne(db, "userprojects", newJoin);
		return acknowledged;
	},
	removeuserfromproject: async ({ reqid, userid, projectid }) => {
		const db = await dbRtns.getDBInstance();
		const results = await dbRtns.findOne(db, "userprojects", {
			userid: new ObjectId(reqid),
			projectid: new ObjectId(projectid),
		});
		if (results.role !== "Owner") return false;
		const { acknowledged } = await dbRtns.deleteOne(db, "userprojects", {
			userid: new ObjectId(userid),
			projectid: new ObjectId(projectid),
		});
		return acknowledged;
	},
	assignroletouser: async ({ role, reqid, userid, projectid }) => {
		const db = await dbRtns.getDBInstance();
		const results = await dbRtns.findOne(db, "userprojects", {
			userid: new ObjectId(reqid),
			projectid: new ObjectId(projectid),
		});
		if (results.role !== "Owner") return false;
		const { acknowledged } = await dbRtns.updateOne(
			db,
			"userprojects",
			{ userid: new ObjectId(userid), projectid: new ObjectId(projectid) },
			{
				$set: { role },
			}
		);
		return acknowledged;
	},
};

export { resolvers };

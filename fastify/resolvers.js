import { dburl } from "./config.js";
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
	getprojectidbysprintid: async ({ sprintid }) => {
		const db = await dbRtns.getDBInstance();
		const projectid = (
			await dbRtns.findOne(db, "sprints", {
				_id: new ObjectId(sprintid),
			})
		).projectid;
		return projectid;
	},
	getprojectidbystoryid: async ({ storyid }) => {
		const db = await dbRtns.getDBInstance();
		const sprintid = (
			await dbRtns.findOne(db, "stories", {
				_id: new ObjectId(storyid),
			})
		).sprintid;
		const projectid = (
			await dbRtns.findOne(db, "sprints", {
				_id: sprintid,
			})
		).projectid;
		return projectid;
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
	getsprintbyid: async ({ sprintid }) => {
		const db = await dbRtns.getDBInstance();
		const results = await dbRtns.findOne(db, "sprints", {
			_id: new ObjectId(sprintid),
		});
		return results;
	},
	getstoriesforsprint: async ({ sprintid }) => {
		const db = await dbRtns.getDBInstance();
		const results = await dbRtns.aggregate(db, "stories", [
			{
				$lookup: {
					from: "appusers",
					localField: "userid",
					foreignField: "_id",
					as: "user",
				},
			},
			{
				$match: {
					sprintid: new ObjectId(sprintid),
				},
			},
		]);
		return results;
	},
	getstorybyid: async ({ storyid }) => {
		const db = await dbRtns.getDBInstance();
		const results = (
			await dbRtns.aggregate(db, "stories", [
				{
					$lookup: {
						from: "appusers",
						localField: "userid",
						foreignField: "_id",
						as: "user",
					},
				},
				{
					$match: {
						_id: new ObjectId(storyid),
					},
				},
			])
		)[0];
		return results;
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
	deleteproject: async ({ projectid }) => {
		const db = await dbRtns.getDBInstance();
		await dbRtns.deleteOne(db, "projects", {
			_id: new ObjectId(projectid),
		});
		const { acknowledged } = await dbRtns.deleteMany(db, "userprojects", {
			projectid: new ObjectId(projectid),
		});
		return acknowledged;
	},
	editproject: async ({ projectid, name, description }) => {
		const db = await dbRtns.getDBInstance();
		const { acknowledged } = await dbRtns.updateOne(
			db,
			"projects",
			{ _id: new ObjectId(projectid) },
			{ $set: { name, description } }
		);
		return acknowledged ? { _id: projectid, name, description } : null;
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
	deletesprint: async ({ sprintid }) => {
		const db = await dbRtns.getDBInstance();
		const { acknowledged } = await dbRtns.deleteOne(db, "sprints", {
			_id: new ObjectId(sprintid),
		});
		return acknowledged;
	},
	editsprint: async ({ sprintid, name, status }) => {
		const db = await dbRtns.getDBInstance();
		const { acknowledged } = await dbRtns.updateOne(
			db,
			"sprints",
			{
				_id: new ObjectId(sprintid),
			},
			{ $set: { name, status } }
		);
		return acknowledged ? { _id: sprintid, name, status } : null;
	},
	createstory: async ({
		userid,
		sprintid,
		name,
		description,
		hoursestimated,
	}) => {
		const db = await dbRtns.getDBInstance();
		const newStory = {
			sprintid: new ObjectId(sprintid),
			userid: new ObjectId(userid),
			name,
			description,
			status: "Planned",
			hourslogged: 0,
			hoursestimated,
		};
		const user = await dbRtns.findAll(
			db,
			"appusers",
			{
				_id: new ObjectId(userid),
			},
			{}
		);
		const { acknowledged, insertedId } = await dbRtns.addOne(
			db,
			"stories",
			newStory
		);
		return acknowledged ? { ...newStory, user, _id: insertedId } : null;
	},
	deletestory: async ({ storyid }) => {
		const db = await dbRtns.getDBInstance();
		const { acknowledged } = await dbRtns.deleteOne(db, "stories", {
			_id: new ObjectId(storyid),
		});
		return acknowledged;
	},
	editstory: async ({
		storyid,
		userid,
		name,
		description,
		status,
		hoursestimated,
		hourslogged,
	}) => {
		const db = await dbRtns.getDBInstance();
		const user = await dbRtns.findAll(db, "appusers", {
			_id: new ObjectId(userid),
		});
		const newStory = {
			userid: new ObjectId(userid),
			name,
			description,
			status,
			hourslogged,
			hoursestimated,
		};
		const { acknowledged } = await dbRtns.updateOne(
			db,
			"stories",
			{ _id: new ObjectId(storyid) },
			{ $set: newStory }
		);
		return acknowledged ? { ...newStory, _id: storyid, user } : null;
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
	deletetask: async ({ taskid }) => {
		const db = await dbRtns.getDBInstance();
		const { acknowledged } = await dbRtns.deleteOne(db, "tasks", {
			_id: new ObjectId(taskid),
		});
		return acknowledged;
	},
	edittask: async ({ taskid, name, status }) => {
		const db = await dbRtns.getDBInstance();
		const { acknowledged } = await dbRtns.updateOne(
			db,
			"tasks",
			{ _id: new ObjectId(taskid) },
			{ $set: { name, status } }
		);
		return acknowledged ? { _id: taskid, name, status } : null;
	},
	addusertoproject: async ({ reqid, userid, projectid }) => {
		const db = await dbRtns.getDBInstance();
		const results = await dbRtns.findOne(db, "userprojects", {
			userid: new ObjectId(reqid),
			projectid: new ObjectId(projectid),
		});
		if (!(results.role === "Owner" || results.role === "Admin")) return false;
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
		if (!(results.role === "Owner" || results.role === "Admin")) return false;
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
	sprintreport: async ({ sprintid }) => {
		const db = await dbRtns.getDBInstance();

		const { name, status } = await dbRtns.findOne(db, "sprints", {
			_id: new ObjectId(sprintid),
		});
		const stories = await dbRtns.aggregate(db, "stories", [
			{
				$match: { sprintid: new ObjectId(sprintid) },
			},
			{
				$lookup: {
					from: "appusers",
					localField: "userid",
					foreignField: "_id",
					as: "user",
				},
			},
			{
				$lookup: {
					from: "tasks",
					localField: "_id",
					foreignField: "storyid",
					as: "tasks",
				},
			},
		]);
		return { name, status, stories };
	},
	userreport: async ({ userprojectid }) => {
		const db = await dbRtns.getDBInstance();
		const { userid, projectid } = await dbRtns.findOne(db, "userprojects", {
			_id: new ObjectId(userprojectid),
		});

		const { username } = await dbRtns.findOne(db, "appusers", { _id: userid });
		const { name } = await dbRtns.findOne(db, "projects", { _id: projectid });
		const sprints = await dbRtns.aggregate(db, "sprints", [
			{
				$match: { projectid },
			},
			{
				$lookup: {
					from: "stories",
					localField: "_id",
					foreignField: "sprintid",
					as: "stories",
					pipeline: [
						{ $match: { userid } },
						{
							$lookup: {
								from: "tasks",
								localField: "_id",
								foreignField: "storyid",
								as: "tasks",
							},
						},
					],
				},
			},
		]);
		return { username, projectname: name, sprints };
	},
};

export { resolvers };

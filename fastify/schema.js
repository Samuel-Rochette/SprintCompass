const schema = `
type Query {
  getusers: [User],
  getusersforproject(projectid: String): [User],
  getprojectsforuser(userid: String): [Project],
  getsprintsforproject(projectid: String): [Sprint],
  getstoriesforsprint(sprintid: String): [Story],
  gettasksforstory(storyid: String): [Task],
},
type Mutation {
  createproject(userid: String, name: String, description: String): Project,
  createsprint(projectid: String, name: String): Sprint,
  createstory(userid: String, sprintid: String, name: String, description: String): Story,
  createtask(storyid: String, name: String): Task,
  addusertoproject(reqid: String, userid: String, projectid: String): Boolean,
  removeuserfromproject(reqid: String, userid: String, projectid: String): Boolean,
  assignroletouser(role: String, reqid: String, userid: String, projectid: String): Boolean,
},
type User {
  _id: String,
  username: String,
  password: String,
 },
 type Project {
  _id: String,
  name: String,
  description: String,
 },
 type UserProject {
  _id: String,
  userid: String,
  projectid: String,
  role: String,
 },
 type Sprint {
  _id: String,
  name: String,
  status: String,
  projectid: String,
 },
 type Story {
  _id: String,
  name: String,
  description: String,
  status: String,
  sprintid: String,
  userid: String,
  hourslogged: Int,
 },
 type Task {
  _id: String,
  name: String,
  status: String,
  storyid: String,
 },
`;
export { schema };

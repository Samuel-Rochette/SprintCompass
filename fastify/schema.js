const schema = `
type Query {
  getusers: [User],
  getusersforproject(projectid: String): [UserProject],
  getusersfornotproject(projectid: String): [UserProject],
  getprojectbyid(projectid: String): Project,
  getprojectidbysprintid(sprintid: String): String,
  getprojectidbystoryid(storyid: String): String,
  getprojectsforuser(userid: String): [Project],
  getsprintsforproject(projectid: String): [Sprint],
  getsprintbyid(sprintid: String): Sprint,
  getstoriesforsprint(sprintid: String): [Story],
  getstorybyid(storyid: String): Story,
  gettasksforstory(storyid: String): [Task],
  sprintreport(sprintid: String): SprintReport,
  userreport(userprojectid: String): UserReport,
},
type Mutation {
  createproject(userid: String, name: String, description: String): Project,
  deleteproject(projectid: String): Boolean,
  editproject(projectid: String, name: String, description: String): Project,
  createsprint(projectid: String, name: String): Sprint,
  deletesprint(sprintid: String): Boolean,
  editsprint(sprintid: String, name: String, status: String): Sprint,
  createstory(userid: String, sprintid: String, name: String, description: String, hoursestimated: Int): Story,
  deletestory(storyid: String): Boolean,
  editstory(storyid: String, userid: String, name: String, description: String, status: String, hoursestimated: Int, hourslogged: Int): Story,
  createtask(storyid: String, name: String): Task,
  deletetask(taskid: String): Boolean,
  edittask(taskid: String, name: String, status: String): Task,
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
  username: String,
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
  hoursestimated: Int,
  user: [User],
 },
 type Task {
  _id: String,
  name: String,
  status: String,
  storyid: String,
 },
 type StoryReport {
  _id: String,
  name: String,
  description: String,
  status: String,
  hourslogged: Int,
  hoursestimated: Int,
  user: [User],
  tasks: [Task]
 },
 type SprintReport {
  _id: String,
  projectid: String,
  name: String,
  status: String,
  stories: [StoryReport]
 }
 type UserReport {
  username: String,
  projectname: String,
  sprints: [SprintReport]
 }
`;
export { schema };

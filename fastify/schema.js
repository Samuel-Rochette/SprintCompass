const schema = `
type Query {
  login(username: String, password: String) : String
},
type Mutation {
  registeruser(username: String, password: String) : String
},
type User {
  username: String,
  password: String,
 },
`;
export { schema };

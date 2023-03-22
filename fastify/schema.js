const schema = `
type Query {
  validatetoken : String
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

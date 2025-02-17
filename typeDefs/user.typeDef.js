const UserTypeDef = `#graphql
 type User {
    _id: ID!
    username:String!
    name:String!
    password:String!
    email: String!  # Added email field
    token: String
}

type AuthPayload {
  user: User
  token: String
}

type Query {
    authUser: User
    user(userId: ID!): User
  }

  type Mutation {
     signUp(input:SignupInput!):User
     login(input: LoginInput!): AuthPayload
     updateUser(input:UpdateUserInput!):User
  }

  input SignupInput {
    username: String!
    name: String!
    password: String!
    email: String!

  }

 input LoginInput {
  email: String!
  password: String!
}

  input UpdateUserInput {
    _id: ID!
    name: String!
    password: String!
    email: String!  # Added email field
  }
`;

export default UserTypeDef
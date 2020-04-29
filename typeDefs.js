const { gql } = require("apollo-server");

// =============================================================================
//                         @a GraphQL SCHEMA
// =============================================================================

module.exports = gql`
  type User {
    _id: ID
    name: String
    email: String
    picture: String
  }

  # [Comment] represent a list populated with Comment
  type Pin {
    _id: ID
    createdAt: String
    title: String
    content: String
    image: String
    latitude: Float
    longitude: Float
    author: User
    comments: [Comment]
  }
  #getPins return a list of Pin that cant be null
  type Query {
    me: User
    getPins: [Pin!]
  }

  type Comment {
    text: String
    createdAt: String
    author: User
  }

  #Input types are special object types that allow you to pass objects as arguments to queries and mutations
  input CreatePinInput {
    title: String
    image: String
    content: String
    latitude: Float
    longitude: Float
  }

  # Here our mutations return a pin we use our CreatePinInput in createPin mutation
  type Mutation {
    createPin(input: CreatePinInput!): Pin
    deletePin(pinId: ID!): Pin
    createComment(pinId: ID!, text: String!): Pin
  }

  #Subscriptions are another root level type, similar to Query and Mutation
  type Subscription {
    pinAdded: Pin
    pinDeleted: Pin
    pinUpdated: Pin
  }
`;

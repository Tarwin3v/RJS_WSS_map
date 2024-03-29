const { ApolloServer } = require("apollo-server");
const mongoose = require("mongoose");
require("dotenv").config();

const typeDefs = require("./typeDefs");
const resolvers = require("./resolvers");
const { findOrCreateUser } = require("./controllers/userCtrl");

// =============================================================================
//                         //@d CONNECTION TO DB
// =============================================================================

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(() => console.log("DB connected"))
  .catch((e) => console.error(e));

// =============================================================================
//                         //@d CREATE AN  APOLLO SERVER
// =============================================================================

new ApolloServer({
  typeDefs,
  resolvers,
  //@q we create our context to get our currentUser data && create // we send this token from our client with our client hooks && graphqlClient
  context: async ({ req }) => {
    let authToken = null;
    let currentUser = null;
    try {
      authToken = req.headers.authorization;
      if (authToken) {
        currentUser = await findOrCreateUser(authToken);
      }
    } catch (err) {
      console.error(`Unable to authenticate user with token ${authToken}`);
    }
    return { currentUser };
  },
})
  .listen({ port: process.env.PORT || 4000 })
  .then(({ url }) => {
    console.log(`Server listening on ${url}`);
  });

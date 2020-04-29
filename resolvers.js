const { AuthenticationError, PubSub } = require("apollo-server");
const Pin = require("./models/Pin");

//@q Subscriptions depend on use of a publish and subscribe primitive to generate the events that notify a subscription.
//@q PubSub is a factory that creates event generators

const pubsub = new PubSub();
const PIN_ADDED = "PIN_ADDED";
const PIN_DELETED = "PIN_DELETED";
const PIN_UPDATED = "PIN_UPDATED";

//@q https://www.apollographql.com/docs/apollo-server/data/resolvers/#resolver-arguments

//@q A resolver can optionally accept four positional arguments: (parent, args, context, info).
//@q parent :: https://www.apollographql.com/docs/apollo-server/data/resolvers/#resolver-chains
//@q args :: An object that contains all GraphQL arguments provided for this field.
//@q For example, when executing query{ user(id: "4") }, the args object passed to the user resolver is { "id": "4" }

//@q authenticated middleware // https://medium.com/the-guild/authentication-and-authorization-in-graphql-and-how-graphql-modules-can-help-fadc1ee5b0c2
const authenticated = (next) => (root, args, ctx, info) => {
  if (!ctx.currentUser) {
    //@q https://www.apollographql.com/docs/apollo-server/data/errors/
    throw new AuthenticationError("You must be logged in");
  }
  return next(root, args, ctx, info);
};

module.exports = {
  Query: {
    //@q we check if we have an currentUser with our authenticated middleware
    //@q && return the context with the currentUser data to be able to use it later in our resolver

    me: authenticated((root, args, ctx) => ctx.currentUser),

    //@d we query our db for our pins we populate it with author && comment.author data && we return the data

    getPins: async (root, args, ctx) => {
      const pins = await Pin.find({})
        .populate("author")
        .populate("comments.author");
      return pins;
    },
  },
  Mutation: {
    //@q we use one more time authenticated on createPin
    createPin: authenticated(async (root, args, ctx) => {
      //@d if ctx.currentUser :: we create a new Pin && we spread our args.input && append author id to the document with ctx.currentUser
      const newPin = await new Pin({
        ...args.input,
        author: ctx.currentUser._id,
      }).save();
      //@d we populate our pin with author data
      const pinAdded = await Pin.populate(newPin, "author");
      //@q then we publish our new pin to access to it in realtime in our app
      pubsub.publish(PIN_ADDED, { pinAdded });
      return pinAdded;
    }),
    deletePin: authenticated(async (root, args, ctx) => {
      const pinDeleted = await Pin.findOneAndDelete({ _id: args.pinId }).exec();
      pubsub.publish(PIN_DELETED, { pinDeleted });
      return pinDeleted;
    }),
    createComment: authenticated(async (root, args, ctx) => {
      const newComment = { text: args.text, author: ctx.currentUser._id };
      const pinUpdated = await Pin.findOneAndUpdate(
        { _id: args.pinId },
        { $push: { comments: newComment } },
        { new: true }
      )
        .populate("author")
        .populate("comments.author");
      pubsub.publish(PIN_UPDATED, { pinUpdated });
      return pinUpdated;
    }),
  },
  Subscription: {
    pinAdded: {
      subscribe: () => pubsub.asyncIterator(PIN_ADDED),
    },
    pinDeleted: {
      subscribe: () => pubsub.asyncIterator(PIN_DELETED),
    },
    pinUpdated: {
      subscribe: () => pubsub.asyncIterator(PIN_UPDATED),
    },
  },
};

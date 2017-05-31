import { pubsub } from '../server/subscriptions';

const resolvers = {
  Query: {
    users(root, { limit, skip, sort }, { Users }) {
      return Users.find({ limit, skip, sort });
    },

    user(root, { _id }, { Users }) {
      return Users.findOneById(_id);
    },
    currentUser(root, args, { Users, userId }) {
      return Users.findOneById(userId);
    }
  },
  Mutation: {
    async createUser(root, { input }, { Users }) {
      const _id = await Users.insertOne(input);
      return Users.findOneById(_id);
    },

    async updateUser(root, { _id, input }, { Users }) {
      await Users.updateById(_id, input);
      return Users.findOneById(_id);
    },

    removeUser(root, { _id }, { Users }) {
      return Users.removeById(_id);
    }
  },
  Subscription: {
    userCreated: {
      subscribe: () => pubsub.asyncIterator('userCreated')
    },
    userUpdated: {
      subscribe: () => pubsub.asyncIterator('userUpdated')
    },
    userRemoved: {
      subscribe: () => pubsub.asyncIterator('userRemoved')
    }
  }
};

export default resolvers;

import { withFilter } from 'graphql-subscriptions';
import { pubsub } from '../lib/api';

const resolvers = {
  Query: {
    async users(root, { limit, skip, sort }, { Users }) {
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
      subscribe: withFilter(() => pubsub.asyncIterator('userCreated'), (payload, { _id }) => {
        if (!!_id) {
          return payload.userCreated._id === _id;
        }
        return !!payload.userCreated;
      })
    },
    userUpdated: {
      subscribe: withFilter(() => pubsub.asyncIterator('userUpdated'), (payload, { _id }) => {
        if (!!_id) {
          return payload.userUpdated._id === _id;
        }
        return !!payload.userUpdated;
      })
    },
    userRemoved: {
      subscribe: withFilter(() => pubsub.asyncIterator('userRemoved'), (payload, { _id }) => {
        if (!!_id) {
          return payload.userRemoved._id === _id;
        }
        return !!payload.userRemoved;
      })
    }
  }
};

export default resolvers;

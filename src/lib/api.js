import fs from 'fs';
import _ from 'lodash';
import { makeExecutableSchema } from 'graphql-tools';
import { PubSub } from 'graphql-subscriptions';
import MongoCollection from './mongo';
import models from '../models';
import schemas from '../schemas';
import resolvers from '../resolvers';
import startServer from '../server/start';

export const pubsub = new PubSub();

export default {
  models,
  schemas,
  resolvers,
  context: { pubsub },
  pubsub,

  startServer() {
    this.loadSchemas();
    return startServer();
  },

  requireGraphQL(name) {
    const file = require.resolve(name);
    try {
      return fs.readFileSync(file, 'utf8');
    } catch (e) {
      throw new Error(`Failed to load schema at path: ${file} \n${e}`);
    }
  },

  createCollection(name, options = {}, collection = MongoCollection) {
    if (!name) {
      throw new TypeError('Model name is required');
    }
    if (typeof options.schema === 'string') {
      this.addSchema(options.schema);
    }
    if (typeof options.resolvers === 'object') {
      this.addResolvers(options.resolvers);
    }
    this.models[name] = { options, collection };
  },

  addSchema(schema) {
    if (typeof schema !== 'string') {
      throw new TypeError('Schema passed to addSchema must be a String');
    }
    this.schemas.push(schema);
  },

  addResolvers(obj = {}) {
    return _.merge(this.resolvers, obj);
  },

  addToContext(obj = {}) {
    return _.merge(this.context, obj);
  },

  getExecutableSchema() {
    return makeExecutableSchema({
      typeDefs: this.schemas,
      resolvers: this.resolvers
    });
  },

  loadSchemas() {
    Object.keys(this.models).forEach((name) => {
      const model = this.models[name];
      if (typeof model.options.schema === 'string') {
        this.addSchema(model.options.schema);
      }
    });
  },

  loadContext(context = {}) {
    const newContext = Object.assign({}, this.context, context);
    Object.keys(this.models).forEach((name) => {
      const model = this.models[name];
      const restOfOpts = _.omit(model.options, ['schema', 'resolvers']);
      newContext[name] = new model.collection(name.toLowerCase(), restOfOpts, newContext);
    });
    return newContext;
  }
};

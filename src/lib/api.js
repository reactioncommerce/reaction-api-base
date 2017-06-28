import fs from 'fs';
import _ from 'lodash';
import { makeExecutableSchema } from 'graphql-tools';

export default class API {

  constructor({ typeDefs = [], resolvers = {} }) {
    this.schemas = typeDefs;
    this.resolvers = resolvers;
  }

  addSchema(schema) {
    this.schemas.push(schema);
  }

  addResolvers(obj = {}) {
    _.merge(this.resolvers, obj);
  }

  requireGraphQL(name) {
    const file = require.resolve(name);
    try {
      return fs.readFileSync(file, 'utf8');
    } catch (e) {
      const msg = `Failed to load schema at path: ${file}`;
      Logger.error(e, msg);
      throw new Error(msg);
    }
  }

  getExecutableSchema() {
    const typeDefs = this.schemas;
    const resolvers = this.resolvers;
    return makeExecutableSchema({ typeDefs, resolvers });
  }
}

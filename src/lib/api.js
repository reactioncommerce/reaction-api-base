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
    const filename = require.resolve(name);
    return fs.readFileSync(filename, 'utf8');
  }

  getExecutableSchema() {
    const typeDefs = this.schemas;
    const resolvers = this.resolvers;
    return makeExecutableSchema({ typeDefs, resolvers });
  }
}

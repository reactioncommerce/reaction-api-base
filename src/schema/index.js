import fs from 'fs';

function requireGraphQL(name) {
  const filename = require.resolve(name);
  return fs.readFileSync(filename, 'utf8');
}

const typeDefs = [`
  scalar ObjID
  scalar Date
  scalar JSON
`];

typeDefs.push(requireGraphQL('./User.graphql'));

export default typeDefs;

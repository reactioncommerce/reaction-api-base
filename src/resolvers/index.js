import _ from 'lodash';
import scalars from './scalars';
import userResolvers from './Users';

const resolvers = {
  ...scalars
};

_.merge(resolvers, userResolvers);

export default resolvers;

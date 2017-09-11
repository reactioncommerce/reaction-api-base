import scalars from './scalars';
import userResolvers from './Users';

// core resolvers
export default {
  ...scalars,
  ...userResolvers
};

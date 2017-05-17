import Users from './Users';

const models = {
  Users
};

export default function loadModelsWithContext(context) {
  const newContext = Object.assign({}, context);
  Object.keys(models).forEach((key) => {
    newContext[key] = new models[key](key.toLowerCase(), newContext);
  });
  return newContext;
}

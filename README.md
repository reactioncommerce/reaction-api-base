
# Reaction GraphQL API Base

A GraphQL API server base to get started with building GraphQL API's.

## Install

```sh
git clone https://github.com/reactioncommerce/reaction-api-base.git

cd reaction-api-base

yarn
```

## Run

### Development

In development, `mongodb-prebuilt` is used to give you an easy local development database and `nodemon` provides a live reloading Node server that will refresh on any changes to the contents of the `src/` directory.

To start the Mongo and GraphQL API servers:

```sh
yarn start
```

The following services should now be available:

**GraphQL API** - <http://localhost:3000/graphql>

**GraphiQL UI** - <http://localhost:3000/graphiql>

**Subscriptions websocket server** - <ws://localhost:3001>

**MongoDB** - <mongodb://localhost:3002>


### Production

To create/run a production build:

```sh
# create the build
yarn run build

# optionally prune dev dependencies
yarn --prod

# start the production server
# (MONGO_URL required)
MONGO_URL="mongodb://example.com:27017/db" yarn run serve
```

Or better yet, let Docker build a lean production image for you in one command...

## Docker

**Production Build**

```sh
./docker/build.sh

# reactioncommerce/reaction-api-base:latest
```

**Development Build**

```sh
./docker/build.sh --dev

# reactioncommerce/reaction-api-base:devel
```

If you are doing test builds regularly in development, you can use the development Docker build to speed your builds up.  It caches all of the dependencies on the first run and only needs to reinstall them if the `package.json` or `yarn.lock` changes.  After the first run, subsequent builds usually take less than 10 seconds because the only step that needs to happen is the Babel transpile.

However, note that while this is technically a production build of the app code, this is NOT a lean Docker build.  All of the dev dependencies and OS build tools remain in the image, so it's usually at least 500MB larger than the lean Docker build above.  This is only intended to give you a way to quickly test that a production build works properly.  You should always use the production Docker build for your final distribution.

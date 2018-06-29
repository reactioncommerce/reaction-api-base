
# GraphQL API Server Base

A GraphQL API server base to get started with building GraphQL API's.

## Install

```sh
git clone https://github.com/reactioncommerce/reaction-api-base.git

cd reaction-api-base

docker-compose up
```

## Run

### Development

All development can be done via Docker Compose. To start the Mongo and GraphQL
API servers:

```sh
docker-compose up
```

It can be convenient to start the project in a detached state:

```sh
docker-compose up -d && docker-compose logs -f
```

#### Service Endpoints

The following services should now be available:

* **GraphQL API** - <http://localhost:3000/graphql>
* **GraphiQL UI** - <http://localhost:3000/graphiql>
* **Subscriptions websocket** - <ws://localhost:3000/subscriptions>


#### File-Reloading
The project code can be edited on the host machine. The process will be
reloaded when code is changed.

#### Updating Dependencies
In development, you will need to run the following command when the
`package.json` file is modified:

```sh
docker-compose run --rm api yarn install --modules-folder /opt/node_modules
docker-compose build api
```

This command will run `yarn install` inside the Docker container which will
rebuild `yarn.lock` and install dependencies. Finally, rebuild the Docker image
to install and cache the dependencies in the image.

### Production

The builds are parameterized so that the environment may be specified. The
default is production. The `yarn.lock` is frozen in production and the build
will fail if an update is needed. To run a production build:

```sh
docker build -t reaction-api-base:latest .
```

## License

Copyright © [MIT](./LICENSE.md)

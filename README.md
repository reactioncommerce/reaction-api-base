# ARCHIVED: Demo GraphQL API

:notebook_with_decorative_cover: This project is archived and no longer
maintained. It was an early experiment to create a simple, standalone GraphQL
server. We have since included a GraphQL API directly in [core Reaction](https://github.com/reactioncommerce/reaction).

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

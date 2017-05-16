# This caches all of the build tools and doesn't
# uninstall them after the app build has completed.
# After the first run, this allows much faster builds
# that are convenient for development, but the image is more
# than 500MB larger than the production Dockerfile
# in the root of the project.

FROM node:7
MAINTAINER Jeremy Shimko <jeremy@reactioncommerce.com>

ENV APP_SOURCE_DIR /opt/src

WORKDIR $APP_SOURCE_DIR

COPY . $APP_SOURCE_DIR

RUN yarn && npm run build

EXPOSE 3000
EXPOSE 3001

CMD ["node", "dist/index.js"]

# This caches all of the build tools and doesn't
# uninstall them after the app build has completed.
# After the first run, this allows much faster builds
# that are convenient in development, but the image is more
# than 500MB larger compared to the image from the production
# Dockerfile in the root of the project.

FROM node:7
MAINTAINER Jeremy Shimko <jeremy@reactioncommerce.com>

ENV APP_SOURCE_DIR /opt/src

WORKDIR $APP_SOURCE_DIR

# Install and cache the npm dependencies so they only need to
# be installed again when the package.json or yarn.lock changes
COPY package.json yarn.lock $APP_SOURCE_DIR/
RUN yarn

# add the rest of the app and build it
COPY . $APP_SOURCE_DIR
RUN npm run build

EXPOSE 3000
EXPOSE 3001

CMD ["node", "dist/index.js"]

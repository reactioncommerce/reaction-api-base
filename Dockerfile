FROM node:8-alpine
MAINTAINER Jeremy Shimko <jeremy@reactioncommerce.com>

ENV APP_SOURCE_DIR /opt/src

WORKDIR $APP_SOURCE_DIR

COPY . $APP_SOURCE_DIR

RUN $APP_SOURCE_DIR/.docker/scripts/install.sh && \
    $APP_SOURCE_DIR/.docker/scripts/cleanup.sh

ENV NODE_ENV production

EXPOSE 3000

CMD ["node", "dist/index.js"]

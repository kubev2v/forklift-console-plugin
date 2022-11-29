# Builder container
FROM registry.access.redhat.com/ubi9/nodejs-16 AS build

# Install yarn
RUN npm install -g yarn -s &>/dev/null

# Copy app source
COPY . /opt/app-root/src/app
WORKDIR /opt/app-root/src/app

# Run install as supper tux
USER 0
RUN yarn install --frozen-lockfile && yarn build

# Web server container
FROM registry.access.redhat.com/ubi9/nginx-120

# Use none-root user
USER 1001

# Set nginx configuration
# COPY nginx.conf /etc/nginx/nginx.conf

# When using ubi9/nginx-120 defaults:
#  listen       8080 default_server;
#  root         /opt/app-root/src;

COPY --from=build /opt/app-root/src/app/dist /opt/app-root/src

# Run the server
CMD nginx -g "daemon off;"

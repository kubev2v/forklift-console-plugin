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

# Use none root user
USER 1001

# Set nginx configuration
# COPY nginx.conf /etc/nginx/nginx.conf

# Example nginx.conf:
# server {
#    listen       9443 ssl;
#    ssl_certificate /var/serving-cert/tls.crt;
#    ssl_certificate_key /var/serving-cert/tls.key;
#    ssl_protocols TLSv1.2 TLSv1.3;
#    location / {
#        root   /opt/app-root/src;
#    }
#    error_page   500 502 503 504  /50x.html;
#    location = /50x.html {
#        root   /usr/share/nginx/html;
#    }
#    ssi on;
# }

# When using ubi9/nginx-120 defaults:
#  listen       8080 default_server;
#  root         /opt/app-root/src;

COPY --from=build /opt/app-root/src/app/dist /opt/app-root/src

# Run the server
CMD nginx -g "daemon off;"

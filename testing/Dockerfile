# Use the official Playwright image as a base
FROM mcr.microsoft.com/playwright:v1.54.2-noble

# Set the locale environment variables first 
ENV LANG en_US.UTF-8
ENV LANGUAGE en_US:en
ENV LC_ALL en_US.UTF-8

# Install system dependencies in one layer 
RUN apt-get update && \
    apt-get install -y git locales tree && \
    rm -rf /var/lib/apt/lists/* && \
    locale-gen en_US.UTF-8

# Create a directory for the test runner script
WORKDIR /test-runner

# Copy package.json and yarn.lock, then install dependencies
COPY package.json yarn.lock ./
RUN corepack enable && yarn install --frozen-lockfile

# Pre-install Playwright browsers with the correct version
RUN npx playwright install --with-deps

# Copy and make executable in one step 
COPY run-tests.sh .
RUN chmod +x run-tests.sh

# Set the default command for the container
CMD ["./run-tests.sh"]

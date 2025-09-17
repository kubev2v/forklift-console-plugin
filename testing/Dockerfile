FROM mcr.microsoft.com/playwright:v1.54.2-noble

# Build arguments for test repository
ARG TEST_REPO=https://github.com/kubev2v/forklift-console-plugin.git
ARG TEST_BRANCH=main

ENV LANG en_US.UTF-8
ENV LANGUAGE en_US.UTF-8
ENV LC_ALL en_US.UTF-8

RUN apt-get update && \
    apt-get install -y git locales tree && \
    rm -rf /var/lib/apt/lists/* && \
    locale-gen en_US.UTF-8

# Clone the test repository at build time
WORKDIR /test-repo
RUN git clone -b "${TEST_BRANCH}" "${TEST_REPO}" .

# Install dependencies at build time
WORKDIR /test-repo/testing
RUN corepack enable && yarn install --frozen-lockfile

# Install Playwright browsers
RUN npx playwright install --with-deps

# Copy the runtime script to both locations for compatibility
COPY run-tests.sh ./run-tests.sh
RUN chmod +x run-tests.sh

# Create symlink for Jenkins compatibility
RUN mkdir -p /test-runner && ln -s /test-repo/testing/run-tests.sh /test-runner/run-tests.sh

USER 1001

CMD ["./run-tests.sh"]

FROM mcr.microsoft.com/playwright:v1.54.2-noble

ENV LANG en_US.UTF-8
ENV LANGUAGE en_US:en
ENV LC_ALL en_US.UTF-8

RUN apt-get update && \
    apt-get install -y git locales tree && \
    rm -rf /var/lib/apt/lists/* && \
    locale-gen en_US.UTF-8

WORKDIR /test-runner

COPY package.json yarn.lock ./
RUN corepack enable && yarn install --frozen-lockfile

RUN npx playwright install --with-deps

COPY run-tests.sh .
RUN chmod +x run-tests.sh

USER 1001

CMD ["./run-tests.sh"]

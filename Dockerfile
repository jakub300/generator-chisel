FROM node:8-stretch as pack

COPY . /generator-chisel
WORKDIR /generator-chisel
RUN apt-get update && \
  apt-get install -y php-cli && \
  rm -rf /var/lib/apt/lists/* && \
  npm pack --unsafe-perm && \
  mv generator-chisel-*.tgz generator-chisel.tgz


FROM ubuntu:17.04

RUN groupadd --gid 1000 chisel \
  && useradd --uid 1000 --gid chisel --shell /bin/bash --create-home chisel

RUN apt-get update && \
  apt-get install -y php-cli php-mysql curl mysql-client && \
  rm -rf /var/lib/apt/lists/* && \
  php -v && \
  mysql --version

COPY --from=pack /generator-chisel/generator-chisel.tgz /generator-chisel/

USER chisel

WORKDIR /home/chisel

ENV NVM_VERSION 0.33.5
ENV NVM_DIR /home/chisel/.nvm
ENV NODE_VERSION 8
ENV CHISEL_DOCKER 1

RUN (curl -o- https://raw.githubusercontent.com/creationix/nvm/v$NVM_VERSION/install.sh | bash) && \
  . $NVM_DIR/nvm.sh && \
  nvm install $NODE_VERSION && \
  npm install -g yarn yo && \
  npm install -g /generator-chisel/generator-chisel.tgz && \
  npm cache clean --force && \
  mkdir bin && \
  (echo '#!/bin/bash -i\n\nyo chisel "$@"' > ./bin/create) && \
  (echo '#!/bin/bash -i\n\nnpm run build "$@"' > ./bin/build) && \
  (echo '#!/bin/bash -i\n\nnpm run watch "$@"' > ./bin/watch) && \
  (echo '#!/bin/bash -i\n\nnpm run dev "$@"' > ./bin/dev) && \
  (echo '#!/bin/bash -i\n\nnpm run lint "$@"' > ./bin/lint) && \
  chmod +x ./bin/* && \
  mkdir project

VOLUME /home/chisel/.cache/yarn /home/chisel/.npm/_cacache

ENV PATH "/home/chisel/bin:$PATH"
WORKDIR /home/chisel/project
EXPOSE 3000
CMD ["tail", "-f", "/dev/null"]

FROM ubuntu:latest
# For Firefox Version 11 use precise (12.04)
# Ubuntu Current Stable is 16.04 aka xenial aka latest
# As of 2017-04-05 Xenial contains version 52

#I use cd . as a NO OP, when I want to do something other than && \

ENV DEBIAN_FRONTEND noninteractive
ENV RUNUSER firefox

ARG FIREFOX_VERSION=52

ARG FIREFOX_INSTALL_DIR=/usr/lib/firefox-addons/
ARG GIT_REPO=https://github.com/eclipxe13/cmdlnprint.git
ARG GIT_BRANCH=master

ARG APT_PACKAGES_RUN="\
    ca-certificates \
    dbus-x11 \
    firefox=${FIREFOX_VERSION}* \
    fonts-liberation \
    fonts-lmodern \
    libdbus-glib-1-2 \
    libgtk-3-0 \
    ttf-dejavu-core \
    ttf-dejavu-extra \
    ttf-liberation \
    xvfb"

ARG APT_PACKAGES_BUILD="\
    bzip2 \
    curl \
    git \
    make \
    unzip \
    xmlstarlet \
    zip \
    nodejs \
    nodejs-legacy \
    npm"

ADD root /

RUN \
  useradd -m $RUNUSER && \
  apt-get update && \
  apt-get install -y --no-install-recommends ${APT_PACKAGES_RUN} ${APT_PACKAGES_BUILD} && \
  npm install jpm --global

RUN \
  rm -rf /tmp/cmdlnprint || true && \
  mkdir -p /tmp/cmdlnprint || true && \
  git clone -b ${GIT_BRANCH} ${GIT_REPO} /tmp/cmdlnprint && \
  cd /tmp/cmdlnprint && \
  make build && \
  xpi_file=dist/cmdlnprint_$(grep -oP '"version"\s*:\s*"\K[a-zA-Z0-9.]+' src/package.json).xpi && \
  xpi_uuid=$(grep -oP '"id"\s*:\s*"\K[a-zA-Z0-9{}\\-]+' src/package.json) && \
  echo "  Installing ${xpi_file} -> ${FIREFOX_INSTALL_DIR}/extensions/${xpi_uuid}.xpi" && \
  mkdir -p ${FIREFOX_INSTALL_DIR}/extensions || true && \
  cp ${xpi_file} ${FIREFOX_INSTALL_DIR}/extensions/${xpi_uuid}.xpi && \
  cd / && \
  rm -rf /tmp/cmdlnprint && \
  apt-get purge -y ${APT_PACKAGES_BUILD} && \
  apt-get autoremove -y --purge && \
  rm -rf /var/lib/apt/lists/* && \
  chmod 755 /usr/local/bin/entrypoint.sh

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]

USER ${RUNUSER}

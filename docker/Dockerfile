FROM ubuntu:latest
#For Firefox Version 11 use precise (12.04)
#Ubuntu Current Stable is 16.04 aka xenial aka latest

#I use cd . as a NO OP, when I want to do something other than && \

ENV DEBIAN_FRONTEND noninteractive
ENV RUNUSER firefox

ARG FIREFOX_VERSION=51

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
    zip"

ADD root /
RUN \
  useradd -m $RUNUSER && \
  apt-get update && \
  apt-get install -y --no-install-recommends ${APT_PACKAGES_RUN} ${APT_PACKAGES_BUILD} && \
  mkdir /tmp/cmdlnprint && \
  git clone -b ${GIT_BRANCH} ${GIT_REPO} /tmp/cmdlnprint && \
  cd /tmp/cmdlnprint/src && \
  if [ -f Makefile ]; then \
     make && \
     cd ../dist && \
     cd . ; \
  else \
     apt-get install -y --no-install-recommends nodejs nodejs-legacy npm && \
     npm install jpm --global && \
     jpm xpi . && \ 
     cd . ; \
  fi && \
  for xpi in $(ls *.xpi); do \
    echo "Installing ${xpi}..." && \
    xpi_uuid=$(unzip -qc ${xpi} install.rdf | xmlstarlet sel \
      -N rdf=http://www.w3.org/1999/02/22-rdf-syntax-ns# \
      -N em=http://www.mozilla.org/2004/em-rdf# \
      -t -v \
      "//rdf:Description[@about='urn:mozilla:install-manifest']/em:id") && \
    echo "  Installing ${xpi} -> ${FIREFOX_INSTALL_DIR}/extensions/${xpi_uuid}.xpi" && \
    mkdir -p ${FIREFOX_INSTALL_DIR}/extensions || true && \
    cp ${xpi} ${FIREFOX_INSTALL_DIR}/extensions/${xpi_uuid}.xpi; \
  done && \
  cd / && \
  rm -rf /tmp/cmdlnprint && \
  apt-get purge -y ${APT_PACKAGES_BUILD} && \
  apt-get autoremove -y --purge && \
  rm -rf /var/lib/apt/lists/* && \
  chmod 755 /usr/local/bin/entrypoint.sh 

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]

USER ${RUNUSER}

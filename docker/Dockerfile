FROM cmdlnprint-base

ARG GIT_REPO=https://github.com/eclipxe13/cmdlnprint.git
ARG GIT_BRANCH=master

RUN set -e && \
    if [ -e /tmp/cmdlnprint ]; then rm -rf /tmp/cmdlnprint; fi && \
    mkdir -p /tmp/cmdlnprint && \
    git clone -b ${GIT_BRANCH} ${GIT_REPO} /tmp/cmdlnprint && \
    cd /tmp/cmdlnprint && \
    make build && \
    cd /tmp/cmdlnprint && \
    xpi_file=$(make info | awk '{print $4}') && \
    xpi_uuid=$(make info | awk '{print $3}') && \
    echo "  Installing ${xpi_file} -> ${FIREFOX_INSTALL_DIR}/extensions/${xpi_uuid}.xpi" && \
    export FIREFOX_INSTALL_DIR=/usr/lib/firefox-esr/browser/ && \
    if [ ! -e ${FIREFOX_INSTALL_DIR}/extensions ]; then mkdir -p ${FIREFOX_INSTALL_DIR}/extensions; fi && \
    cp ${xpi_file} ${FIREFOX_INSTALL_DIR}/extensions/${xpi_uuid}.xpi

EXPOSE 5900

ADD root /

ENTRYPOINT ["/usr/bin/bash", "/usr/local/bin/entrypoint"]

#!/bin/bash
set -euo pipefail
IFS=$'\n\t'

DISPLAY=${DISPLAY-}
FB_DIR=${FB_DIR-/tmp/bigchart-fb}
FB_RESOLUTION=${FB_RESOLUTION-1024x768}
FB_PIXEL_DEPTH=${FB_PIXEL_DEPTH-24}

# #if ! [[ -e ${HOME} -a -r ${HOME} -a -d ${HOME}  ]]; then
# if ! [[ -e ${HOME} ]]; then
#   echo "Home, ${HOME}, doesn't existing assigning HOME=/tmp/home and copying skeleton from ~firefox/.mozilla."
#   mkdir /tmp/ff-home || true
#   ls -ldR /tmp/ff-home
#   cp -R ~firefox/.mozilla /tmp/ff-home/
#   export HOME=/tmp/ff-home
#   ls -ldR /tmp/ff-home
# fi

if [[ -n ${DISPLAY} ]]; then
  echo "DISPLAY already set to ${DISPLAY}.  Skipping Xvfb setup."
else
  if ! [[ -e ${FB_DIR} ]]; then
    echo "Making ${FB_DIR} for Xvfb to use..."
    mkdir -p ${FB_DIR}
  fi
  echo "Setting up Xvfb in ${FB_DIR}..."
  Xvfb :1 -screen 0 ${FB_RESOLUTION}x${FB_PIXEL_DEPTH} -fbdir ${FB_DIR} 2>&1 | \
    egrep -v '^(_XSERVTransmkdir.*will not be created\.|Xlib: extension "RANDR" missing on display .*\.)$' &
  export DISPLAY=":1"
fi

echo "Calling ${@}..."
exec "$@"

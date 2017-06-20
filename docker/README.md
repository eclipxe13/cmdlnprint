# cmdlnprint docker image

This image is based on debian stretch that ships with firefox 52 (as of 2017-06-18)


```
# the docker is inside the project
git clone https://github.com/eclipxe13/cmdlnprint.git
cd cmdlnprint/docker

# build base image
docker build -t cmdlnprint-base cmdlnprint-base/

# build plugin using defaults (master branch)
docker build -t cmdlnprint ./

# test its working
mkdir -p /tmp/output
docker run --rm --volume /tmp/output/:/tmp/output cmdlnprint \
    firefox -print https://opensource.org/licenses/MIT -print-mode pdf -print-file /tmp/output/license-mit.pdf
```

Your file should now be in folder `/tmp/output` since this is the shared mounted volume

## Depends on image cmdlnprint-base

You will need to build cmdlnprint-base, this is better since is the most
expensive process. Then all other builds and changes will be cheap and fast.

```
docker build -t cmdlnprint-base cmdlnprint-base/
```

## Image build args

The following can be overriden at docker build with `--build-arg ARG=value`

- `GIT_REPO`: Override the git location (to test your own fork)
    Default: `https://github.com/eclipxe13/cmdlnprint.git`
- `GIT_BRANCH`: Override the git branch
    Default: `master`

Tip: name the image like 'docker build --build-arg GIT_BRANCH=feature-x -t cmdlnprint:feature-x .'

## Container environment variables: X11VNC

The following can be overridden at docker run time with `-e VAR=value`

```
X11VNC=yes
```

If you set en the environment `X11VNC=yes` the container will run x11vnc and
listen on port 5900, in this way you can access thru VNC to see what is going on
and even use firefox.

```
docker run --rm --volume /tmp/output:/tmp/output -p 5911:5900 cmdlnprint \
    firefox -print https://opensource.org/licenses/MIT -print-mode pdf -print-file /tmp/output/license-mit.pdf
```

While is running you can connect to localhost:5911 and see what is going on.
You can also access to about:addons and see if the extension is enabled.

## Container environment variables: DISPLAY

If you provide a DASPLAY environment varible then the container will skip the
creation of Xvfb and use the defined DISPLAY.

See also: http://fabiorehm.com/blog/2014/09/11/running-gui-apps-with-docker/

# TODO:

- [ ] Remove manual installation of npm when debian stretch includes it.
- [ ] Allow other versions of firefox using the public mozilla repository.

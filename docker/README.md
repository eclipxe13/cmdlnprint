# ubuntu/firefox/cmdlnprint docker image

To use:

```
git clone https://github.com/eclipxe13/cmdlnprint.git
cd cmdlnprint/docker
docker build -t cmdlnprint:latest ./
mkdir -p cmdlnprint_shared/output
docker run --rm --volume `pwd`/cmdlnprint_shared/:/home/firefox/shared cmdlnprint:latest firefox -print https://google.com -print-mode pdf -print-file /home/firefox/shared/output/google.pdf
```

Your file should now be in `cmdlnprint_shared/output/`

Note that firefox will *NOT* be able to write to /home/firefox/shared inside the container because of [this known issue (https://github.com/docker/docker/issues/3124)].

# Batteries included and replacible

There are several defaults that are reasonable choices that can be overridden

## Image build args

The following can be overridden at docker build time with the `--build-arg ARG=value.  So if you wanted to build firefox version 45 (this combiniation does not currently work but perhaps you want to see that) you could build with `docker build --build-arg FIREFOX_VERSION=45 -t cmdlnprint:104_45 ./`

```
FIREFOX_VERSION=54
GIT_REPO=https://github.com/eclipxe13/cmdlnprint.git
GIT_BRANCH=master
```
## Container environment variables

The following can be overridden at docker run time with `-e VAR=value`

```
HOME=${HOME-/home/firefox}
DISPLAY=${DISPLAY-}
```

Setting HOME is helpful if you use `-u` argment at run time to set the uid.  

Modifying DISPLAY to a local x server is helpful for debugging.  On a mac I will first setup a proxy to my x server (requires xquartz and socat; if your installation is missing either of these utilities, they are both available from brew):

```
export DOCKER_DISPLAY=`ifconfig en0 | fgrep 'inet ' | awk '{print $2}'`:0;
xhost +local:docker && \
echo "Docker DISPLAY should be set to: $DOCKER_DISPLAY" && \
socat TCP-LISTEN:6000,reuseaddr,fork UNIX-CLIENT:\"$DISPLAY\" &
```

Then I will run firefox like this (note that firefox will not exit because of the jsconsole window but eventually socat will timeout):

```
docker run --rm --volume `pwd`/cmdlnprint_shared/:/home/firefox/shared -e "DISPLAY=${DOCKER_DISPLAY}" cmdlnprint:latest firefox --jsconsole -print-info -print https://google.com -print-mode pdf -print-file /home/firefox/shared/output/google.pdf
```

TODO:

- [ ] Figure out why ubuntu trusty doesn't work.  Images are smaller and there are a wider range of firefox versions that will install using apt-get
- [ ] Setup remote debugging to work out of the box by doing the configuration work and exposing port 6000
- [ ] Allow build arguments to override the apt-get installed firefox with one installed from a url
- [ ] Provide helpful output from entrypoint.sh if called without any arguments
- [ ] Fix FF 45 and 54.
- [ ] Make configurable environment variable that will inject configuration options that make firefox more verbose
- [ ] Devise a method to expose cmdlnprint as a web service
- [ ] Devise a method to process jobs from a queue of some sort

Helpful info for profile config: https://notabug.org/desktopd/jpm.sh/src/master/lib/runner.sh

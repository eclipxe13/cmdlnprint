ADDONDIR         = src
PACKAGE          = $(ADDONDIR)/package.json
ADDON_BASE_NAME  = ${shell grep -oP '"name"\s*:\s*"\K[a-zA-Z0-9.]+' $(PACKAGE)}
ADDON_VERSION    = ${shell grep -oP '"version"\s*:\s*"\K[a-zA-Z0-9.]+' $(PACKAGE)}
DIST             = dist
ADDON_PATH       = $(DIST)/$(ADDON_BASE_NAME)_$(ADDON_VERSION).xpi

build : $(PACKAGE)
	mkdir -p $(DIST)
	jpm xpi -v --addon-dir $(ADDONDIR) --dest-dir $(DIST)
	mv -f $(DIST)/$(ADDON_BASE_NAME).xpi $(ADDON_PATH)

install : $(ADDON_PATH)
	firefox $< &

clean :
	rm -f $(ADDON_PATH)

all : clean build install

.PHONY : clean build install all

ADDON_BASE_NAME   = cmdlnprint
ADDON_VERSION     = 0.5.4

DIST = ../dist

MANIFEST_PATH = install.rdf

FILES = chrome.manifest \
        chrome/content/mininav.xul \
        chrome/content/mininav.js \
        chrome/content/preferences.xul \
        chrome/locale/en-US/mininav.dtd \
        chrome/locale/en-US/preferences.dtd \
        chrome/license.txt \
        components/cmdlnprint.js \
        defaults/preferences/cmdlnprintSettings.js \
        $(NULL)

ADDON_PATH = $(DIST)/$(ADDON_BASE_NAME)_$(ADDON_VERSION)_.xpi

all : $(ADDON_PATH)

$(ADDON_PATH) : $(FILES) $(MANIFEST_PATH)
	zip -r0 $(ADDON_PATH) $(FILES) $(MANIFEST_PATH)

$(MANIFEST_PATH) : install.rdf.in
	cat install.rdf.in | \
	sed 's/@@ADDON_VERSION@@/$(ADDON_VERSION)/' \
	> $(MANIFEST_PATH)

clean :
	rm -f $(DIST)/*.xpi $(MANIFEST_PATH)


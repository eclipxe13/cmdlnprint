ADDON_BASE_NAME   = cmdlnprint
ADDON_VERSION     = ${shell cat version.txt}

MANIFEST_PATH = install.rdf
FILES = chrome.manifest \
        chrome/content/mininav.xul \
        chrome/content/mininav.js \
        chrome/locale/en-US/mininav.dtd \
	chrome/license.txt \
	chrome/skin/cmdlnprint.png \
        components/cmdlnprint.js \
        $(NULL)


DIST = ../dist

ADDON_PATH = $(DIST)/$(ADDON_BASE_NAME)_$(ADDON_VERSION).xpi

build : $(ADDON_PATH)

install : $(ADDON_PATH)
	firefox $< &

$(ADDON_PATH) : $(FILES) $(MANIFEST_PATH)
	mkdir -p $(DIST)
	zip -r0 $@ $^

$(MANIFEST_PATH) : install.rdf.in version.txt
	cat $< | sed 's/@@ADDON_VERSION@@/$(ADDON_VERSION)/' > $@

clean :
	rm -f $(DIST)/*.xpi $(MANIFEST_PATH)

.PHONY : clean build install

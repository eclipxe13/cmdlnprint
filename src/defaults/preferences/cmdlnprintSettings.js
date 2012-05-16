pref("extensions.cmdlnprint.mode", 0);

/*
   When the mode is either PDF or PNG, and -printfile was not set,

   %EXT% is a file extension, either "pdf" or "png", which
   depends on the mode; -printmode param or "extensions.cmdlnprint.mode".

   %DATE% is "YYYYMMDD-hhmmss+TIMZONE"

   %HOST% is host of target URI. Note that the target may be redirected.
   so %HOST% is not always equals to the URI you specified with -print command.
 */
pref("extensions.cmdlnprint.basefilename",
     "%TITLE%@%HOST%_%DATE%.%EXT%");
pref("extensions.cmdlnprint.timeout", 180);

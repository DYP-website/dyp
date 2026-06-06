DYP v21 clean rebuild: landing with only two slots, separate Brand and Football sites, Firebase enabled.


## v22 Click Fix
The landing buttons now use `mode-controller.js`, a plain non-module script.
This fixes local Safari/file:// issues where type=module JavaScript may not execute, causing Enter Brand / Enter Football to do nothing.

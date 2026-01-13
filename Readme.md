AvNav freenauticalcharts
========================
[AvNav](https://github.com/wellenvogel/avnav) plugin to access online vector charts from [freenauticalcharts.net](https://freenauticalchart.net).<br>
Starting from 20260113 it also contains the chart data for offline use (DE).

The plugin requires at least AvNav version 20260104 (for offline charts at least AvNav 20260113) as it utilzes a lot of new plugin interfaces and this way is also usable for AvNav on Android (get a current AvNav beta [here](https://www.wellenvogel.net/software/avnav/downloads/daily/?dir=/software/avnav/downloads/daily&lang=en)).

Just upload a zip form the [releases](../../releases) to AvNav on the Download Page in the plugin tab.

Afterwards you should be able to select freenautical and freenautical-local as a charts.

Technical hints
---------------
The plugin registers the chart in [plugin.json](freenauticalcharts/plugin.json). It uses the _maplibreVector_ layer profile and enables using a proxy to avoid CORS problems.

In [plugin.mjs](freenauticalcharts/plugin.mjs) a _featureListFormatter_ is registered that will be called when the user clicks on the map and there are rendered features at this position. The formatter will return the information to be shown (see the [api doc](https://github.com/wellenvogel/avnav/blob/b25fce5eb606142af31e74c0b1b1051625bb8ce1/viewer/util/api.js#L220)).

Build
-----
To build you just need to create a zip
```
zip -r frenauticalcharts.zip freenauticalcharts
```
To maintain some version handling there are scripts for [setting the version](setVersion.sh) and [building](build.sh). You can run them
```
./setVersion.sh && ./build.sh
```
This will update [plugin.json](freenauticalcharts/plugin.json) and create a zip with the version in the name.

Licenses
--------
The code in this directory is licensed by the [MIT License](LICENSE), the fonts by  [SIL Open Font License, Version 1.1](https://openfontlicense.org/open-font-license-official-text/).<br> For the chart data, styles and sprites refer to [freenauticalchart.net](https://freenauticalchart.net/download/).
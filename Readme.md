AvNav freenauticalcharts
========================
[AvNav](https://github.com/wellenvogel/avnav) plugin to access online vector charts from [freenauticalcharts.net](https://freenauticalchart.net/#8/54.264/9.196).

The plugin requires at least AvNav version 20260104 (get AvNav [here](https://www.wellenvogel.net/software/avnav/downloads/daily/?dir=/software/avnav/downloads/daily&lang=en)).

Just upload a zip form the [releases](../../releases) to AvNav on the Download Page in the plugin tab.

Afterwards you should be able to select freenautical as a chart.

Technical hints
---------------
The plugin registers the chart in [plugin.json](freenauticalcharts/plugin.json). It uses the _maplibreVector_ layer profile and enables using a proxy to avoid CORS problems.

In [plugin.mjs](freenauticalcharts/plugin.mjs) a _featureListFormatter_ is registered that will be called when the user clicks on the map and there are rendered features at this position. The formatter will return the information to be shown (see the [api doc](https://github.com/wellenvogel/avnav/blob/b25fce5eb606142af31e74c0b1b1051625bb8ce1/viewer/util/api.js#L220)).

#! /bin/sh
cd `dirname $0`|| exit 1
base="freenauticalcharts"
version=`jq -r '.version' < "$base/plugin.json"`
name="$base-$version.zip"
echo "creating $name"
zip "$name" -r "$base"


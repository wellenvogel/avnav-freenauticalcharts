#! /bin/bash
config="`dirname $0`/freenauticalcharts/plugin.json"
tmp="`dirname $0`/__plugin.json"
version="$1"
if [ "$version" = "" ] ; then
  version=`date '+%Y%m%d'`
fi
echo building version $version
rm -f "$tmp"
jq ".version=\"$version\"" < "$config" > "$tmp" || exit 1
if [ ! -f "$tmp" ] ; then
  echo "tmp file $tmp not created"
  exit 1
fi
rm -f "$config"
mv "$tmp" "$config"

//test plugin

export default async (api)=>{
   const name=api.getPluginName(); 

   console.log(`${name} plugin loaded`);

   //helper to sort found features by their distance to the click point
   const computeDistance=(allFeatures,point)=>{
    allFeatures.forEach(feature=>{
        let dst=0;
        for (let k of ['lat','lon']){
            const fk='_'+k;
            if (! (fk in feature) || ! (k in point)) return;
            dst+=(feature[fk]-point[k])*(feature[fk]-point[k]);
        }
        feature._distance=dst;
    })
    }
    //sort the features
    const allFeaturesSort=(a,b)=>{
        if (a._gtype != b._gtype){
            if (a._gtype === 'point') return -1;
            if (b._gtype === 'point') return  1;
        }
        if (a._distance == undefined) return 1;
        if (b._distance == undefined) return -1;
        if (a._distance > b._distance) return 1;
        if (a._distance < b._distance) return -1;
        const al=(a.layer||'').toLowerCase() === 'lights';
        const bl=(b.layer||'').toLowerCase() === 'lights';
        if (al===bl) return 0;
        if (al) return -1;
        return 1;
    }

    //collect the most important features
const FVWHITELIST=['color'];
const collectFeatures=(allFeatures,startIndex)=>{
    const rt={
        _index:startIndex,
    };
    if (startIndex < 0 || startIndex>= allFeatures.length) return rt;
    const dst=allFeatures[startIndex]._distance;
    if (dst == undefined) return rt;
    while (dst === allFeatures[startIndex]._distance){
        const feature=allFeatures[startIndex];
        if (! feature) continue;
        if (feature._lat != undefined && feature._lon != undefined){
            rt._lon=feature._lon;
            rt._lat=feature._lat;
        }
        let layer=feature.layer;
        if (! layer) layer="<none>";
        const data={};
        for (let vk in feature){
            if (vk.startsWith('_')) continue;
            if (vk === vk.toUpperCase() || FVWHITELIST.indexOf(vk) >= 0){
                data[vk]=feature[vk];
            }
        }
        rt[layer]={...rt[layer],...data};
        startIndex++;
    }
    rt._index=startIndex;
    return rt;
}

//build a simple HTML info for a feature
const buildHtmlInfo=(allFeatures)=>{
    let rt='<div class="freenauticalFeatureList">\n';
    allFeatures.forEach(feature=>{
        if (! feature)return;
            rt+='<div class="featureInfoHtml">\n';
            for (let k in feature){
                if (k.startsWith('_')) continue;
                rt+=`<div class="featureAttr">${api.escapeHtml(k)}:${api.escapeHtml(feature[k])}</div>\n`;
            }
            rt+='</div>\n';
    })
    rt+='</div>\n';
    return rt;
}
//format a list of features that have been found
//and return one summary info with light/buoy and and HTML list of all features
    const featureListFormatter=(features,point)=>{
        computeDistance(features, point);
        features.sort(allFeaturesSort);

    const overview = collectFeatures(features, 0);
    if (overview._index > 0) {
        const userInfo={};
        for (let k in overview){
            if (k.toLowerCase().startsWith("boy")){
                if (userInfo.buoy) continue;
                const n=overview[k].OBJNAM||'';
                const c=overview[k].color||'';
                if (n || c){
                    userInfo.buoy=`${n} ${c}`
                }
            }
            else if (k.toLowerCase()==='lights'){
                if (userInfo.light) continue;
                const c=overview[k].color||'';
                const g=overview[k].SIGGRP||'';
                if (c || g){
                    userInfo.light=`${c} ${g}`
                }
            }
        }
        userInfo.htmlInfo=buildHtmlInfo(features);
        if (overview._lat != undefined && overview._lon != undefined){
            userInfo.position={lat:overview._lat,lon:overview._lon};
        }
        return userInfo;
        }
    }

    /* functions to allow the user to adapt map settings
       this includes a widget, a dialog and a user map layer config
       this uses MapLibre's globalState
       It will onyl work if the style recognizes those settings,of course.
       If you have multiple styles with different handled options
       you could add this information to the layer options in the chart definitions
       */
    let storeMap=(map)=>{}
    let unsetMap=()=>{};
    if (api.getAvNavVersion() >= 20260115){
        const keybase=api.getStoreBaseKey();
        const KEY=".map";
        const mapkey=keybase+KEY;
        //save the map to the internal store to make it accessible
        //by widgets and to trigger widget re-render
        storeMap=(map)=>{
            console.log(`${name} set map`);
            api.setStoreData(mapkey,map);
            const current=readCurrentFromStorage();
            setMapStateValues(current);
        }
        //remove the map from the internal store
        //!!important to call to avoid the map remaining active when not being used
        unsetMap=()=>{
            console.log(`${name} unset map`);
            api.setStoreData(mapkey,undefined);
        }
        //set a global state at the map if it is available
        const setMapStateValue=(name,value)=>{
            const map=api.getStoreData(mapkey);
            if (! map) return;
            map.setGlobalStateProperty(name,value);
        }
        //set multiple global state values
        const setMapStateValues=(current)=>{
            for (let n in current){
                setMapStateValue(n,current[n]);
            }
        }
        //get a current global state value
        const getMapStateValue=(name,defaultv)=>{
            const map=api.getStoreData(mapkey);
            if (! map) return defaultv;
            return (map.getGlobalState()||{})[name]||defaultv;
        }
        const STORAGE_KEY="mapsettings";
        //read the current settings values from the browsers local storage
        const readCurrentFromStorage=()=>{
            return api.getLocalStorage(STORAGE_KEY,{});
        }
        //store the settings values to the browser local storage
        const saveCurrentToStorage=(current)=>{
            api.setLocalStorage(STORAGE_KEY,current);
        }
        //parameters that the user can modify
        //this must correlate to the parameters defined in the style (global state)
        const parameters=[
                    {name:'fontSize',default:12,type:'NUMBER',list:[6,30],description:'set the base font size for the map'}
                ];

        //show a parameter dialog to allow the user to change values
        const showDialog=(ev)=>{
            const currentValues={};
            for (let p of parameters){
                currentValues[p.name]=getMapStateValue(p.name,p.default);
            }
            const dialogParam={
                title:"Map Settings",
                parameters: parameters,
                values:currentValues,
                buttons:[
                    {name:'cancel'},
                    {name:'ok',onClick:(ev,nv)=>{
                        //save the current values to the local storage
                        //and activate them at the map
                        saveCurrentToStorage(nv);
                        setMapStateValues(nv);
                        for (let k in nv){
                            console.log(`${name} update map set ${k}=${nv[k]}`);
                        }
                    }}
                ]
            }
            api.showDialog(dialogParam,ev);
        }
        //a widget that can be added to the nav page to allow to show the map settings
        const ControlWidget={
            name: 'FNMapControlWidget',
            initFunction: (context,props)=>{
                context.eventHandler.wclick=(ev)=>showDialog(ev);
            },
            renderHtml:(props,ctx)=> {
                if (! props.map) return;
                return `<div class="fnwidget" onclick="wclick"></div>`
            },
            caption: 'Settings',
            storeKeys: {
                map:mapkey
            }

        }
        const ControlWidgetParam={
            formatter:false,
            formatterParameters: false,
            unit: false,
        }
        api.registerWidget(ControlWidget,ControlWidgetParam);
    }
    //register a map layer with the name plugin_freenautical
    //options are the parameters of the layer definition
    //when you regsiter the charts
    api.registerUserMapLayer('maplibreVector','freenautical',async (options)=>{
        return {
            featureListFormatter: (featureList,point,context)=>featureListFormatter(featureList,point),
            loadCallback:(map,context)=>{
                console.log("map libre loaded",map);
                storeMap(map);
            },
            finalizeFunction:(context)=>unsetMap()
        }
   })
    
};
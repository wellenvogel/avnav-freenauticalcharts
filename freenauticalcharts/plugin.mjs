//test plugin

export default async (api)=>{
   const name=api.getPluginName(); 

   console.log(`${name} plugin loaded`);
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
    let storeMap=(map)=>{}
    let unsetMap=()=>{};
    if (api.getAvNavVersion() >= 20260115){
        const keybase=api.getStoreBaseKey();
        const KEY=".map";
        const mapkey=keybase+KEY;
        storeMap=(map)=>{
            console.log(`${name} set map`);
            api.setStoreData(mapkey,map);
        }
        unsetMap=()=>{
            console.log(`${name} unset map`);
            api.setStoreData(mapkey,map);
        }
        const setMapStateValue=(name,value)=>{
            const map=api.getStoreData(mapkey);
            if (! map) return;
            map.setGlobalStateProperty(name,value);
        }
        const getMapStateValue=(name,defaultv)=>{
            const map=api.getStoreData(mapkey);
            if (! map) return defaultv;
            return (map.getGlobalState()||{})[name]||defaultv;
        }
        const showDialog=(ev)=>{
            const dialogParam={
                title:"Map Settings",
                parameters: [
                    {name:'fontSize',default:12,type:'NUMBER',list:[6,30],description:'set the base font size for the map'}
                ],
                values:{
                    'fontSize':getMapStateValue('fontSize',12)
                },
                buttons:[
                    {name:'cancel'},
                    {name:'ok',onClick:(ev,nv)=>{
                        for (let k in nv){
                            console.log(`${name} update map set ${k}=${nv[k]}`);
                            setMapStateValue(k,nv[k]);
                        }
                    }}
                ]
            }
            api.showDialog(dialogParam,ev);
        }
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
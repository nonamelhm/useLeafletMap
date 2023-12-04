# LeafletTools

## 一、开发参考

1）leaflet官网：https://leafletjs.cn/

2）使用地图平台：天地图、谷歌

## 二、示例

- demo示例：https://nonamelhm.github.io/leafletTools/ 
- 下载代码运行示例：https://github.com/nonamelhm/leafletTools.git 

```javascript
yarn 或  npm i
yarn serve 或  npm run serve
```

## 三、要求

- leaflet version: 1.7.0 (高版本的调整可能会出现不适用情况导致bug)（PS:当然,npm i leaflettools即可一键下载leaflet,不用再次安装)
- 参考leaflet官网得到更多配置知识，这里的配置不一一列举

## 四、使用

### npm方式

```javascript
npm i leaflettools;
import { HlLeaflet as hl } from '@/plugins/hlLeaflet.js';
```

### script标签方式

- 通过CDN方式

```javascript
  <script src="https://cdn.jsdelivr.net/npm/leaflettools@1.0.7/lib/HL.umd.js"></script>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/leaflettools@1.0.7/lib/HL.css">
```

- 下载文件（github下载lib文件）

```javascript
 <script src="./HL.umd.js"></script>
 <link rel="stylesheet" href="./HL.css">
```

## 五、API及其功能参考

### 1、地图初始化

实现（属性）

```javascript
_initMap(mapId, options)
```

- mapId: 设置地图id

- Options: 地图配置options ,示例如下

```javascript
 initMapOptions: { //初始化默认配置
    lat: 23.1538555,
    lng: 113.030911,
    zoom: 4,
    maxZoom: 18,
    minZoom: 3,
    preferCanvas: true,
    attributionControl: false,
    zoomControl: false,
    fullscreenControl: false
  }
```

调用示例示例：
```javascript
  import hl from '@/plugins/hlLeaflet.js'
  let map = hl._initMap("map", { lat: 24, lon: 110, zoom: 8 });

//监听经纬度示例
map.on('mousemove',e=>{
  console.log(e.latlng)
})
```

### 2、普通绘点/聚合点

例如：根据经纬度绘制船只 

实现（属性）：

```javascript
_renderPoint (map, data, layersName = 'defaultPointLayers', options = {}, clusterFlag = false)
```

- map: 绘制map
- data: 根据经纬度直接绘制点(必选）ps:属性showMsg为点击点显示内容
- layersName: 绘制图层名称，为了清除图层
- options: 绘制项options(默认配置如下)

```javascript
{
    iconUrl: require("@/assets/images/leaflet_icon/marker-icon.png"),
    iconSize: [25, 41],
    spiderfyOnMaxZoom: false,
    showCoverageOnHover: false,
    zoomToBoundsOnClick: true,
    disableClusteringAtZoom: 16,
    maxClusterRadius: 60,
    iconCreateFunction: function (cluster) {
      var tempcount = cluster.getChildCount()
      var tempclass = tempcount > 500 ? 'red' : tempcount > 200 ? 'blue2' : tempcount > 100 ? 'blue' : tempcount > 50 ? 'green2' : 'green'
      return L.divIcon({ html: '<b class="' + tempclass + '">' + cluster.getChildCount() + '</b>' });
    }
}
```

- clusterFlag: 是否为聚合点（可选,默认false)

  

调用示例：

```javascript
let data = [{ lat: 24, lng: 110, showMsg: `点击点显示内容1test` }, { lat: 22, lng: 110, showMsg: `点击点显示内容2test` }];

hl._renderPoint(map, data, 'layers1', require("./marker-icon-2x.png"), true);//聚合点
hl._renderPoint(map, [{ lat: 25, lng: 110, showMsg: `显示内容2-25-110` }], 'layers2');
```

### 3、数据绘制线

实现（属性）：

```javascript
 _drawLineByData (map, data, layersName = 'defaultLineLayers', options = { color: '#fc4a14', weight: 2, showDistance: false })
```

- map:绘制map
- data:根据经纬度直接绘制点(必选）ps:属性showMsg为点击点显示内容
- layersName:绘制图层名称(用来清除图层）（可选，默认图层名称：defaultLineLayers)
-  options: 绘制项options,默认如下：

```javascript
{
    weight: 1,
    color: '#3388FF',
    showDistance: false, // 是否显示里程
    distanceMarkers: {
      unit: 'km',
      showAll: 14,
      isReverse: false,
      offset: 10000,
      cssClass: 'hl-line',
      iconSize: [20, 20]
    },
    opacity: 1
}
```

调用示例：

```javascript
let list = [{ lat: 24, lng: 110 }, { lat: 32, lng: 112 }, { lat: 21, lng: 113 }]

hl._drawLineByData(map, list, 'polyline', { color: 'blue', weight: 1, showDistance: true })
```

### 4、数据绘制矩形/圆形/多边形

实现（属性）：

```javascript
_drawByData (map, data, layersName = 'defaultLayers', type, options)
```

- map:绘制map
- data:根据经纬度直接绘制点(必选）ps:属性showMsg为点击点显示内容（PS:在每个矩形的第一个数据加showMsg属性 为矩形的介绍)
- layersName:绘制图层名称(用来清除图层）（可选，默认图层名称：defaultLineLayers)
- type:绘制类型  默认‘polygon'  可选circle rectangle polygon 圆形矩形多边形
-  options: 绘制项options,默认如下：

```javascript
{
    color: '#fc4a14',
    weight: 2
  }
```

调用示例：

```javascript
 //绘制多个 矩形  在每个矩形的第一个数据加showMsg属性 为矩形的介绍
let list = [[{ lat: 24, lng: 110, showMsg: 'hello-rectangle' }, { lat: 24, lng: 121 }, { lat: 30, lng: 121, id: 3 }, { lat: 30, lng: 110, id: 4 }], [{ lat: 14, lng: 90, id: 5, showMsg: 'hi-rectangle' }, { lat: 14, lng: 100, id: 6 }, { lat: 20, lng: 90, id: 7 }, { lat: 20, lng: 100, id: 8 }]];

hl._drawByData(map, list, `rectangle`, 'rectangle', { color: 'blue', weight: 1 })

//绘制 单个矩形  在每个矩形的第一个数据加showMsg属性 为矩形的介绍
let list2 = [{ lat: 26, lng: 130, showMsg: 'hello222-rectangle' }, { lat: 26, lng: 121 }, { lat: 30, lng: 130 }, { lat: 30, lng: 121 }];

hl._drawByData(map, list2, `rectangle`, 'rectangle', { color: 'red', weight: 1 });
```

### 5、数据绘制风圈 

实现（属性）：

```javascript
 _drawWindCircle (map, data, options)
```

- Map:绘制map


- Data:根据经纬度数据直接绘制线(必选，默认地图数据数组为[]）
-  Options:绘制项目options 默认如下

```javascript
{
    fillColor: '#FF9C00',
    fillOpacity: 0.3,
    color: 'transparent',
    startAngle: 0,  //0是Y轴 顺时针转算度数
    stopAngle: 360
}
```

调用示例：

```javascript
 let list = [{ lat: 25, lng: 110, seRadius: 200, neRadius: 250, swRadius: 180, nwRadius: 170 }, { lat: 15, lng: 100, seRadius: 100, neRadius: 220, swRadius: 130, nwRadius: 140 }]//多个风圈
 
 hl._drawWindCircle(map, list);
```

### 6、清除风圈

实现（属性）：

```javascript
_clearWindCircle (map);
```

- Map:绘制map

调用示例：

```javascript
 hl._clearWindCircle(map);
```

### 7、直接绘制图标

实现（属性）：

```javascript
_editMarkerGetData (map, iconUrl = require("@/assets/images/leaflet_icon/position-icon.png"), iconSize = [20, 20], layersName = 'editingMarker');
```

- map:绘制map
- iconUrl:图标url   默认
- iconSize:图标大小
- layersName:图层名称   

调用示例：

```javascript
            //start 初始化监听得到绘制时候经纬度
            this.map.on('pm:drawstart', e => {
              console.log('绘制开始')
              console.log(e);
            });
            this.map.on('pm:drawend', e => {
              console.log('绘制结束')
              console.log(e);
            });
            this.map.on('pm:create', e => {
              console.log('创建完成');
              console.log(e);
            });
            //end 得到绘制时候经纬度

            hl._editMarkerGetData(map);
```

### 8、直接绘制图形

实现（属性）：

```javascript
_editMapGetData (map, type = 0, color = 'rgba(51, 136, 255, 1)', layersName = 'editingLayers')
```

- map:绘制map
- Type:默认   0:多边形  :1 圆形  2:矩形
- iconSize:图标宽度 
- layersName:图层名称   

调用示例：

```javascript
          //start 初始化监听得到绘制时候经纬度
            this.map.on('pm:drawstart', ({ workingLayer }) => {
              console.log('绘制开始')
              console.log(workingLayer);
              // 记录绘制的点得到数据 多边形
              workingLayer.on('pm:vertexadded', (e) => {
                console.log(e)
              });
            })
            this.map.on('pm:drawend', e => {
              console.log('绘制结束')
              console.log(e);
            });
            this.map.on('pm:create', e => {
              console.log('创建完成');
              console.log(e);
            });
            //end 得到绘制时候经纬度

            hl._editMapGetData(this.map,0); //开始绘制多边形
            hl._clearAllEdit(this.map);//取消绘制
```

### 9、测距

实现（属性）：

```javascript
_measure (map);//开始测量
_clearMeasure(map)//清除测量
_changeMeasureUnit(map)//改变测量单位
_getMeasureUnit(map)//得到测量单位
```

- map:绘制map

调用示例：

```javascript
hl._measure(this.map);//开始测量
hl._clearMeasure(map)//清除测量
hl._changeMeasureUnit(map)//改变测量单位
let unit = hl._getMeasureUnit(map)//得到测量单位
```

### 10、测面积

实现（属性）：

```javascript
_mearsureArea(map);//开始测量面积
```

- map:绘制map

调用示例：

```javascript
hl._mearsureArea(map);//开始测量面积

//监听绘制结束
 map.on('measurefinish', function (evt) { //监听绘画结束调用函数
  //绘制结束逻辑  
 })
```

### 11、全屏

实现（属性）：

```javascript
_fullScreen(map);
```

- map:绘制map

调用示例：

```javascript
hl._fullScreen(this.map);
```

### 12、切换图层

实现（属性）：

```javascript
_changeLayers (map, idx) 
```

- map:绘制map
- Idx:图层序号  (ps:1:天地图卫星  2:天地图地形  3:天地图街道 4:谷歌卫星 5:谷歌地形 6:谷歌街道)

调用示例：

```javascript
hl._changeLayers (map, 1);//切换天地图卫星图
hl._changeLayers (map, 2);//切换天地图地形图
hl._changeLayers (map, 3);//切换天地图街道图
hl._changeLayers (map, 4);//切换谷歌卫星图
hl._changeLayers (map, 5);//切换谷歌地形图
hl._changeLayers (map, 6);//切换谷歌街道图
```

### 13、热力图

实现（属性）：

```javascript
_drawHeatMap (map, data, layersName = 'hotLayers', options = { radius: 10, minOpacity: 0.85 })
```

- map:绘制map
- Data:数据
- layersName:图层名称
- Options:默认配置{radius半径  minOpacity透明度}

调用示例：

```javascript
 let data = [{
          lat: 35.460756,
          lng: 119.59847,
          count: 1
        }, {
          lat: 35.560756,
          lng: 119.69847,
          count: 19
        }]
 
hl._drawHeatMap(this.map, data, 'hotLayers');
```

### 14、轨迹回放

实现（属性）：

```javascript
 _trackPlay (map, data, options, manyLineColor = ['red', 'bule', 'yellow', 'orange', 'pink'])//轨迹回放
```

- map:绘制map

- Data:数据

- Options:配置 默认如下

  ```javascript
  {
      weight: 1,
      useImg: true,
      color: '#03ff09',
      imgUrl: require("@/assets/images/leaflet_icon/trackplay-icon.png"),
      width: 40,
      height: 40,
      unit: `km/h`,
      isDir: 1,// 通用图标才有方向变化
      wakeTimeDiff: 100,
      isDrawLine: false,//轨迹运动时候是否画线
      showDistance: false,
      distanceMarkers: {
        unit: 'km',
        showAll: 14,
        isReverse: false,
        offset: 10000,
        cssClass: 'hl-line',
        iconSize: [20, 20]
      },
      opacity: 1
  }
  ```
  
- manyLineColor:多轨迹时候轨迹依次绘制颜色

调用示例：

```javascript
  let testData = [
            [
              { "lng": 133.78486666666666, "lat": 34.34605, "time": 1676458023, "speed": 122, "dir": 61.8, "heading": 62, "point": 1, "info": [], gDeviceStatus: 3 },
              { "lng": 134.98611666666667, "lat": 33.88173333333334, "speed": 124, "point": 3, "time": 1676459023, "dir": 142.7, "heading": 139, "info": [], gDeviceStatus: 4 }
            ],
            [
              { "lng": 130.78486666666666, "lat": 31.34605, "time": 1676458023, "speed": 132, "dir": 61.8, "heading": 62, "point": 1, "info": [], gDeviceStatus: 3 },
              { "lng": 136.98611666666667, "lat": 32.88173333333334, "speed": 134, "point": 3, "time": 1676459023, "dir": 142.7, "heading": 139, "info": [], gDeviceStatus: 4 }
            ]
          ]
          this.trackplay = hl._trackPlay(this.map, testData, { isDrawLine: false });
          hl._startTrack(this.trackplay);//开始轨迹回放

```

相关属性和调用参考如下：

```javascript
this.trackplay = hl._trackPlay(this.map, testData, { isDrawLine: false });

hl._startTrack(this.trackplay);//开始绘制
hl._quitTrack(this.trackplay);//停止播放
hl._clearTrackBack(this.map, this.trackplay);//清除轨迹回放图层
hl._setTrackSpeed(this.trackplay, speed);  //设置回放速度
hl._restartTrack(this.trackplay);//重新播放
hl._showTrackLine(this.trackplay);//运动时轨迹划线
hl._hideTrackLine(this.trackplay);//取消运动时轨迹划线
let time = hl._getCurrentTime(this.trackplay);//得到当前回放时间点
let speed = hl._getCurrentSpeed(this.trackplay);//得到当前回放点速度
```

### 15、适当放大预览

实现（属性）：

```javascript
_fitBounds(map, areaData, options = { padding: [10, 10], maxZoom: 17 })
```

- map:绘制map
- areaData:数据
- Options:默认配置 { padding: [10, 10], maxZoom: 17 }

调用示例：

```javascript
 let data = [{
          lat: 35.460756,
          lng: 119.59847,
          count: 1
        }, {
          lat: 35.560756,
          lng: 119.69847,
          count: 19
        }];//lat lng必须属性
 
hl._fitBounds(this.map, data);
```

### 16、清除图层

实现（属性）：

```javascript
_clearLayer (map, layersName) 
```

- map:绘制map
- layersName:图层名称

调用示例：

```javascript
hl._clearLayer(this.map, 'hotLayers');//删除地图上图层名称为hotLayers的图层
```

### 17、地图绘字

实现（属性）：

```javascript
 _drawTips(map, latlng, layersName = 'defaultTipsLayers', options) 
```

- map:绘制map

- latlng：经纬度

- layersName:图层名称

- options:配置  默认

  ```javascript
  {
      className: 'hl-tips',
      html: '默认',
      iconSize: 30,
      color: 'red'
  }
  ```

调用示例：

```javascript
  hl._drawTips(this.map, { lat: 24, lng: 110 }, 'tips', { html: '24小时警戒线' });
```

### 18、将点设置为中心

实现（属性）：

```javascript
 _fitPoint(map, pointData, zoom = 16)
```

- map:绘制map
- pointData：经纬度{lat:24,lng:110}
- Zoom:放大倍数

调用示例：

```javascript
  hl._fitPoint(this.map, { lat: 24, lng: 110 }, 18);
```

### 19、地图放大

调用示例：

```javascript
hl._zoomAdd(this.map);
```

### 20、地图缩小

调用示例：
```javascript
hl._zoomSub(this.map);
```
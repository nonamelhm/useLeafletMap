<script lang="ts" setup>
import myIconUrl from '../src/assets/vue.svg';
import {nextTick, onMounted, ref, watch} from 'vue';
import {useLeafletMap} from './utils/useLeafletMap.ts'; // 请根据你的文件路径正确导入
const {
  trackplayback,
  _initMap,
  _changeLayer,
  _fullScreen,
  _renderPoint,
  _clearLayer,
  _clearAllEdit,
  _setZoomSmaller,
  _setZoomBigger,
  _drawByData,
  _drawWindCircle,
  _mearsureDistance,
  _clearMeasure,
  _getMeasureUnit,
  _changeMeasureUnit,
  _mearsureArea,
  _drawHeatMap,
  _editPatternGetData,
  _trackPlay,
  _startTrack
} = useLeafletMap();
const map = ref<any>(null);
// 在组件加载后初始化地图
onMounted(() => {
  nextTick(() => {
    map.value = _initMap('mapContainer');
    console.log('地图初始化完成', map.value);
  })
})
const drawPoint = () => {
  let list = [{lat: 24, lng: 110, id: 1,dir:50, showMsg: `hello1`}, {
    lat: 22,
    lng: 110,
    id: 3,
    dir:135,
    showMsg: `hello2`
  }];
  _renderPoint(map.value, list, 'layers1', {iconUrl: myIconUrl}, true);
  // _renderPoint(map.value, [{lat: 25, lng: 110, id: 2, showMsg: `图层2<br/>点1`}], 'layers2');
}
// 测量单位
const mearsureDistanceUnit = ref<string>('千米');

const clearLayer = (name: string) => {
  _clearLayer(map.value, name);
}
const drawShapes = () => {
  _drawByData(map.value, [
    {
      type: 'circle',
      lat: 23.505,
      lng: 113.57,
      radius: 1000,
      info: 'Circle 1',
    },
    {
      type: 'circle',
      lat: 24.505,
      lng: 112.57,
      radius: 2000,
      info: 'Circle 2',
    },
    {
      type: 'line',
      coordinates: [
        {lat: 23, lng: 115.6},
        {lat: 21.7, lng: 112.7},
      ],
      info: 'Rectangle 1',
    },
    {
      type: 'rectangle',
      coordinates: [
        {lat: 23.6, lng: 113.6},
        {lat: 23.7, lng: 113.7},
      ],
      info: 'Rectangle 1',
    },
    {
      type: 'polygon',
      coordinates: [
        {lat: 23.8, lng: 113.8},
        {lat: 23.9, lng: 113.9},
        {lat: 24.0, lng: 114.0},
      ],
      info: 'Polygon 1',
    }
  ], 'layers3', {color: 'green', weight: 1});
}
const changeMeasureUnit = () => {
  _changeMeasureUnit(map.value);
  mearsureDistanceUnit.value = _getMeasureUnit(map.value);
}

const drawWindCircle = () => {
  let list = [
    {lat: 25, lng: 110, seRadius: 200, neRadius: 250, swRadius: 180, nwRadius: 170},
    {lat: 15, lng: 100, seRadius: 100, neRadius: 220, swRadius: 130, nwRadius: 140}]
  _drawWindCircle(map.value, list, 'windCircle');
}
const clearWindCircle = () => {
  _clearLayer(map.value, 'windCircle');
}
const drawHeatMap = () => {
  let data = [{
    lat: 35.460756,
    lng: 119.59847,
    count: 1
  }, {
    lat: 35.560756,
    lng: 119.69847,
    count: 19
  }, {
    lat: 34.460756,
    lng: 109.59847,
    count: 19
  }, {
    lat: 31.560756,
    lng: 112.69847,
    count: 100
  }]
  _drawHeatMap(map.value, data, 'hot');
}
const clearHotMap = () => {
  _clearLayer(map.value, 'hot')
}
const editPattern = (type: string) => {
  _editPatternGetData(map.value, type);
}
let track = ref<any>(null);
const tracePlay = () => {
  const data = [[{lat: 23, lng: 133, time: 1676458023, dir: 320, info: []}], [{
    lat: 33,
    lng: 112,
    time: 1676459023,
    dir: 320,
    info: []
  }]]
  track.value = _trackPlay(map.value, data)
}
watch(() => track.value, () => {
  console.log('bianhua');
  console.log(track.value);
  _startTrack(track.value);
})


</script>
<template>
  <div id="app">
    <!-- 在模板中创建一个容器用于地图 -->
    <div id="mapContainer" style="height: 500px;width:500px;"></div>

    <!-- 添加按钮来切换地图图层 -->
    <button @click="_changeLayer(map,'空白')">切换到空白地图</button>
    <button @click="_changeLayer(map,'天地图街道')">切换到天地图街道</button>
    <button @click="_changeLayer(map,'天地图卫星')">切换到天地图卫星</button>
    <button @click="_changeLayer(map,'天地图地形')">切换到天地图地形</button>
    <button @click="_changeLayer(map,'谷歌卫星')">切换谷歌卫星</button>
    <button @click="_changeLayer(map,'谷歌街道')">切换谷歌街道</button>
    <button @click="_changeLayer(map,'谷歌地形')">切换谷歌地形</button>
    <button @click="_fullScreen(map)">全屏</button>
    <button @click="drawPoint">测试绘制点或聚合点</button>
    <button @click="clearLayer(map,'layers1')">清除图层1</button>
    <button @click="_setZoomSmaller(map)">缩小</button>
    <button @click="_setZoomBigger(map)">放大</button>
    <button @click="drawShapes">绘制图形</button>
    <button @click="_clearLayer(map,'layers3')">清除图形</button>
    <button @click="_mearsureDistance(map)">测距</button>
    <button @click="_clearMeasure(map)">清除测距</button>
    <button @click="changeMeasureUnit()">改变测量单位</button>
    <span>{{ mearsureDistanceUnit }}</span>
    <button @click="_mearsureArea(map)">测面积</button>
    <button @click="drawWindCircle">绘制风圈</button>
    <button @click="clearWindCircle">清除风圈</button>
    <button @click="drawHeatMap">绘制热力图</button>
    <button @click="clearHotMap">清除热力图</button>
    <button @click="editPattern('Marker')">直接绘制点</button>
    <button @click="editPattern('Polygon')">直接绘制多边形</button>
    <button @click="editPattern('Circle')">直接绘制圆形</button>
    <button @click="editPattern('Rectangle')">直接绘制矩形</button>
    <button @click="_clearAllEdit">清除正在绘制</button>
    <button @click="_clearLayer(map,'editingLayers')">清除正在绘制图层</button>
    <button @click="tracePlay">轨迹回放</button>
    <button @click="start">开始回放</button>
    <!-- 添加更多按钮来切换其他地图图层 -->
  </div>
</template>



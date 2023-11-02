<template>
  <div id="app">
    <!-- 在模板中创建一个容器用于地图 -->
    <div id="mapContainer" style="height: 500px;width:500px;"></div>

    <!-- 添加按钮来切换地图图层 -->
    <button @click="_changeLayer('空白')">切换到空白地图</button>
    <button @click="_changeLayer('天地图街道')">切换到天地图街道</button>
    <button @click="_changeLayer('天地图卫星')">切换到天地图卫星</button>
    <button @click="_changeLayer('天地图地形')">切换到天地图地形</button>
    <button @click="_changeLayer('谷歌卫星')">切换谷歌卫星</button>
    <button @click="_changeLayer('谷歌街道')">切换谷歌街道</button>
    <button @click="_changeLayer('谷歌地形')">切换谷歌地形</button>
    <button @click="_fullScreen()">全屏</button>
    <button @click="drawPoint">测试绘制点或聚合点</button>
    <button @click="clearLayer('layers1')">清除图层1</button>
    <button @click="_setZoomSmaller">缩小</button>
    <button @click="_setZoomBigger">放大</button>
    <button @click="drawShapes">绘制图形</button>
    <button @click="_clearLayer('layers3')">清除图形</button>

    <!-- 添加更多按钮来切换其他地图图层 -->

  </div>
</template>

<script lang="ts" setup>
import myIconUrl from '../src/assets/vue.svg';
import {nextTick, onMounted} from 'vue';
import {useLeafletMap} from './utils/useLeafletMap.ts'; // 请根据你的文件路径正确导入
const {
  _initializeMap,
  _changeLayer,
  _fullScreen,
  _renderPoints,
  _clearLayer,
  _setZoomSmaller,
  _setZoomBigger,
  _drawByData
} = useLeafletMap();
// 在组件加载后初始化地图
onMounted(() => {
  nextTick(() => {
    _initializeMap('mapContainer');
  })

})
const drawPoint=()=>{
  let list = [{ lat: 24, lng: 110, id: 1, showMsg: `图层1<br/>点1` }, { lat: 22, lng: 110, id: 3, showMsg: `图层1<br/>点2` }];
  _renderPoints(list, 'layers1', {iconUrl: myIconUrl}, true);
  _renderPoints([{lat: 25, lng: 110, id: 2, showMsg: `图层2<br/>点1`}], 'layers2');
}
const clearLayer = (name: string) => {
  _clearLayer(name);
}
const drawShapes = () => {
  _drawByData([
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
      type: 'rectangle',
      coordinates: [
        { lat: 23.6, lng: 113.6 },
        { lat: 23.7, lng: 113.7 },
      ],
      info: 'Rectangle 1',
    },
    {
      type: 'polygon',
      coordinates: [
        { lat: 23.8, lng: 113.8 },
        { lat: 23.9, lng: 113.9 },
        { lat: 24.0, lng: 114.0 },
      ],
      info: 'Polygon 1',
    }
  ], 'layers3',{ color: 'red' });

}

</script>

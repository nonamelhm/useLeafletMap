<template>
  <div id="app">
    <!-- 在模板中创建一个容器用于地图 -->
    <div id="mapContainer" style="height: 500px;width:500px;"></div>

    <!-- 添加按钮来切换地图图层 -->
    <button @click="_changeLayer('空白')">切换到空白地图</button>
    <button @click="_changeLayer('天地图街道')">切换到天地图街道</button>
    <button @click="_changeLayer('天地图卫星')">切换到天地图卫星</button>
    <button @click="_fullScreen()">全屏</button>
    <button @click="_makeIcon([23,113])">marker标记</button>
    <!-- 添加更多按钮来切换其他地图图层 -->

  </div>
</template>

<script lang="ts" setup>
import {nextTick, onMounted} from 'vue';
import {useLeafletMap} from './utils/useLeafletMap.ts'; // 请根据你的文件路径正确导入
const {_initializeMap, _changeLayer, _fullScreen, _makeIcon} = useLeafletMap();
// 在组件加载后初始化地图
onMounted(() => {
  nextTick(() => {
    _initializeMap('mapContainer');
  })

})

</script>

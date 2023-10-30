/**
 * leaflet绘制地图工具类
 * 官网：https://leafletjs.cn/reference.html
 */
import {ref} from 'vue';
import 'leaflet/dist/leaflet.css';
import L, {Map} from 'leaflet';
// 全屏插件 https://github.com/Leaflet/Leaflet.fullscreen
import '../../src/assets/FullScreen/Leaflet.fullscreen.min.js'
import '../../src/assets/FullScreen/leaflet.fullscreen.css';
// 默认图标
import myIconUrl from '../assets/vue.svg';

export function useLeafletMap() {
  const map = ref<Map | null>(null); // 地图实例
  const baseLayers = ref<any>({}); // 存储图层数据
  const selectedLayer = ref<string>('天地图街道'); // 选中的图层

  // 地图初始化基本配置
  const initMapOptions = {
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
  // 绘制图标默认配置
  const iconOptions = {
    iconUrl: myIconUrl,
    iconSize: [20, 20],
    iconAnchor: [10, 2],
  }

  // 初始化地图
  function _initializeMap(mapId: string, mapOptions: any) {
    const allOptions = Object.assign({}, initMapOptions, mapOptions);
    const {
      lat,
      lng,
      zoom,
      maxZoom,
      minZoom,
      preferCanvas,
      attributionControl,
      zoomControl,
      fullscreenControl
    } = allOptions;


    // 随机生成 nodeRandom
    const nodeRandom = Math.floor(Math.random() * 5) + 3 === 4 ? 6 : Math.floor(Math.random() * 5) + 3;

    // 定义地图基本图层
    baseLayers.value = {
      '空白': L.tileLayer('https://beidouim.oss-cn-hangzhou.aliyuncs.com/map/img/map_whiteBackGround.jpg', {}),
      '天地图街道': L.layerGroup([
        L.tileLayer(`http://t${nodeRandom}.tianditu.gov.cn/DataServer?T=vec_w&x={x}&y={y}&l={z}&tk=5bb740ffd3a80fb3963e022454eca6e2`),
        L.tileLayer(`http://t${nodeRandom}.tianditu.gov.cn/DataServer?T=cva_w&x={x}&y={y}&l={z}&tk=5bb740ffd3a80fb3963e022454eca6e2`),
      ]),
      '天地图卫星': L.layerGroup([
        L.tileLayer(`http://t${nodeRandom}.tianditu.gov.cn/DataServer?T=img_w&x={x}&y={y}&l={z}&tk=5bb740ffd3a80fb3963e022454eca6e2`),
        L.tileLayer(`http://t${nodeRandom}.tianditu.gov.cn/DataServer?T=cia_w&x={x}&y={y}&l={z}&tk=5bb740ffd3a80fb3963e022454eca6e2`),
      ]),
      '天地图地形': L.layerGroup([
        L.tileLayer(`http://t${nodeRandom}.tianditu.gov.cn/DataServer?T=ter_w&x={x}&y={y}&l={z}&tk=5bb740ffd3a80fb3963e022454eca6e2`),
        L.tileLayer(`http://t${nodeRandom}.tianditu.gov.cn/DataServer?T=cta_w&x={x}&y={y}&l={z}&tk=5bb740ffd3a80fb3963e022454eca6e2`),
      ]),
      '谷歌街道': L.tileLayer('http://mt0.google.com/vt/lyrs=m&hl=zh-CN&gl=CN&x={x}&y={y}&z={z}&s=Galil&scale=2'),
      '谷歌卫星': L.tileLayer('http://mt0.google.com/vt/lyrs=y&hl=zh-CN&gl=CN&x={x}&y={y}&z={z}&s=Galil&scale=2'),
      '谷歌地形': L.tileLayer('http://mt0.google.com/vt/lyrs=p&hl=zh-CN&gl=CN&x={x}&y={y}&z={z}&s=Galil&scale=2'),
    };
    const initialMap = L.map(mapId, {
      center: [lat, lng],
      zoom: zoom,
      maxZoom: maxZoom,
      minZoom: minZoom,
      preferCanvas: preferCanvas,
      attributionControl: attributionControl,
      zoomControl: zoomControl,
      fullscreenControl: fullscreenControl,
    });
    baseLayers.value[selectedLayer.value].addTo(initialMap);
    map.value = initialMap;
  }

  // 切换图层
  function _changeLayer(layerName: string) {
    if (!map.value || !baseLayers.value[layerName]) {
      return;
    }
    // 从地图中移除当前选中的图层
    map.value.removeLayer(baseLayers.value[selectedLayer.value]);
    // 切换选中的图层
    selectedLayer.value = layerName;
    // 将新选中的图层添加到地图
    baseLayers.value[selectedLayer.value].addTo(map.value);
  }

  // 全屏
  function _fullScreen() {
    //全屏切换
    map.value.toggleFullscreen();
  }

  // 绘制点
  function _makeIcon(latlng: number[] = [23.505, 113.57], showWord: string = '<p>终端1<br />hello</p>', isOpen: boolean = false, options: any) {
    const allOptions = Object.assign({}, iconOptions, options);
    const myIcon = L.icon(allOptions);
    const marker = L.marker(latlng, {icon: myIcon}).addTo(map.value);
    // 默认关闭显示话语 自行点击展开
    if (!isOpen) {
      marker.bindPopup(showWord).closePopup();
    } else {
      marker.bindPopup(showWord).openPopup();
    }
  }

  //地图以某个点居中
  function _setView(latlng: number[] = [23.505, 113.57]) {
    map.value.setView(latlng);
  }


  // 返回可导出的方法和数据
  return {
    map,
    _initializeMap,
    baseLayers,
    selectedLayer,
    _changeLayer,
    _fullScreen,
    _makeIcon,
    _setView
  };
}

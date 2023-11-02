/**
 * leaflet绘制地图工具类
 * 官网：https://leafletjs.cn/reference.html
 */
import {ref} from 'vue';
import 'leaflet/dist/leaflet.css';
import L, {Map} from 'leaflet';
// 全屏插件 https://github.com/Leaflet/Leaflet.fullscreen
import 'leaflet.fullscreen';
import 'leaflet.fullscreen/Control.FullScreen.css';
// 聚合点 官网插件搜索关键词 leaflet.markercluster https://github.com/Leaflet/Leaflet.markercluster
import "leaflet.markercluster";
import "leaflet.markercluster/dist/MarkerCluster.css";
// 默认图标
import myIconUrl from '../assets/vue.svg';

export function useLeafletMap() {
  const map = ref<Map | null>(null); // 地图实例
  const mouseLatLng = ref<{ lat: number, lng: number }>({lat: 22, lng: 110});
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
    attributionControl: true,
    zoomControl: false,
    fullscreenControl: false
  }
  // 绘制图标默认配置
  const iconOptions = {
    iconUrl: myIconUrl,
    iconSize: [20, 20],
    iconAnchor: [10, 2],
  }

  /** 初始化地图
   * @param mapId
   * @param mapOptions
   */
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
      '谷歌地形': L.tileLayer('http://mt0.google.com/vt/lyrs=p&hl=zh-CN&gl=CN&x={x}&y={y}&z={z}&s=Galil&scale=2')
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
    // 开启鼠标经纬度监听
    _getMouseLatLng();
  }

  /** 添加鼠标移动事件监听器
   * 监听得到鼠标经纬度
   */
  function _getMouseLatLng() {
    if (!map.value) return;
    map.value.on('mousemove', (e) => {
      // 将经纬度保存到当前经纬度
      mouseLatLng.value = e.latlng;
    });
  }

  /** 切换图层
   * @param layerName 图层名称
   */
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

  /** 全屏
   * 切换全屏
   */
  function _fullScreen() {
    if (!map.value) return;
    //全屏切换
    map.value.toggleFullscreen();
  }

  /** 绘制多个点并添加到图层
   * @param points  绘制多点数组
   * @param layerName 图层名称
   * @param options 绘制图层基本配置项
   */
  function _renderPoints(points: Array<{
    lat: number;
    lng: number;
    showMsg: string
  }>, layerName: string, options: any) {
    if (!map.value || !Array.isArray(points) || points.length === 0) return;
    // 定义一个图层
    let myCustomLayer = L.layerGroup();
    const allOptions = {...iconOptions, ...options};
    // 自定义图标
    let myIcon = L.icon(allOptions);
    points.forEach(point => {
      const {lat, lng, showMsg} = point;
      const marker = L.marker([lat, lng], {icon: myIcon}).addTo(myCustomLayer);
      marker.bindPopup(showMsg);
    });
    // 将图层添加到地图，并使用 layerName 作为图层标识
    myCustomLayer.addTo(map.value);
    baseLayers.value[layerName] = myCustomLayer;
  }

  /** 通过名称清除指定图层
   * @param layerName 要清除的图层名称
   */
  function _clearLayer(layerName: string) {
    if (!map.value) return;
    if (baseLayers.value[layerName]) {
      map.value.removeLayer(baseLayers.value[layerName]);
      delete baseLayers.value[layerName];
    }
  }

  /**地图以某个点居中
   * @param latlng 【经度，纬度】
   */
  function _setInCenter(latlng: number[] = [23.505, 113.57]) {
    if (!map.value) return;
    map.value.setView(latlng);
  }

  /** 地图以某群经纬度显示在地图视线范围内
   * @param areaData  经纬度点 eg:[{lat:'',lng:''},{lat:'',lng:''}]
   * @param options  基本配置项
   */
  function _setInBounds(areaData: any, options = {padding: [10, 10], maxZoom: 17}) {
    if (!map.value) return;
    const fitData = []
    for (let item of areaData) {
      //兼容数组与对象型
      if (!Array.isArray(item)) {
        fitData.push([item.lat, item.lng])
      } else {
        for (let p of item) {
          fitData.push([p.lat, p.lng])
        }
      }
    }
    map.value.fitBounds(fitData, options);
  }

  /** 绘制多数据 圆形 矩形 正方形
   * @param data  绘制图形及其坐标点
   * @param layerName 图层名称
   * @param options  基本配置项
   */
  function _drawByData(data:any, layerName:string='patternLayers',options:any) {
    if (!map.value) return;
    if (!baseLayers.value[layerName]) {
      baseLayers.value[layerName] = L.layerGroup().addTo(map.value);
    }
    // 所有经纬度 为了放大适应
    let allLatlngs:{lat:number,lng:number}[] = [];
    data.forEach((shapeData) => {
      let shapeLayer;
      if (shapeData.type === 'circle') {
        const { lat, lng, radius, info } = shapeData;
        allLatlngs.push({lat, lng});
        const circleLatLng = [lat, lng];
        const circleOptions = {
          ...options,
          info: info,
        };
        shapeLayer = L.circle(circleLatLng, { radius, ...circleOptions }).bindPopup(info);
      } else if (shapeData.type === 'rectangle' || shapeData.type === 'polygon') {
        const latlngs = shapeData.coordinates.map((coord:{lat:number,lng:number}) => [coord.lat, coord.lng]);
        const shapeOptions = {
          ...options,
          info: shapeData.info,
        };
        allLatlngs.push(...shapeData.coordinates);
        if (shapeData.type === 'rectangle') {
          shapeLayer = L.rectangle(latlngs, shapeOptions).bindPopup(shapeData.info);
        } else if (shapeData.type === 'polygon') {
          shapeLayer = L.polygon(latlngs, shapeOptions).bindPopup(shapeData.info);
        }
      }

      if (shapeLayer) {
        shapeLayer.addTo(baseLayers.value[layerName]);
      }
    });
    // 使得绘制范围在地图内
    if(allLatlngs.length){
      _setInBounds(allLatlngs);
    }
  }


  /** 地图以某群经纬度显示在地图视线范围内
   * 变大一倍
   */
  function _setZoomBigger() {
    map.value.zoomIn(1);
  }

  /** 地图以某群经纬度显示在地图视线范围内
   * 缩小一倍
   */
  function _setZoomSmaller() {
    map.value.zoomOut(1);
  }


  // 返回可导出的方法和数据
  return {
    map,
    mouseLatLng,
    baseLayers,
    selectedLayer,
    _initializeMap,
    _changeLayer,
    _fullScreen,
    _renderPoints,
    _clearLayer,
    _setZoomBigger,
    _setZoomSmaller,
    _drawByData,
    _setInCenter,
    _setInBounds,
    _getMouseLatLng
  };
}

/**
 * leaflet绘制地图工具类
 * 官网：https://leafletjs.cn/reference.html
 */
import {ref} from 'vue';
import 'leaflet/dist/leaflet.css';
import '../assets/css/hlLeaflet.css';// 自定义样式 聚合点测、面积
import * as L from 'leaflet';
// 测距 https://github.com/ppete2/Leaflet.PolylineMeasure
import "leaflet.polylinemeasure/Leaflet.PolylineMeasure.css";
// import "leaflet.polylinemeasure/Leaflet.PolylineMeasure.js";
// TODO 解决测距单位错乱问题
import "../assets/js/Leaflet.PolylineMeasure.js";
// 侧面积 https://github.com/ljagis/leaflet-measure
import 'leaflet-measure/dist/leaflet-measure.css';
import 'leaflet-measure/dist/leaflet-measure.cn';
import 'leaflet-measure/languages/cn.json';
import calc from 'leaflet-measure/src/calc'
import {selectOne as selectOne} from 'leaflet-measure/src/dom'
// 全屏插件 https://github.com/Leaflet/Leaflet.fullscreen
import 'leaflet.fullscreen';
import 'leaflet.fullscreen/Control.FullScreen.css';
// 聚合点 官网插件搜索关键词 leaflet.markercluster https://github.com/Leaflet/Leaflet.markercluster
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "leaflet.markercluster/dist/leaflet.markercluster.js";
// 有方向的Marker leaflet-rotatedmarker  https://github.com/bbecquet/Leaflet.RotatedMarker
import 'leaflet-rotatedmarker';
// leaflet-canvas-marker Marker  https://www.npmjs.com/package/leaflet-canvas-marker  TODO待成功引入
import 'leaflet-canvas-marker';

// 默认图标
import myIconUrl from '../assets/vue.svg';
// 台风 https://github.com/jieter/Leaflet-semicircle
import 'leaflet-semicircle';
// 热力图 https://github.com/Leaflet/Leaflet.heat
import 'leaflet.heat/dist/leaflet-heat.js';
// 直接绘制图形 https://www.npmjs.com/package/@seated/leaflet.pm
import 'leaflet.pm/dist/leaflet.pm.css';
import 'leaflet.pm';

// 轨迹回放 https://linghuam.github.io/Leaflet.TrackPlayBack/   https://github.com/linghuam/Leaflet.TrackPlayBack
// import 'leaflet-plugin-trackplayback/dist/control.playback.css';
// import 'leaflet-plugin-trackplayback/dist/control.trackplayback.js';
// import 'leaflet-plugin-trackplayback/dist/leaflet.trackplayback.js';
// TODO 运动时候绘制canvas添加内容UI
import '../assets/js/trackback/control.playback.css';//引入轨迹回放css
import '../assets/js/trackback/control.trackplayback.js';//引入轨迹回放控制
import '../assets/js/trackback/leaflet.trackplayback.js';//引入轨迹回放
import '../assets/js/trackback/rastercoords';// 定向地图
import dayjs from 'dayjs';
import { latLonTransform } from '../utils/util';
import trackPng from "../assets/images/leaflet_icon/trackplay-icon.png";
import qidian from '../assets/images/leaflet_icon/tab_state_qidian.png';// 起点 3
import tingzhi from '../assets/images/leaflet_icon/tab_state_tingzhi.png'; // 停止点 2
import zhongdian from '../assets/images/leaflet_icon/tab_state_zhongdian.png'; // 终点 4
import lixian from '../assets/images/leaflet_icon/tab_state_lixian.png'; // 离线 5
import sos from '../assets/images/leaflet_icon/tab_state_sos.png'; // SOS 6
import duandian from '../assets/images/leaflet_icon/tab_state_duandian.png'; // 断电 7
import chaixie from '../assets/images/leaflet_icon/tab_state_chaixie.png'; // 拆卸 8
import jinru from '../assets/images/leaflet_icon/tab_state_jinru.png'; // 进入围栏 9
import likai from '../assets/images/leaflet_icon/tab_state_likai.png'; // 离开围栏 10
import sudu from '../assets/images/leaflet_icon/tab_state_sudu.png'; // 超速 11
import didianliang from '../assets/images/leaflet_icon/tab_state_didianliang.png'; // 低电量 12
import shangsheng from '../assets/images/leaflet_icon/tab_state_shangsheng.png'; // 高度上升 13
import xiajiang from '../assets/images/leaflet_icon/tab_state_xiajiang.png'; // 高度下降 14
import haiba from '../assets/images/leaflet_icon/tab_state_haiba.png' // 海拔 15

export function useLeafletMap() {
  const map = ref(null); // 地图实例
  const mouseLatLng = ref<{ lat: number, lng: number }>({lat: 22, lng: 110});
  const baseLayers = ref<any>({}); // 存储图层数据
  const selectedLayer = ref<string>('天地图街道'); // 选中的图层
  const trackplayback = ref<any>(null);
  // 地图初始化基本配置
  const initMapOptions = {
    lat: 23.1538555,
    lng: 113.030911,
    zoom: 4,
    maxZoom: 18,
    minZoom: 3,
    preferCanvas: true,
    attributionControl: true,
    zoomControl: true,
    fullscreenControl: true
  }
  // 绘制点基本配置
  const pointOptions = {
    iconUrl: myIconUrl,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    spiderfyOnMaxZoom: false,
    showCoverageOnHover: false,
    zoomToBoundsOnClick: true,
    disableClusteringAtZoom: 16,
    maxClusterRadius: 60,
    iconCreateFunction: function (cluster:any) {
      let tempcount = cluster.getChildCount()
      let tempclass = tempcount > 500 ? 'red' : tempcount > 200 ? 'blue2' : tempcount > 100 ? 'blue' : tempcount > 50 ? 'green2' : 'green'
      return L.divIcon({ html: '<b class="' + tempclass + '">' + cluster.getChildCount() + '</b>' });
    }
  }
  // 默认绘制台风风圈配置
  const windCircleOptions = {
    fillColor: '#FF9C00',
    fillOpacity: 0.3,
    color: 'transparent',
    startAngle: 0,  //0是Y轴 顺时针转算度数
    stopAngle: 360
  }

  // 轨迹回放配置
  const trackplayOptions = {
    weight: 1,
    useImg: true,
    color: '#03ff09',
    imgUrl: trackPng,
    iconSize: [25, 25],
    iconAnchor: [15, 20],
    width: 40,
    height: 40,
    unit: `km/h`,
    replayType: false, // false 多个回放 true 单个回放
    isDir: 1,// 通用图标才有方向变化
    wakeTimeDiff: 100,
    isDrawLine: false,
    showDistance: true,
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
  // 直接绘制的图层
  const drawList = ref<any>(null);
  // 直接绘制经纬度数据
  const drawLatlngs = ref<any>(null);
  // 直接绘制圆的半径
  const drawCircleRadius = ref<number>(0);

  /** 初始化地图
   * @param mapId
   * @param mapOptions
   */
  function _initMap(mapId: string, mapOptions: any) {
    const allOptions = Object.assign({}, initMapOptions, mapOptions);
    const {
      lat,
      lng,
      zoom,
      maxZoom,
      minZoom,
      preferCanvas,
      attributionControl,
      zoomControl
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
      fullscreenControl: true
    });
    initialMap.whenReady(() => {
      baseLayers.value[selectedLayer.value].addTo(initialMap);
      // 隐藏全屏控件
      document.querySelectorAll('.leaflet-control-container').forEach(item => {
        item.style.display = 'none';
      })
      map.value = initialMap;
      // 初始化测距插件
      _initMearsureDistance(initialMap);
      _initMearsureArea(initialMap);
    })
    // 开启鼠标经纬度监听
    _getMouseLatLng(initialMap);
    return initialMap;
  }

  /** 添加鼠标移动事件监听器
   * @param map 绘制的地图
   * 监听得到鼠标经纬度
   */
  function _getMouseLatLng(map: any) {
    if (!map) return;
    (map).on('mousemove', (e) => {
      // 将经纬度保存到当前经纬度
      mouseLatLng.value = e.latlng;
    });
  }

  /** 切换图层
   * @param map 绘制的地图
   * @param layerName 图层名称
   */
  function _changeLayer(map: any, layerName: string) {
    if (!map || !baseLayers.value[layerName]) {
      return;
    }
    // 从地图中移除当前选中的图层
    map.removeLayer(baseLayers.value[selectedLayer.value]);
    // 切换选中的图层
    selectedLayer.value = layerName;
    // 将新选中的图层添加到地图
    baseLayers.value[selectedLayer.value].addTo(map);
  }

  /** 全屏
   * 切换全屏
   * @param map 绘制的地图
   */
  function _fullScreen(map: any) {
    if (!map) return;
    //全屏切换
    map.toggleFullscreen();
  }

  /** 绘制多个点并添加到图层
   * @param map 绘制的地图
   * @param points  绘制多点数组
   * @param layerName 图层名称
   * @param options 绘制图层基本配置项
   */
  function _renderPoint(map: any, points: Array<{
    lat: number;
    lng: number;
    dir: number;
    showMsg: string
  }>, layerName: string, options: any, isCluster: boolean = false, isShow: boolean = true) {
    if (!map || !Array.isArray(points) || points.length === 0) return;
    let allOptions = Object.assign(pointOptions, options);
    // 确保 baseLayers.value 初始化
    baseLayers.value = baseLayers.value || {};
    if (isCluster) {
      baseLayers.value[layerName] = L.markerClusterGroup(allOptions);
    } else {
      baseLayers.value[layerName] = baseLayers.value[layerName] || L.layerGroup().addTo(map);
      baseLayers.value[layerName].clearLayers();
    }
    // 自定义图标
    let myIcon = L.icon(allOptions);

    points.forEach(point => {
      const {lat, lng, showMsg, dir} = point;
      const marker = L.marker([lat, lng], {
        icon: myIcon,
        rotationAngle: dir
      }).bindPopup(showMsg, {closeButton: false,className:'hl-pop-msg-box'}).addTo(baseLayers.value[layerName])
      if (isShow) {
        marker.openPopup(); // 自动显示 popup
      }else{
        marker.closePopup(); // 自动显示 popup
      }

    });
    // 将图层添加到地图，并使用 layerName 作为图层标识
    baseLayers.value[layerName].addTo(map);
  }

  /** 通过名称清除指定图层
   * @param map 绘制的地图
   * @param layerName 要清除的图层名称
   */
  function _clearLayer(map: any, layerName: string) {
    if (!map) return;
    if (baseLayers.value[layerName]) {
      map.removeLayer(baseLayers.value[layerName]);
      delete baseLayers.value[layerName];
    }
  }

  /**地图以某个点居中
   * @param map 绘制的地图
   * @param map 绘制的地图
   * @param latlng 【经度，纬度】
   */
  function _setInCenter(map: any, latlng: number[] = [23.505, 113.57]) {
    if (!map) return;
    map.setView(latlng);
  }

  /** 地图以某群经纬度显示在地图视线范围内
   * @param map 绘制的地图
   * @param areaData  经纬度点 eg:[{lat:'',lng:''},{lat:'',lng:''}]
   * @param options  基本配置项
   */
  function _setInBounds(map: any, areaData: { lat: number; lng: number }[], options = {
    padding: [10, 10],
    maxZoom: 17
  }) {
    if (!map) return;
    const fitData = areaData.map(item => [item.lat, item.lng]);
    map.fitBounds(fitData, options);
  }

  /**
   * 绘制多数据 圆形 矩形 正方形 线
   * @param {object} map - 绘制的地图
   * @param {array} data - 绘制图形及其坐标点
   * @param {string} layerName - 图层名称
   * @param {boolean} isEdit - 是否开启编辑功能
   * @param {object} options - 基本配置项
   */
  function _drawByData(map: any, data: any, layerName: string = 'patternLayers', isEdit: boolean = false, options: any) {
    if (!map || !Array.isArray(data)) return;

    // 确保 baseLayers.value 初始化
    baseLayers.value = baseLayers.value || {};

    baseLayers.value[layerName] = baseLayers.value[layerName] || L.layerGroup().addTo(map);
    baseLayers.value[layerName].clearLayers();

    const allLatlngs = [];
    const shapeTypeToConstructor = {
      circle: L.circle.bind(L),
      rectangle: L.rectangle.bind(L),
      polygon: L.polygon.bind(L),
      line: L.polyline.bind(L),
    };

    data.forEach((shapeData) => {
      const {type, coordinates, info} = shapeData;
      if (type === 'circle') {
        // 处理圆形
        const {lat, lng, radius} = shapeData;
        const circleLayer = L.circle([lat, lng], {radius}).bindPopup(info);
        circleLayer.addTo(baseLayers.value[layerName]);
        allLatlngs.push([lat, lng]);
        if (isEdit) {
          circleLayer.pm.enable();
          // 处理圆形编辑事件
          circleLayer.on('pm:edit', (e) => {
            drawList.value = [e.sourceTarget._latlng];
            baseLayers.value[layerName].addLayer(drawList.value);
            map.addLayer(baseLayers.value[layerName]);
            // 处理圆形编辑事件
            drawLatlngs.value = [e.sourceTarget._latlng];
            drawCircleRadius.value = e.sourceTarget._mRadius;
          });
        }
      } else {
        const constructor = shapeTypeToConstructor[type];
        let latlngs;
        let shapeLayer;
        if (constructor && coordinates?.length) {
          latlngs = coordinates.map(({lat, lng}) => [lat, lng]);
          shapeLayer = constructor(latlngs, {...options, info}).bindPopup(info);
          shapeLayer.addTo(baseLayers.value[layerName]);
          allLatlngs.push(...coordinates);
          if (isEdit) {
            shapeLayer.pm.enable();
            shapeLayer.on('pm:edit', e => {
              drawList.value = e.layer;
              baseLayers.value[layerName].addLayer(drawList.value);
              map.addLayer(baseLayers.value[layerName]);
              drawLatlngs.value = e.sourceTarget._latlngs
            });
          }
        }
      }
    });
    if (allLatlngs.length) {
      _setInBounds(map, allLatlngs);
    }
  }

  /** 测量距离 初始化
   * @param map 绘制的地图
   */
  function _initMearsureDistance(map: any) {
    if (!map) return;
    L.control.polylineMeasure({
      clearMeasurementsOnStop: true,
      unitControlTitle: {
        // Title texts to show on the Unit Control button
        text: 'Change Units',
        metres: 'metres',
        landmiles: 'land miles',
        nauticalmiles: 'nautical miles'
      },
      position: 'topleft',
      unit: 'kilometres', //最小单位
      showBearings: true,
      showClearControl: true,
      showUnitControl: true,
      bearingTextIn: '起点',
      bearingTextOut: '终点',
      tooltipTextFinish: '<b>单击并<b>拖动到移动点</b><br>',
      tooltipTextDelete: '按shift键，然后<b>单击删除</b>',
      tooltipTextMove: '单击然后拖动<b>即可移动</b><br>',
      tooltipTextAdd: '按ctrl键或单击<b>添加点</b>',
      tooltipTextResume: '<br>按ctrl键并单击<b>重新开始</b>',
      unitControlLabel: {
        metres: '米',
        kilometres: '千米',
        feet: '英尺',
        landmiles: '英里',
        nauticalmiles: '海里'
      },
    }).addTo(map)
    let controlArr = document.querySelectorAll(`.leaflet-control`);
    if (controlArr.length) {
      controlArr.forEach(item => {
        item.style.display = "none";
      })
    }
  }

  /** 测量距离 触发
   * @param map 绘制的地图
   */
  function _mearsureDistance(map: any) {
    if (map) {
      document.getElementById(`polyline-measure-control`).click();
    }
  }

  /** 清除距离
   * @param map 绘制的地图
   */
  function _clearMeasure(map: any) {
    if (map) {
      document.getElementById(`polyline-measure-control`).click(); //取消绘制
      document.querySelectorAll(`.polyline-measure-clearControl`)[0].click();
    }
  }

  /** 改变测量单位
   * @param map 绘制的地图
   */
  function _changeMeasureUnit(map: any) {
    if (map) {
      document.getElementById(`unitControlId`).click();
    }
  }

  /** 得到测量单位
   * @param map 绘制的地图
   */
  function _getMeasureUnit(map: any) {
    if (map) {
      return document.getElementById(`unitControlId`).innerHTML;
    }
  }

  /** 测量面积初始化
   * @param map 绘制的地图
   */
  function _initMearsureArea(map: any) {
    if (!map) return;
    // 继承测面积插件的_handleMeasureDoubleClick方法，改写弹窗内容
    let newMeasureRules = L.Control.Measure.extend({
      _handleMeasureDoubleClick: function () {
        const latlngs = this._latlngs
        let resultFeature, popupContent
        this._finishMeasure()
        if (!latlngs.length) {
          return
        }
        if (latlngs.length > 2) {
          latlngs.push(latlngs[0]) // close path to get full perimeter measurement for areas
        }
        const calced = calc(latlngs)
        let strHtml = '', buttonHtml = ''
        if (latlngs.length === 1) {
          resultFeature = L.circleMarker(latlngs[0], this._symbols.getSymbol('resultPoint'))
          popupContent = calced
          strHtml = `<p style="margin: 0; padding-top: 10px;">${popupContent.lastCoord.dms.y} / ${popupContent.lastCoord.dms.x}</p><p style="margin: 0; padding-top: 10px;">${popupContent.lastCoord.dd.y} / ${popupContent.lastCoord.dd.x}</p>`
          buttonHtml = `<ul class="tasks"><li><a href="#" class="js-zoomto zoomto">该位置居中</a></li> <li><a href="#" class="js-deletemarkup deletemarkup">删除</a></li></ul>`
        } else if (latlngs.length === 2) {
          resultFeature = L.polyline(latlngs, this._symbols.getSymbol('resultLine'))
          popupContent = this._getMeasurementDisplayStrings(calced)
          strHtml = `<p style="margin: 0; padding-top: 10px;">${popupContent.lengthDisplay}</p>`
          buttonHtml = `<ul class="tasks"><li><a href="#" class="js-zoomto zoomto">该线段居中</a></li> <li><a href="#" class="js-deletemarkup deletemarkup">删除</a></li></ul>`
        } else {
          resultFeature = L.polygon(latlngs, this._symbols.getSymbol('resultArea'))
          strHtml = `<p style="margin: 0; padding-top: 10px;">${(calced.area * (1e-6)).toFixed(2)} 平方千米</p><p style="margin: 0; padding-top: 10px;">${(calced.area * 0.0015).toFixed(2)} 亩</p><p style="margin: 0; padding-top: 10px;">${(calced.area * 0.000015).toFixed(2)} 顷</p><p style="margin: 0; padding-top: 10px;">${(calced.area * 0.0001).toFixed(2)} 公顷</p><p style="margin: 0; padding-top: 10px;">${(calced.area * 1).toFixed(2)} 平方米</p><p style="margin: 0; padding-top: 10px;">${(calced.area * 0.0002471).toFixed(2)} 英亩</p><p style="margin: 0; padding-top: 10px;">${(calced.area * 3.8610e-7).toFixed(2)} 平方英里</p><p style="margin: 0; padding-top: 10px;">${(calced.area * 10.7639104).toFixed(2)} 平方英尺</p><p style="margin: 0; padding-top: 10px;">${(calced.area * 1.19599).toFixed(2)} 平方码</p>`
          buttonHtml = `<ul class="tasks"><li><a href="#" class="js-zoomto zoomto">该面积居中</a></li> <li><a href="#" class="js-deletemarkup deletemarkup">删除</a></li> </ul>`
        }
        const popupContainer = L.DomUtil.create('div', '')
        popupContainer.innerHTML = strHtml + buttonHtml
        const zoomLink = selectOne('.js-zoomto', popupContainer)
        if (zoomLink) {
          L.DomEvent.on(zoomLink, 'click', L.DomEvent.stop)
          L.DomEvent.on(
            zoomLink,
            'click',
            function () {
              if (resultFeature.getBounds) {
                this._map.fitBounds(resultFeature.getBounds(), {
                  padding: [20, 20],
                  maxZoom: 17
                })
              } else if (resultFeature.getLatLng) {
                this._map.panTo(resultFeature.getLatLng())
              }
            },
            this
          )
        }
        const deleteLink = selectOne('.js-deletemarkup', popupContainer)
        if (deleteLink) {
          L.DomEvent.on(deleteLink, 'click', L.DomEvent.stop)
          L.DomEvent.on(
            deleteLink,
            'click',
            function () {
              // TODO. maybe remove any event handlers on zoom and delete buttons?
              this._layer.removeLayer(resultFeature)
            },
            this
          )
        }
        resultFeature.addTo(this._layer)
        resultFeature.bindPopup(popupContainer, this.options.popupOptions)
        if (resultFeature.getBounds) {
          resultFeature.openPopup(resultFeature.getBounds().getCenter())
        } else if (resultFeature.getLatLng) {
          resultFeature.openPopup(resultFeature.getLatLng())
        }
      },
      _startMeasure: function () {
        this._locked = !0, this._measureVertexes = L.featureGroup().addTo(this._layer), this._captureMarker = L.marker(this._map.getCenter(), {
          clickable: !0,
          zIndexOffset: this.options.captureZIndex,
          opacity: 0,
          autoPanOnFocus: false  //解决测量面积会飘问题
        }).addTo(this._layer), this._setCaptureMarkerIcon(), this._captureMarker.on('mouseout', this._handleMapMouseOut, this).on('dblclick', this._handleMeasureDoubleClick, this).on('click', this._handleMeasureClick, this), this._map.on('mousemove', this._handleMeasureMove, this).on('mouseout', this._handleMapMouseOut, this).on('move', this._centerCaptureMarker, this).on('resize', this._setCaptureMarkerIcon, this), L.DomEvent.on(this._container, 'mouseenter', this._handleMapMouseOut, this), this._updateMeasureStartedNoPoints(), this._map.fire('measurestart', null, !1)
      },
    })
    let measureRules = new newMeasureRules({
      position: 'topright',
      activeColor: '#0f0',
      completedColor: '#0f0',
      popupOptions: {
        className: 'leaflet-measure-resultpopup',
        autoPanPadding: [10, 10]
      },
      primaryLengthUnit: 'meters',
      secondaryLengthUnit: 'kilometers',
      primaryAreaUnit: 'sqmeters',
      secondaryAreaUnit: 'hectares',
    })
    map.addControl(measureRules);
  }

  /** 测量面积
   * @param map 绘制的地图
   */
  function _mearsureArea(map: any) {
    if (!map) return;
    document.querySelectorAll(".js-start")[0].click();
  }

  /**
   * 绘制风圈
   * @param map 绘制的地图
   * @param data 绘制的台风数据
   * @param layerName 图层名称
   * @param options 风圈的配置项
   */
  function _drawWindCircle(map: any, data: any, layerName: string = 'windCircleLayers', options: any) {
    if (!map) return;
    // baseLayers.value 初始化
    baseLayers.value = baseLayers.value || {};

    // 使用自定义图层名称
    baseLayers.value[layerName] = baseLayers.value[layerName] || L.layerGroup().addTo(map);
    baseLayers.value[layerName].clearLayers();

    let allWindOptions = {...windCircleOptions, ...options};

    // 转换数据成角度画圆
    for (const p of data) {
      if (!Array.isArray(p)) { // 一个台风数据
        _windCircle(map, data, allWindOptions, layerName);
      } else { // 多个台风数据
        for (const pp of p) {
          _windCircle(map, p, allWindOptions, layerName);
        }
      }
    }
  }

  /**
   * 单个台风数据绘制风圈
   * @param map 绘制的地图
   * @param data 台风数据
   * @param allWindOptions 风圈的总体配置项
   * @param layerName 图层名称
   */
  function _windCircle(map: any, data: any, allWindOptions: any, layerName: string) {
    if (!map) return;
    for (const p of data) {
      // 绘制台风需要 L.semiCircle，radius 需要 * 1000 插件
      if (p.neRadius) {
        allWindOptions = {...allWindOptions, startAngle: 0, stopAngle: 90};
        baseLayers.value[layerName].addLayer(L.semiCircle([p.lat, p.lng], {radius: p.neRadius * 1000, ...allWindOptions}).addTo(map));
      }
      if (p.seRadius) {
        allWindOptions = {...allWindOptions, startAngle: 90, stopAngle: 180};
        baseLayers.value[layerName].addLayer(L.semiCircle([p.lat, p.lng], {radius: p.seRadius * 1000, ...allWindOptions}).addTo(map));
      }
      if (p.swRadius) {
        allWindOptions = {...allWindOptions, startAngle: 180, stopAngle: 270};
        baseLayers.value[layerName].addLayer(L.semiCircle([p.lat, p.lng], {radius: p.swRadius * 1000, ...allWindOptions}).addTo(map));
      }
      if (p.nwRadius) {
        allWindOptions = {...allWindOptions, startAngle: 270, stopAngle: 360};
        baseLayers.value[layerName].addLayer(L.semiCircle([p.lat, p.lng], {radius: p.nwRadius * 1000, ...allWindOptions}).addTo(map));
      }
    }
    _setInBounds(map, data);
  }

  /** 地图以某群经纬度显示在地图视线范围内
   * 变大一倍
   * @param map 绘制的地图
   */
  function _setZoomBigger(map: any) {
    if (!map) return;
    map.zoomIn(1);
  }

  /**
   * 绘制热力图
   * @param map 绘制的地图
   * @param data 热力图数据
   * @param layerName 图层名称
   * @param options 热力图的配置项
   */
  function _drawHeatMap(map: any, data: {
    lat: number,
    lng: number,
    count: number
  }[], layerName: string = 'hotLayers', options: any = {radius: 10, minOpacity: 0.85}) {
    if (!map) return;

    // baseLayers.value 初始化
    baseLayers.value = baseLayers.value || {};

    // 使用自定义图层名称
    baseLayers.value[layerName] = baseLayers.value[layerName] || L.layerGroup().addTo(map);
    baseLayers.value[layerName].clearLayers();

    let heatPoints = data.map(item => [item.lat, item.lng, item.count]);
    let hotLayers = L.heatLayer(heatPoints, options);

    // 使用自定义图层名称
    baseLayers.value[layerName].addLayer(hotLayers).addTo(map);
  }

  /**
   * 获取编辑地图数据
   * @param map 绘制的地图
   * @param type 绘制类型
   * @param color 绘制颜色
   * @param layersName 图层名称
   */
  function _editPatternGetData(map: any, shapeType: string = 'Polygon', layerName: string = 'editingLayers', color: string = 'rgba(51, 136, 255, 1)', iconUrl: any) {
    if (!map) return;
    _clearAllEdit(map);
    // baseLayers.value 初始化
    baseLayers.value = baseLayers.value || {};
    // 使用自定义图层名称
    baseLayers.value[layerName] = baseLayers.value[layerName] || L.layerGroup().addTo(map);
    baseLayers.value[layerName].clearLayers();
    map.on('pm:drawstart', ({workingLayer}) => {
      workingLayer.on('pm:vertexadded', e => {
        drawList.value = e.workingLayer;
        baseLayers.value[layerName].addLayer(drawList.value);
        map.addLayer(baseLayers.value[layerName]);
        drawLatlngs.value = e.target._latlngs;
      });
    });

    map.on('pm:create', e => {
      drawList.value = e.layer;
      baseLayers.value[layerName].addLayer(drawList.value);
      map.addLayer(baseLayers.value[layerName]);

      if (e.shape === 'Circle') {
        drawLatlngs.value = e.layer._latlng;
        drawCircleRadius.value = e.layer._mRadius;
      } else {
        drawLatlngs.value = e.layer._latlngs;
      }

      e.layer.pm.enable();
      e.layer.on('pm:edit', e2 => {
        if (shapeType === 'Circle') {
          drawLatlngs.value = e2.sourceTarget._latlng;
          drawCircleRadius.value = e2.sourceTarget._mRadius;
        } else {
          drawLatlngs.value = e2.sourceTarget._latlngs;
        }
      });
    });
    let myIcon = L.icon({
      iconUrl: iconUrl || myIconUrl,
      iconSize:[20,20]
    })
    map.pm.enableDraw(shapeType, {
      tooltips: false,
      markerStyle: {icon: myIcon},
      templineStyle: {
        color: color,
      },
      hintlineStyle: {
        color: color,
        dashArray: [5, 5],
      },
      pathOptions: {
        color: color,
        fillColor: color,
      },
      snappable: true,
      snapDistance: 20,
    });
  }

  /**
   * 清除所有编辑图层
   * @param map 绘制的地图
   */
  function _clearAllEdit(map: any) {
    if (!map) return;
    map.pm.disableDraw('Line');
    map.pm.disableDraw('Marker');
    map.pm.disableDraw('Polygon');
    map.pm.disableDraw('Circle');
    map.pm.disableDraw('Rectangle');
  }


  /** 地图以某群经纬度显示在地图视线范围内
   * 缩小一倍
   * @param map 绘制的地图
   */
  function _setZoomSmaller(map: any) {
    if (!map) return;
    map.zoomOut(1);
  }
  /**
   * 根据状态画出轨迹点及线
   * @param map 
   * @param MarkersList 
   * @param layerName 
   * @param options 
   * @returns 
   */
  function _drawTrackPoint (map:any, MarkersList:any, layerName:string='trackplay', options:any) {
    if (!map) {
      return
    }
     // baseLayers.value 初始化
     baseLayers.value = baseLayers.value || {};
     // 使用自定义图层名称
     baseLayers.value[layerName] = baseLayers.value[layerName] || L.layerGroup().addTo(map);
      let graphics = []
      let image
      let style = {}
       
      for (let i = 0; i < MarkersList.length; ++i) {
        let drawList = {}
        let info = ''
        if (MarkersList[i].gDeviceStatus === null || MarkersList[i].gDeviceStatus !== 1) {
          if (MarkersList[i].gDeviceStatus === 3 || MarkersList[i].gDeviceStatus === 4) { // 起点|终点的文本信息
            info += "<div class='hl-track-point-box'>" + "纬度：" + (MarkersList[i] && MarkersList[i].lat !== -1 ? latLonTransform(MarkersList[i].lat, 'lat') : "未知") + "</div>"
            info += "<div class='hl-track-point-box'>" + "经度：" + (MarkersList[i] && MarkersList[i].lng !== -1 ? latLonTransform(MarkersList[i].lng, 'lon') : "未知") + "</div>"
            info += "<div class='hl-track-point-box'>" + "时间：" + (MarkersList[i].time ? dayjs(MarkersList[i].time * 1000).format('YYYY-MM-DD HH:mm:ss') : MarkersList[i].timestamp ? MarkersList[i].timestamp : "未知") + "</div>"
          } else if (MarkersList[i].gDeviceStatus === 2) { // 停止点的文本信息
            gc = MarkersList[i].stayPoint.lng, MarkersList[i].stayPoint.lat
            info += "<div class='hl-track-point-box'>" + "纬度：" + (MarkersList[i].stayPoint && MarkersList[i].stayPoint.lat !== -1 ? latLonTransform(MarkersList[i].stayPoint.lat, 'lat') : "未知") + "</div>"
            info += "<div class='hl-track-point-box'>" + "经度：" + (MarkersList[i].stayPoint && MarkersList[i].stayPoint.lng !== -1 ? latLonTransform(MarkersList[i].stayPoint.lng, 'lon') : "未知") + "</div>"
            info += "<div class='hl-track-point-box'>" + "停止时间：" + (MarkersList[i].startTime ? MarkersList[i].startTime : "未知") + "</div>"
            info += "<div class='hl-track-point-box'>" + "移动时间：" + (MarkersList[i].endTime ? MarkersList[i].endTime : "未知") + "</div>"
            info += "<div class='hl-track-point-box'>" + "停止时长：" + (MarkersList[i].duration ? MarkersList[i].duration : "未知") + "</div>"
          } else { // 除起点|终点|停止点以外的文本信息
            gc = MarkersList[i].stayPoint.lng, MarkersList[i].stayPoint.lat
            info += "<div class='hl-track-point-box'>" + "纬度：" + (MarkersList[i].stayPoint && MarkersList[i].stayPoint.lat !== -1 ? latLonTransform(MarkersList[i].stayPoint.lat, 'lat') : "未知") + "</div>"
            info += "<div class='hl-track-point-box'>" + "经度：" + (MarkersList[i].stayPoint && MarkersList[i].stayPoint.lng !== -1 ? latLonTransform(MarkersList[i].stayPoint.lng, 'lon') : "未知") + "</div>"
            info += "<div class='hl-track-point-box'>" + "时间：" + (MarkersList[i].time ? dayjs(MarkersList[i].time * 1000
            ).format('YYYY-MM-DD HH:mm:ss') : MarkersList[i].timestamp ? MarkersList[i].timestamp : "未知") + "</div>"
          }
          if (MarkersList[i].gDeviceStatus === 3) { // 起点
            image = qidian
          } else if (MarkersList[i].gDeviceStatus === 4) { // 终点
            image = zhongdian
          } else if (MarkersList[i].gDeviceStatus === 5) { // 离线
            image = lixian
          } else if (MarkersList[i].gDeviceStatus === 6) { // SOS
            image = sos
          } else if (MarkersList[i].gDeviceStatus === 7) { // 断电
            image = duandian
          } else if (MarkersList[i].gDeviceStatus === 8) { // 拆卸
            image = chaixie
          } else if (MarkersList[i].gDeviceStatus === 9) { // 进入围栏
            image = jinru
          } else if (MarkersList[i].gDeviceStatus === 10) { // 离开围栏
            image = likai
          } else if (MarkersList[i].gDeviceStatus === 11) { // 超速
            image = sudu
          } else if (MarkersList[i].gDeviceStatus === 12) { // 低电量
            image = didianliang
          } else if (MarkersList[i].gDeviceStatus === 13) { // 高度上升
            image = shangsheng
          } else if (MarkersList[i].gDeviceStatus === 14) { // 高度下降
            image = xiajiang
          } else if (MarkersList[i].gDeviceStatus === 15) { // 海拔
            image = haiba
          } else {
            image = tingzhi
          }

          let icon = L.icon({
            iconUrl: image,
            iconSize: options.iconSize,
            iconAnchor: options.iconAnchor
          })
         drawList = L.marker(L.latLng(MarkersList[i].lat, MarkersList[i].lng), {
            icon: icon,
            info
          }).on('click', function (e) {
            let info = e.sourceTarget.options.info;
            if (info) {
              L.popup({ offset: [0, 0], className: 'hlleaflet-marker-popup' })
                .setLatLng([e.sourceTarget._latlng.lat, e.sourceTarget._latlng.lng])
                .setContent(`${info}`)
                .openOn(map);
            }
          })
          baseLayers.value[layerName].addLayer(drawList);
        }
      }
      map.addLayer(baseLayers.value[layerName]);
    _setInBounds(map, MarkersList);
  }

/**
 * 轨迹回放
 * @param map 
 * @param data 
 * @param options 
 * @param manyLineColor 
 * @returns 
 */
  function _trackPlay (map:any, data:any, layerName:string='trackplay',options:any, manyLineColor = ['red', 'blue', 'yellow', 'orange', 'pink']) { //轨迹回放 lineColor多轨迹线条颜色
    if (!map) return;
    let allTargetOptions = Object.assign(trackplayOptions, options);
   // baseLayers.value 初始化
    baseLayers.value = baseLayers.value || {};
    // 使用自定义图层名称
    baseLayers.value[layerName] = baseLayers.value[layerName] || L.layerGroup().addTo(map);
    baseLayers.value[layerName].clearLayers();
    data.forEach((item, index) => { 
      let drawList = {}
      if (!Array.isArray(item)) { //单轨迹画出轨迹  显示里程
        let latlngs = []
        for (let p of data) {
          latlngs.push([p.lat, p.lng]);
          // 画出起点终点停止点等等
          _drawTrackPoint(map, data, layerName,allTargetOptions);
        }
        if (!allTargetOptions.isDrawLine) {
          drawList = L.polyline(latlngs, allTargetOptions).addTo(map);
        }

      } else { //多轨迹画出轨迹  不显示里程
        let latlngs = []
        for (let p of item) {
          latlngs.push([p.lat, p.lng]);
          // 画出起点终点停止点等等
          _drawTrackPoint(map, item, layerName,allTargetOptions);
        }
        if (!allTargetOptions.isDrawLine) {
          drawList = L.polyline(latlngs, { ...allTargetOptions, color: manyLineColor[index] ? manyLineColor[index] : 'green' }).addTo(map);
        }
      }
      if (!allTargetOptions.isDrawLine) {
        baseLayers.value[layerName].addLayer(drawList);
      }
    })
    const trackplay = L.trackplayback(data, map, {
      targetOptions: { ...allTargetOptions },
      trackLineOptions: {
        isDraw: allTargetOptions.isDrawLine, // 是否画线
        stroke: true,
        color: allTargetOptions.color, // 线条颜色
        weight: 2, // 线条宽度
        opacity: 1, // 透明度
        wakeTimeDiff: allTargetOptions.wakeTimeDiff// 尾迹时间控制 不传默认一年
      }
    })
     L.trackplaybackcontrol(trackplay).addTo(map);
    return trackplay;
  }


  /**
   * 开始播放
   */ 
  function _startTrack(trackplay: any) {
    if (!trackplay) {
      return;
    }
    trackplay.start();
  }
 /**
  * 设置速度
  * @param trackplay 
  * @param speed
  * @returns 
  */
 function _setTrackSpeed (trackplay:any, speed:number) {
  if (!trackplay) return;
  trackplay.setSpeed(speed);
}
 /**
  * 设置时间
  * @param trackplay 
  * @param time 
  * @returns 
  */
 function _setTrackCurentTime (trackplay:any, time:number) {
  if (!trackplay) return;
  trackplay.setCursor(time);
}

 /**
   * 销毁轨迹
   */ 
 function _disposeTrack(trackplay:any) {
  if (!trackplay) return;
  trackplay.dispose();
}

 /**
   *刷新
   */ 
 function _restartTrack(trackplay:any) {
  if (!trackplay) return;
  trackplay.rePlaying();
}

 /**
   * 停止
   */ 
 function _stopTrack(trackplay:any) {
  if (!trackplay) return;
  trackplay.stop();
}

 /**
   * 显示轨迹线路
   */ 
 function _showTrackLine(trackplay:any) {
  if (!trackplay) return;
  trackplay.showTrackLine();
}

 /**
   * 隐藏轨迹线路
   */ 
 function _hideTrackLine(trackplay:any) {
  if (!trackplay) return;
  trackplay.hideTrackLine();
}
 /**
   * 获得当前速度
   */ 
function _getCurrentSpeed (trackplay:any) {
  return trackplay.getSpeed();
}
 /**
   *获得当前时间
   */ 
function _getCurrentTime (trackplay:any) {
  return trackplay.getCurTime();
}

  // 返回可导出的方法和数据
  return {
    map,
    mouseLatLng,
    baseLayers,
    selectedLayer,
    drawLatlngs,
    drawCircleRadius,
    trackplayback,
    _initMap,
    _changeLayer,
    _fullScreen,
    _renderPoint,
    _clearLayer,
    _setZoomBigger,
    _setZoomSmaller,
    _drawByData,
    _mearsureDistance,
    _clearMeasure,
    _changeMeasureUnit,
    _getMeasureUnit,
    _drawHeatMap,
    _editPatternGetData,
    _clearAllEdit,
    _setInCenter,
    _setInBounds,
    _getMouseLatLng,
    _initMearsureDistance,
    _drawWindCircle,
    _trackPlay,
    _mearsureArea,
    _startTrack,
    _setTrackSpeed,
    _disposeTrack,
    _restartTrack,
    _stopTrack,
    _showTrackLine,
    _hideTrackLine,
    _getCurrentSpeed,
    _getCurrentTime,
    _setTrackCurentTime
  };
}

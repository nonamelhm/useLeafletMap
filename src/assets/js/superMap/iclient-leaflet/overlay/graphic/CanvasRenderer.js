/* eslint-disable */
/* Copyright© 2000 - 2019 SuperMap Software Co.Ltd. All rights reserved.
 * This program are made available under the terms of the Apache License, Version 2.0
 * which accompanies this distribution and is available at http://www.apache.org/licenses/LICENSE-2.0.html.*/
import L from "leaflet";

const emptyFunc = L.Util.falseFn;
export var GraphicCanvasRenderer = L.Class.extend({
  initialize: function (layer, options) {
    this.layer = layer;
    options = options || {};
    L.Util.setOptions(this, options);
  },

  /**
   * @private
   * @function  GraphicCanvasRenderer.prototype.getRenderer
   * @description 返回渲染器给图层，提供图层后续的数据增删改。
   * @returns {L.Canvas}
   */
  getRenderer: function () {
    return this.options.renderer;
  },

  /**
   * @private
   * @function  GraphicCanvasRenderer.prototype.update
   * @description  更新图层，数据或者样式改变后调用。
   */
  update: function () {
    this.getRenderer()._clear();
    this.getRenderer()._draw();
  },

  _handleClick: function (evt) {
    let me = this,
      layer = me.layer,
      map = layer._map;
    if (!layer.options.onClick) {
      return;
    }
    this.layer._renderer._ctx.canvas.style.cursor = "pointer";
    let graphics = layer._getGraphicsInBounds();
    for (let i = 0; i < graphics.length; i++) {
      let p1, p2, bounds;
      let center = map.latLngToLayerPoint(graphics[i].getLatLng());
      let style = graphics[i].getStyle();
      if (!style && this.defaultStyle) {
        style = this.defaultStyle;
      }
      if (style.img) {
        let anchor = style.anchor || [style.img.width / 2, style.img.height / 2];
        // p1 = L.point(center.x - anchor[0], center.y - anchor[1]);
        // p2 = L.point(p1.x + style.img.width, p1.y + style.img.height);
        p1 = L.point(center.x - anchor[0], center.y - anchor[1]);
        p2 = L.point(p1.x + style.size[0], p1.y + style.size[1]);
      } else {
        // p1 = L.point(center.x - style.width / 2, center.y - style.height / 2);
        // p2 = L.point(center.x + style.width / 2, center.y + style.height / 2);
        p1 = L.point(center.x - anchor[0], center.y - anchor[1]);
        p2 = L.point(p1.x + style.size[0], p1.y + style.size[1]);
      }
      bounds = L.bounds(p1, p2);
      if (bounds.contains(map.latLngToLayerPoint(evt.latlng))) {
        return layer.options.onClick.call(layer, graphics[i], evt);
      }
    }
  },
  //跟GraphicWebGLRenderer保持一致
  _clearBuffer: emptyFunc
});

L.Canvas.include({
  drawGraphics: function (graphics, defaultStyle) {

    var me = this;
    if (!me._drawing) {
      return;
    }
    //this._ctx.clearRect(0, 0, this._ctx.canvas.width, me._ctx.canvas.height);
    graphics.forEach(function (graphic) {
      var style = graphic.getStyle();
      if (!style && defaultStyle) {
        style = defaultStyle;
      }
      if (style.img) { //绘制图片
        // me._drawImage.call(me, me._ctx, style, graphic.getLatLng(), graphic.attributes);
        let number
        if (graphic._style.userInfo) {
          number = graphic._style.userInfo.number
        }
        // showLabel显示标签 hideLabel隐藏标签 showDetailLabel详细标签
        if (graphic._style.isdrawLabel === 'showDetailLabel') {
          me._drawDetailMapInfoRoundRect.call(me, me._ctx, style, graphic.getLatLng(), graphic.attributes, number, graphic._style.isdrawLabel);
        } else {
          if (graphic.attributes.length > 1) {
            me._drawDetailMapInfoRoundRect.call(me, me._ctx, style, graphic.getLatLng(), graphic.attributes, number, graphic._style.isdrawLabel);
          } else {
            me._drawRoundRect.call(me, me._ctx, style, graphic.getLatLng(), graphic.attributes, number, graphic._style.isdrawLabel);
          }
        }
      } else { //绘制canvas
        me._drawCanvas.call(me, me._ctx, style, graphic.getLatLng());
      }
    })
  },
  _drawCanvas: function (ctx, style, latLng) {

    var canvas = style;
    var pt = this._map.latLngToLayerPoint(latLng);
    var p0 = pt.x - canvas.width / 2;
    var p1 = pt.y - canvas.height / 2;
    var width = canvas.width;
    var height = canvas.height;

    ctx.drawImage(canvas, p0, p1, width, height);

  },
   // 地图标签绘制 TODO修改了显示
  _drawRoundRect: function (ctx, style, latLng, name, number, isdrawLabel) {
    var width, height, fontColor, borderColor, dir = 0;
    if (style.size) {// 设置图片的大小
      var size = style.size;
      width = size[0];
      height = size[1];
      if (style.dir) {
        dir = style.dir;
      }
    } else {
      width = style.img.width;
      height = style.img.height;
    }
    if (style.userInfo) {
      //TODO修改颜色
      fontColor = style.userInfo.status === 2 ? '#20c023' : style.userInfo.status === 1 ? '#2398F3' : style.userInfo.status === 0 ? '#868686' : style.userInfo.status === 3 ? '#d30d0d' : '2398F3'
      borderColor = style.userInfo.status === 2 ? '#20c023' : style.userInfo.status === 1 ? '#2398F3' : style.userInfo.status === 0 ? '#868686' : style.userInfo.status === 3 ? '#d30d0d' : '2398F3'
    } else {
      fontColor = '#000'
      borderColor = '#eee'
    }
    // 设置偏移
    var point = this._coordinateToPoint(latLng);
    var pt = L.point(point), ac = L.point(style.anchor || [width / 2, height / 2]);
    point = [pt.x - ac.x, pt.y - ac.y];
    if (name.length && isdrawLabel === 'showLabel' && !style.labelImg) {
      // x：矩形左上角的横坐标（非圆角矩形时左上角横坐标）。
      // y：矩形左上角的纵坐标（非圆角矩形时左上角纵坐标）。
      // w：矩形的宽度。
      // h：矩形的高度。
      // r：圆角所处圆的半径尺寸。
      let padding = 14
      let fontSize = 10
      ctx.font = `normal bold ${fontSize}px Verdana`;
      let w
      if (number) {
        w = ctx.measureText(`${name[0]}(${number})`).width + padding // 文本宽度两边各预留5px
      } else {
        w = ctx.measureText(`${name[0]}`).width + padding // 文本宽度两边各预留5px
      }
      let h = 24
      let x = point[0] - ((w - width) / 2)
      let y = point[1] - height / 2 - (h / 2) // 往上预留5px
      let r = 5
      if (w < 2 * r) r = w / 2;
      if (h < 2 * r) r = h / 2;
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.arc(x + w - r, y + r, r, Math.PI * 3 / 2, Math.PI * 2); // 右上角圆弧
      ctx.lineTo(x + w, y + h - r);
      ctx.arc(x + w - r, y + h - r, r, 0, Math.PI / 2); // 右下角圆弧
      ctx.lineTo(x + w / 2 + 4, y + h); // 三角形 底边为8
      ctx.lineTo(x + w / 2, y + h + 4); // 三角形 高度为4
      ctx.lineTo(x + w / 2 - 4, y + h); // 三角形
      ctx.lineTo(x + r, y + h);
      ctx.arc(x + r, y + h - r, r, Math.PI / 2, Math.PI); // 左下角圆弧
      ctx.lineTo(x, y + r);
      ctx.arc(x + r, y + r, r, Math.PI, Math.PI * 3 / 2);  // 左上角圆弧
      ctx.closePath();
      ctx.lineWidth = 1
      ctx.fillStyle = 'rgba(255, 255, 255, 1)'; //若是给定了值就用给定的值否则给予默认值
      ctx.fill();
      ctx.strokeStyle = borderColor;
      ctx.stroke()
      ctx.restore();
      ctx.textBaseline = 'top';
      ctx.textAlign = 'center';
      ctx.fillStyle = fontColor;
      if (number) {
        ctx.fillText(`${name[0]}(${number})`, x + (w / 2), y + ((h - fontSize) / 2));
      } else {
        if (window.__wxjs_is_wkwebview) {
          ctx.fillText(`${name[0]}`, x + (w / 2), y + ((h - fontSize) / 2) - 3);
        } else {
          ctx.fillText(`${name[0]}`, x + (w / 2), y + ((h - fontSize) / 2));
        }
      }
    }
    ctx.save();
    ctx.translate(point[0] + width / 2, point[1] + height / 2);
    if (style.labelImg) {
      ctx.drawImage(style.labelImg, -width / 3, -height / 2 - 26, style.labelImg.width / 2, style.labelImg.height / 2);
    }
    ctx.rotate(Math.PI / 180 * dir);
    ctx.drawImage(style.img, -width / 2, -height / 2, width, height);
    ctx.restore();
    // ctx.drawImage(style.img, point[0], point[1] - height / 2, width, height);
  },
  _drawDetailMapInfoRoundRect: function (ctx, style, latLng, name, number, isdrawLabel) { // 地图详细信息标签绘制
    // 设置图片的大小
    var width, height, fontColor, borderColor, backgroundColor, dir = 0;
    if (style.size) {
      var size = style.size;
      width = size[0];
      height = size[1];
      if (style.dir) {
        dir = style.dir;
      }
    } else {
      width = style.img.width;
      height = style.img.height;
    }
    if (style.userInfo && style.userInfo) {
      /*backgroundColor = style.userInfo.status === 2 ? '#20c023' : style.userInfo.status === 1 ? '#2398F3' : style.userInfo.status === 0 ? '#fff' : style.userInfo.status === 3 ? '#d30d0d' : '#2398F3'
      fontColor = style.userInfo.status === 0 ? '#000' : '#fff'*/
      fontColor = style.userInfo.status === 2 ? '#20c023' : style.userInfo.status === 1 ? '#2398F3' : style.userInfo.status === 0 ? '#868686' : style.userInfo.status === 3 ? '#d30d0d' : '2398F3'
      borderColor = style.userInfo.status === 2 ? '#20c023' : style.userInfo.status === 1 ? '#2398F3' : style.userInfo.status === 0 ? '#868686' : style.userInfo.status === 3 ? '#d30d0d' : '2398F3'
    } else {
      // backgroundColor = '#fff'
      fontColor = '#000'
      borderColor = '#eee'
    }
    // 设置偏移
    var point = this._coordinateToPoint(latLng);
    var pt = L.point(point), ac = L.point(style.anchor || [width / 2, height / 2]);
    point = [pt.x - ac.x, pt.y - ac.y];
    if (isdrawLabel !== 'hideLabel' && name.length && !style.labelImg) {
      // x：矩形左上角的横坐标（非圆角矩形时左上角横坐标）。
      // y：矩形左上角的纵坐标（非圆角矩形时左上角纵坐标）。
      // w：矩形的宽度。
      // h：矩形的高度。
      // r：圆角所处圆的半径尺寸。
      let padding = 20
      let fontSize = 12
      let lineHeight = 18 // 绘制文字的行高
      let fontBoxHeight = name.length * lineHeight + 20 // 文字框的高度 20为文本框上下边框的留白
      let w
      if (number) {
        let wArr = []
        name.forEach((item, index) => {
          if (index !== 0) {
            ctx.font = `normal normal 10px Verdana`;
          } else {
            ctx.font = `normal bold ${fontSize}px Verdana`;
          }
          wArr.push(ctx.measureText(`${item}(${number})`).width + padding) // 文本宽度两边各预留5px
        })
        w = Math.max.apply(null, wArr)
      } else {
        let wArr = []
        name.forEach((item, index) => {
          if (index !== 0) {
            ctx.font = `normal normal 10px Verdana`;
          } else {
            ctx.font = `normal bold ${fontSize}px Verdana`;
          }
          wArr.push(ctx.measureText(`${item}`).width + padding) // 获取文本宽度 文本宽度两边各留白5px
        })
        w = Math.max.apply(null, wArr)
      }
      let h = 24
      let x = point[0] - ((w - width) / 2) // 绘制文本框的定位x坐标值
      // 绘制文本框的定位y坐标值 ((lineHeight + 10 - fontSize) / 2):首行文字与上文本框之间的留白 8:图标与下文本框之间的留白
      let y = point[1] - (height / 2) - fontBoxHeight + ((lineHeight + 10 - fontSize) / 2) + 8
      let r = 2
      if (w < 2 * r) r = w / 2;
      if (h < 2 * r) r = h / 2;
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.arc(x + w - r, y + r, r, Math.PI * 3 / 2, Math.PI * 2); // 右上角圆弧
      ctx.lineTo(x + w, y + fontBoxHeight - r);
      ctx.arc(x + w - r, y + fontBoxHeight - r, r, 0, Math.PI / 2); // 右下角圆弧
      ctx.lineTo(x + w / 2 + 4, y + fontBoxHeight); // 三角形 底边为8
      ctx.lineTo(x + w / 2, y + fontBoxHeight + 4); // 三角形 高度为4
      ctx.lineTo(x + w / 2 - 4, y + fontBoxHeight); // 三角形
      ctx.lineTo(x + r, y + fontBoxHeight);
      ctx.arc(x + r, y + fontBoxHeight - r, r, Math.PI / 2, Math.PI); // 左下角圆弧
      ctx.lineTo(x, y + r);
      ctx.arc(x + r, y + r, r, Math.PI, Math.PI * 3 / 2);  // 左上角圆弧
      ctx.closePath();
      ctx.lineWidth = 1
      /*ctx.fillStyle = backgroundColor; // 设置背景色 若是给定了值就用给定的值否则给予默认值
      ctx.strokeStyle = backgroundColor; // 设置边框色*/
      ctx.fillStyle = 'rgba(255, 255, 255, 1)'; //若是给定了值就用给定的值否则给予默认值
      ctx.fill();
      ctx.strokeStyle = borderColor;
      ctx.stroke();
      ctx.restore();
      ctx.beginPath();
      ctx.textBaseline = 'top';
      ctx.textAlign = 'left';
      ctx.fillStyle = fontColor; // 设置字体色
      if (number) {
        name.forEach((item, index) => {
          if (index !== 0) {
            ctx.font = `normal normal 10px Verdana`;
            ctx.fillText(`${item}(${number})`, x + padding / 2, (y + ((lineHeight + 20 - fontSize) / 2) + 2 + index * lineHeight));
          } else {
            ctx.font = `normal bold ${fontSize}px Verdana`;
            ctx.fillText(`${item}(${number})`, x + padding / 2, y + ((lineHeight + 20 - fontSize) / 2));
          }
        })
      } else {
        if (window.__wxjs_is_wkwebview) {
          name.forEach((item, index) => {
            if (index !== 0) {
              ctx.font = `normal normal 10px Verdana`;
              ctx.fillText(item, x + padding / 2, (y + ((lineHeight + 20 - fontSize) / 2) + 2 + index * lineHeight));
            } else {
              ctx.font = `normal bold ${fontSize}px Verdana`;
              ctx.fillText(item, x + padding / 2, y + ((lineHeight + 20 - fontSize) / 2));
            }
          })
        } else {
          name.forEach((item, index) => { // 通过不同y坐标绘制不同文字来实现换行效果 x+ padding/2左边留白padding/2 px 7文字距离上文本框的留白
            if (index !== 0) {
              ctx.font = `normal normal 10px Verdana`;
              ctx.fillText(item, x + padding / 2, (y + ((lineHeight + 20 - fontSize) / 2) + 2 + index * lineHeight)); // 2:首行文字大小14，其他行文字大小12,绘制第二行开始定位y坐标多加2px
            } else {
              ctx.font = `normal bold ${fontSize}px Verdana`;
              // ((lineHeight + 10 - fontSize) / 2):首行文字与上文本框之间的留白
              ctx.fillText(item, x + padding / 2, y + ((lineHeight + 20 - fontSize) / 2));
            }
          })
        }
      }
    }
    ctx.save();
    ctx.translate(point[0] + width / 2, point[1] + height / 2);
    if (style.labelImg) {
      ctx.drawImage(style.labelImg, -width / 3, -height / 2 - 26, style.labelImg.width / 2, style.labelImg.height / 2);
    }
    ctx.rotate(Math.PI / 180 * dir);
    ctx.drawImage(style.img, -width / 2, -height / 2, width, height);
    ctx.restore();
    // ctx.drawImage(style.img, point[0], point[1] - height / 2, width, height);
  },
  _drawImage: function (ctx, style, latLng, name) {
    //设置图片的大小
    var width, height;
    if (style.size) {
      var size = style.size;
      width = size[0];
      height = size[1];
    } else {
      width = style.img.width;
      height = style.img.height;
    }
    //设置偏移
    var point = this._coordinateToPoint(latLng);

    var pt = L.point(point),
      ac = L.point(style.anchor || [width / 2, height / 2]);
    point = [pt.x - ac.x, pt.y - ac.y];

    //参数分别为：图片，图片裁剪下x,y位置，裁剪长宽，放置在画布的位置x,y, 占取画布长宽
    //ctx.drawImage(style.img, 0, 0, width, height, point[0], point[1], width, height);
    ctx.font = '12px Verdana';
    ctx.textBaseline = 'top';
    ctx.strokeStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.lineWidth = 3;
    ctx.fillStyle = style.color;
    ctx.strokeText(name, point[0] + (width / 2), point[1] + (height / 2 + 10));
    ctx.fillText(name, point[0] + (width / 2), point[1] + (height / 2 + 10));
    ctx.drawImage(style.img, point[0], point[1] - height / 2, width, height);
  },
  _coordinateToPoint: function (coordinate) {
    if (!this._map) {
      return coordinate;
    }
    var latLng = coordinate;
    if (L.Util.isArray(coordinate)) {
      latLng = L.latLng(coordinate[0], coordinate[1]);
    } else if (coordinate instanceof L.LatLng) {
      latLng = L.latLng(coordinate.lat, coordinate.lng);
    }
    var point = this._map.latLngToLayerPoint(latLng);
    return [point.x, point.y];
  }
})

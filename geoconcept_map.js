/* global ApplicationPrototype AndroidDevice Image $ logger OpenLayers GCUI
  onTileLoadStart, onBaseLayerLoaded, onTileLoaded
*/

'use strict'
window.LOG_INACTIVE = true

window.onerror = function (err, a, b) {
  if (typeof (App) === 'object') {
    App.log('error', err, a, b)
  } else {
    console.error.apply(console, arguments)
  }
}

var Android = new ApplicationPrototype()

Android.bind('trigger', function (eventName, params) {
  this.device().on(eventName, JSON.stringify(params || ''))
})

Android.bind('device', function () {
  var f = function () {
    (console.warn || console.log || function () {})("AndroidDevice doesn't exist", arguments)
  }
  return (typeof (AndroidDevice) === 'object' && AndroidDevice) ? AndroidDevice : {
    on: f
  }
}, '')

// Application Structure
var App = new ApplicationPrototype()

App.bind('Image', (function () {
  var app = new ApplicationPrototype()
  app.bind('URL2Canvas', function (url, size, cb) {
    var canvas = document.createElement('canvas')
    var ratioSize = 4
    document.body.appendChild(canvas)
    var ctx = canvas.getContext('2d')
    ctx.mozImageSmoothingEnabled = true
    ctx.webkitImageSmoothingEnabled = true
    ctx.msImageSmoothingEnabled = true
    ctx.imageSmoothingEnabled = true
    var img = new Image()
    var isize = size * ratioSize
    img.width = isize
    img.height = isize
    canvas.width = isize
    canvas.height = isize
    img.onload = function () {
      ctx.drawImage(img, 0, 0, isize, isize) // Or at whatever offset you like
      cb(canvas)
      document.body.removeChild(canvas)
    }
    img.src = url
  })

  app.bind('CanvasText', function (canvas, text) {
    var context = canvas.getContext('2d')
    var ratioSize = 4
    var x = canvas.width - 7 * ratioSize
    var y = 11 * ratioSize

    context.mozImageSmoothingEnabled = true
    context.webkitImageSmoothingEnabled = true
    context.msImageSmoothingEnabled = true
    context.imageSmoothingEnabled = true

    context.beginPath()
    context.strokeColor = 'black'
    context.strokeSize = '2px'
    context.arc(canvas.width - 7 * ratioSize, 7 * ratioSize, 7 * ratioSize, 0, 2 * Math.PI, 0)
    context.fill()

    context.font = (11 * ratioSize) + 'px tahoma'
    context.textAlign = 'center'
    context.fillStyle = 'white'
    context.fillText(text, x, y)
  })

  return function () {
    return app
  }
})())

App.bind('config', ((function () {
  var config = {}
  return function () { return config }
})()), '')

App.bind('debug', function (status) {
  var self = this
  if (status) {
    self.config().debug = !!status
    console.log(self)
    return self
  }
  return !!self.config.debug
}, 'on')

App.bind('log', function (type, data) {
  console.log(arguments)
}, 'on')

;((function () {
  var initCallbacks = []
  App.bind('init', function (cb) {
    if (Array.isArray(initCallbacks)) {
      if (typeof (cb) === 'function') {
        initCallbacks.push(cb)
      } else {
        initCallbacks.forEach(function (cb) {
          try {
            cb()
          } catch (er) {
            App.log('error', er)
          }
        })
        initCallbacks = false
      }
      return true
    } else {
      return false
    }
  })
})())

/**
 * definig logger Space
 */
;((function (App) {
  var app = new ApplicationPrototype()
  var config = {}
  app.bind('config', function () {
    return config
  }, '')
  app.bind('node', function () {
    return app.config().node
  })
  app.bind('init', function () {
    /* eslint-disable */
    app.config().node = $('<div class="wv-logger">\
        <style type="text/css">\
          .wv-logger {\
            position: fixed; bottom: 0; left: 10%; width: 80%; background: rgba(0, 0, 0, 0.45);  font-family: monospace, freemono, mono, droid sans mono, sherif;\
            overflow: auto; height: 50px; z-index: 10000;\
          }\
          .wv-logger:hover {\
            height: 40%;\
          }\
        </style>\
      </div>')
    $('body').eq(0).append(app.config().node)
    if (window.LOG_INACTIVE) {
      app.hide()
    }
  })
  app.bind('encode', function (message) {
    var er, res
    try {
      res = JSON.stringify(message)
    } catch (er) {}
    if (er) {
      try {
        if (typeof (message.toString) === 'function') {
          res = message.toString()
        } else {
          res = message + ''
        }
      } catch (er) {}
    }
    var color = ''
    if (typeof (message) === 'object' && !message) {
      color = 'red'
    }
    if (typeof (message) === 'boolean') {
      color = 'darkblue'
    }
    if (typeof (message) === 'string') {
      color = 'darkgreen'
    }
    if (typeof (message) === 'function') {
      color = 'royalblue'
    }
    var node = $('<span></span>')
    node.css('color', color)
    node.text(res)
    return node
  }, '')
  App.on('onLog', function (type, message) {
    if (window.LOG_INACTIVE) {
      app.hide()
      return
    }
    app.show()
    var color = '#454545'
    var bgColor = '#dedede'
    switch (type) {
      case 'error':
        color = '#aa1a10'
        bgColor = '#ffc5c5'

        break
      case 'info':
        color = '#006aaa'
        bgColor = '#d0d0ff'
        break
      case 'warn':
        color = '#aa6a10'
        bgColor = '#ffffc0'

        break
      case 'log':
        break
      default:
        bgColor = '#ffd0d0'
        break
    }

    var row = $('<div></div>')
    row.css({
      lineHeight: '1.2',
      fontSize: '12px',
      margin: '2px 0',
      background: bgColor,
      color: color
    })
    var label = $('<span style="background: ' + color + '; color: #fff; padding: 0 5px"></span>')
    label.text(type)
    row.append(label)
    row.append(' ')
    var i
    for (i = 1; i < arguments.length; i++) {
      row.append(app.encode(arguments[i]))
    }
    app.node().prepend(row)
  })

  app.bind('hide', function () {
    var n = app.node()
    if (n) n.css('display', 'none')
  })

  app.bind('show', function () {
    var n = app.node()
    if (n) n.css('display', '')
  })

  App.init(function () {
    app.init()
  })
  App.bind('logger', function () {
    return logger
  }, '')
})(App))

/**
 * definig progress Space
 */
;((function (App) {
  var app = new ApplicationPrototype()
  var config = {}
  app.bind('config', function () {
    return config
  }, '')
  app.bind('node', function () {
    return app.config().node
  })
  app.bind('init', function () {
    /* eslint-disable */
    app.config().node = $('<div class="wv-progress">\
        <div class="wv-progress-bg"></div>\n\
        <div class="wv-progress-label">Hi!</div>\n\
        <button class="wv-progress-button">OK</button>\n\
        <div class="wv-progress-spinner">\n\
          <img src="data:image/gif;base64,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">\n\
        </div>\n\
        <style type="text/css">\
          .wv-progress .wv-progress-bg {\
            position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(255, 255, 255, 0.45);  font-family: monospace, freemono, mono, droid sans mono, sherif;\
            overflow: auto; z-index: 90000000;\
          }\
          .wv-progress .wv-progress-spinner {\
            position: fixed; top: 50%; left: 50%;\
            -webkit-transform: translate(-50%, -50%);\n\
            -ms-transform: translate(-50%, -50%);\n\
            -o-transform: translate(-50%, -50%);\n\
            transform: translate(-50%, -50%);\n\
            z-index: 90000001;\
          }\
          .wv-progress .wv-progress-label {\
            position: fixed; top: 50%; left: 50%;\
            -webkit-transform: translate(-50%, -50%) translateY(-120px);\n\
            -ms-transform: translate(-50%, -50%) translateY(-120px);\n\
            -o-transform: translate(-50%, -50%) translateY(-120px);\n\
            transform: translate(-50%, -50%) translateY(-120px);\n\
            z-index: 90000001;\
            font-size: 14px;\n\
            font-family: Arial;\n\
            font-weight: bolder;\n\
            color: rgba(0, 0, 0, 0.67);\n\
            white-space: initial;\n\
          }\
          .wv-progress .wv-progress-button {\
            background: #fff;\n\
            color: #c0c0c0;\n\
            font-size: 18px;\n\
            font-family: Arial;\n\
            -webkit-border-radius: 5px;\n\
            -moz-border-radius: 5px;\n\
            -ms-border-radius: 5px;\n\
            -o-border-radius: 5px;\n\
            border-radius: 5px;\n\
            padding: 10px 25px;\n\
            text-align: center;\n\
            -webkit-box-shadow: 0 0 15px rgba(0, 0, 0, 0.25);\n\
            box-shadow: 0 0 15px rgba(0, 0, 0, 0.25);\n\
            position: fixed; top: 50%; left: 50%;\
            -webkit-transform: translate(-50%, -50%) translatey(120px);\n\
            -ms-transform: translate(-50%, -50%) translatey(120px);\n\
            -o-transform: translate(-50%, -50%) translatey(120px);\n\
            transform: translate(-50%, -50%) translatey(120px);\n\
            z-index: 90000001;\
          }\
        </style>\
      </div>').get(0)
    $('body').eq(0).append(app.config().node)
    app.hide()
    $(app.button()).on('click', function () {
      if (typeof (Android) === 'object' && Android && typeof (Android.device) === 'function') {
        // var ad = Android.device()
        if (typeof (Android.trigger) === 'function') {
          Android.trigger((app.button().getAttribute('attr-event-click') || 'button-click'), [])
        }
      }
    })
  })
  app.bind('label', function (v) {
    switch (typeof (v)) {
      case 'boolean':
        app.label().style.display = (v ? '' : 'none')
        break
      case 'string':
        app.label().innerHTML = v
        break
      default:
        return app.node().querySelector('.wv-progress-label')
    }
  })
  app.bind('button', function (v) {
    switch (typeof (v)) {
      case 'boolean':
        app.button().style.display = (v ? '' : 'none')
        break
      case 'string':
        app.button().innerHTML = v
        break
      case 'object':
        if (v && typeof (v.eventName) === 'string') {
          app.button().setAttribute('attr-event-click', v.eventName)
        }
        break
      default:
        return app.node().querySelector('.wv-progress-button')
    }
  })

  app.bind('progress', function (v) {
    switch (typeof (v)) {
      case 'boolean':
        app.progress().style.display = (v ? '' : 'none')
        break
      default:
        return app.node().querySelector('.wv-progress-bg')
    }
  })
  app.bind('hide', function () {
    var n = app.node()
    if (n) n.style.display = 'none'
  })
  app.bind('show', function () {
    var n = app.node()
    if (n) n.style.display = ''
  })

  App.init(function () {
    app.init()
  })
  App.bind('progressPanel', function () {
    return app
  }, '')
})(App))

/**
 * defining Map
 */
;((function (App) {
  var app = new ApplicationPrototype()
  App.bind('Map', function () {
    return app
  }, '')
  ;((function () {
    var config = {
      vectorLayer: undefined,
      lineLayer: undefined,
      markers_before: undefined,
      markers: undefined,
      rawObject: undefined
    }
    app.bind('config', function () {
      return config
    }, '')
  })())

  app.bind('raw', function () {
    return this.config().rawObject
  })

  app.bind('init', function () {
    App.log('log', 'Map init')
    App.log('log', 'GCUI ' + GCUI != null)

    var options = {
      server: 'http://gcweb.geoconcept.com/gws/wmts',
      layer: 'France',
      x: 601106,
      y: 2428909,
      layerOptions: {
        eventListeners: {
          'tileloadstart': onTileLoadStart,
          'tileloaded': onTileLoaded,
          'init': onBaseLayerLoaded
        }
      }
    }
    var map = new GCUI.Map('map', options)
    var c = new OpenLayers.Control.Click()
    map.addControl(c)
    c.activate()
    app.config().rawObject = map

    map.onEvent('load', function () {
      var vectorLayer = new OpenLayers.Layer.Vector('Marker')
      vectorLayer.events.on({
        featureselected: function (evt) {
          var feature = evt.feature
          App.log('log', 'On marker selected: ' + feature.attributes.id)
          Android.trigger('OnMarkerSelected', feature.attributes)
        },
        featureunselected: function (e) {
          App.log('log', 'On marker unselected')
        }
      })

      var hoverCtrl = new OpenLayers.Control.SelectFeature(vectorLayer, {
        hover: false,
        autoActivate: true
      })
      map.addControl(hoverCtrl)

      app.config().vectorLayer = vectorLayer

      app.bind('vectorLayer', function () {
        return app.config().vectorLayer
      }, '')

      var lineLayer = new OpenLayers.Layer.Vector('Lines')
      app.config().lineLayer = lineLayer
      app.bind('lineLayer', function () {
        return app.config().lineLayer
      }, '')

      // add layer markers
      /* eslint-disable */
      var markers_before = new OpenLayers.Layer.Vector('Marker')
      app.config().markers_before = markers_before
      app.bind('markersLayer_before', function () {
        return app.config().markers_before
      }, '')

      // add layer markers
      /* eslint-disable */
      var markers_after = new OpenLayers.Layer.Vector('Marker')
      app.config().markers_after = markers_after
      app.bind('markersLayer_after', function () {
        return app.config().markers_after
      }, '')
      markers_after.events.on({
        featureselected: function (evt) {
          var feature = evt.feature
          App.log('log', 'On marker selected: ' + feature.attributes.id)
          Android.trigger('OnMarkerSelected', feature.attributes)
        },
        featureunselected: function (e) {
          App.log('log', 'On marker unselected')
        }
      })
      /* eslint-disable */
      var markersAfterHoverCtrl = new OpenLayers.Control.SelectFeature(vectorLayer, {
        hover: false,
        autoActivate: true
      })

      map.addLayer(markers_before)
      map.addLayer(lineLayer)
      map.addLayer(vectorLayer)
      map.addLayer(marker_after)
      hoverCtrl.activate()
      map.addControl(markers_afterHoverCtrl)
      markers_afterHoverCtrl.activate()
      app.emit('load')
    })
  })

  App.init(function () { app.init() })
})(App))

// define App.Map Methods

App.Map().bind('getMarkersLayer', function (index) {
  if (typeof (index) !== 'string') {
    return App.Map().vectorLayer()
  }
  return ((App.Map()['markersLayer' + index])())
}, '')

App.Map().bind('getMarkersRaw', function (index) {
  return App.Map().getMarkersLayer(index).features
}, '')

App.Map().bind('getMarkers', function (filter, index) {
  var markers = App.Map().getMarkersRaw(index)
  if (typeof (filter) === 'function') {
    markers = markers.filter(filter)
  } else if (['string', 'number'].indexOf(typeof (filter)) !== -1) {
    markers = markers.filter(function (marker) {
      return marker.data.id === filter
    })
  }
  return markers.map(function (markerRaw) {
    return {
      id: function () { return markerRaw.data.id },
      data: function () { return markerRaw.data.data || {} },
      raw: markerRaw,

      atPoint: function () { return markerRaw.atPoint.apply(markerRaw, arguments) },
      clone: function () { return markerRaw.clone.apply(markerRaw, arguments) },
      createMarker: function () { return markerRaw.createMarker.apply(markerRaw, arguments) },
      createPopup: function () { return markerRaw.createPopup.apply(markerRaw, arguments) },
      destroy: function () { return markerRaw.destroy.apply(markerRaw, arguments) },
      destroyMarker: function () { return markerRaw.destroyMarker.apply(markerRaw, arguments) },
      destroyPopup: function () { return markerRaw.destroyPopup.apply(markerRaw, arguments) },
      getVisibility: function () { return markerRaw.getVisibility.apply(markerRaw, arguments) },
      move: function () { return markerRaw.move.apply(markerRaw, arguments) },
      onScreen: function () { return markerRaw.onScreen.apply(markerRaw, arguments) },
      toState: function () { return markerRaw.toState.apply(markerRaw, arguments) }
    }
  })
}, '')

/**
 * Marker structure
 * {
    "id": "string",
    "iconUrl": "string",
    "location": {
      "latitude": 34.345345,
      "longitude": 4.343534
    }
  }
 */
App.Map().bind('addMarkers', function (markers, index) {
  markers.forEach(function (marker) {
    App.Map().getMarkers(marker.id, index).forEach(function (marker) {
      marker.destroy()
    })
  })
  markers.forEach(function (marker) {
    App.log('info', 'Add marker path: ', marker)
    var point

    if (marker.gps) {
      // transform coords from GPS to map projection
      var lonlat = new OpenLayers.LonLat(marker.location.longitude, marker.location.latitude).transform(
        new OpenLayers.Projection('EPSG:4326'),
        new OpenLayers.Projection('EPSG:27572')
      )
      point = new OpenLayers.Geometry.Point(lonlat.lon, lonlat.lat)
    } else {
      point = new OpenLayers.Geometry.Point(marker.location.latitude, marker.location.longitude)
    }

    var feature = new OpenLayers.Feature.Vector(
      point,
      {
        id: marker.id,
        data: marker.data || {}
      }, {
        externalGraphic: marker.iconUrl,
        graphicWidth: marker.iconSize || 32,
        graphicHeight: marker.iconSize || 32,
        graphicXOffset: marker.iconXOffset || undefined,
        graphicYOffset: marker.iconYOffset || undefined
      }
    )
    App.Map().getMarkersLayer(index).addFeatures(feature)

    // used for drawing number on marker, to uncomment when implemented properly

    if (marker.iconText && marker.iconUrl) {
      App.Image().URL2Canvas(marker.iconUrl, (marker.iconSize || 32), function (canvas) {
        App.Image().CanvasText(canvas, marker.iconText)
        feature.style.externalGraphic = canvas.toDataURL()
        App.Map().getMarkersLayer(index).redraw()
      })
    }
  })
})

App.Map().bind('removeMarkers', function (ids, index) {
  var markers = App.Map().getMarkers(undefined, index)
  markers.forEach(function (marker) {
    if (ids.indexOf(marker.id()) !== -1) {
      marker.destroy()
    }
  })
})

App.Map().bind('removeAllMarkers', function (removeLocationMarker, index) {
  if (!index) {
    index = [ true, '_before', '_after' ]
  }
  if (!Array.isArray(index)) {
    index = [index]
  }
  index.forEach(function (index) {
    var markers = App.Map().getMarkers(undefined, index)
    markers.forEach(function (marker) {
      if (removeLocationMarker || marker.id() !== 'location-marker') {
        marker.destroy()
      }
    })
  })
})

App.Map().bind('addMyLocationMarker', function (marker) {
  App.Map().removeMyLocationMarker()
  marker.id = 'location-marker'
  App.Map().addMarkers([marker], '_before')
})

App.Map().bind('removeMyLocationMarker', function () {
  var markers = App.Map().getMarkers(undefined, '_before')
  markers.forEach(function (marker) {
    if (marker.id() === 'location-marker') {
      marker.destroy()
    }
  })
})

App.Map().bind('updateMyLocationMarker', function (marker) {
  marker.id = 'location-marker'
  App.Map().updateMarkers([marker], '_before')
})

App.Map().bind('updateMarkers', function (markers, index) {
  markers.forEach(function (marker) {
    App.Map().getMarkers(marker.id, index).forEach(function (markerInfo) {
      console.info(marker, markerInfo)
      // debugger
      // location update
      if ('location' in marker) {
        var point = false
        // var epsg4326 = new OpenLayers.Projection('EPSG:4326')
        // var epsg900913 = new OpenLayers.Projection('EPSG:900913')
        if ('latitude' in marker.location && 'longitude' in marker.location) {
          if (marker.gps) {
            // transform coords from GPS to map projection
            var lonlat = new OpenLayers.LonLat(marker.location.longitude, marker.location.latitude).transform(
              new OpenLayers.Projection('EPSG:4326'),
              new OpenLayers.Projection('EPSG:27572')
            )
            point = new OpenLayers.Geometry.Point(lonlat.lon, lonlat.lat)
          } else {
            point = new OpenLayers.Geometry.Point(marker.location.latitude, marker.location.longitude)
          }
        }

        if (point) {
          markerInfo.move(point)
        }
      }
      // data update
      if (typeof (marker.data) === 'object' && marker.data) {
        $.extend(markerInfo.data(), marker.data)
      }
    })
  })
})

App.Map().bind('getLinesRaw', function () {
  return App.Map().lineLayer().features
}, '')

App.Map().bind('addLines', function (coords, style) {
  if (coords.length > 1) {
    var points = []
    var initialPoints = coords.map(function (coord) {
      return new OpenLayers.Geometry.Point(coord.latitude, coord.longitude)
    })

    // in case there is connection, try drawing route, if not, draw plain lines
    if (AndroidDevice.isOnline()) {
      // draw route
      var routeLayer = new OpenLayers.Layer.Vector('routeLayer',
        OpenLayers.Util.extend(OpenLayers.Feature.Vector.style, {
          'default': {
            strokeWidth: style.strokeWidth,
            strokeColor: style.strokeColor
          }
        }))
      // trying to add route
      var route = new GCUI.Control.Route({
        autoActivate: true,
        layer: routeLayer // App.Map().lineLayer()
      })
      var map = GCUI.getMap('map')
      // start/end points
      var startPointGeo = initialPoints[0]
      var endPointGeo = initialPoints[1]
      // transform coords from map projection to GPS
      var startLonLat = new OpenLayers.LonLat(startPointGeo.x, startPointGeo.y).transform(
        new OpenLayers.Projection('EPSG:27572'),
        new OpenLayers.Projection('EPSG:4326')
      )

      var endLonLat = new OpenLayers.LonLat(endPointGeo.x, endPointGeo.y).transform(
        new OpenLayers.Projection('EPSG:27572'),
        new OpenLayers.Projection('EPSG:4326')
      )
      // important: without it downloads empty points
      map.addLayer(routeLayer)
      map.addControl(route)
      // request route async
      route.route({
        origin: startLonLat,
        destination: endLonLat,
        callback: function (resp, options) {
          // this.displayRoute(resp); // this == the route control
          try {
            points = extractRoutePoints(resp)
            drawLine(points, style)
          } catch (err) { // backup
            console.log(err)
            // draw simple lines
            drawLine(initialPoints, style)
          }
        },
        format: 'EXTENDED',
        version: '/v2'
      })
    } else {
      drawLine(initialPoints, style)
    }
  }
})

function extractRoutePoints (route) {
  var points = []
  var index = 0
  var legs = route.legs
  for (var i = 0; i < legs.length; i++) {
    var leg = legs[i]
    var steps = leg.steps
    for (var j = 0; j < steps.length; j++) {
      var step = steps[j]
      for (var k = 0; k < step.points.length; k++) {
        var pt = step.points[k].split(',')
        points[index] = new OpenLayers.Geometry.Point(pt[0], pt[1]).transform(new OpenLayers.Projection('EPSG:4326'), new OpenLayers.Projection('EPSG:27572'))
        index++
      }
    }
  }

  return points
}

function drawLine (points, style) {
  var line = new OpenLayers.Feature.Vector(
    new OpenLayers.Geometry.LineString(points),
    null,
    $.extend({
      fillOpacity: 0.2,
      graphicOpacity: 1,
      strokeColor: '#232323',
      strokeWidth: 3,
      strokeDashstyle: 'dashdot',
      pointRadius: 6,
      pointerEvents: 'visiblePainted',
      title: '...'
    }, (style || {}))
  )
  App.Map().lineLayer().addFeatures([line])
}

App.Map().bind('removeLines', function () {
  App.Map()
    .getLinesRaw()
    .forEach(line => line.destroy())
})

App.Map().bind('getZoomLevel', function () {
  var map = App.Map().raw()
  var zoomLevel = map.getZoom()
  return zoomLevel
})

App.Map().bind('setZoomLevel', function (zoomLevel) {
  var map = App.Map().raw()
  map.zoomTo(zoomLevel)
})

App.Map().bind('setZoomFit', function () {
  var fitSize = App.Map().vectorLayer().getDataExtent() || App.Map().lineLayer().getDataExtent()
  if (fitSize) {
    App.Map().raw().zoomToExtent(
      fitSize
    )
  }
  setTimeout(function () {
    App.Map().emit('afterSetZoomFitDelayed')
  }, 3000)
})

// Attaching events
App.Map().on('load', function () {
  Android.trigger('MapLoaded')
})

App.Map().on('load', function () {
  App.log('log', 'On map loaded')
})

Android.on('MapAddMarkers', function (markers, index) {
  App.Map().addMarkers(markers, index)
})

Android.on('MapUpdateMarkers', function (markers, index) {
  App.Map().updateMarkers(markers, index)
})

Android.on('MapRemoveAllMarkers', function (removeLocationMarker, index) {
  App.Map().removeAllMarkers(!!removeLocationMarker, index)
})

Android.on('MapAddMyLocationMarker', function (marker) {
  App.Map().addMyLocationMarker(marker)
})

Android.on('MapUpdateMyLocationMarker', function (marker) {
  App.Map().updateMyLocationMarker(marker)
})

Android.on('MapRemoveMyLocationMarker', function () {
  App.Map().removeMyLocationMarker()
})

Android.on('MapGetMarkers', function () {
  Android.trigger('MapGetMarkers', App.Map().getMarkers().map(function (markerInfo) {
    return {
      id: markerInfo.id(),
      data: markerInfo.data()
    }
  })
  )
})

Android.on('MapRemoveMarkers', function (ids, index) {
  App.Map().removeMarkers(ids, index)
})

Android.on('MapZoom', function (zoom) {
  var level = ((zoom || {}).level || App.Map().getZoomLevel())
  if (level === 'fit') {
    App.Map().setZoomFit()
  } else {
    App.Map().setZoomLevel(
      level
    )
  }
})

App.Map().on('afterSetZoomFitDelayed', function () {
  Android.trigger('AfterZoomToFit', [])
})

Android.on('MapAddLines', function (config) {
  App.Map().addLines((config.coords || []), (config.style || {}))
})

Android.on('MapRemoveLines', function () {
  App.Map().removeLines()
})

OpenLayers.Control.Click = OpenLayers.Class(OpenLayers.Control, {
  defaultHandlerOptions: {
    'single': true,
    'double': false,
    'pixelTolerance': 0,
    'stopSingle': false,
    'stopDouble': false
  },

  initialize: function (options) {
    this.handlerOptions = OpenLayers.Util.extend({},
      this.defaultHandlerOptions)
    OpenLayers.Control.prototype.initialize.apply(this,
      arguments)
    this.handler = new OpenLayers.Handler.Click(this, {
      'click': this.trigger
    }, this.handlerOptions)
  },

  trigger: function (e) {
    var map = GCUI.getMap('map')
    var lonlat = map.getLonLatFromPixel(e.xy)
    App.log('log', 'Map click x: ' + lonlat.lon + ' , y: ' + lonlat.lat, e)
    Android.trigger('OnMapClicked')
  }
})

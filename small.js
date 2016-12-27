/**
 * Generate the icon
 *
 * @param {Object} options
 *
 * {
 * iconUrl: 'sun.rays.small.png',
 * group: {
 *   count: 3,
 *   color: 'black',
 *   textColor: 'white'
 * },
 * index: {
 *   count: 1,
 *   color: 'black',
 *   textColor: 'white'
 * },
 * scale: 8
}
 *
 * @returns {Promise}
 */
function generateFeatureIcon (options) {
  return new Promise((resolve, reject) => {
    createCanvas()
      .then(canvas => insertIcon(canvas, options.iconUrl, options.group))
      .then(canvas => drawGroupSize(canvas, options.group, options.scale))
      .then(canvas => drawIndex(canvas, options.index, options.scale))
      .then(canvas => resolve(canvas))
      .catch(err => reject(err))
  })
}

/**
 * @param {Object} canvas
 * @param {String} url
 * @param {Object} group
 *
 * @returns {Promise}
 */
function insertIcon (canvas, url, group) {
  return new Promise((resolve, reject) => {
    if ((url !== null)) {
      let context = canvas.getContext('2d')
      let img = document.createElement('img')
      img.src = url
      img.onload = function () {
        context.drawImage(img, 0, 0, 128, 128)
        resolve(canvas)
      }
    } else {
      resolve(canvas)
    }
  })
}

function createCanvas (donut) {
  return new Promise((resolve, reject) => {
    var canvas = document.createElement('canvas')
    canvas.width = 128
    canvas.height = 128

    resolve(canvas)
  })
}

function drawGroupSize (canvas, group, scale) {
  return new Promise((resolve, reject) => {
    if (group.count > 1) {
      var context = canvas.getContext('2d')
      var radius = 7 * scale
      var arcX = canvas.width / 2
      var arcY = canvas.height / 2
      var x = arcX
      var y = arcY + radius / 2
      context.fillStyle = group.color
      context.mozImageSmoothingEnabled = true
      context.webkitImageSmoothingEnabled = true
      context.msImageSmoothingEnabled = true
      context.imageSmoothingEnabled = true
      context.beginPath()
      context.strokeColor = 'black'
      context.strokeSize = '2px'
      context.arc(arcX, arcY, radius, 0, 2 * Math.PI, 0)
      context.fill()
      context.font = (11 * scale) + 'px tahoma'
      context.textAlign = 'center'
      context.fillStyle = group.textColor
      context.fillText(group.count, x, y)
    }
    resolve(canvas)
  })
}

function drawIndex (canvas, index, ratioSize) {
  return new Promise((resolve, reject) => {
    var context = canvas.getContext('2d')
    var x = canvas.width - 7 * ratioSize
    var y = 11 * ratioSize
    context.fillStyle = index.color
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
    context.fillStyle = index.textColor
    context.fillText(index.count, x, y)
    resolve(canvas)
  })
}

function clone (object) {
  return JSON.parse(JSON.stringify(object))
}

var configs = [1, 2, 3, 4, 5, 6, 4, 3, 4]

var featureOptions = {
  iconUrl: 'ic_int_planned_32dp.png',
  group: {
    count: 0,
    color: 'black',
    textColor: 'white'
  },
  index: {
    count: 1,
    color: 'black',
    textColor: 'white'
  },
  scale: 4
}

configs.forEach((config, index) => {
  var options = clone(featureOptions)
  options.group.count = config
  options.index.count = index
  generateFeatureIcon(options)
    .then(canvas => {
      var ctx = canvas.getContext('2d')
      var img = new Image()
      img.onload = function () {
        ctx.drawImage(canvas, 0, 0)
      }
      img.src = canvas.toDataURL()
      document.body.appendChild(img)
      document.body.style = 'background: gray'
    })
    .catch(err => console.error(err))
})

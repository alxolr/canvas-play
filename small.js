/**
 * @param {Object} options
 * {
 *  url: String,
 *  groupSize: Number,
 *  index: Number,
 *  scale: Number,
 *  color: String
 * }
 */
function generateFeatureIcon (options) {
  return new Promise((resolve, reject) => {
    drawDonut(256, options.color)
      .then(canvas => insertIcon(canvas, options.url))
      .then(canvas => drawGroupSize(canvas, options.groupSize, options.scale))
      .then(canvas => drawIndex(canvas, options.index, options.scale))
      .then(canvas => resolve(canvas))
      .catch(err => reject(err))
  })
}

function insertIcon (canvas, url) {
  return new Promise((resolve, reject) => {
    let context = canvas.getContext('2d')
    let img = document.createElement('img')
    img.src = url
    img.onload = function () {
      context.drawImage(img, 64, 64, 128, 128)
      resolve(canvas)
    }
  })
}

function drawDonut (size, color) {
  return new Promise((resolve, reject) => {
    var canvas = document.createElement('canvas')
    var arc = size / 2
    var ctx = canvas.getContext('2d')
    ctx.mozImageSmoothingEnabled = true
    ctx.webkitImageSmoothingEnabled = true
    ctx.msImageSmoothingEnabled = true
    ctx.imageSmoothingEnabled = true
    canvas.width = size
    canvas.height = size
    ctx.beginPath()
    ctx.arc(arc, arc, arc, 0, Math.PI * 2, false)
    ctx.fillStyle = '#ffffff'
    ctx.fill()
    ctx.arc(arc, arc, arc * 0.75, 0, Math.PI * 2, true)
    ctx.closePath()
    ctx.fillStyle = color
    ctx.fill()
    resolve(canvas)
  })
}

function drawGroupSize (canvas, size, scale) {
  return new Promise((resolve, reject) => {
    if (size > 1) {
      var context = canvas.getContext('2d')
      var radius = 7 * scale
      var width = canvas.width
      var height = canvas.height
      var arcX = width / 2
      var arcY = height / 2
      var x = arcX
      var y = arcY + radius / 2
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
      context.fillStyle = 'white'
      context.fillText(size, x, y)
    }
    resolve(canvas)
  })
}

function drawIndex (canvas, index, ratioSize) {
  return new Promise((resolve, reject) => {
    var context = canvas.getContext('2d')
    var x = canvas.width - 7 * ratioSize
    var y = 11 * ratioSize
    context.fillStyle = '#000000'
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
    context.fillText(index, x, y)
    resolve(canvas)
  })
}

generateFeatureIcon({
  url: 'sun.rays.small.png',
  groupSize: 0,
  index: 1,
  scale: 7,
  color: '#000000'
}).then(canvas => {
  var img = document.createElement('img')
  img.src = canvas.toDataURL()

  document.body.appendChild(img)
})

/**
 * Generate the icon
 *
 * @param {Object} options
 *
 * {
 * iconUrl: 'sun.rays.small.png',
 * donut: {
 *   size: 256,
 *   color: 'black'
 * },
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
 * @returns
 */
function generateFeatureIcon (options) {
  return new Promise((resolve, reject) => {
    drawDonut(options.donut)
      .then(canvas => insertIcon(canvas, options.iconUrl, options.group))
      .then(canvas => drawGroupSize(canvas, options.group, options.scale))
      .then(canvas => drawIndex(canvas, options.index, options.scale))
      .then(canvas => resolve(canvas))
      .catch(err => reject(err))
  })
}

function insertIcon (canvas, url, group) {
  return new Promise((resolve, reject) => {
    if ((group.count <= 1) && (url !== null)) {
      let context = canvas.getContext('2d')
      let img = document.createElement('img')
      img.src = url
      img.onload = function () {
        context.drawImage(img, 48, 48, 160, 160)
        resolve(canvas)
      }
    } else {
      resolve(canvas)
    }
  })
}

function drawDonut (donut) {
  return new Promise((resolve, reject) => {
    var canvas = document.createElement('canvas')
    var arc = donut.size / 2
    var ctx = canvas.getContext('2d')
    ctx.mozImageSmoothingEnabled = true
    ctx.webkitImageSmoothingEnabled = true
    ctx.msImageSmoothingEnabled = true
    ctx.imageSmoothingEnabled = true
    canvas.width = donut.size
    canvas.height = donut.size
    ctx.beginPath()
    ctx.arc(arc, arc, arc, 0, Math.PI * 2, false)
    ctx.fillStyle = '#ffffff'
    ctx.fill()
    ctx.arc(arc, arc, arc * 0.75, 0, Math.PI * 2, true)
    ctx.closePath()
    ctx.fillStyle = donut.color
    ctx.fill()
    resolve(canvas)
  })
}

function drawGroupSize (canvas, group, scale) {
  return new Promise((resolve, reject) => {
    if (group.count > 1) {
      var context = canvas.getContext('2d')
      var radius = 7 * scale
      var width = canvas.width
      var height = canvas.height
      var arcX = width / 2
      var arcY = height / 2
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

let featureOptions = {
  iconUrl: 'sun.rays.small.png',
  donut: {
    size: 256,
    color: 'black'
  },
  group: {
    count: 3,
    color: 'black',
    textColor: 'white'
  },
  index: {
    count: 1,
    color: 'black',
    textColor: 'white'
  },
  scale: 8
}

generateFeatureIcon(featureOptions).then(canvas => {
  var img = document.createElement('img')
  img.src = canvas.toDataURL()

  var second = document.createElement('img')
  second.src = img.src
  second.width = 128

  document.body.appendChild(img)
  document.body.appendChild(second)
  document.body.style = 'background: gray'
})

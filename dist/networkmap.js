/* svg.js 1.1.0 - svg selector inventor polyfill regex default color array pointarray patharray number viewbox bbox rbox element parent container fx relative event defs group arrange mask clip gradient pattern doc shape symbol use rect ellipse line poly path image text textpath nested hyperlink marker sugar set data memory helpers - svgjs.com/license */
;(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(factory);
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    root.SVG = factory();
  }
}(this, function() {

  var SVG = this.SVG = function(element) {
    if (SVG.supported) {
      element = new SVG.Doc(element)
  
      if (!SVG.parser)
        SVG.prepare(element)
  
      return element
    }
  }
  
  // Default namespaces
  SVG.ns    = 'http://www.w3.org/2000/svg'
  SVG.xmlns = 'http://www.w3.org/2000/xmlns/'
  SVG.xlink = 'http://www.w3.org/1999/xlink'
  
  // Element id sequence
  SVG.did  = 1000
  
  // Get next named element id
  SVG.eid = function(name) {
    return 'Svgjs' + name.charAt(0).toUpperCase() + name.slice(1) + (SVG.did++)
  }
  
  // Method for element creation
  SVG.create = function(name) {
    /* create element */
    var element = document.createElementNS(this.ns, name)
    
    /* apply unique id */
    element.setAttribute('id', this.eid(name))
    
    return element
  }
  
  // Method for extending objects
  SVG.extend = function() {
    var modules, methods, key, i
    
    /* get list of modules */
    modules = [].slice.call(arguments)
    
    /* get object with extensions */
    methods = modules.pop()
    
    for (i = modules.length - 1; i >= 0; i--)
      if (modules[i])
        for (key in methods)
          modules[i].prototype[key] = methods[key]
  
    /* make sure SVG.Set inherits any newly added methods */
    if (SVG.Set && SVG.Set.inherit)
      SVG.Set.inherit()
  }
  
  // Initialize parsing element
  SVG.prepare = function(element) {
    /* select document body and create invisible svg element */
    var body = document.getElementsByTagName('body')[0]
      , draw = (body ? new SVG.Doc(body) : element.nested()).size(2, 0)
      , path = SVG.create('path')
  
    /* insert parsers */
    draw.node.appendChild(path)
  
    /* create parser object */
    SVG.parser = {
      body: body || element.parent
    , draw: draw.style('opacity:0;position:fixed;left:100%;top:100%;overflow:hidden')
    , poly: draw.polyline().node
    , path: path
    }
  }
  
  // svg support test
  SVG.supported = (function() {
    return !! document.createElementNS &&
           !! document.createElementNS(SVG.ns,'svg').createSVGRect
  })()
  
  if (!SVG.supported) return false


  SVG.get = function(id) {
    var node = document.getElementById(idFromReference(id) || id)
    if (node) return node.instance
  }

  SVG.invent = function(config) {
  	/* create element initializer */
  	var initializer = typeof config.create == 'function' ?
  		config.create :
  		function() {
  			this.constructor.call(this, SVG.create(config.create))
  		}
  
  	/* inherit prototype */
  	if (config.inherit)
  		initializer.prototype = new config.inherit
  
  	/* extend with methods */
  	if (config.extend)
  		SVG.extend(initializer, config.extend)
  
  	/* attach construct method to parent */
  	if (config.construct)
  		SVG.extend(config.parent || SVG.Container, config.construct)
  
  	return initializer
  }

  if (typeof CustomEvent !== 'function') {
    // Code from: https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent
    var CustomEvent = function(event, options) {
      options = options || { bubbles: false, cancelable: false, detail: undefined }
      var e = document.createEvent('CustomEvent')
      e.initCustomEvent(event, options.bubbles, options.cancelable, options.detail)
      return e
    }
  
    CustomEvent.prototype = window.Event.prototype
  
    window.CustomEvent = CustomEvent
  }
  
  // requestAnimationFrame / cancelAnimationFrame Polyfill with fallback based on Paul Irish
  (function(w) {
    var lastTime = 0
    var vendors = ['moz', 'webkit']
    
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
      w.requestAnimationFrame = w[vendors[x] + 'RequestAnimationFrame']
      w.cancelAnimationFrame  = w[vendors[x] + 'CancelAnimationFrame'] ||
                                w[vendors[x] + 'CancelRequestAnimationFrame']
    }
   
    w.requestAnimationFrame = w.requestAnimationFrame || 
      function(callback) {
        var currTime = new Date().getTime()
        var timeToCall = Math.max(0, 16 - (currTime - lastTime))
        
        var id = w.setTimeout(function() {
          callback(currTime + timeToCall)
        }, timeToCall)
        
        lastTime = currTime + timeToCall
        return id
      }
   
    w.cancelAnimationFrame = w.cancelAnimationFrame || w.clearTimeout;
  
  }(window))

  SVG.regex = {
    /* parse unit value */
    unit:         /^(-?[\d\.]+)([a-z%]{0,2})$/
    
    /* parse hex value */
  , hex:          /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i
    
    /* parse rgb value */
  , rgb:          /rgb\((\d+),(\d+),(\d+)\)/
    
    /* parse reference id */
  , reference:    /#([a-z0-9\-_]+)/i
  
    /* test hex value */
  , isHex:        /^#[a-f0-9]{3,6}$/i
    
    /* test rgb value */
  , isRgb:        /^rgb\(/
    
    /* test css declaration */
  , isCss:        /[^:]+:[^;]+;?/
    
    /* test for blank string */
  , isBlank:      /^(\s+)?$/
    
    /* test for numeric string */
  , isNumber:     /^-?[\d\.]+$/
  
    /* test for percent value */
  , isPercent:    /^-?[\d\.]+%$/
  
    /* test for image url */
  , isImage:      /\.(jpg|jpeg|png|gif)(\?[^=]+.*)?/i
    
    /* test for namespaced event */
  , isEvent:      /^[\w]+:[\w]+$/
  
  }

  SVG.defaults = {
    // Default matrix
    matrix:       '1 0 0 1 0 0'
    
    // Default attribute values
  , attrs: {
      /* fill and stroke */
      'fill-opacity':     1
    , 'stroke-opacity':   1
    , 'stroke-width':     0
    , 'stroke-linejoin':  'miter'
    , 'stroke-linecap':   'butt'
    , fill:               '#000000'
    , stroke:             '#000000'
    , opacity:            1
      /* position */
    , x:                  0
    , y:                  0
    , cx:                 0
    , cy:                 0
      /* size */  
    , width:              0
    , height:             0
      /* radius */  
    , r:                  0
    , rx:                 0
    , ry:                 0
      /* gradient */  
    , offset:             0
    , 'stop-opacity':     1
    , 'stop-color':       '#000000'
      /* text */
    , 'font-size':        16
    , 'font-family':      'Helvetica, Arial, sans-serif'
    , 'text-anchor':      'start'
    }
    
    // Default transformation values
  , trans: function() {
      return {
        /* translate */
        x:        0
      , y:        0
        /* scale */
      , scaleX:   1
      , scaleY:   1
        /* rotate */
      , rotation: 0
        /* skew */
      , skewX:    0
      , skewY:    0
        /* matrix */
      , matrix:   this.matrix
      , a:        1
      , b:        0
      , c:        0
      , d:        1
      , e:        0
      , f:        0
      }
    }
    
  }

  SVG.Color = function(color) {
    var match
    
    /* initialize defaults */
    this.r = 0
    this.g = 0
    this.b = 0
    
    /* parse color */
    if (typeof color === 'string') {
      if (SVG.regex.isRgb.test(color)) {
        /* get rgb values */
        match = SVG.regex.rgb.exec(color.replace(/\s/g,''))
        
        /* parse numeric values */
        this.r = parseInt(match[1])
        this.g = parseInt(match[2])
        this.b = parseInt(match[3])
        
      } else if (SVG.regex.isHex.test(color)) {
        /* get hex values */
        match = SVG.regex.hex.exec(fullHex(color))
  
        /* parse numeric values */
        this.r = parseInt(match[1], 16)
        this.g = parseInt(match[2], 16)
        this.b = parseInt(match[3], 16)
  
      }
      
    } else if (typeof color === 'object') {
      this.r = color.r
      this.g = color.g
      this.b = color.b
      
    }
      
  }
  
  SVG.extend(SVG.Color, {
    // Default to hex conversion
    toString: function() {
      return this.toHex()
    }
    // Build hex value
  , toHex: function() {
      return '#'
        + compToHex(this.r)
        + compToHex(this.g)
        + compToHex(this.b)
    }
    // Build rgb value
  , toRgb: function() {
      return 'rgb(' + [this.r, this.g, this.b].join() + ')'
    }
    // Calculate true brightness
  , brightness: function() {
      return (this.r / 255 * 0.30)
           + (this.g / 255 * 0.59)
           + (this.b / 255 * 0.11)
    }
    // Make color morphable
  , morph: function(color) {
      this.destination = new SVG.Color(color)
  
      return this
    }
    // Get morphed color at given position
  , at: function(pos) {
      /* make sure a destination is defined */
      if (!this.destination) return this
  
      /* normalise pos */
      pos = pos < 0 ? 0 : pos > 1 ? 1 : pos
  
      /* generate morphed color */
      return new SVG.Color({
        r: ~~(this.r + (this.destination.r - this.r) * pos)
      , g: ~~(this.g + (this.destination.g - this.g) * pos)
      , b: ~~(this.b + (this.destination.b - this.b) * pos)
      })
    }
    
  })
  
  // Testers
  
  // Test if given value is a color string
  SVG.Color.test = function(color) {
    color += ''
    return SVG.regex.isHex.test(color)
        || SVG.regex.isRgb.test(color)
  }
  
  // Test if given value is a rgb object
  SVG.Color.isRgb = function(color) {
    return color && typeof color.r == 'number'
                 && typeof color.g == 'number'
                 && typeof color.b == 'number'
  }
  
  // Test if given value is a color
  SVG.Color.isColor = function(color) {
    return SVG.Color.isRgb(color) || SVG.Color.test(color)
  }

  SVG.Array = function(array, fallback) {
    array = (array || []).valueOf()
  
    /* if array is empty and fallback is provided, use fallback */
    if (array.length == 0 && fallback)
      array = fallback.valueOf()
  
    /* parse array */
    this.value = this.parse(array)
  }
  
  SVG.extend(SVG.Array, {
    // Make array morphable
    morph: function(array) {
      this.destination = this.parse(array)
  
      /* normalize length of arrays */
      if (this.value.length != this.destination.length) {
        var lastValue       = this.value[this.value.length - 1]
          , lastDestination = this.destination[this.destination.length - 1]
  
        while(this.value.length > this.destination.length)
          this.destination.push(lastDestination)
        while(this.value.length < this.destination.length)
          this.value.push(lastValue)
      }
  
      return this
    }
    // Clean up any duplicate points
  , settle: function() {
      /* find all unique values */
      for (var i = 0, il = this.value.length, seen = []; i < il; i++)
        if (seen.indexOf(this.value[i]) == -1)
          seen.push(this.value[i])
  
      /* set new value */
      return this.value = seen
    }
    // Get morphed array at given position
  , at: function(pos) {
      /* make sure a destination is defined */
      if (!this.destination) return this
  
      /* generate morphed array */
      for (var i = 0, il = this.value.length, array = []; i < il; i++)
        array.push(this.value[i] + (this.destination[i] - this.value[i]) * pos)
  
      return new SVG.Array(array)
    }
    // Convert array to string
  , toString: function() {
      return this.value.join(' ')
    }
    // Real value
  , valueOf: function() {
      return this.value
    }
    // Parse whitespace separated string
  , parse: function(array) {
      array = array.valueOf()
  
      /* if already is an array, no need to parse it */
      if (Array.isArray(array)) return array
  
      return this.split(array)
    }
    // Strip unnecessary whitespace
  , split: function(string) {
      return string.replace(/\s+/g, ' ').replace(/^\s+|\s+$/g,'').split(' ') 
    }
    // Reverse array
  , reverse: function() {
      this.value.reverse()
  
      return this
    }
  
  })
  


  SVG.PointArray = function() {
    this.constructor.apply(this, arguments)
  }
  
  // Inherit from SVG.Array
  SVG.PointArray.prototype = new SVG.Array
  
  SVG.extend(SVG.PointArray, {
    // Convert array to string
    toString: function() {
      /* convert to a poly point string */
      for (var i = 0, il = this.value.length, array = []; i < il; i++)
        array.push(this.value[i].join(','))
  
      return array.join(' ')
    }
    // Get morphed array at given position
  , at: function(pos) {
      /* make sure a destination is defined */
      if (!this.destination) return this
  
      /* generate morphed point string */
      for (var i = 0, il = this.value.length, array = []; i < il; i++)
        array.push([
          this.value[i][0] + (this.destination[i][0] - this.value[i][0]) * pos
        , this.value[i][1] + (this.destination[i][1] - this.value[i][1]) * pos
        ])
  
      return new SVG.PointArray(array)
    }
    // Parse point string
  , parse: function(array) {
      array = array.valueOf()
  
      /* if already is an array, no need to parse it */
      if (Array.isArray(array)) return array
  
      /* split points */
      array = this.split(array)
  
      /* parse points */
      for (var i = 0, il = array.length, p, points = []; i < il; i++) {
        p = array[i].split(',')
        points.push([parseFloat(p[0]), parseFloat(p[1])])
      }
  
      return points
    }
    // Move point string
  , move: function(x, y) {
      var box = this.bbox()
  
      /* get relative offset */
      x -= box.x
      y -= box.y
  
      /* move every point */
      if (!isNaN(x) && !isNaN(y))
        for (var i = this.value.length - 1; i >= 0; i--)
          this.value[i] = [this.value[i][0] + x, this.value[i][1] + y]
  
      return this
    }
    // Resize poly string
  , size: function(width, height) {
      var i, box = this.bbox()
  
      /* recalculate position of all points according to new size */
      for (i = this.value.length - 1; i >= 0; i--) {
        this.value[i][0] = ((this.value[i][0] - box.x) * width)  / box.width  + box.x
        this.value[i][1] = ((this.value[i][1] - box.y) * height) / box.height + box.y
      }
  
      return this
    }
    // Get bounding box of points
  , bbox: function() {
      SVG.parser.poly.setAttribute('points', this.toString())
  
      return SVG.parser.poly.getBBox()
    }
  
  })

  SVG.PathArray = function(array, fallback) {
    this.constructor.call(this, array, fallback)
  }
  
  // Inherit from SVG.Array
  SVG.PathArray.prototype = new SVG.Array
  
  SVG.extend(SVG.PathArray, {
    // Convert array to string
    toString: function() {
      return arrayToString(this.value)
    }
    // Move path string
  , move: function(x, y) {
  		/* get bounding box of current situation */
  		var box = this.bbox()
  		
      /* get relative offset */
      x -= box.x
      y -= box.y
  
      if (!isNaN(x) && !isNaN(y)) {
        /* move every point */
        for (var l, i = this.value.length - 1; i >= 0; i--) {
          l = this.value[i][0]
  
          if (l == 'M' || l == 'L' || l == 'T')  {
            this.value[i][1] += x
            this.value[i][2] += y
  
          } else if (l == 'H')  {
            this.value[i][1] += x
  
          } else if (l == 'V')  {
            this.value[i][1] += y
  
          } else if (l == 'C' || l == 'S' || l == 'Q')  {
            this.value[i][1] += x
            this.value[i][2] += y
            this.value[i][3] += x
            this.value[i][4] += y
  
            if (l == 'C')  {
              this.value[i][5] += x
              this.value[i][6] += y
            }
  
          } else if (l == 'A')  {
            this.value[i][6] += x
            this.value[i][7] += y
          }
  
        }
      }
  
      return this
    }
    // Resize path string
  , size: function(width, height) {
  		/* get bounding box of current situation */
  		var i, l, box = this.bbox()
  
      /* recalculate position of all points according to new size */
      for (i = this.value.length - 1; i >= 0; i--) {
        l = this.value[i][0]
  
        if (l == 'M' || l == 'L' || l == 'T')  {
          this.value[i][1] = ((this.value[i][1] - box.x) * width)  / box.width  + box.x
          this.value[i][2] = ((this.value[i][2] - box.y) * height) / box.height + box.y
  
        } else if (l == 'H')  {
          this.value[i][1] = ((this.value[i][1] - box.x) * width)  / box.width  + box.x
  
        } else if (l == 'V')  {
          this.value[i][1] = ((this.value[i][1] - box.y) * height) / box.height + box.y
  
        } else if (l == 'C' || l == 'S' || l == 'Q')  {
          this.value[i][1] = ((this.value[i][1] - box.x) * width)  / box.width  + box.x
          this.value[i][2] = ((this.value[i][2] - box.y) * height) / box.height + box.y
          this.value[i][3] = ((this.value[i][3] - box.x) * width)  / box.width  + box.x
          this.value[i][4] = ((this.value[i][4] - box.y) * height) / box.height + box.y
  
          if (l == 'C')  {
            this.value[i][5] = ((this.value[i][5] - box.x) * width)  / box.width  + box.x
            this.value[i][6] = ((this.value[i][6] - box.y) * height) / box.height + box.y
          }
  
        } else if (l == 'A')  {
          /* resize radii */
          this.value[i][1] = (this.value[i][1] * width)  / box.width
          this.value[i][2] = (this.value[i][2] * height) / box.height
  
          /* move position values */
          this.value[i][6] = ((this.value[i][6] - box.x) * width)  / box.width  + box.x
          this.value[i][7] = ((this.value[i][7] - box.y) * height) / box.height + box.y
        }
  
      }
  
      return this
    }
    // Absolutize and parse path to array
  , parse: function(array) {
      /* if it's already is a patharray, no need to parse it */
      if (array instanceof SVG.PathArray) return array.valueOf()
  
      /* prepare for parsing */
      var i, il, x0, y0, x1, y1, x2, y2, s, seg, segs
        , x = 0
        , y = 0
      
      /* populate working path */
      SVG.parser.path.setAttribute('d', typeof array === 'string' ? array : arrayToString(array))
      
      /* get segments */
      segs = SVG.parser.path.pathSegList
  
      for (i = 0, il = segs.numberOfItems; i < il; ++i) {
        seg = segs.getItem(i)
        s = seg.pathSegTypeAsLetter
  
        /* yes, this IS quite verbose but also about 30 times faster than .test() with a precompiled regex */
        if (s == 'M' || s == 'L' || s == 'H' || s == 'V' || s == 'C' || s == 'S' || s == 'Q' || s == 'T' || s == 'A') {
          if ('x' in seg) x = seg.x
          if ('y' in seg) y = seg.y
  
        } else {
          if ('x1' in seg) x1 = x + seg.x1
          if ('x2' in seg) x2 = x + seg.x2
          if ('y1' in seg) y1 = y + seg.y1
          if ('y2' in seg) y2 = y + seg.y2
          if ('x'  in seg) x += seg.x
          if ('y'  in seg) y += seg.y
  
          if (s == 'm')
            segs.replaceItem(SVG.parser.path.createSVGPathSegMovetoAbs(x, y), i)
          else if (s == 'l')
            segs.replaceItem(SVG.parser.path.createSVGPathSegLinetoAbs(x, y), i)
          else if (s == 'h')
            segs.replaceItem(SVG.parser.path.createSVGPathSegLinetoHorizontalAbs(x), i)
          else if (s == 'v')
            segs.replaceItem(SVG.parser.path.createSVGPathSegLinetoVerticalAbs(y), i)
          else if (s == 'c')
            segs.replaceItem(SVG.parser.path.createSVGPathSegCurvetoCubicAbs(x, y, x1, y1, x2, y2), i)
          else if (s == 's')
            segs.replaceItem(SVG.parser.path.createSVGPathSegCurvetoCubicSmoothAbs(x, y, x2, y2), i)
          else if (s == 'q')
            segs.replaceItem(SVG.parser.path.createSVGPathSegCurvetoQuadraticAbs(x, y, x1, y1), i)
          else if (s == 't')
            segs.replaceItem(SVG.parser.path.createSVGPathSegCurvetoQuadraticSmoothAbs(x, y), i)
          else if (s == 'a')
            segs.replaceItem(SVG.parser.path.createSVGPathSegArcAbs(x, y, seg.r1, seg.r2, seg.angle, seg.largeArcFlag, seg.sweepFlag), i)
          else if (s == 'z' || s == 'Z') {
            x = x0
            y = y0
          }
        }
  
        /* record the start of a subpath */
        if (s == 'M' || s == 'm') {
          x0 = x
          y0 = y
        }
      }
  
      /* build internal representation */
      array = []
      segs  = SVG.parser.path.pathSegList
      
      for (i = 0, il = segs.numberOfItems; i < il; ++i) {
        seg = segs.getItem(i)
        s = seg.pathSegTypeAsLetter
        x = [s]
  
        if (s == 'M' || s == 'L' || s == 'T')
          x.push(seg.x, seg.y)
        else if (s == 'H')
          x.push(seg.x)
        else if (s == 'V')
          x.push(seg.y)
        else if (s == 'C')
          x.push(seg.x1, seg.y1, seg.x2, seg.y2, seg.x, seg.y)
        else if (s == 'S')
          x.push(seg.x2, seg.y2, seg.x, seg.y)
        else if (s == 'Q')
          x.push(seg.x1, seg.y1, seg.x, seg.y)
        else if (s == 'A')
          x.push(seg.r1, seg.r2, seg.angle, seg.largeArcFlag|0, seg.sweepFlag|0, seg.x, seg.y)
  
        /* store segment */
        array.push(x)
      }
      
      return array
    }
    // Get bounding box of path
  , bbox: function() {
      SVG.parser.path.setAttribute('d', this.toString())
  
      return SVG.parser.path.getBBox()
    }
  
  })

  SVG.Number = function(value) {
  
    /* initialize defaults */
    this.value = 0
    this.unit = ''
  
    /* parse value */
    if (typeof value === 'number') {
      /* ensure a valid numeric value */
      this.value = isNaN(value) ? 0 : !isFinite(value) ? (value < 0 ? -3.4e+38 : +3.4e+38) : value
  
    } else if (typeof value === 'string') {
      var match = value.match(SVG.regex.unit)
  
      if (match) {
        /* make value numeric */
        this.value = parseFloat(match[1])
      
        /* normalize percent value */
        if (match[2] == '%')
          this.value /= 100
        else if (match[2] == 's')
          this.value *= 1000
      
        /* store unit */
        this.unit = match[2]
      }
  
    } else {
      if (value instanceof SVG.Number) {
        this.value = value.value
        this.unit  = value.unit
      }
    }
  
  }
  
  SVG.extend(SVG.Number, {
    // Stringalize
    toString: function() {
      return (
        this.unit == '%' ?
          ~~(this.value * 1e8) / 1e6:
        this.unit == 's' ?
          this.value / 1e3 :
          this.value
      ) + this.unit
    }
  , // Convert to primitive
    valueOf: function() {
      return this.value
    }
    // Add number
  , plus: function(number) {
      this.value = this + new SVG.Number(number)
  
      return this
    }
    // Subtract number
  , minus: function(number) {
      return this.plus(-new SVG.Number(number))
    }
    // Multiply number
  , times: function(number) {
      this.value = this * new SVG.Number(number)
  
      return this
    }
    // Divide number
  , divide: function(number) {
      this.value = this / new SVG.Number(number)
  
      return this
    }
    // Convert to different unit
  , to: function(unit) {
      if (typeof unit === 'string')
        this.unit = unit
  
      return this
    }
    // Make number morphable
  , morph: function(number) {
      this.destination = new SVG.Number(number)
  
      return this
    }
    // Get morphed number at given position
  , at: function(pos) {
      /* make sure a destination is defined */
      if (!this.destination) return this
  
      /* generate new morphed number */
      return new SVG.Number(this.destination)
          .minus(this)
          .times(pos)
          .plus(this)
    }
  
  })

  SVG.ViewBox = function(element) {
    var x, y, width, height
      , wm   = 1 /* width multiplier */
      , hm   = 1 /* height multiplier */
      , box  = element.bbox()
      , view = (element.attr('viewBox') || '').match(/-?[\d\.]+/g)
      , we   = element
      , he   = element
  
    /* get dimensions of current node */
    width  = new SVG.Number(element.width())
    height = new SVG.Number(element.height())
  
    /* find nearest non-percentual dimensions */
    while (width.unit == '%') {
      wm *= width.value
      width = new SVG.Number(we instanceof SVG.Doc ? we.parent.offsetWidth : we.parent.width())
      we = we.parent
    }
    while (height.unit == '%') {
      hm *= height.value
      height = new SVG.Number(he instanceof SVG.Doc ? he.parent.offsetHeight : he.parent.height())
      he = he.parent
    }
    
    /* ensure defaults */
    this.x      = box.x
    this.y      = box.y
    this.width  = width  * wm
    this.height = height * hm
    this.zoom   = 1
    
    if (view) {
      /* get width and height from viewbox */
      x      = parseFloat(view[0])
      y      = parseFloat(view[1])
      width  = parseFloat(view[2])
      height = parseFloat(view[3])
      
      /* calculate zoom accoring to viewbox */
      this.zoom = ((this.width / this.height) > (width / height)) ?
        this.height / height :
        this.width  / width
  
      /* calculate real pixel dimensions on parent SVG.Doc element */
      this.x      = x
      this.y      = y
      this.width  = width
      this.height = height
      
    }
    
  }
  
  //
  SVG.extend(SVG.ViewBox, {
    // Parse viewbox to string
    toString: function() {
      return this.x + ' ' + this.y + ' ' + this.width + ' ' + this.height
    }
    
  })

  SVG.BBox = function(element) {
    var box
  
    /* initialize zero box */
    this.x      = 0
    this.y      = 0
    this.width  = 0
    this.height = 0
    
    /* get values if element is given */
    if (element) {
      try {
        /* actual, native bounding box */
        box = element.node.getBBox()
      } catch(e) {
        /* fallback for some browsers */
        box = {
          x:      element.node.clientLeft
        , y:      element.node.clientTop
        , width:  element.node.clientWidth
        , height: element.node.clientHeight
        }
      }
      
      /* include translations on x an y */
      this.x = box.x + element.trans.x
      this.y = box.y + element.trans.y
      
      /* plain width and height */
      this.width  = box.width  * element.trans.scaleX
      this.height = box.height * element.trans.scaleY
    }
  
    /* add center, right and bottom */
    boxProperties(this)
    
  }
  
  //
  SVG.extend(SVG.BBox, {
    // merge bounding box with another, return a new instance
    merge: function(box) {
      var b = new SVG.BBox()
  
      /* merge box */
      b.x      = Math.min(this.x, box.x)
      b.y      = Math.min(this.y, box.y)
      b.width  = Math.max(this.x + this.width,  box.x + box.width)  - b.x
      b.height = Math.max(this.y + this.height, box.y + box.height) - b.y
  
      /* add center, right and bottom */
      boxProperties(b)
  
      return b
    }
  
  })

  SVG.RBox = function(element) {
    var e, zoom
      , box = {}
  
    /* initialize zero box */
    this.x      = 0
    this.y      = 0
    this.width  = 0
    this.height = 0
    
    if (element) {
      e = element.doc().parent
      zoom = element.doc().viewbox().zoom
      
      /* actual, native bounding box */
      box = element.node.getBoundingClientRect()
      
      /* get screen offset */
      this.x = box.left
      this.y = box.top
      
      /* subtract parent offset */
      this.x -= e.offsetLeft
      this.y -= e.offsetTop
      
      while (e = e.offsetParent) {
        this.x -= e.offsetLeft
        this.y -= e.offsetTop
      }
      
      /* calculate cumulative zoom from svg documents */
      e = element
      while (e = e.parent) {
        if (e.type == 'svg' && e.viewbox) {
          zoom *= e.viewbox().zoom
          this.x -= e.x() || 0
          this.y -= e.y() || 0
        }
      }
    }
    
    /* recalculate viewbox distortion */
    this.x /= zoom
    this.y /= zoom
    this.width  = box.width  /= zoom
    this.height = box.height /= zoom
    
    /* offset by window scroll position, because getBoundingClientRect changes when window is scrolled */
    this.x += typeof window.scrollX === 'number' ? window.scrollX : window.pageXOffset
    this.y += typeof window.scrollY === 'number' ? window.scrollY : window.pageYOffset
  
    /* add center, right and bottom */
    boxProperties(this)
    
  }
  
  //
  SVG.extend(SVG.RBox, {
    // merge rect box with another, return a new instance
    merge: function(box) {
      var b = new SVG.RBox()
  
      /* merge box */
      b.x      = Math.min(this.x, box.x)
      b.y      = Math.min(this.y, box.y)
      b.width  = Math.max(this.x + this.width,  box.x + box.width)  - b.x
      b.height = Math.max(this.y + this.height, box.y + box.height) - b.y
  
      /* add center, right and bottom */
      boxProperties(b)
  
      return b
    }
  
  })


  SVG.Element = SVG.invent({
    // Initialize node
    create: function(node) {
      /* make stroke value accessible dynamically */
      this._stroke = SVG.defaults.attrs.stroke
  
      /* initialize transformation store with defaults */
      this.trans = SVG.defaults.trans()
      
      /* create circular reference */
      if (this.node = node) {
        this.type = node.nodeName
        this.node.instance = this
      }
    }
  
    // Add class methods
  , extend: {
      // Move over x-axis
      x: function(x) {
        if (x != null) {
          x = new SVG.Number(x)
          x.value /= this.trans.scaleX
        }
        return this.attr('x', x)
      }
      // Move over y-axis
    , y: function(y) {
        if (y != null) {
          y = new SVG.Number(y)
          y.value /= this.trans.scaleY
        }
        return this.attr('y', y)
      }
      // Move by center over x-axis
    , cx: function(x) {
        return x == null ? this.x() + this.width() / 2 : this.x(x - this.width() / 2)
      }
      // Move by center over y-axis
    , cy: function(y) {
        return y == null ? this.y() + this.height() / 2 : this.y(y - this.height() / 2)
      }
      // Move element to given x and y values
    , move: function(x, y) {
        return this.x(x).y(y)
      }
      // Move element by its center
    , center: function(x, y) {
        return this.cx(x).cy(y)
      }
      // Set width of element
    , width: function(width) {
        return this.attr('width', width)
      }
      // Set height of element
    , height: function(height) {
        return this.attr('height', height)
      }
      // Set element size to given width and height
    , size: function(width, height) {
        var p = proportionalSize(this.bbox(), width, height)
  
        return this
          .width(new SVG.Number(p.width))
          .height(new SVG.Number(p.height))
      }
      // Clone element
    , clone: function() {
        var clone , attr
          , type = this.type
        
        /* invoke shape method with shape-specific arguments */
        clone = type == 'rect' || type == 'ellipse' ?
          this.parent[type](0,0) :
        type == 'line' ?
          this.parent[type](0,0,0,0) :
        type == 'image' ?
          this.parent[type](this.src) :
        type == 'text' ?
          this.parent[type](this.content) :
        type == 'path' ?
          this.parent[type](this.attr('d')) :
        type == 'polyline' || type == 'polygon' ?
          this.parent[type](this.attr('points')) :
        type == 'g' ?
          this.parent.group() :
          this.parent[type]()
        
        /* apply attributes attributes */
        attr = this.attr()
        delete attr.id
        clone.attr(attr)
        
        /* copy transformations */
        clone.trans = this.trans
        
        /* apply attributes and translations */
        return clone.transform({})
      }
      // Remove element
    , remove: function() {
        if (this.parent)
          this.parent.removeElement(this)
        
        return this
      }
      // Replace element
    , replace: function(element) {
        this.after(element).remove()
  
        return element
      }
      // Add element to given container and return self
    , addTo: function(parent) {
        return parent.put(this)
      }
      // Add element to given container and return container
    , putIn: function(parent) {
        return parent.add(this)
      }
      // Get parent document
    , doc: function(type) {
        return this._parent(type || SVG.Doc)
      }
      // Set svg element attribute
    , attr: function(a, v, n) {
        if (a == null) {
          /* get an object of attributes */
          a = {}
          v = this.node.attributes
          for (n = v.length - 1; n >= 0; n--)
            a[v[n].nodeName] = SVG.regex.isNumber.test(v[n].nodeValue) ? parseFloat(v[n].nodeValue) : v[n].nodeValue
          
          return a
          
        } else if (typeof a == 'object') {
          /* apply every attribute individually if an object is passed */
          for (v in a) this.attr(v, a[v])
          
        } else if (v === null) {
            /* remove value */
            this.node.removeAttribute(a)
          
        } else if (v == null) {
          /* act as a getter if the first and only argument is not an object */
          v = this.node.attributes[a]
          return v == null ? 
            SVG.defaults.attrs[a] :
          SVG.regex.isNumber.test(v.nodeValue) ?
            parseFloat(v.nodeValue) : v.nodeValue
        
        } else if (a == 'style') {
          /* redirect to the style method */
          return this.style(v)
        
        } else {
          /* BUG FIX: some browsers will render a stroke if a color is given even though stroke width is 0 */
          if (a == 'stroke-width')
            this.attr('stroke', parseFloat(v) > 0 ? this._stroke : null)
          else if (a == 'stroke')
            this._stroke = v
  
          /* convert image fill and stroke to patterns */
          if (a == 'fill' || a == 'stroke') {
            if (SVG.regex.isImage.test(v))
              v = this.doc().defs().image(v, 0, 0)
  
            if (v instanceof SVG.Image)
              v = this.doc().defs().pattern(0, 0, function() {
                this.add(v)
              })
          }
          
          /* ensure correct numeric values (also accepts NaN and Infinity) */
          if (typeof v === 'number')
            v = new SVG.Number(v)
  
          /* ensure full hex color */
          else if (SVG.Color.isColor(v))
            v = new SVG.Color(v)
          
          /* parse array values */
          else if (Array.isArray(v))
            v = new SVG.Array(v)
  
          /* if the passed attribute is leading... */
          if (a == 'leading') {
            /* ... call the leading method instead */
            if (this.leading)
              this.leading(v)
          } else {
            /* set given attribute on node */
            typeof n === 'string' ?
              this.node.setAttributeNS(n, a, v.toString()) :
              this.node.setAttribute(a, v.toString())
          }
          
          /* rebuild if required */
          if (this.rebuild && (a == 'font-size' || a == 'x'))
            this.rebuild(a, v)
        }
        
        return this
      }
      // Manage transformations
    , transform: function(o, v) {
        
        if (arguments.length == 0) {
          /* act as a getter if no argument is given */
          return this.trans
          
        } else if (typeof o === 'string') {
          /* act as a getter if only one string argument is given */
          if (arguments.length < 2)
            return this.trans[o]
          
          /* apply transformations as object if key value arguments are given*/
          var transform = {}
          transform[o] = v
          
          return this.transform(transform)
        }
        
        /* ... otherwise continue as a setter */
        var transform = []
        
        /* parse matrix */
        o = parseMatrix(o)
        
        /* merge values */
        for (v in o)
          if (o[v] != null)
            this.trans[v] = o[v]
        
        /* compile matrix */
        this.trans.matrix = this.trans.a
                    + ' ' + this.trans.b
                    + ' ' + this.trans.c
                    + ' ' + this.trans.d
                    + ' ' + this.trans.e
                    + ' ' + this.trans.f
        
        /* alias current transformations */
        o = this.trans
        
        /* add matrix */
        if (o.matrix != SVG.defaults.matrix)
          transform.push('matrix(' + o.matrix + ')')
        
        /* add rotation */
        if (o.rotation != 0)
          transform.push('rotate(' + o.rotation + ' ' + (o.cx == null ? this.bbox().cx : o.cx) + ' ' + (o.cy == null ? this.bbox().cy : o.cy) + ')')
        
        /* add scale */
        if (o.scaleX != 1 || o.scaleY != 1)
          transform.push('scale(' + o.scaleX + ' ' + o.scaleY + ')')
        
        /* add skew on x axis */
        if (o.skewX != 0)
          transform.push('skewX(' + o.skewX + ')')
        
        /* add skew on y axis */
        if (o.skewY != 0)
          transform.push('skewY(' + o.skewY + ')')
        
        /* add translation */
        if (o.x != 0 || o.y != 0)
          transform.push('translate(' + new SVG.Number(o.x / o.scaleX) + ' ' + new SVG.Number(o.y / o.scaleY) + ')')
        
        /* update transformations, even if there are none */
        if (transform.length == 0)
          this.node.removeAttribute('transform')
        else
          this.node.setAttribute('transform', transform.join(' '))
        
        return this
      }
      // Dynamic style generator
    , style: function(s, v) {
        if (arguments.length == 0) {
          /* get full style */
          return this.node.style.cssText || ''
        
        } else if (arguments.length < 2) {
          /* apply every style individually if an object is passed */
          if (typeof s == 'object') {
            for (v in s) this.style(v, s[v])
          
          } else if (SVG.regex.isCss.test(s)) {
            /* parse css string */
            s = s.split(';')
  
            /* apply every definition individually */
            for (var i = 0; i < s.length; i++) {
              v = s[i].split(':')
              this.style(v[0].replace(/\s+/g, ''), v[1])
            }
          } else {
            /* act as a getter if the first and only argument is not an object */
            return this.node.style[camelCase(s)]
          }
        
        } else {
          this.node.style[camelCase(s)] = v === null || SVG.regex.isBlank.test(v) ? '' : v
        }
        
        return this
      }
      // Get / set id
    , id: function(id) {
        return this.attr('id', id)
      }
      // Get bounding box
    , bbox: function() {
        return new SVG.BBox(this)
      }
      // Get rect box
    , rbox: function() {
        return new SVG.RBox(this)
      }
      // Checks whether the given point inside the bounding box of the element
    , inside: function(x, y) {
        var box = this.bbox()
        
        return x > box.x
            && y > box.y
            && x < box.x + box.width
            && y < box.y + box.height
      }
      // Show element
    , show: function() {
        return this.style('display', '')
      }
      // Hide element
    , hide: function() {
        return this.style('display', 'none')
      }
      // Is element visible?
    , visible: function() {
        return this.style('display') != 'none'
      }
      // Return id on string conversion
    , toString: function() {
        return this.attr('id')
      }
      // Return array of classes on the node
    , classes: function() {
        var classAttr = this.node.getAttribute('class')
        if (classAttr === null) {
          return []
        } else {
          return classAttr.trim().split(/\s+/)
        }
      }
      // Return true if class exists on the node, false otherwise
    , hasClass: function(className) {
        return this.classes().indexOf(className) != -1
      }
      // Add class to the node
    , addClass: function(className) {
        var classArray
        if (!(this.hasClass(className))) {
          classArray = this.classes()
          classArray.push(className)
          this.node.setAttribute('class', classArray.join(' '))
        }
        return this
      }
      // Remove class from the node
    , removeClass: function(className) {
        var classArray
        if (this.hasClass(className)) {
          classArray = this.classes().filter(function(c) {
            return c != className
          })
          this.node.setAttribute('class', classArray.join(' '))
        }
        return this
      }
      // Toggle the presence of a class on the node
    , toggleClass: function(className) {
        if (this.hasClass(className)) {
          this.removeClass(className)
        } else {
          this.addClass(className)
        }
        return this
      }
      // Get referenced element form attribute value
    , reference: function(attr) {
        return SVG.get(this.attr()[attr])
      }
      // Private: find svg parent by instance
    , _parent: function(parent) {
        var element = this
        
        while (element != null && !(element instanceof parent))
          element = element.parent
  
        return element
      }
    }
  })


  SVG.Parent = SVG.invent({
    // Initialize node
    create: function(element) {
      this.constructor.call(this, element)
    }
  
    // Inherit from
  , inherit: SVG.Element
  
    // Add class methods
  , extend: {
      // Returns all child elements
      children: function() {
        return this._children || (this._children = [])
      }
      // Add given element at a position
    , add: function(element, i) {
        if (!this.has(element)) {
          /* define insertion index if none given */
          i = i == null ? this.children().length : i
          
          /* remove references from previous parent */
          if (element.parent)
            element.parent.children().splice(element.parent.index(element), 1)
          
          /* add element references */
          this.children().splice(i, 0, element)
          this.node.insertBefore(element.node, this.node.childNodes[i] || null)
          element.parent = this
        }
  
        /* reposition defs */
        if (this._defs) {
          this.node.removeChild(this._defs.node)
          this.node.appendChild(this._defs.node)
        }
        
        return this
      }
      // Basically does the same as `add()` but returns the added element instead
    , put: function(element, i) {
        this.add(element, i)
        return element
      }
      // Checks if the given element is a child
    , has: function(element) {
        return this.index(element) >= 0
      }
      // Gets index of given element
    , index: function(element) {
        return this.children().indexOf(element)
      }
      // Get a element at the given index
    , get: function(i) {
        return this.children()[i]
      }
      // Get first child, skipping the defs node
    , first: function() {
        return this.children()[0]
      }
      // Get the last child
    , last: function() {
        return this.children()[this.children().length - 1]
      }
      // Iterates over all children and invokes a given block
    , each: function(block, deep) {
        var i, il
          , children = this.children()
        
        for (i = 0, il = children.length; i < il; i++) {
          if (children[i] instanceof SVG.Element)
            block.apply(children[i], [i, children])
  
          if (deep && (children[i] instanceof SVG.Container))
            children[i].each(block, deep)
        }
      
        return this
      }
      // Remove a child element at a position
    , removeElement: function(element) {
        this.children().splice(this.index(element), 1)
        this.node.removeChild(element.node)
        element.parent = null
        
        return this
      }
      // Remove all elements in this container
    , clear: function() {
        /* remove children */
        for (var i = this.children().length - 1; i >= 0; i--)
          this.removeElement(this.children()[i])
  
        /* remove defs node */
        if (this._defs)
          this._defs.clear()
  
        return this
      }
     , // Get defs
      defs: function() {
        return this.doc().defs()
      }
    }
    
  })


  SVG.Container = SVG.invent({
    // Initialize node
    create: function(element) {
      this.constructor.call(this, element)
    }
  
    // Inherit from
  , inherit: SVG.Parent
  
    // Add class methods
  , extend: {
      // Get the viewBox and calculate the zoom value
      viewbox: function(v) {
        if (arguments.length == 0)
          /* act as a getter if there are no arguments */
          return new SVG.ViewBox(this)
        
        /* otherwise act as a setter */
        v = arguments.length == 1 ?
          [v.x, v.y, v.width, v.height] :
          [].slice.call(arguments)
        
        return this.attr('viewBox', v)
      }
    }
    
  })

  SVG.FX = SVG.invent({
    // Initialize FX object
    create: function(element) {
      /* store target element */
      this.target = element
    }
  
    // Add class methods
  , extend: {
      // Add animation parameters and start animation
      animate: function(d, ease, delay) {
        var akeys, tkeys, skeys, key
          , element = this.target
          , fx = this
        
        /* dissect object if one is passed */
        if (typeof d == 'object') {
          delay = d.delay
          ease = d.ease
          d = d.duration
        }
  
        /* ensure default duration and easing */
        d = d == '=' ? d : d == null ? 1000 : new SVG.Number(d).valueOf()
        ease = ease || '<>'
  
        /* process values */
        fx.to = function(pos) {
          var i
  
          /* normalise pos */
          pos = pos < 0 ? 0 : pos > 1 ? 1 : pos
  
          /* collect attribute keys */
          if (akeys == null) {
            akeys = []
            for (key in fx.attrs)
              akeys.push(key)
  
            /* make sure morphable elements are scaled, translated and morphed all together */
            if (element.morphArray && (fx._plot || akeys.indexOf('points') > -1)) {
              /* get destination */
              var box
                , p = new element.morphArray(fx._plot || fx.attrs.points || element.array)
  
              /* add size */
              if (fx._size) p.size(fx._size.width.to, fx._size.height.to)
  
              /* add movement */
              box = p.bbox()
              if (fx._x) p.move(fx._x.to, box.y)
              else if (fx._cx) p.move(fx._cx.to - box.width / 2, box.y)
  
              box = p.bbox()
              if (fx._y) p.move(box.x, fx._y.to)
              else if (fx._cy) p.move(box.x, fx._cy.to - box.height / 2)
  
              /* delete element oriented changes */
              delete fx._x
              delete fx._y
              delete fx._cx
              delete fx._cy
              delete fx._size
  
              fx._plot = element.array.morph(p)
            }
          }
  
          /* collect transformation keys */
          if (tkeys == null) {
            tkeys = []
            for (key in fx.trans)
              tkeys.push(key)
          }
  
          /* collect style keys */
          if (skeys == null) {
            skeys = []
            for (key in fx.styles)
              skeys.push(key)
          }
  
          /* apply easing */
          pos = ease == '<>' ?
            (-Math.cos(pos * Math.PI) / 2) + 0.5 :
          ease == '>' ?
            Math.sin(pos * Math.PI / 2) :
          ease == '<' ?
            -Math.cos(pos * Math.PI / 2) + 1 :
          ease == '-' ?
            pos :
          typeof ease == 'function' ?
            ease(pos) :
            pos
          
          /* run plot function */
          if (fx._plot) {
            element.plot(fx._plot.at(pos))
  
          } else {
            /* run all x-position properties */
            if (fx._x)
              element.x(fx._x.at(pos))
            else if (fx._cx)
              element.cx(fx._cx.at(pos))
  
            /* run all y-position properties */
            if (fx._y)
              element.y(fx._y.at(pos))
            else if (fx._cy)
              element.cy(fx._cy.at(pos))
  
            /* run all size properties */
            if (fx._size)
              element.size(fx._size.width.at(pos), fx._size.height.at(pos))
          }
  
          /* run all viewbox properties */
          if (fx._viewbox)
            element.viewbox(
              fx._viewbox.x.at(pos)
            , fx._viewbox.y.at(pos)
            , fx._viewbox.width.at(pos)
            , fx._viewbox.height.at(pos)
            )
  
          /* run leading property */
          if (fx._leading)
            element.leading(fx._leading.at(pos))
  
          /* animate attributes */
          for (i = akeys.length - 1; i >= 0; i--)
            element.attr(akeys[i], at(fx.attrs[akeys[i]], pos))
  
          /* animate transformations */
          for (i = tkeys.length - 1; i >= 0; i--)
            element.transform(tkeys[i], at(fx.trans[tkeys[i]], pos))
  
          /* animate styles */
          for (i = skeys.length - 1; i >= 0; i--)
            element.style(skeys[i], at(fx.styles[skeys[i]], pos))
  
          /* callback for each keyframe */
          if (fx._during)
            fx._during.call(element, pos, function(from, to) {
              return at({ from: from, to: to }, pos)
            })
        }
        
        if (typeof d === 'number') {
          /* delay animation */
          this.timeout = setTimeout(function() {
            var start = new Date().getTime()
  
            /* initialize situation object */
            fx.situation = {
              interval: 1000 / 60
            , start:    start
            , play:     true
            , finish:   start + d
            , duration: d
            }
  
            /* render function */
            fx.render = function() {
              
              if (fx.situation.play === true) {
                // This code was borrowed from the emile.js micro framework by Thomas Fuchs, aka MadRobby.
                var time = new Date().getTime()
                  , pos = time > fx.situation.finish ? 1 : (time - fx.situation.start) / d
                
                /* process values */
                fx.to(pos)
                
                /* finish off animation */
                if (time > fx.situation.finish) {
                  if (fx._plot)
                    element.plot(new SVG.PointArray(fx._plot.destination).settle())
  
                  if (fx._loop === true || (typeof fx._loop == 'number' && fx._loop > 1)) {
                    if (typeof fx._loop == 'number')
                      --fx._loop
                    fx.animate(d, ease, delay)
                  } else {
                    fx._after ? fx._after.apply(element, [fx]) : fx.stop()
                  }
  
                } else {
                  fx.animationFrame = requestAnimationFrame(fx.render)
                }
              } else {
                fx.animationFrame = requestAnimationFrame(fx.render)
              }
              
            }
  
            /* start animation */
            fx.render()
            
          }, new SVG.Number(delay).valueOf())
        }
        
        return this
      }
      // Get bounding box of target element
    , bbox: function() {
        return this.target.bbox()
      }
      // Add animatable attributes
    , attr: function(a, v) {
        if (typeof a == 'object') {
          for (var key in a)
            this.attr(key, a[key])
        
        } else {
          var from = this.target.attr(a)
  
          this.attrs[a] = SVG.Color.isColor(from) ?
            new SVG.Color(from).morph(v) :
          SVG.regex.unit.test(from) ?
            new SVG.Number(from).morph(v) :
            { from: from, to: v }
        }
        
        return this
      }
      // Add animatable transformations
    , transform: function(o, v) {
        if (arguments.length == 1) {
          /* parse matrix string */
          o = parseMatrix(o)
          
          /* dlete matrixstring from object */
          delete o.matrix
          
          /* add rotation-center to transformations */
          this.target.trans.cx = o.cx || null
          this.target.trans.cy = o.cy || null
          
          delete o.cx
          delete o.cy
          
          /* store matrix values */
          for (v in o)
            this.trans[v] = { from: this.target.trans[v], to: o[v] }
          
        } else {
          /* apply transformations as object if key value arguments are given*/
          var transform = {}
          transform[o] = v
          
          this.transform(transform)
        }
        
        return this
      }
      // Add animatable styles
    , style: function(s, v) {
        if (typeof s == 'object')
          for (var key in s)
            this.style(key, s[key])
        
        else
          this.styles[s] = { from: this.target.style(s), to: v }
        
        return this
      }
      // Animatable x-axis
    , x: function(x) {
        this._x = new SVG.Number(this.target.x()).morph(x)
        
        return this
      }
      // Animatable y-axis
    , y: function(y) {
        this._y = new SVG.Number(this.target.y()).morph(y)
        
        return this
      }
      // Animatable center x-axis
    , cx: function(x) {
        this._cx = new SVG.Number(this.target.cx()).morph(x)
        
        return this
      }
      // Animatable center y-axis
    , cy: function(y) {
        this._cy = new SVG.Number(this.target.cy()).morph(y)
        
        return this
      }
      // Add animatable move
    , move: function(x, y) {
        return this.x(x).y(y)
      }
      // Add animatable center
    , center: function(x, y) {
        return this.cx(x).cy(y)
      }
      // Add animatable size
    , size: function(width, height) {
        if (this.target instanceof SVG.Text) {
          /* animate font size for Text elements */
          this.attr('font-size', width)
          
        } else {
          /* animate bbox based size for all other elements */
          var box = this.target.bbox()
  
          this._size = {
            width:  new SVG.Number(box.width).morph(width)
          , height: new SVG.Number(box.height).morph(height)
          }
        }
        
        return this
      }
      // Add animatable plot
    , plot: function(p) {
        this._plot = p
  
        return this
      }
      // Add leading method
    , leading: function(value) {
        if (this.target._leading)
          this._leading = new SVG.Number(this.target._leading).morph(value)
  
        return this
      }
      // Add animatable viewbox
    , viewbox: function(x, y, width, height) {
        if (this.target instanceof SVG.Container) {
          var box = this.target.viewbox()
          
          this._viewbox = {
            x:      new SVG.Number(box.x).morph(x)
          , y:      new SVG.Number(box.y).morph(y)
          , width:  new SVG.Number(box.width).morph(width)
          , height: new SVG.Number(box.height).morph(height)
          }
        }
        
        return this
      }
      // Add animateable gradient update
    , update: function(o) {
        if (this.target instanceof SVG.Stop) {
          if (o.opacity != null) this.attr('stop-opacity', o.opacity)
          if (o.color   != null) this.attr('stop-color', o.color)
          if (o.offset  != null) this.attr('offset', new SVG.Number(o.offset))
        }
  
        return this
      }
      // Add callback for each keyframe
    , during: function(during) {
        this._during = during
        
        return this
      }
      // Callback after animation
    , after: function(after) {
        this._after = after
        
        return this
      }
      // Make loopable
    , loop: function(times) {
        this._loop = times || true
  
        return this
      }
      // Stop running animation
    , stop: function(fulfill) {
        /* fulfill animation */
        if (fulfill === true) {
  
          this.animate(0)
  
          if (this._after)
            this._after.apply(this.target, [this])
  
        } else {
          /* stop current animation */
          clearTimeout(this.timeout)
          cancelAnimationFrame(this.animationFrame);
  
          /* reset storage for properties that need animation */
          this.attrs     = {}
          this.trans     = {}
          this.styles    = {}
          this.situation = {}
  
          /* delete destinations */
          delete this._x
          delete this._y
          delete this._cx
          delete this._cy
          delete this._size
          delete this._plot
          delete this._loop
          delete this._after
          delete this._during
          delete this._leading
          delete this._viewbox
        }
        
        return this
      }
      // Pause running animation
    , pause: function() {
        if (this.situation.play === true) {
          this.situation.play  = false
          this.situation.pause = new Date().getTime()
        }
  
        return this
      }
      // Play running animation
    , play: function() {
        if (this.situation.play === false) {
          var pause = new Date().getTime() - this.situation.pause
          
          this.situation.finish += pause
          this.situation.start  += pause
          this.situation.play    = true
        }
  
        return this
      }
      
    }
  
    // Define parent class
  , parent: SVG.Element
  
    // Add method to parent elements
  , construct: {
      // Get fx module or create a new one, then animate with given duration and ease
      animate: function(d, ease, delay) {
        return (this.fx || (this.fx = new SVG.FX(this))).stop().animate(d, ease, delay)
      }
      // Stop current animation; this is an alias to the fx instance
    , stop: function(fulfill) {
        if (this.fx)
          this.fx.stop(fulfill)
        
        return this
      }
      // Pause current animation
    , pause: function() {
        if (this.fx)
          this.fx.pause()
  
        return this
      }
      // Play paused current animation
    , play: function() {
        if (this.fx)
          this.fx.play()
  
        return this
      }
      
    }
  })


  SVG.extend(SVG.Element, SVG.FX, {
    // Relative move over x axis
    dx: function(x) {
      return this.x((this.target || this).x() + x)
    }
    // Relative move over y axis
  , dy: function(y) {
      return this.y((this.target || this).y() + y)
    }
    // Relative move over x and y axes
  , dmove: function(x, y) {
      return this.dx(x).dy(y)
    }
  
  })

  ;[  'click'
    , 'dblclick'
    , 'mousedown'
    , 'mouseup'
    , 'mouseover'
    , 'mouseout'
    , 'mousemove'
    // , 'mouseenter' -> not supported by IE
    // , 'mouseleave' -> not supported by IE
    , 'touchstart'
    , 'touchmove'
    , 'touchleave'
    , 'touchend'
    , 'touchcancel' ].forEach(function(event) {
    
    /* add event to SVG.Element */
    SVG.Element.prototype[event] = function(f) {
      var self = this
      
      /* bind event to element rather than element node */
      this.node['on' + event] = typeof f == 'function' ?
        function() { return f.apply(self, arguments) } : null
      
      return this
    }
    
  })
  
  // Initialize listeners stack
  SVG.listeners = []
  SVG.handlerMap = []
  
  // Only kept for consistency of API
  SVG.registerEvent = function(){};
  
  // Add event binder in the SVG namespace
  SVG.on = function(node, event, listener) {
    // create listener, get object-index
    var l     = listener.bind(node.instance || node)
      , index = (SVG.handlerMap.indexOf(node) + 1 || SVG.handlerMap.push(node)) - 1
      , ev    = event.split('.')[0]
      , ns    = event.split('.')[1] || '*'
      
    
    // ensure valid object
    SVG.listeners[index]         = SVG.listeners[index]         || {}
    SVG.listeners[index][ev]     = SVG.listeners[index][ev]     || {}
    SVG.listeners[index][ev][ns] = SVG.listeners[index][ev][ns] || {}
  
    // reference listener
    SVG.listeners[index][ev][ns][listener] = l
  
    // add listener
    node.addEventListener(ev, l, false)
  }
  
  // Add event unbinder in the SVG namespace
  SVG.off = function(node, event, listener) {
    var index = SVG.handlerMap.indexOf(node)
      , ev    = event && event.split('.')[0]
      , ns    = event && event.split('.')[1]
  
    if(index == -1) return
    
    if (listener) {
      // remove listener reference
      if (SVG.listeners[index][ev] && SVG.listeners[index][ev][ns || '*']) {
        // remove listener
        node.removeEventListener(ev, SVG.listeners[index][ev][ns || '*'][listener], false)
  
        delete SVG.listeners[index][ev][ns || '*'][listener]
      }
  
    } else if (ns) {
      // remove all listeners for the namespaced event
      if (SVG.listeners[index][ev] && SVG.listeners[index][ev][ns]) {
        for (listener in SVG.listeners[index][ev][ns])
          SVG.off(node, [ev, ns].join('.'), listener)
  
        delete SVG.listeners[index][ev][ns]
      }
  
    } else if (ev) {
      // remove all listeners for the event
      if (SVG.listeners[index][ev]) {
        for (namespace in SVG.listeners[index][ev])
          SVG.off(node, [ev, namespace].join('.'))
  
        delete SVG.listeners[index][ev]
      }
  
    } else {
      // remove all listeners on a given node
      for (event in SVG.listeners[index])
        SVG.off(node, event)
  
      delete SVG.listeners[index]
  
    }
  }
  
  //
  SVG.extend(SVG.Element, {
    // Bind given event to listener
    on: function(event, listener) {
      SVG.on(this.node, event, listener)
      
      return this
    }
    // Unbind event from listener
  , off: function(event, listener) {
      SVG.off(this.node, event, listener)
      
      return this
    }
    // Fire given event
  , fire: function(event, data) {
      
      // Dispatch event
      this.node.dispatchEvent(new CustomEvent(event, {detail:data}))
  
      return this
    }
  })

  SVG.Defs = SVG.invent({
    // Initialize node
    create: 'defs'
  
    // Inherit from
  , inherit: SVG.Container
    
  })

  SVG.G = SVG.invent({
    // Initialize node
    create: 'g'
  
    // Inherit from
  , inherit: SVG.Container
    
    // Add class methods
  , extend: {
      // Move over x-axis
      x: function(x) {
        return x == null ? this.trans.x : this.transform('x', x)
      }
      // Move over y-axis
    , y: function(y) {
        return y == null ? this.trans.y : this.transform('y', y)
      }
      // Move by center over x-axis
    , cx: function(x) {
        return x == null ? this.bbox().cx : this.x(x - this.bbox().width / 2)
      }
      // Move by center over y-axis
    , cy: function(y) {
        return y == null ? this.bbox().cy : this.y(y - this.bbox().height / 2)
      }
    }
    
    // Add parent method
  , construct: {
      // Create a group element
      group: function() {
        return this.put(new SVG.G)
      }
    }
  })

  SVG.extend(SVG.Element, {
    // Get all siblings, including myself
    siblings: function() {
      return this.parent.children()
    }
    // Get the curent position siblings
  , position: function() {
      return this.parent.index(this)
    }
    // Get the next element (will return null if there is none)
  , next: function() {
      return this.siblings()[this.position() + 1]
    }
    // Get the next element (will return null if there is none)
  , previous: function() {
      return this.siblings()[this.position() - 1]
    }
    // Send given element one step forward
  , forward: function() {
      var i = this.position()
      return this.parent.removeElement(this).put(this, i + 1)
    }
    // Send given element one step backward
  , backward: function() {
      var i = this.position()
      
      if (i > 0)
        this.parent.removeElement(this).add(this, i - 1)
  
      return this
    }
    // Send given element all the way to the front
  , front: function() {
      return this.parent.removeElement(this).put(this)
    }
    // Send given element all the way to the back
  , back: function() {
      if (this.position() > 0)
        this.parent.removeElement(this).add(this, 0)
      
      return this
    }
    // Inserts a given element before the targeted element
  , before: function(element) {
      element.remove()
  
      var i = this.position()
      
      this.parent.add(element, i)
  
      return this
    }
    // Insters a given element after the targeted element
  , after: function(element) {
      element.remove()
      
      var i = this.position()
      
      this.parent.add(element, i + 1)
  
      return this
    }
  
  })

  SVG.Mask = SVG.invent({
    // Initialize node
    create: function() {
      this.constructor.call(this, SVG.create('mask'))
  
      /* keep references to masked elements */
      this.targets = []
    }
  
    // Inherit from
  , inherit: SVG.Container
  
    // Add class methods
  , extend: {
      // Unmask all masked elements and remove itself
      remove: function() {
        /* unmask all targets */
        for (var i = this.targets.length - 1; i >= 0; i--)
          if (this.targets[i])
            this.targets[i].unmask()
        delete this.targets
  
        /* remove mask from parent */
        this.parent.removeElement(this)
        
        return this
      }
    }
    
    // Add parent method
  , construct: {
      // Create masking element
      mask: function() {
        return this.defs().put(new SVG.Mask)
      }
    }
  })
  
  
  SVG.extend(SVG.Element, {
    // Distribute mask to svg element
    maskWith: function(element) {
      /* use given mask or create a new one */
      this.masker = element instanceof SVG.Mask ? element : this.parent.mask().add(element)
  
      /* store reverence on self in mask */
      this.masker.targets.push(this)
      
      /* apply mask */
      return this.attr('mask', 'url("#' + this.masker.attr('id') + '")')
    }
    // Unmask element
  , unmask: function() {
      delete this.masker
      return this.attr('mask', null)
    }
    
  })


  SVG.Clip = SVG.invent({
    // Initialize node
    create: function() {
      this.constructor.call(this, SVG.create('clipPath'))
  
      /* keep references to clipped elements */
      this.targets = []
    }
  
    // Inherit from
  , inherit: SVG.Container
  
    // Add class methods
  , extend: {
      // Unclip all clipped elements and remove itself
      remove: function() {
        /* unclip all targets */
        for (var i = this.targets.length - 1; i >= 0; i--)
          if (this.targets[i])
            this.targets[i].unclip()
        delete this.targets
  
        /* remove clipPath from parent */
        this.parent.removeElement(this)
        
        return this
      }
    }
    
    // Add parent method
  , construct: {
      // Create clipping element
      clip: function() {
        return this.defs().put(new SVG.Clip)
      }
    }
  })
  
  //
  SVG.extend(SVG.Element, {
    // Distribute clipPath to svg element
    clipWith: function(element) {
      /* use given clip or create a new one */
      this.clipper = element instanceof SVG.Clip ? element : this.parent.clip().add(element)
  
      /* store reverence on self in mask */
      this.clipper.targets.push(this)
      
      /* apply mask */
      return this.attr('clip-path', 'url("#' + this.clipper.attr('id') + '")')
    }
    // Unclip element
  , unclip: function() {
      delete this.clipper
      return this.attr('clip-path', null)
    }
    
  })

  SVG.Gradient = SVG.invent({
    // Initialize node
    create: function(type) {
      this.constructor.call(this, SVG.create(type + 'Gradient'))
      
      /* store type */
      this.type = type
    }
  
    // Inherit from
  , inherit: SVG.Container
  
    // Add class methods
  , extend: {
      // From position
      from: function(x, y) {
        return this.type == 'radial' ?
          this.attr({ fx: new SVG.Number(x), fy: new SVG.Number(y) }) :
          this.attr({ x1: new SVG.Number(x), y1: new SVG.Number(y) })
      }
      // To position
    , to: function(x, y) {
        return this.type == 'radial' ?
          this.attr({ cx: new SVG.Number(x), cy: new SVG.Number(y) }) :
          this.attr({ x2: new SVG.Number(x), y2: new SVG.Number(y) })
      }
      // Radius for radial gradient
    , radius: function(r) {
        return this.type == 'radial' ?
          this.attr({ r: new SVG.Number(r) }) :
          this
      }
      // Add a color stop
    , at: function(offset, color, opacity) {
        return this.put(new SVG.Stop).update(offset, color, opacity)
      }
      // Update gradient
    , update: function(block) {
        /* remove all stops */
        this.clear()
        
        /* invoke passed block */
        if (typeof block == 'function')
          block.call(this, this)
        
        return this
      }
      // Return the fill id
    , fill: function() {
        return 'url(#' + this.id() + ')'
      }
      // Alias string convertion to fill
    , toString: function() {
        return this.fill()
      }
    }
    
    // Add parent method
  , construct: {
      // Create gradient element in defs
      gradient: function(type, block) {
        return this.defs().gradient(type, block)
      }
    }
  })
  
  SVG.extend(SVG.Defs, {
    // define gradient
    gradient: function(type, block) {
      return this.put(new SVG.Gradient(type)).update(block)
    }
    
  })
  
  SVG.Stop = SVG.invent({
    // Initialize node
    create: 'stop'
  
    // Inherit from
  , inherit: SVG.Element
  
    // Add class methods
  , extend: {
      // add color stops
      update: function(o) {
        if (typeof o == 'number' || o instanceof SVG.Number) {
          o = {
            offset:  arguments[0]
          , color:   arguments[1]
          , opacity: arguments[2]
          }
        }
  
        /* set attributes */
        if (o.opacity != null) this.attr('stop-opacity', o.opacity)
        if (o.color   != null) this.attr('stop-color', o.color)
        if (o.offset  != null) this.attr('offset', new SVG.Number(o.offset))
  
        return this
      }
    }
  
  })


  SVG.Pattern = SVG.invent({
    // Initialize node
    create: 'pattern'
  
    // Inherit from
  , inherit: SVG.Container
  
    // Add class methods
  , extend: {
      // Return the fill id
  	  fill: function() {
  	    return 'url(#' + this.id() + ')'
  	  }
  	  // Update pattern by rebuilding
  	, update: function(block) {
  			/* remove content */
        this.clear()
        
        /* invoke passed block */
        if (typeof block == 'function')
        	block.call(this, this)
        
        return this
  		}
  	  // Alias string convertion to fill
  	, toString: function() {
  	    return this.fill()
  	  }
    }
    
    // Add parent method
  , construct: {
      // Create pattern element in defs
  	  pattern: function(width, height, block) {
  	    return this.defs().pattern(width, height, block)
  	  }
    }
  })
  
  SVG.extend(SVG.Defs, {
    // Define gradient
    pattern: function(width, height, block) {
      return this.put(new SVG.Pattern).update(block).attr({
        x:            0
      , y:            0
      , width:        width
      , height:       height
      , patternUnits: 'userSpaceOnUse'
      })
    }
  
  })

  SVG.Doc = SVG.invent({
    // Initialize node
    create: function(element) {
      /* ensure the presence of a html element */
      this.parent = typeof element == 'string' ?
        document.getElementById(element) :
        element
      
      /* If the target is an svg element, use that element as the main wrapper.
         This allows svg.js to work with svg documents as well. */
      this.constructor
        .call(this, this.parent.nodeName == 'svg' ? this.parent : SVG.create('svg'))
      
      /* set svg element attributes */
      this
        .attr({ xmlns: SVG.ns, version: '1.1', width: '100%', height: '100%' })
        .attr('xmlns:xlink', SVG.xlink, SVG.xmlns)
      
      /* create the <defs> node */
      this._defs = new SVG.Defs
      this._defs.parent = this
      this.node.appendChild(this._defs.node)
  
      /* turn off sub pixel offset by default */
      this.doSpof = false
      
      /* ensure correct rendering */
      if (this.parent != this.node)
        this.stage()
    }
  
    // Inherit from
  , inherit: SVG.Container
  
    // Add class methods
  , extend: {
      /* enable drawing */
      stage: function() {
        var element = this
  
        /* insert element */
        this.parent.appendChild(this.node)
  
        /* fix sub-pixel offset */
        element.spof()
        
        /* make sure sub-pixel offset is fixed every time the window is resized */
        SVG.on(window, 'resize', function() {
          element.spof()
        })
  
        return this
      }
  
      // Creates and returns defs element
    , defs: function() {
        return this._defs
      }
  
      // Fix for possible sub-pixel offset. See:
      // https://bugzilla.mozilla.org/show_bug.cgi?id=608812
    , spof: function() {
        if (this.doSpof) {
          var pos = this.node.getScreenCTM()
          
          if (pos)
            this
              .style('left', (-pos.e % 1) + 'px')
              .style('top',  (-pos.f % 1) + 'px')
        }
        
        return this
      }
  
      // Enable sub-pixel offset
    , fixSubPixelOffset: function() {
        this.doSpof = true
  
        return this
      }
      
        // Removes the doc from the DOM
    , remove: function() {
        if(this.parent) {
          this.parent.removeChild(this.node);
          this.parent = null;
        }
  
        return this;
      }
    }
    
  })


  SVG.Shape = SVG.invent({
    // Initialize node
    create: function(element) {
  	  this.constructor.call(this, element)
  	}
  
    // Inherit from
  , inherit: SVG.Element
  
  })

  SVG.Symbol = SVG.invent({
    // Initialize node
    create: 'symbol'
  
    // Inherit from
  , inherit: SVG.Container
  
    // Add parent method
  , construct: {
      // Create a new symbol
      symbol: function() {
        return this.defs().put(new SVG.Symbol)
      }
    }
    
  })

  SVG.Use = SVG.invent({
    // Initialize node
    create: 'use'
  
    // Inherit from
  , inherit: SVG.Shape
  
    // Add class methods
  , extend: {
      // Use element as a reference
      element: function(element, file) {
        /* store target element */
        this.target = element
  
        /* set lined element */
        return this.attr('href', (file || '') + '#' + element, SVG.xlink)
      }
    }
    
    // Add parent method
  , construct: {
      // Create a use element
      use: function(element, file) {
        return this.put(new SVG.Use).element(element, file)
      }
    }
  })

  SVG.Rect = SVG.invent({
  	// Initialize node
    create: 'rect'
  
  	// Inherit from
  , inherit: SVG.Shape
  	
  	// Add parent method
  , construct: {
    	// Create a rect element
    	rect: function(width, height) {
    	  return this.put(new SVG.Rect().size(width, height))
    	}
    	
  	}
  	
  })

  SVG.Ellipse = SVG.invent({
    // Initialize node
    create: 'ellipse'
  
    // Inherit from
  , inherit: SVG.Shape
  
    // Add class methods
  , extend: {
      // Move over x-axis
      x: function(x) {
        return x == null ? this.cx() - this.attr('rx') : this.cx(x + this.attr('rx'))
      }
      // Move over y-axis
    , y: function(y) {
        return y == null ? this.cy() - this.attr('ry') : this.cy(y + this.attr('ry'))
      }
      // Move by center over x-axis
    , cx: function(x) {
        return x == null ? this.attr('cx') : this.attr('cx', new SVG.Number(x).divide(this.trans.scaleX))
      }
      // Move by center over y-axis
    , cy: function(y) {
        return y == null ? this.attr('cy') : this.attr('cy', new SVG.Number(y).divide(this.trans.scaleY))
      }
      // Set width of element
    , width: function(width) {
        return width == null ? this.attr('rx') * 2 : this.attr('rx', new SVG.Number(width).divide(2))
      }
      // Set height of element
    , height: function(height) {
        return height == null ? this.attr('ry') * 2 : this.attr('ry', new SVG.Number(height).divide(2))
      }
      // Custom size function
    , size: function(width, height) {
        var p = proportionalSize(this.bbox(), width, height)
  
        return this.attr({
          rx: new SVG.Number(p.width).divide(2)
        , ry: new SVG.Number(p.height).divide(2)
        })
      }
      
    }
  
    // Add parent method
  , construct: {
      // Create circle element, based on ellipse
      circle: function(size) {
        return this.ellipse(size, size)
      }
      // Create an ellipse
    , ellipse: function(width, height) {
        return this.put(new SVG.Ellipse).size(width, height).move(0, 0)
      }
      
    }
  
  })

  SVG.Line = SVG.invent({
    // Initialize node
    create: 'line'
  
    // Inherit from
  , inherit: SVG.Shape
  
    // Add class methods
  , extend: {
      // Move over x-axis
      x: function(x) {
        var b = this.bbox()
        
        return x == null ? b.x : this.attr({
          x1: this.attr('x1') - b.x + x
        , x2: this.attr('x2') - b.x + x
        })
      }
      // Move over y-axis
    , y: function(y) {
        var b = this.bbox()
        
        return y == null ? b.y : this.attr({
          y1: this.attr('y1') - b.y + y
        , y2: this.attr('y2') - b.y + y
        })
      }
      // Move by center over x-axis
    , cx: function(x) {
        var half = this.bbox().width / 2
        return x == null ? this.x() + half : this.x(x - half)
      }
      // Move by center over y-axis
    , cy: function(y) {
        var half = this.bbox().height / 2
        return y == null ? this.y() + half : this.y(y - half)
      }
      // Set width of element
    , width: function(width) {
        var b = this.bbox()
  
        return width == null ? b.width : this.attr(this.attr('x1') < this.attr('x2') ? 'x2' : 'x1', b.x + width)
      }
      // Set height of element
    , height: function(height) {
        var b = this.bbox()
  
        return height == null ? b.height : this.attr(this.attr('y1') < this.attr('y2') ? 'y2' : 'y1', b.y + height)
      }
      // Set line size by width and height
    , size: function(width, height) {
        var p = proportionalSize(this.bbox(), width, height)
  
        return this.width(p.width).height(p.height)
      }
      // Set path data
    , plot: function(x1, y1, x2, y2) {
        return this.attr({
          x1: x1
        , y1: y1
        , x2: x2
        , y2: y2
        })
      }
    }
    
    // Add parent method
  , construct: {
      // Create a line element
      line: function(x1, y1, x2, y2) {
        return this.put(new SVG.Line().plot(x1, y1, x2, y2))
      }
    }
  })


  SVG.Polyline = SVG.invent({
    // Initialize node
    create: 'polyline'
  
    // Inherit from
  , inherit: SVG.Shape
    
    // Add parent method
  , construct: {
      // Create a wrapped polyline element
      polyline: function(p) {
        return this.put(new SVG.Polyline).plot(p)
      }
    }
  })
  
  SVG.Polygon = SVG.invent({
    // Initialize node
    create: 'polygon'
  
    // Inherit from
  , inherit: SVG.Shape
    
    // Add parent method
  , construct: {
      // Create a wrapped polygon element
      polygon: function(p) {
        return this.put(new SVG.Polygon).plot(p)
      }
    }
  })
  
  // Add polygon-specific functions
  SVG.extend(SVG.Polyline, SVG.Polygon, {
    // Define morphable array
    morphArray:  SVG.PointArray
    // Plot new path
  , plot: function(p) {
      return this.attr('points', (this.array = new SVG.PointArray(p, [[0,0]])))
    }
    // Move by left top corner
  , move: function(x, y) {
      return this.attr('points', this.array.move(x, y))
    }
    // Move by left top corner over x-axis
  , x: function(x) {
      return x == null ? this.bbox().x : this.move(x, this.bbox().y)
    }
    // Move by left top corner over y-axis
  , y: function(y) {
      return y == null ? this.bbox().y : this.move(this.bbox().x, y)
    }
    // Set width of element
  , width: function(width) {
      var b = this.bbox()
  
      return width == null ? b.width : this.size(width, b.height)
    }
    // Set height of element
  , height: function(height) {
      var b = this.bbox()
  
      return height == null ? b.height : this.size(b.width, height) 
    }
    // Set element size to given width and height
  , size: function(width, height) {
      var p = proportionalSize(this.bbox(), width, height)
  
      return this.attr('points', this.array.size(p.width, p.height))
    }
  
  })

  SVG.Path = SVG.invent({
    // Initialize node
    create: 'path'
  
    // Inherit from
  , inherit: SVG.Shape
  
    // Add class methods
  , extend: {
      // Plot new poly points
      plot: function(p) {
        return this.attr('d', (this.array = new SVG.PathArray(p, [['M', 0, 0]])))
      }
      // Move by left top corner
    , move: function(x, y) {
        return this.attr('d', this.array.move(x, y))
      }
      // Move by left top corner over x-axis
    , x: function(x) {
        return x == null ? this.bbox().x : this.move(x, this.bbox().y)
      }
      // Move by left top corner over y-axis
    , y: function(y) {
        return y == null ? this.bbox().y : this.move(this.bbox().x, y)
      }
      // Set element size to given width and height
    , size: function(width, height) {
        var p = proportionalSize(this.bbox(), width, height)
        
        return this.attr('d', this.array.size(p.width, p.height))
      }
      // Set width of element
    , width: function(width) {
        return width == null ? this.bbox().width : this.size(width, this.bbox().height)
      }
      // Set height of element
    , height: function(height) {
        return height == null ? this.bbox().height : this.size(this.bbox().width, height)
      }
      
    }
    
    // Add parent method
  , construct: {
      // Create a wrapped path element
      path: function(d) {
        return this.put(new SVG.Path).plot(d)
      }
    }
  })

  SVG.Image = SVG.invent({
    // Initialize node
    create: 'image'
  
    // Inherit from
  , inherit: SVG.Shape
  
    // Add class methods
  , extend: {
      // (re)load image
      load: function(url) {
        if (!url) return this
  
        var self = this
          , img  = document.createElement('img')
        
        /* preload image */
        img.onload = function() {
          var p = self.doc(SVG.Pattern)
  
          /* ensure image size */
          if (self.width() == 0 && self.height() == 0)
            self.size(img.width, img.height)
  
          /* ensure pattern size if not set */
          if (p && p.width() == 0 && p.height() == 0)
            p.size(self.width(), self.height())
          
          /* callback */
          if (typeof self._loaded === 'function')
            self._loaded.call(self, {
              width:  img.width
            , height: img.height
            , ratio:  img.width / img.height
            , url:    url
            })
        }
  
        return this.attr('href', (img.src = this.src = url), SVG.xlink)
      }
      // Add loade callback
    , loaded: function(loaded) {
        this._loaded = loaded
        return this
      }
    }
    
    // Add parent method
  , construct: {
      // Create image element, load image and set its size
      image: function(source, width, height) {
        return this.put(new SVG.Image).load(source).size(width || 0, height || width || 0)
      }
    }
  
  })

  SVG.Text = SVG.invent({
    // Initialize node
    create: function() {
      this.constructor.call(this, SVG.create('text'))
      
      this._leading = new SVG.Number(1.3)    /* store leading value for rebuilding */
      this._rebuild = true                   /* enable automatic updating of dy values */
      this._build   = false                  /* disable build mode for adding multiple lines */
  
      /* set default font */
      this.attr('font-family', SVG.defaults.attrs['font-family'])
    }
  
    // Inherit from
  , inherit: SVG.Shape
  
    // Add class methods
  , extend: {
      // Move over x-axis
      x: function(x) {
        /* act as getter */
        if (x == null)
          return this.attr('x')
        
        /* move lines as well if no textPath is present */
        if (!this.textPath)
          this.lines.each(function() { if (this.newLined) this.x(x) })
  
        return this.attr('x', x)
      }
      // Move over y-axis
    , y: function(y) {
        var oy = this.attr('y')
          , o  = typeof oy === 'number' ? oy - this.bbox().y : 0
  
        /* act as getter */
        if (y == null)
          return typeof oy === 'number' ? oy - o : oy
  
        return this.attr('y', typeof y === 'number' ? y + o : y)
      }
      // Move center over x-axis
    , cx: function(x) {
        return x == null ? this.bbox().cx : this.x(x - this.bbox().width / 2)
      }
      // Move center over y-axis
    , cy: function(y) {
        return y == null ? this.bbox().cy : this.y(y - this.bbox().height / 2)
      }
      // Set the text content
    , text: function(text) {
        /* act as getter */
        if (typeof text === 'undefined') return this.content
        
        /* remove existing content */
        this.clear().build(true)
        
        if (typeof text === 'function') {
          /* call block */
          text.call(this, this)
  
        } else {
          /* store text and make sure text is not blank */
          text = (this.content = text).split('\n')
          
          /* build new lines */
          for (var i = 0, il = text.length; i < il; i++)
            this.tspan(text[i]).newLine()
        }
        
        /* disable build mode and rebuild lines */
        return this.build(false).rebuild()
      }
      // Set font size
    , size: function(size) {
        return this.attr('font-size', size).rebuild()
      }
      // Set / get leading
    , leading: function(value) {
        /* act as getter */
        if (value == null)
          return this._leading
        
        /* act as setter */
        this._leading = new SVG.Number(value)
        
        return this.rebuild()
      }
      // Rebuild appearance type
    , rebuild: function(rebuild) {
        /* store new rebuild flag if given */
        if (typeof rebuild == 'boolean')
          this._rebuild = rebuild
  
        /* define position of all lines */
        if (this._rebuild) {
          var self = this
          
          this.lines.each(function() {
            if (this.newLined) {
              if (!this.textPath)
                this.attr('x', self.attr('x'))
              this.attr('dy', self._leading * new SVG.Number(self.attr('font-size'))) 
            }
          })
  
          this.fire('rebuild')
        }
  
        return this
      }
      // Enable / disable build mode
    , build: function(build) {
        this._build = !!build
        return this
      }
    }
    
    // Add parent method
  , construct: {
      // Create text element
      text: function(text) {
        return this.put(new SVG.Text).text(text)
      }
      // Create plain text element
    , plain: function(text) {
        return this.put(new SVG.Text).plain(text)
      }
    }
  
  })
  
  SVG.TSpan = SVG.invent({
    // Initialize node
    create: 'tspan'
  
    // Inherit from
  , inherit: SVG.Shape
  
    // Add class methods
  , extend: {
      // Set text content
      text: function(text) {
        typeof text === 'function' ? text.call(this, this) : this.plain(text)
  
        return this
      }
      // Shortcut dx
    , dx: function(dx) {
        return this.attr('dx', dx)
      }
      // Shortcut dy
    , dy: function(dy) {
        return this.attr('dy', dy)
      }
      // Create new line
    , newLine: function() {
        /* fetch text parent */
        var t = this.doc(SVG.Text)
  
        /* mark new line */
        this.newLined = true
  
        /* apply new hy¡n */
        return this.dy(t._leading * t.attr('font-size')).attr('x', t.x())
      }
    }
    
  })
  
  SVG.extend(SVG.Text, SVG.TSpan, {
    // Create plain text node
    plain: function(text) {
      /* clear if build mode is disabled */
      if (this._build === false)
        this.clear()
  
      /* create text node */
      this.node.appendChild(document.createTextNode((this.content = text)))
      
      return this
    }
    // Create a tspan
  , tspan: function(text) {
      var node  = (this.textPath || this).node
        , tspan = new SVG.TSpan
  
      /* clear if build mode is disabled */
      if (this._build === false)
        this.clear()
      
      /* add new tspan and reference */
      node.appendChild(tspan.node)
      tspan.parent = this
  
      /* only first level tspans are considered to be "lines" */
      if (this instanceof SVG.Text)
        this.lines.add(tspan)
  
      return tspan.text(text)
    }
    // Clear all lines
  , clear: function() {
      var node = (this.textPath || this).node
  
      /* remove existing child nodes */
      while (node.hasChildNodes())
        node.removeChild(node.lastChild)
      
      /* reset content references  */
      if (this instanceof SVG.Text) {
        delete this.lines
        this.lines = new SVG.Set
        this.content = ''
      }
      
      return this
    }
    // Get length of text element
  , length: function() {
      return this.node.getComputedTextLength()
    }
  })


  SVG.TextPath = SVG.invent({
    // Initialize node
    create: 'textPath'
  
    // Inherit from
  , inherit: SVG.Element
  
    // Define parent class
  , parent: SVG.Text
  
    // Add parent method
  , construct: {
      // Create path for text to run on
      path: function(d) {
        /* create textPath element */
        this.textPath = new SVG.TextPath
  
        /* move lines to textpath */
        while(this.node.hasChildNodes())
          this.textPath.node.appendChild(this.node.firstChild)
  
        /* add textPath element as child node */
        this.node.appendChild(this.textPath.node)
  
        /* create path in defs */
        this.track = this.doc().defs().path(d)
  
        /* create circular reference */
        this.textPath.parent = this
  
        /* link textPath to path and add content */
        this.textPath.attr('href', '#' + this.track, SVG.xlink)
  
        return this
      }
      // Plot path if any
    , plot: function(d) {
        if (this.track) this.track.plot(d)
        return this
      }
    }
  })

  SVG.Nested = SVG.invent({
    // Initialize node
    create: function() {
      this.constructor.call(this, SVG.create('svg'))
      
      this.style('overflow', 'visible')
    }
  
    // Inherit from
  , inherit: SVG.Container
    
    // Add parent method
  , construct: {
      // Create nested svg document
      nested: function() {
        return this.put(new SVG.Nested)
      }
    }
  })

  SVG.A = SVG.invent({
    // Initialize node
    create: 'a'
  
    // Inherit from
  , inherit: SVG.Container
  
    // Add class methods
  , extend: {
      // Link url
      to: function(url) {
        return this.attr('href', url, SVG.xlink)
      }
      // Link show attribute
    , show: function(target) {
        return this.attr('show', target, SVG.xlink)
      }
      // Link target attribute
    , target: function(target) {
        return this.attr('target', target)
      }
    }
    
    // Add parent method
  , construct: {
      // Create a hyperlink element
      link: function(url) {
        return this.put(new SVG.A).to(url)
      }
    }
  })
  
  SVG.extend(SVG.Element, {
    // Create a hyperlink element
    linkTo: function(url) {
      var link = new SVG.A
  
      if (typeof url == 'function')
        url.call(link, link)
      else
        link.to(url)
  
      return this.parent.put(link).put(this)
    }
    
  })

  SVG.Marker = SVG.invent({
    // Initialize node
    create: 'marker'
  
    // Inherit from
  , inherit: SVG.Container
  
    // Add class methods
  , extend: {
      // Set width of element
      width: function(width) {
        return this.attr('markerWidth', width)
      }
      // Set height of element
    , height: function(height) {
        return this.attr('markerHeight', height)
      }
      // Set marker refX and refY
    , ref: function(x, y) {
        return this.attr('refX', x).attr('refY', y)
      }
      // Update marker
    , update: function(block) {
        /* remove all content */
        this.clear()
        
        /* invoke passed block */
        if (typeof block == 'function')
          block.call(this, this)
        
        return this
      }
      // Return the fill id
    , toString: function() {
        return 'url(#' + this.id() + ')'
      }
    }
  
    // Add parent method
  , construct: {
      marker: function(width, height, block) {
        // Create marker element in defs
        return this.defs().marker(width, height, block)
      }
    }
  
  })
  
  SVG.extend(SVG.Defs, {
    // Create marker
    marker: function(width, height, block) {
      // Set default viewbox to match the width and height, set ref to cx and cy and set orient to auto
      return this.put(new SVG.Marker)
        .size(width, height)
        .ref(width / 2, height / 2)
        .viewbox(0, 0, width, height)
        .attr('orient', 'auto')
        .update(block)
    }
    
  })
  
  SVG.extend(SVG.Line, SVG.Polyline, SVG.Polygon, SVG.Path, {
    // Create and attach markers
    marker: function(marker, width, height, block) {
      var attr = ['marker']
  
      // Build attribute name
      if (marker != 'all') attr.push(marker)
      attr = attr.join('-')
  
      // Set marker attribute
      marker = arguments[1] instanceof SVG.Marker ?
        arguments[1] :
        this.doc().marker(width, height, block)
      
      return this.attr(attr, marker)
    }
    
  })

  var sugar = {
    stroke: ['color', 'width', 'opacity', 'linecap', 'linejoin', 'miterlimit', 'dasharray', 'dashoffset']
  , fill:   ['color', 'opacity', 'rule']
  , prefix: function(t, a) {
      return a == 'color' ? t : t + '-' + a
    }
  }
  
  /* Add sugar for fill and stroke */
  ;['fill', 'stroke'].forEach(function(m) {
    var i, extension = {}
    
    extension[m] = function(o) {
      if (typeof o == 'string' || SVG.Color.isRgb(o) || (o && typeof o.fill === 'function'))
        this.attr(m, o)
  
      else
        /* set all attributes from sugar.fill and sugar.stroke list */
        for (i = sugar[m].length - 1; i >= 0; i--)
          if (o[sugar[m][i]] != null)
            this.attr(sugar.prefix(m, sugar[m][i]), o[sugar[m][i]])
      
      return this
    }
    
    SVG.extend(SVG.Element, SVG.FX, extension)
    
  })
  
  SVG.extend(SVG.Element, SVG.FX, {
    // Rotation
    rotate: function(deg, x, y) {
      return this.transform({
        rotation: deg || 0
      , cx: x
      , cy: y
      })
    }
    // Skew
  , skew: function(x, y) {
      return this.transform({
        skewX: x || 0
      , skewY: y || 0
      })
    }
    // Scale
  , scale: function(x, y) {
      return this.transform({
        scaleX: x
      , scaleY: y == null ? x : y
      })
    }
    // Translate
  , translate: function(x, y) {
      return this.transform({
        x: x
      , y: y
      })
    }
    // Matrix
  , matrix: function(m) {
      return this.transform({ matrix: m })
    }
    // Opacity
  , opacity: function(value) {
      return this.attr('opacity', value)
    }
  
  })
  
  SVG.extend(SVG.Rect, SVG.Ellipse, SVG.FX, {
    // Add x and y radius
    radius: function(x, y) {
      return this.attr({ rx: x, ry: y || x })
    }
  
  })
  
  SVG.extend(SVG.Path, {
    // Get path length
    length: function() {
      return this.node.getTotalLength()
    }
    // Get point at length
  , pointAt: function(length) {
      return this.node.getPointAtLength(length)
    }
  
  })
  
  SVG.extend(SVG.Parent, SVG.Text, SVG.FX, {
    // Set font 
    font: function(o) {
      for (var k in o)
        k == 'leading' ?
          this.leading(o[k]) :
        k == 'anchor' ?
          this.attr('text-anchor', o[k]) :
        k == 'size' || k == 'family' || k == 'weight' || k == 'stretch' || k == 'variant' || k == 'style' ?
          this.attr('font-'+ k, o[k]) :
          this.attr(k, o[k])
      
      return this
    }
    
  })
  


  SVG.Set = SVG.invent({
    // Initialize
    create: function() {
      /* set initial state */
      this.clear()
    }
  
    // Add class methods
  , extend: {
      // Add element to set
      add: function() {
        var i, il, elements = [].slice.call(arguments)
  
        for (i = 0, il = elements.length; i < il; i++)
          this.members.push(elements[i])
        
        return this
      }
      // Remove element from set
    , remove: function(element) {
        var i = this.index(element)
        
        /* remove given child */
        if (i > -1)
          this.members.splice(i, 1)
  
        return this
      }
      // Iterate over all members
    , each: function(block) {
        for (var i = 0, il = this.members.length; i < il; i++)
          block.apply(this.members[i], [i, this.members])
  
        return this
      }
      // Restore to defaults
    , clear: function() {
        /* initialize store */
        this.members = []
  
        return this
      }
      // Checks if a given element is present in set
    , has: function(element) {
        return this.index(element) >= 0
      }
      // retuns index of given element in set
    , index: function(element) {
        return this.members.indexOf(element)
      }
      // Get member at given index
    , get: function(i) {
        return this.members[i]
      }
      // Get first member
    , first: function() {
        return this.get(0)
      }
      // Get last member
    , last: function() {
        return this.get(this.members.length - 1)
      }
      // Default value
    , valueOf: function() {
        return this.members
      }
      // Get the bounding box of all members included or empty box if set has no items
    , bbox: function(){
        var box = new SVG.BBox()
  
        /* return an empty box of there are no members */
        if (this.members.length == 0)
          return box
  
        /* get the first rbox and update the target bbox */
        var rbox = this.members[0].rbox()
        box.x      = rbox.x
        box.y      = rbox.y
        box.width  = rbox.width
        box.height = rbox.height
  
        this.each(function() {
          /* user rbox for correct position and visual representation */
          box = box.merge(this.rbox())
        })
  
        return box
      }
    }
    
    // Add parent method
  , construct: {
      // Create a new set
      set: function() {
        return new SVG.Set
      }
    }
  })
  
  SVG.SetFX = SVG.invent({
    // Initialize node
    create: function(set) {
      /* store reference to set */
      this.set = set
    }
  
  })
  
  // Alias methods
  SVG.Set.inherit = function() {
    var m
      , methods = []
    
    /* gather shape methods */
    for(var m in SVG.Shape.prototype)
      if (typeof SVG.Shape.prototype[m] == 'function' && typeof SVG.Set.prototype[m] != 'function')
        methods.push(m)
  
    /* apply shape aliasses */
    methods.forEach(function(method) {
      SVG.Set.prototype[method] = function() {
        for (var i = 0, il = this.members.length; i < il; i++)
          if (this.members[i] && typeof this.members[i][method] == 'function')
            this.members[i][method].apply(this.members[i], arguments)
  
        return method == 'animate' ? (this.fx || (this.fx = new SVG.SetFX(this))) : this
      }
    })
  
    /* clear methods for the next round */
    methods = []
  
    /* gather fx methods */
    for(var m in SVG.FX.prototype)
      if (typeof SVG.FX.prototype[m] == 'function' && typeof SVG.SetFX.prototype[m] != 'function')
        methods.push(m)
  
    /* apply fx aliasses */
    methods.forEach(function(method) {
      SVG.SetFX.prototype[method] = function() {
        for (var i = 0, il = this.set.members.length; i < il; i++)
          this.set.members[i].fx[method].apply(this.set.members[i].fx, arguments)
  
        return this
      }
    })
  }
  
  


  SVG.extend(SVG.Element, {
  	// Store data values on svg nodes
    data: function(a, v, r) {
    	if (typeof a == 'object') {
    		for (v in a)
    			this.data(v, a[v])
  
      } else if (arguments.length < 2) {
        try {
          return JSON.parse(this.attr('data-' + a))
        } catch(e) {
          return this.attr('data-' + a)
        }
        
      } else {
        this.attr(
          'data-' + a
        , v === null ?
            null :
          r === true || typeof v === 'string' || typeof v === 'number' ?
            v :
            JSON.stringify(v)
        )
      }
      
      return this
    }
  })

  SVG.extend(SVG.Element, {
    // Remember arbitrary data
    remember: function(k, v) {
      /* remember every item in an object individually */
      if (typeof arguments[0] == 'object')
        for (var v in k)
          this.remember(v, k[v])
  
      /* retrieve memory */
      else if (arguments.length == 1)
        return this.memory()[k]
  
      /* store memory */
      else
        this.memory()[k] = v
  
      return this
    }
  
    // Erase a given memory
  , forget: function() {
      if (arguments.length == 0)
        this._memory = {}
      else
        for (var i = arguments.length - 1; i >= 0; i--)
          delete this.memory()[arguments[i]]
  
      return this
    }
  
    // Initialize or return local memory object
  , memory: function() {
      return this._memory || (this._memory = {})
    }
  
  })

  function camelCase(s) { 
    return s.toLowerCase().replace(/-(.)/g, function(m, g) {
      return g.toUpperCase()
    })
  }
  
  // Ensure to six-based hex 
  function fullHex(hex) {
    return hex.length == 4 ?
      [ '#',
        hex.substring(1, 2), hex.substring(1, 2)
      , hex.substring(2, 3), hex.substring(2, 3)
      , hex.substring(3, 4), hex.substring(3, 4)
      ].join('') : hex
  }
  
  // Component to hex value
  function compToHex(comp) {
    var hex = comp.toString(16)
    return hex.length == 1 ? '0' + hex : hex
  }
  
  // Calculate proportional width and height values when necessary
  function proportionalSize(box, width, height) {
    if (width == null || height == null) {
      if (height == null)
        height = box.height / box.width * width
      else if (width == null)
        width = box.width / box.height * height
    }
    
    return {
      width:  width
    , height: height
    }
  }
  
  // Calculate position according to from and to
  function at(o, pos) {
    /* number recalculation (don't bother converting to SVG.Number for performance reasons) */
    return typeof o.from == 'number' ?
      o.from + (o.to - o.from) * pos :
    
    /* instance recalculation */
    o instanceof SVG.Color || o instanceof SVG.Number ? o.at(pos) :
    
    /* for all other values wait until pos has reached 1 to return the final value */
    pos < 1 ? o.from : o.to
  }
  
  // PathArray Helpers
  function arrayToString(a) {
    for (var i = 0, il = a.length, s = ''; i < il; i++) {
      s += a[i][0]
  
      if (a[i][1] != null) {
        s += a[i][1]
  
        if (a[i][2] != null) {
          s += ' '
          s += a[i][2]
  
          if (a[i][3] != null) {
            s += ' '
            s += a[i][3]
            s += ' '
            s += a[i][4]
  
            if (a[i][5] != null) {
              s += ' '
              s += a[i][5]
              s += ' '
              s += a[i][6]
  
              if (a[i][7] != null) {
                s += ' '
                s += a[i][7]
              }
            }
          }
        }
      }
    }
    
    return s + ' '
  }
  
  // Add more bounding box properties
  function boxProperties(b) {
    b.x2 = b.x + b.width
    b.y2 = b.y + b.height
    b.cx = b.x + b.width / 2
    b.cy = b.y + b.height / 2
  }
  
  // Parse a matrix string
  function parseMatrix(o) {
    if (o.matrix) {
      /* split matrix string */
      var m = o.matrix.replace(/\s/g, '').split(',')
      
      /* pasrse values */
      if (m.length == 6) {
        o.a = parseFloat(m[0])
        o.b = parseFloat(m[1])
        o.c = parseFloat(m[2])
        o.d = parseFloat(m[3])
        o.e = parseFloat(m[4])
        o.f = parseFloat(m[5])
      }
    }
    
    return o
  }
  
  // Get id from reference string
  function idFromReference(url) {
    var m = url.toString().match(SVG.regex.reference)
  
    if (m) return m[1]
  }


  return SVG
}));
;// svg.draggable.js 0.1.0 - Copyright (c) 2014 Wout Fierens - Licensed under the MIT license
// extended by Florian Loch
;(function() {

  SVG.extend(SVG.Element, {
    // Make element draggable
    // Constraint might be a object (as described in readme.md) or a function in the form "function (x, y)" that gets called before every move.
    // The function can return a boolean or a object of the form {x, y}, to which the element will be moved. "False" skips moving, true moves to raw x, y.
    draggable: function(constraint) {
      var start, drag, end
        , dragstarted = false
        , element = this
        , parent  = this.parent._parent(SVG.Nested) || this._parent(SVG.Doc)
      
		element.dragged = false;      
      
      /* remove draggable if already present */
      if (typeof this.fixed === 'function')
        this.fixed()
      
      /* ensure constraint object */
      constraint = constraint || {}
      
      /* start dragging */
      start = function(event) {
        event = event || window.event
        
        /* invoke any callbacks */
        if (element.beforedrag)
          element.beforedrag(event)
        
        /* get element bounding box */
        var box = element.bbox()
        
        if (element instanceof SVG.G) {
          box.x = element.x()
          box.y = element.y()
          
        } else if (element instanceof SVG.Nested) {
          box = {
            x:      element.x()
          , y:      element.y()
          , width:  element.width()
          , height: element.height()
          }
        }
        
        /* store event */
        element.startEvent = event
        
        /* store start position */
        element.startPosition = {
          x:        box.x
        , y:        box.y
        , width:    box.width
        , height:   box.height
        , zoom:     parent.viewbox().zoom
        , rotation: element.transform('rotation') * Math.PI / 180
        }
        
        /* add while and end events to window */
        SVG.on(window, 'mousemove', drag)
        SVG.on(window, 'mouseup',   end)
        
        /* prevent selection dragging */
        event.preventDefault ? event.preventDefault() : event.returnValue = false
      }
      
      /* while dragging */
      drag = function(event) {
        event = event || window.event
        
        if (element.startEvent) {
          /* calculate move position */
          var x, y
            , rotation  = element.startPosition.rotation
            , width     = element.startPosition.width
            , height    = element.startPosition.height
            , delta     = {
                x:    event.pageX - element.startEvent.pageX,
                y:    event.pageY - element.startEvent.pageY,
                zoom: element.startPosition.zoom
              }
          
          /* caculate new position [with rotation correction] */
          x = element.startPosition.x + (delta.x * Math.cos(rotation) + delta.y * Math.sin(rotation))  / element.startPosition.zoom
          y = element.startPosition.y + (delta.y * Math.cos(rotation) + delta.x * Math.sin(-rotation)) / element.startPosition.zoom
          
          /* move the element to its new position, if possible by constraint */
          if (typeof constraint === 'function') {
            var coord = constraint(x, y, element, delta)
            
            if (coord === true){
               dragstarted = true
               element.move(x, y) 
            }
            else if (typeof coord === 'object') {
               dragstarted = true
               element.move(coord.x, coord.y)
            }
          } else if (typeof constraint === 'object') {
            /* keep element within constrained box */
            if (constraint.minX != null && x < constraint.minX)
              x = constraint.minX
            else if (constraint.maxX != null && x > constraint.maxX - width)
              x = constraint.maxX - width
            
            if (constraint.minY != null && y < constraint.minY)
              y = constraint.minY
            else if (constraint.maxY != null && y > constraint.maxY - height)
              y = constraint.maxY - height

            dragstarted = true;
            element.move(x, y)          
          }

			 /* invoke any callbacks */
          if (dragstarted && !element.dragged && element.dragstart){
            element.dragged = true;           
            element.dragstart({ x: 0, y: 0, zoom: element.startPosition.zoom }, event)
          }
          /* invoke any callbacks */
          if (dragstarted && element.dragmove)
            element.dragmove({delta: delta, target: element}, event)
        }
      }
      
      /* when dragging ends */
      end = function(event) {
        event = event || window.event   
        
        /* calculate move position */
        var delta = {
          x:    event.pageX - element.startEvent.pageX
        , y:    event.pageY - element.startEvent.pageY
        , zoom: element.startPosition.zoom
        }
        
        /* reset store */
        element.startEvent    = null
        element.startPosition = null

        /* remove while and end events to window */
        SVG.off(window, 'mousemove', drag)
        SVG.off(window, 'mouseup',   end)

        /* invoke any callbacks */
        if (dragstarted && element.dragend){
          element.dragend(delta, event)
          window.setTimeout(function(){
			   element.dragged = false;
			 }, 1);        
        }
          
        dragstarted = false;
        
       
        
      }
      
      /* bind mousedown event */
      element.on('mousedown', start)
      
      /* disable draggable */
      element.fixed = function() {
        element.off('mousedown', start)
        
        SVG.off(window, 'mousemove', drag)
        SVG.off(window, 'mouseup',   end)
        
        start = drag = end = null
        
        return element
      }
      
      return this
    }
    
  })

}).call(this);
;// svg.path.js 0.2 - Copyright (c) 2013 Nils Lagerkvist - Licensed under the MIT license

(function(){


	SVG.math = {
		angle: function(p1, p2, p3){
			if (p3){
				return Math.abs(SVG.math.angle(p1, p3) - SVG.math.angle(p2, p3));
			}

			var angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);

			while (angle < 0){
				angle += 2 * Math.PI;
			}

			return angle;
		},

		rad: function(degree){
			return degree * Math.PI / 180;
		},

		deg: function(radians){
			return radians * 180 / Math.PI;
		},

		snapToAngle: function(angle, directions){
			var minDiff = 100,
				diff,
				i,
				length;

			// Find the smallest value in the array and add 2*PI to it
			directions.push(Math.min.apply( Math, directions ) + 2 * Math.PI);

			length = directions.length;

			while (angle > 2 * Math.PI){
				angle -= 2 * Math.PI;
			}

			while (angle < 0){
				angle += 2 * Math.PI;
			}

			for (i = 0; i < length; i += 1){
				diff = Math.abs(angle - directions[i]);
				if (diff > minDiff){
					return directions[i-1];
				}
				minDiff = diff;
			}

			// This is a special case when we match on the smallest angle + 2*PI
			return directions[0];
		},

		// linear interpolation of two values
		lerp: function(a, b, x) {
			return a + x * (b - a);
		}, 

		round: function(number, precision){
			precision = Math.pow(10, precision || 0).toFixed(precision < 0 ? -precision : 0);
			return Math.round(number * precision) / precision;
		}

	};
	
	

	SVG.math.Point = function Point(x, y){
		this.x = parseFloat(x);
		this.y = parseFloat(y);
	};

	SVG.extend(SVG.math.Point, {
		round: function(precision){
			this.x = SVG.math.round(this.x, precision);
			this.y = SVG.math.round(this.y, precision);
			return this;
		}	
	});

	SVG.math.Point.attr = {
		stroke: '#000',
		fill: 'none',
		radius: 5
	};

	SVG.extend(SVG.math.Point, {
		draw: function(svg, options){
			if (svg){
				attr = options || SVG.math.Point.attr;
				options = options || {};
				var radius = attr.radus || 5;
				delete attr.radius;

				this.svg = svg;
				this.circle = svg.circle(radius).attr(options).move(this.x, this.y);
			}
			else if (this.circle){
				this.circle.remove();
				delete this.svg;
				delete this.circle;
			}

			return this;
		}
	});

	SVG.math.Line = function Line(p1, p2){
		this.update(p1, p2);
	};

	SVG.math.Line.attr = {
		stroke: '#000',
		fill: 'none'
	};

	SVG.extend(SVG.math.Line, {
		update: function(p1, p2){               
			this.p1 = p1;
			this.p2 = p2;		
        
            this.a = this.p2.y - this.p1.y;
            this.b = this.p1.x - this.p2.x;

            this.c = p1.x * p2.y - p2.x * p1.y; 

            return this;
		},
		draw: function(svg, options){
			if (svg){
				attr = attr || SVG.math.Line.attr;
				this.svg = svg;
				this.line = svg.line(p1.x, p1.y, p2.x, p2.y).attr(options);
			}
			else if (this.line){
				this.line.remove();
				delete this.svg;
				delete this.line;
			}

			return this
		},
		
		angle: function(){
			return SVG.math.angle(this.p1, this.p2);	
		},
		
		snapToAngle: function(snap){
			var angle = this.angle();
			var length = this.segmentLength();
			angle = angle - angle % snap;
			
			var x = length * Math.cos(angle);
			var y = length * Math.sin(angle);
			
			return this.update(this.p1, new SVG.math.Point(x, y));
		},
		
		parallel: function(line){
			return (this.a * line.b - line.a * this.b) === 0;			
		},
		
		round: function(precision){
			this.p1.x = SVG.math.round(this.p1.x, precision);
			this.p1.y = SVG.math.round(this.p1.y, precision);

			this.p2.x = SVG.math.round(this.p2.x, precision);
			this.p2.y = SVG.math.round(this.p2.y, precision);

			return this;
		},

		move: function(from, towards, distance){
			var sign = (from.x > towards.x) ? -1 :
    			from.x < towards.x ? 1 : 
    			from.y > towards.y ? 1 : 1; // The special case when from.x == towards.x

			var theta = Math.atan((this.p1.y - this.p2.y) / (this.p1.x - this.p2.x));
			var dy = distance * Math.sin(theta);
			var dx = distance * Math.cos(theta);
			return new SVG.math.Point(
				from.x + sign * dx, 
				from.y + sign * dy
			);
		},

		intersection: function(line){
			var det = this.a * line.b - line.a * this.b;

			var point = new SVG.math.Point(
				(line.b * this.c - this.b * line.c) / det,
				(this.a * line.c - line.a * this.c) / det
			);
			point.parallel = (det === 0);
			return point;
		},
		
		midPoint: function(){
			return this.interpolatedPoint(0.5);
		},

		segmentLegth: function(){
			return Math.sqrt(this.segmentLengthSquared());
		},

		segmentLengthSquared: function() {
			var dx = this.p2.x - this.p1.x;
			var dy = this.p2.y - this.p1.y;
			return dx * dx + dy * dy;
		},

		closestLinearInterpolation: function(p) {
			var dx = this.p2.x - this.p1.x;
			var dy = this.p2.y - this.p1.y;

			return ((p.x - this.p1.x) * dx + (p.y - this.p1.y) * dy) /
				this.segmentLengthSquared();
		},

		interpolatedPoint: function(t) {
			return {
				x: SVG.math.lerp(this.p1.x, this.p2.x, t),
				y: SVG.math.lerp(this.p1.y, this.p2.y, t)
			};
		},

		closestPoint: function(p) {
  			return this.interpolatedPoint(
      			this.closestLinearInterpolation(p)
      		);
		},

		perpendicularLine: function(p, distance){
			var dx = this.p1.x - this.p2.x;
			var dy = this.p1.y - this.p2.y;

			var dist = Math.sqrt(dx*dx + dy*dy);
			dx = dx / dist;
			dy = dy / dist;

			return new SVG.math.Line(
				new SVG.math.Point(
					p.x + distance * dy,
					p.y - distance * dx
				),
				new SVG.math.Point(
					p.x - distance * dy,
					p.y + distance * dx
				)
			);
		}

	});

})();;// svg.path.js 0.2 - Copyright (c) 2013 Nils Lagerkvist - Licensed under the MIT license

(function() {

	SVG.extend(SVG.Path, {
		M: function(p){
			p = (arguments.length === 1) ? [p.x, p.y] : Array.prototype.slice.call(arguments);

			this.addSegment('M', p, false);

			if (this._segments.length === 1){
				return this.plot('M' + p[0] + ' ' + p[1]);
			}

			return this;
		},
		m: function(p){
			p = (arguments.length === 1) ? [p.x, p.y] : Array.prototype.slice.call(arguments);

			this.addSegment('m', p, false);

			if (this._segments.length === 1){
				return this.plot('m' + p[0] + ' ' + p[1]);
			}

			return this;
		},
		// TODO: Solve
	  	L: function(p) {
	  		p = (arguments.length === 1) ? [p.x, p.y] : Array.prototype.slice.call(arguments);

  			return this.addSegment('L', p, this._redrawEnabled);
		},
		l: function(p) {
	  		p = (arguments.length === 1) ? [p.x, p.y] : Array.prototype.slice.call(arguments);

  			return this.addSegment('l', p, this._redrawEnabled);
		},
		H: function(x){
			return this.addSegment('H', [x], this._redrawEnabled);
		},
		h: function(x){
			return this.addSegment('h', [x], this._redrawEnabled);
		},
		V: function(y){
			return this.addSegment('V', [y], this._redrawEnabled);
		},
		v: function(y){
			return this.addSegment('v', [y], this._redrawEnabled);
		},
		C: function(p1, p2, p){
			p = (arguments.length === 3) ? [p1.x, p1.y, p2.x, p2.y, p.x, p.y] : Array.prototype.slice.call(arguments);

			return this.addSegment('C', p, this._redrawEnabled);
		},
		c: function(p1, p2, p){
			p = (arguments.length === 3) ? [p1.x, p1.y, p2.x, p2.y, p.x, p.y] : Array.prototype.slice.call(arguments);

			return this.addSegment('c', p, this._redrawEnabled);
		}, 
		S: function(p2, p){
			p = (arguments.length === 2) ? [p2.x, p2.y, p.x, p.y] : Array.prototype.slice.call(arguments);

			return this.addSegment('S', p, this._redrawEnabled);
		},
		s: function(p2, p){
			p = (arguments.length === 2) ? [p2.x, p2.y, p.x, p.y] : Array.prototype.slice.call(arguments);

			return this.addSegment('s', p, this._redrawEnabled);
		},
		// Q x1 y1, x y
		Q: function(p1, p){
			p = (arguments.length === 2) ? [p1.x, p1.y, p.x, p.y] : Array.prototype.slice.call(arguments);

			return this.addSegment('Q', p, this._redrawEnabled);
			var str = ', S' + p2.x + ' ' + p2.x + ', ' + p.x + ' ' + p.y
			return this.attr('d', this.attr('d') + str);
		},
		q: function(p1, p){
			p = (arguments.length === 2) ? [p1.x, p1.y, p.x, p.y] : Array.prototype.slice.call(arguments);

			return this.addSegment('q', p, this._redrawEnabled);
		},
		T: function(p){
			p = (arguments.length === 1) ? [p.x, p.y] : Array.prototype.slice.call(arguments);

  			return this.addSegment('T', p, this._redrawEnabled);
		},
		t: function(p){
			p = (arguments.length === 1) ? [p.x, p.y] : Array.prototype.slice.call(arguments);

  			return this.addSegment('t', p, this._redrawEnabled);
		},
		A: function(rx, ry, xAxisRotation, largeArcFlag, sweepFlag, p){
			p = (arguments.length === 6) ? [rx, ry, xAxisRotation, largeArcFlag, sweepFlag, p.x, p.y] : Array.prototype.slice.call(arguments);

			return this.addSegment('A', p, this._redrawEnabled);
		},
		a: function(rx, ry, xAxisRotation, largeArcFlag, sweepFlag, p){
			p = (arguments.length === 6) ? [rx, ry, xAxisRotation, largeArcFlag, sweepFlag, p.x, p.y] : Array.prototype.slice.call(arguments);
			
			return this.addSegment('a', p, this._redrawEnabled);
		},
		Z: function(){
			return this.addSegment('Z', [], this._redrawEnabled);
		},
		// TODO: Add check that first element is moveto
		addSegment: function(movement, coordinates, redraw){
			var segment = {
				type: movement,
				coords: coordinates
			};

			if (!this._segments){
				this._segments = [];
			}

			this._segments.push(segment);

			if (redraw !== false){
				this._drawSegment(segment);	
			}

			return this;
		},
		clear: function(){

			if (this._segments){
				this._segments.length = 0;
			}
			this._lastSegment = null;
			return this.plot();
		},
		getSegmentCount: function(){
			return this._segments.lenght;
		},
		getSegment: function(index){
			return this._segments[index];
		},
		removeSegment: function(index){
			this._segments.splice(index, 1);
			return this.redraw();
		},
		replaceSegment: function(index, segment){
			this._segments.splice(index, 1, segment);
			return this.redraw();
		},
		redraw: function(){
			// reset 
			this._lastSegment = null;
			this.attr('d', '');

			return this._drawSegment(this._segments);
		},
		_drawSegment: function(segment){
			var str = '', lastSegment = this._lastSegment;

			if (!Array.isArray(segment)){
				segment = [segment];
			}

			for (var i = 0; i < segment.length; i += 1){
				if (lastSegment === segment[i].type){
					str += ' ' + segment[i].coords.join(' ');
				}
				else{
					str += ' ' + segment[i].type + segment[i].coords.join(' ');
				}
				lastSegment = segment[i].type;
			}

			this._lastSegment = lastSegment;

			return this.attr('d', this.attr('d') + str);
		
		},
		line: function(line, options){
			var Point = networkMap.Point;
			if (options && options.reset){
				this.M(new Point(line.p1.x, line.p1.y));
			}
			else{
				this.L(new Point(line.p1.x, line.p1.y));
			}

			this.L(new Point(line.p2.x, line.p2.y));
			return this;
		}
	});	

}).call(this);/*
 * classList.js: Cross-browser full element.classList implementation.
 * 2014-01-31
 *
 * By Eli Grey, http://eligrey.com
 * Public Domain.
 * NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
 */

/*global self, document, DOMException */

/*! @source http://purl.eligrey.com/github/classList.js/blob/master/classList.js*/

if ("document" in self && !("classList" in document.createElement("_"))) {

(function (view) {

"use strict";

if (!('Element' in view)) return;

var
	  classListProp = "classList"
	, protoProp = "prototype"
	, elemCtrProto = view.Element[protoProp]
	, objCtr = Object
	, strTrim = String[protoProp].trim || function () {
		return this.replace(/^\s+|\s+$/g, "");
	}
	, arrIndexOf = Array[protoProp].indexOf || function (item) {
		var
			  i = 0
			, len = this.length
		;
		for (; i < len; i++) {
			if (i in this && this[i] === item) {
				return i;
			}
		}
		return -1;
	}
	// Vendors: please allow content code to instantiate DOMExceptions
	, DOMEx = function (type, message) {
		this.name = type;
		this.code = DOMException[type];
		this.message = message;
	}
	, checkTokenAndGetIndex = function (classList, token) {
		if (token === "") {
			throw new DOMEx(
				  "SYNTAX_ERR"
				, "An invalid or illegal string was specified"
			);
		}
		if (/\s/.test(token)) {
			throw new DOMEx(
				  "INVALID_CHARACTER_ERR"
				, "String contains an invalid character"
			);
		}
		return arrIndexOf.call(classList, token);
	}
	, ClassList = function (elem) {
		var
			  trimmedClasses = strTrim.call(elem.getAttribute("class") || "")
			, classes = trimmedClasses ? trimmedClasses.split(/\s+/) : []
			, i = 0
			, len = classes.length
		;
		for (; i < len; i++) {
			this.push(classes[i]);
		}
		this._updateClassName = function () {
			elem.setAttribute("class", this.toString());
		};
	}
	, classListProto = ClassList[protoProp] = []
	, classListGetter = function () {
		return new ClassList(this);
	}
;
// Most DOMException implementations don't allow calling DOMException's toString()
// on non-DOMExceptions. Error's toString() is sufficient here.
DOMEx[protoProp] = Error[protoProp];
classListProto.item = function (i) {
	return this[i] || null;
};
classListProto.contains = function (token) {
	token += "";
	return checkTokenAndGetIndex(this, token) !== -1;
};
classListProto.add = function () {
	var
		  tokens = arguments
		, i = 0
		, l = tokens.length
		, token
		, updated = false
	;
	do {
		token = tokens[i] + "";
		if (checkTokenAndGetIndex(this, token) === -1) {
			this.push(token);
			updated = true;
		}
	}
	while (++i < l);

	if (updated) {
		this._updateClassName();
	}
};
classListProto.remove = function () {
	var
		  tokens = arguments
		, i = 0
		, l = tokens.length
		, token
		, updated = false
	;
	do {
		token = tokens[i] + "";
		var index = checkTokenAndGetIndex(this, token);
		if (index !== -1) {
			this.splice(index, 1);
			updated = true;
		}
	}
	while (++i < l);

	if (updated) {
		this._updateClassName();
	}
};
classListProto.toggle = function (token, force) {
	token += "";

	var
		  result = this.contains(token)
		, method = result ?
			force !== true && "remove"
		:
			force !== false && "add"
	;

	if (method) {
		this[method](token);
	}

	return !result;
};
classListProto.toString = function () {
	return this.join(" ");
};

if (objCtr.defineProperty) {
	var classListPropDesc = {
		  get: classListGetter
		, enumerable: true
		, configurable: true
	};
	try {
		objCtr.defineProperty(elemCtrProto, classListProp, classListPropDesc);
	} catch (ex) { // IE 8 doesn't support enumerable:true
		if (ex.number === -0x7FF5EC54) {
			classListPropDesc.enumerable = false;
			objCtr.defineProperty(elemCtrProto, classListProp, classListPropDesc);
		}
	}
} else if (objCtr[protoProp].__defineGetter__) {
	elemCtrProto.__defineGetter__(classListProp, classListGetter);
}

}(self));

}
;var networkMap = networkMap || {};

networkMap.path = function(svg){
	return svg.path().attr({ 
		fill: 'none',
		stroke: '#000'
	});
};

networkMap.find = function(arr, fn){	
	for (var i = 0, len = arr.length; i < len; i++){
		if (fn.call(arr, arr[i], i, arr)){
			return arr[i];
		}
	}
};

networkMap.isFunction = function(f){
	var getType = {};
	return f && getType.toString.call(f) === '[object Function]';
};

networkMap.extend = function () {
	var modules, methods, key, i;
	
	/* get list of modules */
	modules = [].slice.call(arguments);
	
	/* get object with extensions */
	methods = modules.pop();
	
	for (i = modules.length - 1; i >= 0; i--)
		if (modules[i])
			for (key in methods)
				modules[i].prototype[key] = methods[key];
};

networkMap.Observable = (function(){
	function removeOn(string){
		return string.replace(/^on([A-Z])/, function(full, first){
			return first.toLowerCase();
		});
	}

	return {
		addEvent: function(type, fn) {
			this.$events = this.$events || {};

			if (!networkMap.isFunction(fn)){
				return this;
			}

			type = removeOn(type);

			(this.$events[type] = this.$events[type] || []).push(fn);

			return this;
		},

		addEvents: function(events){
			for (var type in events) this.addEvent(type, events[type]);
			return this;
		},

		fireEvent: function(type, args, delay) {
			this.$events = this.$events || {};
			type = removeOn(type);
			var events = this.$events[type];

			if (!events) return this;
			
			args = (args instanceof Array) ? args : [args];

			events.forEach(function(fn){
				if (delay) setTimeout(function() { fn.apply(this, args); }, delay);
				else fn.apply(this, args);
			}, this); 

			return this;
		},	
		
		removeEvent: function(type, fn) {
			type = removeOn(type);

			var events = this.$events[type] || [];
			var index = events.indexOf(fn);
			if (index !== -1) events.splice(index, 1);

			return this;
		},

		removeEvents: function(events){
			var type;
			if (typeof(events) == 'object'){
				for (type in events) this.removeEvent(type, events[type]);
				return this;
			}

			if (events) events = removeOn(events);
			for (type in this.$events){
				if (events && events != type) continue;
				var fns = this.$events[type];
				for (var i = fns.length; i--;) if (i in fns){
					this.removeEvent(type, fns[i]);
				}
			}
			return this;
		}

	};

})();

networkMap.keys = function(obj) {
	var keys = [], key;

	if (obj !== Object(obj)) return keys;
	if (Object.keys) return Object.keys(obj);	
	for (key in obj) if (hasOwnProperty.call(obj, key)) keys.push(key);
	return keys;
};


networkMap.each = function(obj, iterator, context) {
	var i, length;
	if (obj === null) return obj;
	if (Array.prototype.forEach && obj.forEach === Array.prototype.forEach) {
		obj.forEach(iterator, context);
	} else if (obj.length === +obj.length) {
		for (i = 0, length = obj.length; i < length; i++) {
			iterator.call(context, obj[i], i, obj);
		}
	} else {
		var keys = networkMap.keys(obj);
		for (i = 0, length = keys.length; i < length; i++) {
			iterator.call(context, obj[keys[i]], keys[i], obj);
		}
	}
	return obj;
};


/**
 * Extend an object with defaults
 * @param  {Object} obj The object to extend with defaults
 * @param {...Object} var_args Objects with default configuration
 * @return {Object}     The extended object
 */
networkMap.defaults = function(obj) {
	obj = obj || {};
	networkMap.each(Array.prototype.slice.call(arguments, 1), function(source) {
		if (source) {
			for (var prop in source) {
				if (obj[prop] === void 0) obj[prop] = source[prop];
			}
		}
	});
	return obj;
};

networkMap.Options = {
	setOptions: function(options){
		this.options = networkMap.defaults(options, this.options);
		return this;
	}
};

networkMap.Mediator = {
	
	subscribe: function(topic, fn){
		if (!networkMap.isFunction(fn)){
			return this;
		}

		this.$topics = this.$topics || {};
		(this.$topics[topic] = this.$topics[topic] || []).push(fn);

		return this;  
	},

	publish: function(topic, args, delay){
		this.$topics = this.$topics || {};
		var events = this.$topics[topic];

		if (!events) return this;
		
		args = (args instanceof Array) ? args : [args];

		events.forEach(function(fn){
			if (delay) setTimeout(function() { fn.apply(this, args); }, delay);
			else fn.apply(this, args);
		}, this); 

		return this;
	},

	unsubscribe: function(topic, fn){
		var events = this.$topics[topic];
		var index = events.indexOf(fn);
		if (index !== -1) events.splice(index, 1);

		return this;
	}
};


networkMap.toQueryString = function(object, base){
	var queryString = [];

	networkMap.each(object, function(value, key){
		if (base) key = base + '[' + key + ']';
		var result;
		switch (typeof value){
			case 'object': 
					result = networkMap.toQueryString(value, key); 
			break;
			case 'array':
				var qs = {};
				value.forEach(function(val, i){
					qs[i] = val;
				});
				result = networkMap.toQueryString(qs, key);
			break;
			default: result = key + '=' + encodeURIComponent(value);
		}
		/* jshint ignore:start */
		if (value != null) queryString.push(result);
		/* jshint ignore:end */
	});

	return queryString.join('&');
};
;networkMap.vec2 = SVG.math.Point;

SVG.math.Point.create = function(x, y){
	return new SVG.math.Point(x, y);
};

SVG.extend(SVG.math.Point, {
	clone: function(){
		return SVG.math.Point.create(this.x, this.y);
	},
	
	add: function(v){
		this.x += v.x;
		this.y += v.y;

		return this;
	},

	sub: function(v){
		this.x -= v.x;
		this.y -= v.y;

		return this;
	},

	distance: function(v){
		var x = v.x - this.x,
		y = v.y - this.y;
		return Math.sqrt(x*x + y*y);
	},

	len: function(){
		var x = this.x,
			y = this.y;
		return Math.sqrt(x*x + y*y);
	},

	normalize: function() {
		
		var x = this.x,
			y = this.y,
			len = x*x + y*y;
			
		if (len > 0) {
			len = 1 / Math.sqrt(len);
			this.x = x * len;
			this.y = y * len;
		}
		return this;
	},
	
	angle: function(){
		var angle = Math.atan2(this.y, this.x);

		while (angle < 0){
			angle += 2 * Math.PI;
		}

		return angle;
	},

	maxDir: function(){
		var x = this.x, 
			y = this.y,
			al0 = Math.abs(x),
			al1 = Math.abs(y);

		if (al0 > al1){
			this.x = x / al0;
			this.y = 0;
		}
		else{
			this.x = 0;
			this.y = y / al1;
		}
		return this;
	},
	
	roundDir: function(snapAngle){
		var angle = this.angle();
		var length = this.len();
		angle = angle - angle % snapAngle;
		
		this.x = length * Math.cos(angle);
		this.y = length * Math.sin(angle);
		
		return this;
	},

	scale: function(s){
		this.x *= s;
		this.y *= s;		

		return this;
	},

	mul: function(v){
		this.x *= v.x;
		this.y *= v.y; 
		
		return this;
	},

	confine: function(v){
		var x = this.x, y = this.y, x2 = v.x, y2 = v.y;

		this.x = (Math.abs(x) < Math.abs(x2)) ? x : x / Math.abs(x)*x2;
		this.y = (Math.abs(y) < Math.abs(y2)) ? y : y / Math.abs(y)*y2;

		return this;
	}
});

/*

networkMap.vec2 = function(x, y){
	this.x = x;
	this.y = y;
};

networkMap.vec2.create = function(x,y){
	return new networkMap.vec2(x,y);	
};

networkMap.extend(networkMap.vec2, {
	clone: function(){
		return networkMap.vec2.create(this.x, this.y);
	},
	
	add: function(v){
		this.x += v.x;
		this.y += v.y;

		return this;
	},

	sub: function(v){
		this.x -= v.x;
		this.y -= v.y;

		return this;
	},

	distance: function(v){
		var x = v.x - this.x,
		y = v.y - this.y;
		return Math.sqrt(x*x + y*y);
	},

	len: function(){
		var x = v.x,
			y = v.y;
		return Math.sqrt(x*x + y*y);
	},

	normalize: function() {
		
		var x = this.x,
			y = this.y,
			len = x*x + y*y;
			
		if (len > 0) {
			len = 1 / Math.sqrt(len);
			this.x = x * len;
			this.y = y * len;
		}
		return this;
	},

	maxDir: function(){
		var x = this.x, 
			y = this.y,
			al0 = Math.abs(x),
			al1 = Math.abs(y);

		if (al0 > al1){
			this.x = x / al0;
			this.y = 0;
		}
		else{
			this.x = 0;
			this.y = y / al1;
		}
		return this;
	},

	scale: function(s){
		this.x *= s;
		this.y *= s;		

		return this;
	},

	mul: function(v){
		this.x *= v.x;
		this.y *= v.y; 
		
		return this;
	},

	confine: function(v){
		var x = this.x, y = this.y, x2 = v.x, y2 = v.y;

		this.x = (Math.abs(x) < Math.abs(x2)) ? x : x / Math.abs(x)*x2;
		this.y = (Math.abs(y) < Math.abs(y2)) ? y : y / Math.abs(y)*y2;

		return this;
	}
});
*/
;networkMap.event = networkMap.event || {};

networkMap.event.Configuration = function(options){
	this.deletable = (options.deletable) ? true : false;
	this._destroy = (options.destroy) ? options.destroy : function(){ return false; };
	this._cancel = (options.cancel) ? options.cancel : function(){ return false; };
	this.editable = (options.editable) ? true : false;
	this.editWidget = (options.editWidget) ? options.editWidget : null;
	this.target = (options.target) ? options.target : null;
	this.type = (options.type) ? options.type : 'unknown';

	// TODO: Depricated, remove	
	this.configWidget = this.editWidget;
};

networkMap.extend(networkMap.event.Configuration, {
	
	destroy: function(){
		return this._destroy();
	},
	
	cancel: function(){
		return this._cancel();
	}
	
	
});;networkMap.widget = networkMap.widget || {};

networkMap.widget.IntegerInput = function(label, value, options){
	this.options = {
		class: 'nm-input-integer'
	};
	this.setOptions(options);
	this.createElements(label, value);	
};


networkMap.extend(networkMap.widget.IntegerInput, networkMap.Observable);
networkMap.extend(networkMap.widget.IntegerInput, networkMap.Options);
networkMap.extend(networkMap.widget.IntegerInput, {
	createElements: function(label, value){
		this.wrapper = document.createElement('div');
		this.wrapper.classList.add(this.options.class);

		this.label = document.createElement('span');
		this.label.textContent = label;

		this.input = document.createElement('input');
		this.input.setAttribute('type', 'number');

		/*
		// TODO: Clean up code		
		var tmpValue = (value.inherited) ? value.value : 
			(value) ? value : null;
			
		if (!tmpValue && value.inherited)
			this.increment = parseInt(value.inherited, 10);
		else
			this.increment = 0;
		*/
		this.input.value = (value.inherited && value.value) ? value.value : 
			(value.inherited) ? '' :
			(value) ? value : '';
			
			
		if (value.inherited) this.input.setAttribute('placeholder', value.inherited);
		this.input.addEventListener('change', function(e){
			/*
			if (this.input.value === '' && value.inherited){
				this.increment = parseInt(value.inherited, 10);
			}
			if (this.increment && (this.options.min !== undefined && parseInt(this.input.value, 10) === this.options.min ) || parseInt(this.input.value, 10) === 1) ){
				this.input.value = parseInt(this.input.value) + parseInt(this.increment);
				this.increment = 0;
			}
			if (this.increment && (parseInt(this.input.value, 10) === this.options.min || parseInt(this.input.value, 10) === 0)){
				this.input.value = parseInt(this.increment) - 1;
				this.increment = 0;
			}
			*/
			e.value = this.value();
			
			// this is a hack to prevent the change event to 
			// fire twice in chrome
			var self = this;
			setTimeout(function(){
				self.fireEvent('change', [e, self]);
			}, 1);
		}.bind(this));

		if (this.options.min !== undefined){
			this.input.setAttribute('min', this.options.min);	
		}

		if (this.options.disabled === true){
			this.input.disabled = true;
		}

		this.wrapper.appendChild(this.label);
		this.wrapper.appendChild(this.input);

		return this;
	},

	toElement: function(){
		return this.wrapper;
	},

	value: function(){
		return (this.input.value !== '') ? parseInt(this.input.value) : undefined;
	}
});;networkMap.widget = networkMap.widget || {};

networkMap.widget.TextInput = function(label, value, options){
	this.options = {
		class: 'nm-input-text',
		type: 'text'
	};
	this.setOptions(options);

	this.$destroy = [];

	this.createElements(label, value);
};

networkMap.extend(networkMap.widget.TextInput, networkMap.Observable);
networkMap.extend(networkMap.widget.TextInput, networkMap.Options);
networkMap.extend(networkMap.widget.TextInput, {	
	createElements: function(label, value){
		var wrapper = this.wrapper = document.createElement('div');
		wrapper.classList.add(this.options.class);

		var lbl = this.label = document.createElement('span');
		lbl.textContent = label;

		var input = this.input = document.createElement('input');
		var inputHandler = function(e){
			this.fireEvent('change', [e, this]);
		}.bind(this);
		input.setAttribute('type', this.options.type);
		input.setAttribute('value', (value) ? value : '');
		this.$destroy.push({
			el: input,
			type: 'change',
			fn: inputHandler
		});
		input.addEventListener('change', inputHandler, false);

		if (this.options.disabled === true){
			this.input.disabled = true;
		}
		
		wrapper.appendChild(lbl);
		wrapper.appendChild(input);

		return this;
	},
	
	value: function(){
		return (this.input.value !== '') ? this.input.value : undefined;
	},

	toElement: function(){
		return this.wrapper;
	}
});;networkMap.widget = networkMap.widget || {};

networkMap.widget.ColorInput = function(label, value, options){
	this.options = {
		class: 'nm-input-color'
	};

	this.setOptions(options);

	this.createElements(label, value);
};

networkMap.extend(networkMap.widget.ColorInput, networkMap.Observable);
networkMap.extend(networkMap.widget.ColorInput, networkMap.Options);
networkMap.extend(networkMap.widget.ColorInput, {

	createElements: function(label, value){
		this.wrapper = document.createElement('div');
		this.wrapper.classList.add(this.options.class);

		this.label = document.createElement('span');
		this.label.textContent = label;

		this.div = document.createElement('div');

		this.input = document.createElement('input');
		this.input.setAttribute('type', 'color');
		this.input.setAttribute('value', value);
		this.input.addEventListener('change', function(e){
			this.fireEvent('change', [e, this]);
		}.bind(this));
		
		if (this.options.disabled === true){
			this.input.disabled = true;
		}

		this.div.appendChild(this.input);
		this.wrapper.appendChild(this.label);
		this.wrapper.appendChild(this.div);
	},

	/**
	 * Get the current value of the widget
	 * @return {string} The color encoded as a string
	 */
	value: function(){
		return this.input.value;
	},

	toElement: function(){
		return this.wrapper;
	}
});;networkMap.widget = networkMap.widget || {};

networkMap.widget.Accordion = function(options){
	this.options = {
		class: 'nm-accordion'
	};

	this.setOptions(options);

	this.items = [];
	this.wrapper = document.createElement('div');
	this.wrapper.classList.add(this.options.class);
};

networkMap.extend(networkMap.widget.Accordion, networkMap.Observable);
networkMap.extend(networkMap.widget.Accordion, networkMap.Options);
networkMap.extend(networkMap.widget.Accordion, {	
	toElement: function(){
		return this.wrapper;
	},
	add: function(label, options){
		var item = document.createElement('div');
		item.classList.add('nm-accordion-group', 'nm-accordion-open');

		
		var trigger = document.createElement('div');
		trigger.classList.add('nm-accordion-trigger', 'unselectable');
		trigger.textContent = label;

		var list = new networkMap.widget.Accordion.Group(options);
		
		item.appendChild(trigger);
		item.appendChild(list.toElement());

		this.items.push(item);
		this.wrapper.appendChild(item);
		trigger.addEventListener('click', this.clickHandler.bind(this));

		return list;
	},

	clickHandler: function(e){
		e.target.parentNode.classList.toggle('nm-accordion-open');
	}
});

networkMap.widget.Accordion.Group = function(options){
	var list = this.list = document.createElement('ul');
	list.classList.add('nm-accordion-inner');

	if (options && options.id){
		list.setAttribute('id', options.id);		
	}
};

networkMap.extend(networkMap.widget.Accordion.Group, {

	appendChild: function(node){
		if (node.toElement)
			this.list.appendChild(node.toElement());
		else
			this.list.appendChild(node);

		return this;
	},

	toElement: function(){
		return this.list;
	}
});;networkMap.widget = networkMap.widget || {};

networkMap.widget.List = function(options){
	this.options = {
		class: 'nm-list'
	};
	this.listItems = [];
	this.setOptions(options);

	this.list = document.createElement('ul');
	this.list.classList.add(this.options.class);
};

networkMap.extend(networkMap.widget.List, networkMap.Observable);
networkMap.extend(networkMap.widget.List, networkMap.Options);
networkMap.extend(networkMap.widget.List, {
	toElement: function(){
		return this.list;
	},
	add: function(element, options){
		var listItem = new networkMap.widget.ListItem(element, options);
		listItem.addEvent('remove', this.remove.bind(this));
		this.listItems.push(listItem);
		this.list.appendChild(listItem.toElement());
		
		return listItem;
	},
	remove: function(listItem){
		var index = this.listItems.indexOf(listItem);
		this.listItems.splice(index, 1);
				
		return this;
	}
});

networkMap.widget.ListItem = function(element, options){
	this.options = {
		class: 'nm-list-item',
		enableDelete: false
	};
	this.setOptions(options);

	this.listItem = document.createElement('li');
	this.listItem.classList.add(this.options.class);

	if (typeof element === 'string'){
		this.listItem.textContent = element;
	}
	else{
		this.listItem.appechChild(element);
	}

	if (this.options.enableDelete){
		var del = document.createElement('span');
		del.textContent = 'x';
		del.classList.add('nm-list-item-delete', 'pull-right');
		this.$remove = this.remove.bind(this);
		del.addEventListener('click', this.$remove);
		this.listItem.appendChild(del);
	}
};

networkMap.extend(networkMap.widget.ListItem, networkMap.Observable);
networkMap.extend(networkMap.widget.ListItem, networkMap.Options);
networkMap.extend(networkMap.widget.ListItem, {
	remove: function(){
		this.listItem.parentNode.removeChild(this.listItem);
		this.listItem.removeEventListener('click', this.$remove);
		delete this.listItem;
		this.fireEvent('remove', [this]);
		
		return this;
	},
	toElement: function(){
		return this.listItem;
	}
});

;networkMap.widget = networkMap.widget || {};

networkMap.widget.Select = function(label, values, options){
	this.options = {
		class: 'nm-input-select'
	};
	this.setOptions(options);

	this.$destroy = [];

	this.createElements(label);
	this.addOptions(values);
};

networkMap.extend(networkMap.widget.Select, networkMap.Observable);
networkMap.extend(networkMap.widget.Select, networkMap.Options);
networkMap.extend(networkMap.widget.Select, {
	
	createElements: function(label){
		var wrapper = this.wrapper = document.createElement('div');
		wrapper.classList.add(this.options.class);

		var lbl = this.label = document.createElement('span');
		lbl.textContent = label;

		var input = this.input = document.createElement('select');
		var inputHandler = function(e){
			this.fireEvent('select', [e, this]);
		}.bind(this);
		this.$destroy.push({
			el: input,
			type: 'change',
			fn: inputHandler
		});
		input.addEventListener('change', inputHandler, false);

		wrapper.appendChild(lbl);
		wrapper.appendChild(input);
	},

	addOptions: function(values){
		values.forEach(function(value){
			this.addOption(value);
		}.bind(this));
	},

	addOption: function(text, options){
		options = options || {};
		
		var el = document.createElement('option');
		el.setAttribute('value', (options.value) ? options.value : text);
		el.textContent = text;
		el.selected = options.selected;

		this.input.appendChild(el);

		return el;
	},

	value: function(){
		return this.getSelected();
	},

	getSelected: function(){
		return (this.input.selectedIndex !== -1) ? this.input.options[this.input.selectedIndex].value : null; 
	},

	clearOptions: function(){
		while (this.input.firstChild) {
			this.input.removeChild(this.input.firstChild);
		}
		return this;
	},

	toElement: function(){
		return this.wrapper;
	},

	toString: function(){
		return (this.input.selectedIndex !== -1) ? this.input.options[this.input.selectedIndex] : null;
	}
});;networkMap.widget = networkMap.widget || {};

networkMap.widget.Modal = function(options){
	this.options = {
		class: 'modal',
		title: '',
		content: '',
		footer: '',
		type: 'alert'
	};
	this.setOptions(options);
	
	// containing elements to destroy
	this.$destroy = [];

	this.buildUI();	
};

networkMap.extend(networkMap.widget.Modal, networkMap.Observable);
networkMap.extend(networkMap.widget.Modal, networkMap.Options);
networkMap.extend(networkMap.widget.Modal, {
	buildUI: function(){
		

		var modal = this.modal = document.createElement('div');
		modal.classList.add('modal', 'hide', 'fade', 'in');
		modal.style.zIndex = 1000000;

		var header = this.header = document.createElement('div');
		header.classList.add('modal-header');

		var closeButton = this.closeButton = document.createElement('button');
		var closeHandler = this._close.bind(this);
		closeButton.classList.add('close');
		closeButton.innerHTML = '&times;';
		this.$destroy.push({
			el: closeButton,
			type: 'click',
			fn: closeHandler
		});
		closeButton.addEventListener('click', closeHandler, false);
		header.appendChild(closeButton);

		var title = this.title = document.createElement('h3');
		title.innerHTML = this.options.title;
		header.appendChild(title);

		var body = this.body = document.createElement('div');
		body.classList.add('modal-body');
		body.innerHTML = this.options.content;

		var footer = this.footer = document.createElement('div');
		footer.classList.add('modal-footer');
		footer.innerHTML = this.options.footer;

		modal.appendChild(header);
		modal.appendChild(body);
		modal.appendChild(footer);
		
		return this;
	},
	alert: function(html, options){
		options = options || {};
		
		this.body.innerHTML =  html;
		this.title.innerHTML = (options.title) ? options.title : 'Alert';		
		
		
		var btn = this.btn = document.createElement('a');
		var btnHandler = this.destroy.bind(this);
		btn.setAttribute('href', '#');
		btn.classList.add('btn');
		btn.textContent = (options.button) ? options.button : 'Ok';
		this.$destroy.push({
			el: btn,
			type: 'click',
			fn: btnHandler
		});
		btn.addEventListener('click', btnHandler, false);
		this.footer.appendChild(btn);

		document.body.appendChild(this.modal);
	
		return this.show();				
	},
	confirm: function(html, options){
		options = options || {};
		
		this.body.innerHTML = html;
		this.title.innerHTML = (options.title) ? options.title : 'Alert';		
		
		var cancelBtn = document.createElement('a');
		var cancelHandler = this._cancel.bind(this);
		cancelBtn.setAttribute('href', '#');
		cancelBtn.classList.add('btn');
		cancelBtn.textContent = (options.button) ? options.button : 'Ok';
		this.$destroy.push({
			el: cancelBtn,
			type: 'click',
			fn: cancelHandler
		});
		cancelBtn.addEventListener('click', cancelHandler, false);
		this.footer.appendChild(cancelBtn);

		var okBtn = document.createElement('a');
		var okHandler = this._cancel.bind(this);
		okBtn.setAttribute('href', '#');
		okBtn.classList.add('btn');
		okBtn.textContent = (options.button) ? options.button : 'Ok';
		this.$destroy.push({
			el: okBtn,
			type: 'click',
			fn: okHandler
		});
		okBtn.addEventListener('click', okHandler, false);
		this.footer.appendChild(okBtn);

		document.body.appendChild(this.modal);
	
		return this.show();				
	},
	show: function(){
		this.modal.style.display = 'block';
		return this;
	},
	destroy: function(){
		this.modal.parentNode.removeChild(this.modal);

		this.$destroy.forEach(function(ref){
			ref.el.removeEventListener(ref.type, ref.fn, false);
		});
		this.$destroy.length = 0;
		return this;
	},
	
	_close: function(e){
		this.fireEvent('close', [e]);
		this.destroy();
	},
	_ok: function(e){
		this.fireEvent('ok', [e]);
		this.destroy();
	},
	_cancel: function(e){
		this.fireEvent('cancel', [e]);
		this.destroy();
	}
});;networkMap.widget = networkMap.widget || {};

networkMap.widget.Checkbox = function(label, value, options){
	this.options = {
		class: 'nm-checkbox',
		type: 'checkbox'
	};

	this.setOptions(options);
	this.createElements(label, value);
};

networkMap.extend(networkMap.widget.Checkbox, networkMap.Observable);
networkMap.extend(networkMap.widget.Checkbox, networkMap.Options);
networkMap.extend(networkMap.widget.Checkbox, {

	createElements: function(label, value){
		this.wrapper = document.createElement('div');
		this.wrapper.classList.add(this.options.class);

		this.label = document.createElement('span');
		this.label.textContent = label;

		this.input = document.createElement('input');
		this.input.setAttribute('type', this.options.type);
		this.input.checked = value;
		this.input.addEventListener('change', function(e){
			e.value = this.value();
			this.fireEvent('change', [e, this]);
		}.bind(this));


		if (this.options.disabled === true){
			this.input.disabled = true;
		}
		
		this.wrapper.appendChild(this.label);
		this.wrapper.appendChild(this.input);

		return this;
	},
	
	toElement: function(){
		return this.wrapper;
	},

	value: function(){
		return this.input.checked;
	},
	
	isChecked: function(){
		return this.input.checked;
	}
});;networkMap.widget = networkMap.widget || {};

networkMap.widget.GridInput = function(label, value, options){
	this.options = {
		class: 'nm-input-snap',
		type: 'snap'
	};
	
	this.setOptions(options);
	this.createElements(label, value);
};

networkMap.extend(networkMap.widget.GridInput, networkMap.Observable);
networkMap.extend(networkMap.widget.GridInput, networkMap.Options);
networkMap.extend(networkMap.widget.GridInput, {
	createElements: function(label, value){
		this.wrapper = document.createElement('div');
		this.wrapper.classList.add(this.options.class);

		this.label = document.createElement('span');
		this.label.textContent = label;

		this.check = document.createElement('input');
		this.check.setAttribute('type', 'checkbox');
		this.check.checked = value.enabled;
		this.check.addEventListener('change', function(e){
			this.x.input.disabled = !this.check.checked;
			this.y.input.disabled = !this.check.checked;
			e.value = this.value();
			this.fireEvent('change', [e]);
		}.bind(this));

		this.x = this.$createInputs('x', value.grid.x, value.enabled);
		this.y = this.$createInputs('y', value.grid.y, value.enabled);

		this.wrapper.appendChild(this.label);
		this.wrapper.appendChild(this.check);
		this.wrapper.appendChild(this.x.label);
		this.wrapper.appendChild(this.x.input);
		this.wrapper.appendChild(this.y.label);
		this.wrapper.appendChild(this.y.input);
	},

	$createInputs: function(label, value, enabled){
		var els = {};
		els.label = document.createElement('span');
		els.label.textContent = label;

		els.input = document.createElement('input');
		els.input.setAttribute('type', 'number');
		els.input.setAttribute('value', (value) ? value : 1);
		els.input.setAttribute('min', 1);
		els.input.setAttribute('max', 50);
		els.input.disabled = !enabled;
		els.input.addEventListener('change', function(e){
			e.value = this.value();
			this.fireEvent('change', [e, this]);
		}.bind(this));
		return els;
	},

	value: function(){
		return {
			enabled: this.check.checked,
			grid: {
				x: parseInt(this.x.input.value, 10),
				y: parseInt(this.y.input.value, 10)
			}
		};
	},

	toElement: function(){
		return this.wrapper;
	}
});;networkMap.Properties = function(properties, defaults){
	this.properties = properties || {};
	this.$change = [];
	this.setDefaults(defaults);
};

networkMap.extend(networkMap.Properties, networkMap.Observable);

networkMap.extend(networkMap.Properties, {
	get: function(k, inherited){
		var v = this.properties;
		
		for(var i = 0,path = k.split('.'),len = path.length; i < len; i++){
			if(!v || typeof v !== 'object') break;
			v = v[path[i]];
		}

		if (inherited === true){
			return {
				value: v,
				inherited: (this.defaults) ? this.defaults.get(k) : void 0
			};
		}

		if (v === void 0 && this.defaults !== void 0)
			v = this.defaults.get(k);

		return v;
	},

	set: function(k, v){
		
		this.$change.length = 0;
		if (arguments.length === 1 && arguments[0].constructor ===  Object){
			networkMap.each(arguments[0], this.$set, this);
		}
		else{
			this.$set(v, k);
		}
		this.fireEvent('change', [this.$change]);
		return this;
	},

	$set: function(v, k){
		var change = {
			key: k,
			value: v,
			oldValue: this.properties[k]
		};
		this.properties[k] = v;
		this.$change.push(change);
		return change;
	},

	unset: function(k){
		var oldValue = this.properties[k];
		delete this.properties[k];
		this.fireEvent('change', [k, v, oldValue]);
		return this;
	},

	load: function(properties){
		var change = [];
		var oldProperties = this.properties;
		networkMap.each(properties, function(k, v){
			change.push({
				key: k, 
				value: v,
				oldValue: oldProperties[k]
			});
		});

		this.properties = properties;
		this.$change = change;

		this.fireEvent('change', [change]);
		return this;
	},

	extract: function(){
		return this.properties;
	},

	setDefaults: function(defaults){
		this.defaults = defaults || void 0;

		// propagate change events
		if (this.defaults){
			this.defaults.addEvent('change', function(change){
				this.fireEvent('change', [change]);
			}.bind(this));
		}
	},

	configuration: function(properties){
		properties = properties || {};
		if (this.defaults === void 0)
			return networkMap.defaults(properties, this.properties);

		return networkMap.defaults(properties, this.properties, this.defaults.configuration());
	}
});
;networkMap.datasource = networkMap.datasource || {};

/**
 * Register a datasource
 *
 * @param {string} name The name of the datasource.
 * @param {function} f The datasource
 */
networkMap.registerDatasource = function(name, f){
	networkMap.datasource[name] = function(url, requests){
		if (Object.prototype.toString.call(requests) !== '[object Array]'){
			requests = [requests];
		}
		f(url, requests);
	};
};

/**
 * Dummy datasource used for simulation and testing.
 * The requests array contains object of the form:
 * {
 *		link: {Sublink} 
 *		callback: {function}
 * }
 * Use the link to gather data to send with the request,
 * when the request is made send the data to the callback.  
 *
 * @param {string} url The URL to send the request to.
 * @param {Array} requests An array of requests. 
 * @return null.
 */
networkMap.registerDatasource('simulate', function(url, requests){
	requests.forEach(function(request){
		var dataPoint = Math.random();

		// Example on how to get the node to get node specific data
		//request.link.getNode().options.id;

		request.callback({
			url: url,
			request: request.link,
			value: dataPoint,
			realValue: Math.round(dataPoint * 100) + 'Mbps'
		});
	});
});;networkMap.events = networkMap.events || {
	click: function(e, link){
		var linkEvents = link.properties.get('events');
		
		if (linkEvents && linkEvents.click && linkEvents.click.href){
			window.location.href = link.options.events.click.href;
		}
	},
	
	hover: function(e, link, el){
		el.set('text', link.options.name);
	},
	mouseover: function(e, options, hover){},
	
	mouseout: function(e, options, hover){}
};

networkMap.registerEvent = function(name, f){
	if (!networkMap.events[name])
		throw "Invalid event: " + name + " is not an registered event";
	
	if (name === 'click'){
		networkMap.events[name] = function(e, link){
			//var options = (e.target.instance.link) ? e.target.instance.link.click : e.target.instance.parent.link.click;
			f(e, link);
		};
	}
	else if (name === 'hover'){	
		networkMap.events.mouseover = function(e, link){
			var el = document.getElementById('nm-active-hover');
			var id = e.target.instance.attr('id');
			
			if (el){
				if (el && el.retrieve('id') !== e.target.instance.attr('id')){
					el.destroy();	
				}
				else{
					el.store('keep', true);
					return;
				}	
			}
			
			/*
			var position = e.target.getPosition(),
			svg = e.target.instance;
				
			var midX, midY;
			var viewbox = svg.doc().viewbox();
			if (svg.getSegment(6).type !== 'Z'){
				var segment11 = svg.getSegment(2),
				segment12 = svg.getSegment(3),
				segment21 = svg.getSegment(5),
				segment22 = svg.getSegment(6);
				
				midX = ((segment11.coords[0] + segment22.coords[0])/2 +
					(segment12.coords[0] + segment21.coords[0])/2)/2;
	
				midY = ((segment11.coords[1] + segment22.coords[1])/2 +
					(segment12.coords[1] + segment21.coords[1])/2)/2;
			}
			else{
				var s1 = svg.getSegment(1),
				s2 = svg.getSegment(2),
				s4 = svg.getSegment(4),
				s5 = svg.getSegment(5);
				
				midX = ((s1.coords[0] + s2.coords[0] + s4.coords[0] + s5.coords[0]) / 4 + viewbox.x ) * viewbox.zoomX;
	
				midY = ((s1.coords[1] + s2.coords[1] + s4.coords[1] + s5.coords[1]) / 4  + viewbox.y ) * viewbox.zoomY;
				
				console.log(s1.coords[0] , s2.coords[0] , s4.coords[0] , s5.coords[0]);
			}

			*/
			
			
			el = new Element('div', {
				'id': 'nm-active-hover',
				'class': 'nm-hover',
				events: {
					mouseover: function(){
						el.store('mouseover', true);
					},
					mouseout: function(){
						el.eliminate('mouseover');
						(function(){
							if (!el.retrieve('keep'))
								el.destroy();
							else
								el.eliminate('keep');
						}).delay(10);
					},
					click: function(ev){
						link._clickHandler(e);
					}
						
					
				}
			})
			.store('id', e.target.instance.attr('id'));
			
			el.setStyles({
				top: -1000,
				left: -1000	
			});
					
			
			document.id(document.body).grab(el);
						
			f(e, link, el);
			
			var size = el.getSize();
			var bboxClient = e.target.getBoundingClientRect();
			
			el.setStyles({
				top: (bboxClient.top + bboxClient.bottom)/2 - size.y/2,
				left: (bboxClient.left + bboxClient.right)/2 - size.x/2
			});
		
		};
		
		networkMap.events.mouseout = function(e, link){
			var options = e.target.instance.link;
			(function(){
				var el = document.id('nm-active-hover');
				if (el && el.retrieve('id') !== e.target.instance.attr('id')){
					return;	
				}

				if (el && !el.retrieve('mouseover')){
					el.destroy();
				}
			}).delay(10);
		};
	}
	else{
		networkMap.events[name] = f;	
	}
};

networkMap.registerEvent('click', networkMap.events.click);
networkMap.registerEvent('mouseover', networkMap.events.mouseover);
networkMap.registerEvent('mouseout', networkMap.events.mouseout);
networkMap.registerEvent('hover', networkMap.events.hover);;
networkMap.colormap = networkMap.colormap || {};


/**
 * Register a color map. After a color map is registed
 * it can be used in the graph. 
 *
 * @param {String} The name of the colormap
 * @param {Object} colormap
 * @param {array} colormap.map The color values
 * @param {array} colormap.limits The limits associated with colormap.map
 * @param {string} colormap.nodata The color if no data is available
 * @param {function} colormap.translate(value) A function that takes a value [0:1|undefined] and returns a color
 */
networkMap.registerColormap = function(name, colormap){
	networkMap.colormap[name] = colormap;
};

/**
 * Rasta5 colormap
 */
networkMap.colormap.rasta5 = {
	translate: function(value){
		if (!value)
			return networkMap.colormap.rasta5.nodata;

		if (value < 0.2)
			return networkMap.colormap.rasta5.map[0];

		if (value < 0.4)
			return networkMap.colormap.rasta5.map[1];

		if (value < 0.6)
			return networkMap.colormap.rasta5.map[2];
		
		if (value < 0.8)
			return networkMap.colormap.rasta5.map[3];
		
		return networkMap.colormap.rasta5.map[4];
	},
	map: [
		'#3DDE1E',
		'#9BEC1A',
		'#F9EB18',
		'#F98020',
		'#F51329'
	],
	limits: [
		0.2,
		0.4,
		0.6,
		0.8,
		1
	],
	nodata: '#C0C0C0'
};

/**
 * Flat5 colormap
 */
networkMap.colormap.flat5 = {
	translate: function(value){
		var map = networkMap.colormap.flat5;
		if (!value && value !== 0)
			return map.nodata;
	
		if (value === 0)
			return map.map[0];

		if (value < 0.2)
			return map.map[1];

		if (value < 0.4)
			return map.map[2];

		if (value < 0.6)
			return map.map[3];
		
		if (value < 0.8)
			return map.map[4];
		
		return map.map[5];
	},
	map: [
		'#000000',
		'#27ae60',
		'#2ecc71',
		'#f1c40f',
		'#e67e22',
		'#c0392b'
	],
	limits: [
		0,
		0.2,
		0.4,
		0.6,
		0.8,
		1
	],
	nodata: '#ecf0f1'
};

/**
 * HSL colormap
 */
networkMap.colormap.hsl20 = {
	translate: function(value){
		var map = networkMap.colormap.hsl20;
		
		if (!value && value !== 0)
			return map.nodata;
	
			
	
		if (value === 0)
			return '#000';

		
		var hue = 220 - (Math.floor(value * 24) * 10);
		if (hue < 0) {
			hue = 360 - hue;
		}
		return "hsl(" + hue + ", 100%, 50%)";
	},
	map: [
		'#000',
		'#007fff',
		'#0af',
		'#00d4ff',
		'#0ff',
		'#0fa',
		'#00ff80',
		'#0f5',
		'#00ff2b',
		'#0f0',
		'#5f0',
		'#80ff00',
		'#af0',
		'#d4ff00',
		'#ff0',
		'#fa0',
		'#ff8000',
		'#f50',
		'#ff2b00',
		'#f00',
		'#f05'
	],
	limits: [
		0, //#000
		0.05, //#007fff
		0.1, //#0af
		0.15, //#00d4ff
		0.2, //#0ff
		0.25, //#0fa
		0.3, //#00ff80
		0.35, //#0f5
		0.4, //#00ff2b
		0.45, //#0f0
		0.5, //#5f0
		0.55, //#80ff00
		0.6, //#af0
		0.65, //#d4ff00
		0.7, //#ff0
		0.75, //#fa0
		0.8, //#ff8000
		0.85, //#f50
		0.9, //#ff2b00
		0.95, //#f00
		1		//#f05
	],
	nodata: '#ecf0f1'
};;/**
 * Creates an instance of networkMap.ColorLegend.
 *
 * @constructor
 * @this {networkMap.ColorLegend}
 * @param {string} The name of the colormap
 * @param {Object} A options object.
 */
networkMap.ColorLegend = function(colormap, options){
	this.options = {
		/** The size of the the color square */
		boxSize: 25,
		/** margin */
		margin: 10,
		/** target */
		target: null
	};
	this.graph = options.graph;
	delete options.graph;

	this.setOptions(options);
	this.colormap = networkMap.colormap[colormap];

	if (!this.colormap){
		throw 'Colormap "' + colormap + '" is not registerd';
	}

	this.draw();
	
	// Fix for FF 
	// A timing issue seems to cause the bbox to
	// return an incorrect value
	setTimeout(function(){
		var bbox = this.svg.bbox();
		if (bbox.x === 0 && bbox.y === 0){
			return this;
		}
		this._move();
	}.bind(this), 0);
};

networkMap.extend(networkMap.ColorLegend, networkMap.Options);

networkMap.extend(networkMap.ColorLegend, {

	

	/** The graph object to attach to */
	graph: null,

	/**
	 * Draw/redraw the legend in the graph
	 *
	 * @this {networkMap.ColorLegend}
	 * @return {networkMap.ColorLegend} self
	 */
	draw: function(){
		var colormap = this.colormap.map;

		var container = this.container = this.wrapper = document.createElement('div');
		this.wrapper.classList.add('nm-colormap');
		this.options.target.appendChild(container);

		var svg = this.svg = this.svg || SVG(container).group();
		this.svg.clear();	

		

		colormap.forEach(function(color, index){
			svg.rect(this.options.boxSize, this.options.boxSize).attr({
				fill: color,
				'stroke-width': 1
			}).move(
				0, 
				(colormap.length - 1 - index) * this.options.boxSize
			);

			svg.line(
				-5, (colormap.length - 1 - index) * this.options.boxSize,
				0, (colormap.length - 1 - index) * this.options.boxSize
			).attr({
				stroke:'#000'

			});

			svg.text(Math.round(this.colormap.limits[index].toString() * 100) + '%')
				.attr({
					'text-anchor': 'end',
					'font-size': this.options.boxSize/2
				})
				.move(
				-this.options.boxSize/2,
				(colormap.length - 1.3 - index) * this.options.boxSize ,
				'end'
			);
		}.bind(this));

		svg.line(
			-5, (colormap.length) * this.options.boxSize,
			0, (colormap.length) * this.options.boxSize
		).attr({
			stroke:'#000'

		});

		svg.text('0%')
			.attr({
				'text-anchor': 'end',
				'font-size': this.options.boxSize/2
			})
			.move(
			-this.options.boxSize/2, 
			(colormap.length - 0.3) * this.options.boxSize ,
			'end'
		);
		
		this._move();

		return this;
	},

	/**
	 * Move the legend and resize the containing div
	 *
	 * @this {networkMap.ColorLegend}
	 * @return {networkMap.ColorLegend} self
	 */
	_move: function(){
		var bbox = this.svg.bbox();
		
		this.container.style.width = Math.ceil(bbox.width) + 'px';
		this.container.style.height = Math.ceil(bbox.height) + 'px';
		
		this.svg.move(Math.abs(bbox.x), Math.abs(bbox.y));

		return this;
	}

});
;/**
 * Creates an instance of networkMap.SettingsManager.
 *
 * @constructor
 * @this {networkMap.SettingsManager}
 * @param {Element} The html element to inject into
 * @param {networkMap.Mediator} An instance of networkMap.Mediator
 */
networkMap.SettingsManager = function(container, mediator, defaultView){
	this.container = container;
	this.mediator = mediator;
	this.defaultView = defaultView;

	// An array which contains the views
	this.editing = [];

	this.nav = this.createMenu();
	container.appendChild(this.nav);
	
	
	this._actions = {};

	if (this.mediator){
		this.mediator.subscribe('edit', this.edit.bind(this));
	}
};

networkMap.extend(networkMap.SettingsManager, networkMap.Observable);

networkMap.extend(networkMap.SettingsManager, {
	
	/**
	 * Create the HTML for the settings manager
	 *
	 * @this {networkMap.SettingsManager}
	 * @return {Element} The HTML for the settingsmanager.
	 */
	createMenu: function(){
		var nav = document.createElement('nav');
		nav.classList.add('nm-menu');

		var trigger = document.createElement('div');
		trigger.classList.add('nm-trigger');
		trigger.innerHTML = '<span class="nm-icon nm-icon-menu"></span><a class="nm-label">Settings</a>';
		trigger.addEventListener('click', this.toggle.bind(this));

		var menu = this.menu = document.createElement('ul');

		var editContent = this.contentContainer = document.createElement('li');
		editContent.classList.add('nm-object-properties');
		editContent.setAttribute('id', 'nm-edit-content');

		menu.appendChild(editContent);

		var menuButtons = this.menuButtons = document.createElement('li');
		menuButtons.classList.add('clearfix', 'nm-menu-buttons');

		var saveButton = this.btnSave = document.createElement('button');
		saveButton.textContent = 'Save';
		saveButton.classList.add('btn', 'btn-primary', 'pull-right');
		saveButton.addEventListener('click', this.save.bind(this));

		var addButton = this.btnAdd = document.createElement('button');
		addButton.textContent = 'Add';
		addButton.classList.add('btn', 'btn-success');
		addButton.addEventListener('click', this.add.bind(this));
		
		var deleteButton = this.btnDelete = document.createElement('button');
		deleteButton.textContent = 'Delete';
		deleteButton.classList.add('btn', 'btn-danger');
		deleteButton.addEventListener('click', this.delete.bind(this));

		menu.appendChild(menuButtons);
		menuButtons.appendChild(saveButton);
		menuButtons.appendChild(addButton);
		menuButtons.appendChild(deleteButton);
		nav.appendChild(trigger);
		nav.appendChild(menu);

		return nav;
	},

	/**
	 * Returns the content container. This container is
	 * used when custom html should be injected.
	 *
	 * @this {networkMap.SettingsManager}s
	 * @return {Element} The content conainer
	 */
	getContentContainer: function(){
		return this.contentContainer;
		
		// TODO: Remove
		//return this.nav.querySelector('#nm-edit-content');
	},

	/**
	 * By calling this function and sending in the 
	 * object that shold be edited the settingsManager
	 * will setup the UI. This is the default action when 
	 * clicking a node.
	 *
	 * @param {networkMap.event.Configuration} The edit event
	 * @this {networkMap.SettingsManager}
	 * @return {networkMap.SettingsManager} self
	 */
	edit: function(e){
		if (!e.editable)
			return;
		
		this.purgeEditing();
		return this.configure(e);
	},

	/**
	 * Clears the content container.
	 *
	 * @this {networkMap.SettingsManager}
	 * @return {networkMap.SettingsManager} self
	 */
	clear: function(){
		var container = this.getContentContainer();
		while (container.firstChild){
			container.removeChild(container.firstChild);
		}

		return this;
	},
	
	/**
	 * Hides the normal menu buttons. The callback
	 * will be called before they are set into visable
	 * state. 
	 *
	 * @this {networkMap.SettingsManager}
	 * @return {networkMap.SettingsManager} self
	 */
	hideButtons: function(callback){
		
		this.menuButtons.setStyle('display', 'none');
		this.showButtonsCallback = (callback) ? callback : function(){};
		
		return this;	
	},

	/**
	 * Hides the normal menu buttons. The callback
	 * will be called before they are set into visable
	 * state. 
	 *
	 * @this {networkMap.SettingsManager}
	 * @return {networkMap.SettingsManager} self
	 */
	displayButtons: function(){
		if (!this.showButtonsCallback){
			return this;
		}
			
		this.showButtonsCallback();
		delete this.showButtonsCallback;
		
		this.menuButtons.style.display = 'block';
		
		return this;
	},
	
	purgeEditing: function(){
		var editing = this.editing;
		
		// make sure they get GCed
		editing.forEach(function(view){
			view.configurationEvent().cancel();
			view.purge();
		});
		
		// drop/truncate references
		editing.length = 0;
	},
	
	previousEdit: function(){
		// prepare the previous view for GC
		var oldView = this.editing.pop();
		if (oldView){
			oldView.purge();
		}

		// fetch the new view
		var newView = this.editing.pop();
		
		// If there are no views display default view
		if (!newView){
			return this.displayDefaultView();
		}

		// Clear the content pane and draw the new view
		// and add it back to the view queue 
		this.clear();
		this.displayButtons();
		this.getContentContainer().appendChild(newView.render());
		this.editing.push(newView);
		
		return this;

	},
	
	setConfigWidget: function(configWidget){
		this.defaultView.configWidget = configWidget;
		this.displayDefaultView();
		return this;	
	},

	displayDefaultView: function(){
		this.purgeEditing();
		
		var content = this.getContentContainer();
		this.clear();
		this.displayButtons();
		
		if (this.defaultView.deletable){
			this.btnDelete.classList.remove('nm-hidden');
		}
		else {
			this.btnDelete.classList.add('nm-hidden');	
		}
		
		content.appendChild(this.defaultView.configWidget.toElement());
		
		return this;
	},

	/**
	 * Toggle the settings manager. 
	 *
	 * @this {networkMap.SettingsManager}
	 * @return {networkMap.SettingsManager} self
	 */
	toggle: function(){
		if (this.nav.classList.contains('nm-menu-open')){
			return this.disable();
		}
		else {
			return this.enable();
		}
	},
	

	/**
	 * Enable the settings manager. 
	 *
	 * @this {networkMap.SettingsManager}
	 * @return {networkMap.SettingsManager} self
	 */
	enable: function(){
		this.nav.classList.add('nm-menu-open');	
		this.fireEvent('active');
		
		return this.displayDefaultView();
		
		// TODO: REMOVE
		//this.mediator.publish('settingsManager.defaultView', [this]);
	},
	

	/**
	 * Disable the settings manager. 
	 *
	 * @this {networkMap.SettingsManager}
	 * @return {networkMap.SettingsManager} self
	 */
	disable: function(){
		this.nav.classList.remove('nm-menu-open');
		var content = this.nav.querySelector('#nm-edit-content');
		while (content.firstChild) {
			content.removeChild(content.firstChild);
		}
		
		this.clear();
		this.fireEvent('deactive');

		return this;
	},
	

	/**
	 * This triggers a save event.
	 *
	 * @this {networkMap.SettingsManager}
	 * @return {networkMap.SettingsManager} self
	 */
	save: function(){
		this.fireEvent('save');

		return this;
	},
	
	
	setAction: function(action, actionInterface){
		networkMap.SettingsManager.isActionInterface(action, actionInterface);
		this._actions[action] = actionInterface;
		
		return this;
	},	
	
	_runAction: function(action, e){
		if (this._actions[action] === undefined){
			this._action = networkMap.SettingsManager._actions[action];
		}		
		
		if (this._actions[action] !== null && this._actions[action] !== undefined){
			this._action = this._actions[action];	
		}				
		
		if (this._action){
			// let the interface be able to remove the default buttons
			this.displayButtons();
			this._action.addEvent('hideButtons', function(){
				this.hideButtons();
			}.bind(this));
			
			this._action.addEvent('deletable', function(deletable){
				if (deletable){	
					return this.btnDelete.classList.remove('nm-hidden');
				}
				
				return this.btnDelete.classList.add('nm-hidden'); 
			}.bind(this));
			
			this._action.addEvent('cancel', this.previousEdit.bind(this));
			
			this._action.addEvent('addLink', function(e){
				this.mediator.publish('addLink', [e]);
				this.previousEdit();
			}.bind(this));			
			
			var el = this._action.render(e);
			
			if (el){
				this.clear();
				
				this.getContentContainer().appendChild(el);
				this.editing.push(this._action);
			}
			return el;
		}
	},	
	
	add: function(){
		return this._runAction('add');
	},
	
	addNode: function(){
		return this._runAction('addNode');
	},
	
	addLink: function(){
		return this._runAction('addLink');
	},
	
	configure: function(e){
		return this._runAction('configure', e);
	},
	
	delete: function(e){
		return this._runAction('delete', this.editing[this.editing.length - 1].configurationEvent());
	},
	
	modify: function(e){
		return this._runAction('modify', e);
	}
	
	

});


networkMap.SettingsManager._actions = {};

networkMap.SettingsManager.registerAction = function(action, actionInterface){
	networkMap.SettingsManager.isActionInterface(action, actionInterface);
		
	networkMap.SettingsManager._actions[action] = actionInterface;
	
	return true;
};

networkMap.SettingsManager.isActionInterface = function(action, actionInterface){
	if (!networkMap.find(['add', 'delete', 'addNode', 'addLink', 'configure'], function(item){ return item === action; }))
		throw 'Action not implemented: ' + action;
	
	if (!actionInterface.render || !networkMap.isFunction(actionInterface.render)){
		throw 'Class does not implement actionInterface.render for ' + action;
	}
	
	if (!actionInterface.purge || !networkMap.isFunction(actionInterface.purge)){
		throw 'Class does not implement actionInterface.purge for ' + action;
	}
	
	return true;
};
;networkMap.renderer = networkMap.renderer || {};
networkMap.renderer.settingsManager = networkMap.renderer.settingsManager || {};

networkMap.renderer.settingsManager.Add = function(){
	
};

networkMap.extend(networkMap.renderer.settingsManager.Add, networkMap.Observable);
networkMap.extend(networkMap.renderer.settingsManager.Add, {
	render: function(){
		
	},
	
	purge: function(){
		
	},
	
	toElement: function(){
		
	}
});
 
networkMap.SettingsManager.registerAction('add', new networkMap.renderer.settingsManager.Add());
;networkMap.renderer = networkMap.renderer || {};
networkMap.renderer.settingsManager = networkMap.renderer.settingsManager || {};

networkMap.renderer.settingsManager.AddLink = function(){
	this.el = null;
	this.state = this.states.notRendered;
};

networkMap.extend(networkMap.renderer.settingsManager.AddLink, networkMap.Observable);
networkMap.extend(networkMap.renderer.settingsManager.AddLink, {
	render: function(){
		this.state.render.call(this);
	},
	
	purge: function(){
		this.state.purge.call(this);		
	},
	
	states: {
		rendered: {
			render: function(){
				return this.el;	
			},
			purge: function(){
				// Clean up HTML
				this.state = this.states.notRendered;
			}
		},
		
		notRendered: {
			render: function(){
				// Render HTML
				this.state = this.states.rendered;
			},
			purge: function(){
				return true;
			}
		}
	}
});

networkMap.SettingsManager.registerAction('addLink', new networkMap.renderer.settingsManager.AddLink());
 ;networkMap.renderer = networkMap.renderer || {};
networkMap.renderer.settingsManager = networkMap.renderer.settingsManager || {};

networkMap.renderer.settingsManager.Delete = function(){
	this.el = null;
	this.state = this.states.notRendered;
};

networkMap.extend(networkMap.renderer.settingsManager.Delete, networkMap.Observable);
networkMap.extend(networkMap.renderer.settingsManager.Delete, {
	render: function(e){
		this.state.render.call(this, e);
	},
	
	purge: function(){
		this.state.purge.call(this);		
	},
	
	states: {
		rendered: {
			render: function(){
				return this.el;	
			},
			purge: function(){
				// Clean up HTML
				this.state = this.states.notRendered;
			}
		},
		
		notRendered: {
			render: function(e){
				if (e.deletable && window.confirm('Are you sure you want to delete the ' + e.type + ' ' + e.targetName)){
						e.destroy();
				}
				
				return null;
			},
			purge: function(){
				return true;
			}
		}
	}
});

networkMap.SettingsManager.registerAction('delete', new networkMap.renderer.settingsManager.Delete());
 ;networkMap.renderer = networkMap.renderer || {};

networkMap.renderer.settingsManager.Configure = function(){
	/** The element that should be rendered */
	this.el = null;
	
	/** The configuration event */
	this.e = null;
	
	/** The current state in the state machine */
	this.state = this.states.notRendered;
};

networkMap.extend(networkMap.renderer.settingsManager.Configure, networkMap.Observable);
networkMap.extend(networkMap.renderer.settingsManager.Configure, {
	render: function(e){
		return this.state.render.call(this, e);
	},
	
	purge: function(){
		return this.state.purge.call(this);		
	},
	
	configurationEvent: function(){
		return this.e;
	},
	
	states: {
		rendered: {
			render: function(e){	
				return this.el;	
			},
			purge: function(){
				// TODO: We should call a clean up method here
				this.el = null;
				this.state = this.states.notRendered;
			}
		},
		
		notRendered: {
			render: function(e){
				this.e = e;
				if (e.deletable){
					this.fireEvent('deletable', [true]);
				}
				else {
					this.fireEvent('deletable', [false]);
				}
				
				// Use the provided conf element
				if (e.configWidget.toElement){
					this.el = document.createElement('div');
					this.el.appendChild(e.configWidget.toElement());
				}
				else{ 
					// If we can not configure it we will not do it...
					return null;	
				}
				this.state = this.states.rendered;
				return this.el;
				
			},
			purge: function(){
				return true;
			}
		}
	}
});

networkMap.SettingsManager.registerAction('configure', new networkMap.renderer.settingsManager.Configure());;networkMap.renderer.link = networkMap.renderer.Link || {};
networkMap.renderer.link.UtilizationLabel = function(svg, options){
	this.label = null;
	this.rect = null;
	this.svg = svg;
	
	this.value = null;

	options = options || {};
	this.cx = options.cx || null;
	this.cy = options.cy || null;
	delete options.cx;
	delete options.cy;
		
	this.options = {
		enabled: false,
		padding: 2,
		fontSize: 8,
		digits: 0
	};
	this.setOptions(options);
	
	this.state = this.states.notRendered;
};

networkMap.extend(networkMap.renderer.link.UtilizationLabel, networkMap.Options);
networkMap.extend(networkMap.renderer.link.UtilizationLabel, networkMap.Observable);

networkMap.extend(networkMap.renderer.link.UtilizationLabel, {
	NULL_STRING: '  -  ',
	
	setPosition: function(cx, cy){
		this.cx = cx;
		this.cy = cy;
		return this;
	},
	
	render: function(value){ return this.state.render.call(this, value); },
	hide: function(){ return this.state.hide.call(this); },
	show: function(){ return this.state.show.call(this); },
	purge: function(){ return this.state.purge.call(this); },
	
	states: {
		notRendered: {
			render: function(value){
				if (!this.svg)
					return this;
				
				if (!this.options.enabled){
					return this;
				}

				value = value || this.value;
				
				var bgColor = '#ffffff', 
					strokeColor = '#000000',
					strokeWidth = 1;				
				
				var svg = this.svg;
	
				var label = this.label = svg.text(this.NULL_STRING)
				.font({
					family:   this.options.fontFamily,
					size:     this.options.fontSize,
					anchor:   'start',
					leading:  this.options.fontSize
				})
				.move(parseFloat(this.options.padding), parseFloat(this.options.padding));
				
				var bboxLabel = label.bbox();		
				var rect = this.rect = svg.rect(1,1)
					.fill({ color: bgColor})
					.stroke({ color: strokeColor, width: strokeWidth })
					.attr({ 
						rx: 2,
						ry: 2
					})
					.size(
						bboxLabel.width + this.options.padding * 2, 
						bboxLabel.height + this.options.padding * 2
					);
				label.front();
				
				this.state = this.states.rendered;
				this.render(value);
				return this;
			},
			hide: function(){
				return this;
			},
			show: function(){
				return this;
			},
			purge: function(){
				return this;	
			}
		},
		rendered: {
			render: function(value){
				value = this.value = value || this.value;
				
				value = (value === null) ? null : value * 100;
				if (!this.options.enabled || this.cx === null || this.cy === null){
					this.hide();
					return this;
				}
				
				this.show();
				
				if (value === null)
					this.label.text(this.NULL_STRING);	
				else		
					this.label.text(((value < 10) ? ' ' : '') + value.toFixed(this.options.digits) + '%');
					
				this.label.font({
					family:   this.options.fontFamily,
					size:     this.options.fontSize,
					leading:  this.options.fontSize
				})
				.move(parseFloat(this.options.padding), parseFloat(this.options.padding));
				
				var bboxLabel = this.label.bbox();	
				this.rect.size(
					bboxLabel.width + this.options.padding * 2, 
					bboxLabel.height + this.options.padding * 2
				);
				
				this.svg.center(parseFloat(this.cx), parseFloat(this.cy));	
				this.svg.front();
				return this;
				
			},
			hide: function(){
				this.svg.hide();
				this.state = this.states.hidden;
				
				return this;
			},
			show: function(){
				return this;
			},
			purge: function(node){}
		},
		hidden: {
			render: function(value){
				if (this.options.enabled){
					return this.show();
				}
				
				this.value = value;
				return this;
			},
			hide: function(){
				return this;
			},
			show: function(){
				this.svg.show();
				this.state = this.states.rendered;
				return this.render();			
			},
			purge: function(node){}
		}
		
	}

});;/**
 * Creates an instance of networkMap.Graph.
 *
 * @constructor
 * @this {networkMap.Graph}
 * @param {string|element} A string or Element to attach to network graph to
 * @param {Object} A options object.
 */
networkMap.Graph = function(target, options){
	/** The default options*/
	var defaults = {
		/** The with of the graph */
		width: 10,
		
		/** The height of the graph */
		height: 10,
		
		/** The name of the datasoruce to use */
		datasource: undefined,		
		
		/** The name of the colormap to use */
		colormap: undefined,
		
		/** Controls of the settings manager is created */
		enableEditor: true,
		
		/** Controls if the nodes are draggable */
		allowDraggableNodes: undefined,
		
		/** Controlls how often the links refresh the data */
		refreshInterval: 300,
		
		/** Controls if the link update should be controlled 
		 * by the graph or the link */ 
		batchUpdate: true,

		/** Controls if the grid is enabled */
		gridEnabled: true,		
		
		/** A grid size for objects to snap to */
		grid: {x:10, y:10},
		
		/** utilization labels */
		utilizationLabels: {
			enabled: false,
			fontSize: 8,
			padding: 2
		}
	};
	
	/** The default configuration */
	this.defaults = {};
	

	/** This array controls what is exported in getConfiguration*/
	this.exportedOptions = [
		//'width',
		//'height'
	];

	/** An internal array of nodes, do not use directly */
	this.nodes = [];

	/** An internal array of links, do not use directly */
	this.links = [];

	/** An internal reference to onSave configuration */
	this.saveData = {};

	/** An internal reference to check keep track of the mode */
	this._mode = 'normal';


	// Setup link generator for node
	this.node = this.node || {};
	
	options = options || {};
	if (options.node && options.node.linkGenerator){
		this.node.linkGenerator = networkMap.Node.createLinkGenerator(this.options.node.linkGenerator);
		delete options.node;
	} else{
		this.node.linkGenerator = networkMap.Node._linkGenerator;		
	}
	
	// setup link generator for link
	this.link = this.link || {};
	if (options.link && options.link.linkGenerator){
		this.link.linkGenerator = networkMap.Link.createLinkGenerator(this.options.link.linkGenerator);
		delete options.link;
	} else{
		this.link.linkGenerator = networkMap.Link._linkGenerator;		
	}

	this.properties = new networkMap.Properties(options, new networkMap.Properties(defaults));
	this.properties.addEvent('change', function(change){
		var gridChange = false;		
		var self = this;
		change.forEach(function(prop){
			if (prop.key === 'gridEnabled') gridChange = true;
			if (prop.key === 'grid') gridChange = true;
			if (prop.key === 'utilizationLabels') self.onUtilizationLabelsChange();
		});
		if (gridChange) this.onGridChange();
		self = null;				
	}.bind(this));
		
	// Setup node and link defaults
	this.defaults.node = new networkMap.Properties({}, networkMap.Node.defaults);
	this.defaults.link = new networkMap.Properties({}, networkMap.Link.defaults);
	this.defaults.link.set('colormap', this.properties.get('colormap'));
	this.defaults.link.set('datasource', this.properties.get('datasource'));

	// Create HTML
	this.element = (typeof target == 'string' || target instanceof String) ? document.getElementById(target) : target;
	this.container = document.createElement('div');
	this.container.classList.add('nm-container');
	this.element.appendChild(this.container);

	// create SVG
	this.svg = SVG(this.container);
	this.graph = this.svg.group();
	
	// Create legend
	this.legend = new networkMap.ColorLegend(this.defaults.link.get('colormap'), {graph: this, target: this.container});

	// Enable editor, this should be move to a separate function.
	if (this.properties.get('enableEditor')){
		this.settings = new networkMap.SettingsManager(this.container, this, new networkMap.event.Configuration({
			deletable: false,
			editable: true,
			editWidget: new networkMap.Graph.Module.Settings(this.defaults.node, this.defaults.link, this.properties).toElement(),
			target: this,
			type: 'graph',
			targetName: 'graph'
		}));
		
		this.settings.addEvent('active', this.enableEditor.bind(this));
		this.settings.addEvent('deactive', this.disableEditor.bind(this));
		this.settings.addEvent('save', this.save.bind(this));
	}

	// This is the way to externaly add a link from a GUI		
	this.subscribe('addLink', this.addLinkBySubsriber.bind(this));

	this.addEvent('resize', this.rescale.bind(this));
	
	this.setRefreshInterval(this.properties.get('refreshInterval'));
	
	this.svg.on('click', this._clickHandler.bind(this));

	this.addEvent('load', this.update.bind(this));
	
};

networkMap.extend(networkMap.Graph, networkMap.Observable);
networkMap.extend(networkMap.Graph, networkMap.Mediator);
networkMap.extend(networkMap.Graph, networkMap.Options);

networkMap.extend(networkMap.Graph, {
	
	/**
	 * Set the default options for the graph. The defaults will be 
	 * merged with the current defaults.
	 * 
	 * @param element {string} The element to set default options for.
	 * Can be one of (node|link)
	 * @param defaults {object} An object with key value pairs of options
	 * @return {networkMap.Graph} self
	 */
	setDefaults: function(element, properties){
		if (!this.defaults[element]){
			throw "Illigal element";
		}
		
		// set the properties will merge with configuration from user
		this.defaults[element].set(properties);
		
		// TODO: rework
		this.fireEvent('redraw', [{defaultsUpdated: true}]);
		
		return this;
	},

	/**
	 * Retrive the default configuration for a graph element
	 *
	 * @param element {string} The graph element to return defaults for.
	 * @return {object} the default configuration 
	 */
	getDefaults: function(element){
		if (!this.defaults[element]){
			throw "Illigal element";
		}
		
		return this.defaults[element];
	},

	/** 
	 * Set the intervall which the graph should refresh
	 *
	 * @param interval {int} interval in seconds. If null it 
	 * will disable the updates.  
	 * @return {networkMap.Graph} self
	 */
	setRefreshInterval: function(interval){
		this.properties.set('refreshInterval', interval);
		
		if (interval){
			this.intervalId = setInterval(function(){
				this.update();
			}.bind(this), interval*1000);
		}
		else if (this.intervalId){
			clearInterval(this.intervalId);
			delete this.intervalId;
		}
		
		return this;
	},

	/**
	 * Trigger an event in an object
	 * @param event {string} The event name to trigger 
	 * @param object {object} The object to trigger the event on
	 * 
	 * @return {networkMap.Graph} self
	 */
	triggerEvent: function(event, object){
		object.fireEvent(event, object);

		return this;
	},

	/**
	 * This will rescale the SVG element, and if it 
	 * does not fit it will will zoom out.
	 *
	 * @ retrun {networkMap.Graph} self
	 */
	rescale: function(){
		var docSize = {
			x: this.element.offsetWidth,
			y: this.element.offsetHeight
		};	
		
		this.svg.size(
			docSize.x, 
			docSize.y
		);
					
		var bbox = this.graph.bbox();	
		
		if (docSize.x > (Math.abs(bbox.x) + bbox.width) && docSize.y > (Math.abs(bbox.y) + bbox.height)){
			// the svg is within the docSize (with the exception if we have negative bbox.x and bbox.y
			this.svg.viewbox(
				(bbox.x < 0) ? bbox.x : 0,
				(bbox.y < 0) ? bbox.y : 0,
				docSize.x,
				docSize.y		
			);
		}
		else if (docSize.x > bbox.width && docSize.y > bbox.height){
			// the svg fits without scaling
			this.svg.viewbox(
				bbox.x - (docSize.x - bbox.width) / 2, 
				bbox.y - (docSize.y - bbox.height) / 2, 
				docSize.x, 
				docSize.y);
		}	
		else {
			// scale the svg to fit
			var scaleFactor = ((bbox.width - docSize.x) > (bbox.height - docSize.y)) ? bbox.width / docSize.x : bbox.height / docSize.y;
			this.svg.viewbox(
				bbox.x - 5, 
				bbox.y - 5, 
				docSize.x * scaleFactor + 10, 
				docSize.y * scaleFactor + 10
			);
			//this.svg.viewbox(bbox.x, bbox.y, bbox.width + Math.abs(bbox.x), bbox.height + Math.abs(bbox.y));
		}
		
		return this;		
	},

	/**
	 * Returns the root SVG object
	 *
	 * @ retrun {SVG}
	 */
	getSVG: function(){
		return this.svg;
	},

	/**
	 * Returns the main SVG group used for painting the graph
	 *
	 * @ retrun {SVG.Group}
	 */
	getPaintArea: function(){
		return this.graph;
	},

	/**
	 * Returns the settingsManager that is bound to the graph
	 *
	 * @ retrun {networkMap.SettingsManager}
	 */
	settingsManager: function(){
		return this.settings();
	},

	/**
	 * Generates HTML that is used for configuration
	 *
	 * @this {networkMap.Graph}
	 * @return {Element} A HTML Element that contains the UI
	 */
	getSettingsWidget: function(){
		var container = new networkMap.widget.Accordion();
		var accordionGroup;

		var changeHandler = function(defaults, key){
			return function(e, widget){
				defaults.set(key, widget.value());
			}.bind(this);
		}.bind(this);
	
		accordionGroup = container.add('Globals');
		accordionGroup.appendChild(new networkMap.widget.GridInput('Grid', {
			enabled: this.options.gridEnabled,
			grid: this.options.grid
		}).addEvent('change', function(e){
			if (e.value.enabled)
				this.grid(e.value.grid);
			else
				this.grid(false);
		}.bind(this)));
				
	
		accordionGroup = container.add('Node Defaults');		
		networkMap.each(networkMap.Node.defaultTemplate, function(option, key){
			if (option.type === 'number'){
				accordionGroup.appendChild(
					new networkMap.widget.IntegerInput(option.label, this.defaults.node.get(key, true), option)
						.addEvent('change', changeHandler(this.defaults.node, key)
					)
				);
			}
			else if(option.type === 'text'){
				accordionGroup.appendChild(
					new networkMap.widget.TextInput(option.label, this.defaults.node.get(key, true), option)
						.addEvent('change', changeHandler(this.defaults.node, key)
					)
				);
			}
			else if (option.type === 'color'){
				accordionGroup.appendChild(
					new networkMap.widget.ColorInput(option.label, this.defaults.node.get(key, true), option)
						.addEvent('change', changeHandler(this.defaults.node, key)
					)
				);
			}
		}.bind(this));
		
		accordionGroup = container.add('Link Defaults');		
		networkMap.each(networkMap.Link.defaultTemplate, function(option, key){
			if (option.type === 'number'){
				accordionGroup.appendChild(
					new networkMap.widget.IntegerInput(option.label, this.defaults.link.get(key, true), option)
						.addEvent('change', changeHandler(this.defaults.link, key)
					)
				);
			}
			else if(option.type === 'text'){
				accordionGroup.appendChild(
					new networkMap.widget.TextInput(option.label, this.defaults.link.get(key, true), option)
						.addEvent('change', changeHandler(this.defaults.link, key)
					)
				);
			}
			else if (option.type === 'color'){
				accordionGroup.appendChild(
					new networkMap.widget.ColorInput(option.label, this.defaults.link.get(key, true), option)
						.addEvent('change', changeHandler(this.defaults.link, key)
					)
				);
			}
		}.bind(this));
				
		
		return container;
	},

	grid: function(grid){
		if (grid === true){
			this.properties.set('gridEnabled', true);
			
			return this;
		}
		
		if (grid === false){
			this.properties.set('gridEnabled', false);	
		}		
		
		if (grid === undefined){
			if (!this.properties.get('gridEnabled'))
				return false;
				
			return this.properties.get('grid');
		}
		
		if (typeof grid === 'object'){
			this.properties.set('gridEnabled', true);			
			this.properties.set('grid', grid);
		}

		
		return this.onGridChange();
	},
	
	onGridChange: function(){
		this.disableDraggableNodes();
		this.enableDraggableNodes();
		
		return this;
	},
	
	onUtilizationLabelsChange: function(){
		var options = this.properties.get('utilizationLabels');
		this.links.forEach(function(link){
			link.setUtilizationLabelOptions(options);
		});
		options = null;
	},

	/**
	 * Load a network map, it can either be a URI string
	 * or an configuration object.
	 *
	 * @param {string|object} The thing to load
	 * @retrun {networkMap.Graph} self
	 * @throws "TypeError"
	 */
	load: function(obj){
		if (typeof obj == 'string' || obj instanceof String){
			return this.loadUrl(obj);
		}
		else if (obj !== null && typeof obj === 'object'){
			return this.loadObject(obj);
		}
		else{
			throw new TypeError('Unknown type ' + Object.prototype.toString.call(obj));
		}
		return this;
	},

	/**
	 * Loads a JSON file from the URL and builds a 
	 * network map.
	 *
	 * @param {string} The URL to the JSON file
	 * @ retrun {networkMap.Graph} self
	 */
	loadUrl: function(url){
		var request = new XMLHttpRequest();
		request.open('GET', url, true);

		request.onload = function() {
			if (request.status >= 200 && request.status < 400){
				// Success!
				this.loadObject(JSON.parse(request.responseText));
			} else {
				new networkMap.widget.Modal().alert('There was an error when loading the weathermap (' + request.status + ')', {title: 'Error'});
			}
		}.bind(this);

		request.onerror = function() {
			new networkMap.widget.Modal().alert('An error occurred when trying to load the resource', {title: 'Error'});
		};

		request.send();

		return this;
	},

	/**
	 * Load an object representation of a network map.
	 *
	 * @param {Object} The Object representation of the mao
	 * @ retrun {networkMap.Graph} self
	 */
	loadObject: function(mapStruct){
		this.setOnSave(mapStruct.onSave);
		mapStruct.nodes = mapStruct.nodes || [];
		mapStruct.links = mapStruct.links || [];
		
		if (mapStruct.defaults){
			
			// TODO: This can be removed as soon as all weathermaps are converted 
			if (mapStruct.defaults.graph && mapStruct.defaults.graph.utilizationLabels){
				if (mapStruct.defaults.graph.utilizationLabels.enabled === 'false')
					mapStruct.defaults.graph.utilizationLabels.enabled = false;
					
				if (mapStruct.defaults.graph.utilizationLabels.enabled === 'true')
					mapStruct.defaults.graph.utilizationLabels.enabled = true;
			}
				
			this.properties.set(mapStruct.defaults.graph || {});
		
			this.setDefaults('node', mapStruct.defaults.node || {});
			this.setDefaults('link', mapStruct.defaults.link || {});
		}
		
		mapStruct.nodes.forEach(function(node){
			node.graph = this;
			node.draggable = this.properties.get('allowDraggableNodes');
			
			this.addNode(new networkMap.Node(node), false);
		}.bind(this));

		mapStruct.links.forEach(function(link){
			link.graph = this;
			this.addLink(new networkMap.Link(link), false);
		}.bind(this));

		// TODO: Clean up!!!		
		this.settings.setConfigWidget(new networkMap.Graph.Module.Settings(this.defaults.node, this.defaults.link, this.properties).toElement());
		
		this.fireEvent('load', [this]);
		this.triggerEvent('resize', this);
		
		this.onUtilizationLabelsChange();
		
		return this;
	},

	/**
	 * This will set the configuration that controlls
	 * the save call. See documentation for onSave in
	 * the configuration file documentation for more 
	 * information.
	 *
	 * @param {Object} The onŚave configuration
	 * @ retrun {networkMap.Graph} self
	 */
	setOnSave: function(saveData){
		if (saveData){
			if (this.validateSave(saveData))
				this.saveData = saveData;
		}
		return this;
	},

	/**
	 * Retreive the configuration object for the save
	 * call. See documentation for onSave in the 
	 * configuration file documentation for more 
	 * information.
	 *
	 *
	 * @ retrun {Object} The onSave configuration.
	 */
	getOnSave: function(){
		return (this.saveData) ? this.saveData : {};
	},

	
	/**
	 * Validate a onSave configuration object. Returns
	 * true if it validates, false otherwise.
	 * structure:
	 * "onSave": {
	 *  "method": "post|get",
	 *  "url": "update.php",
	 *  "data": {
	 *   "id": "weathermap.json"		
	 *  }
	 * }
	 *
	 * @ retrun {boolean} The onSave configuration.
	 */
	validateSave: function(save){
		if (save.method && !(save.method == 'post' || save.method == 'get')){
			this.saveEnabled = false;
			alert("Illigal argument: " + save.method + ". Valid onSave.method arguments are: post, get"); 
			return false;
		}
		else{
			save.method = "post";	
		}
				
		save.data = save.data || {};
		
		if (!save.url){
			this.saveEnabled = false;
			alert("Missing argument onSave.url");	
			return false;
		}
		
		return true;		
	},

	/**
	 * Send a save request to the server.
	 *
	 * @ retrun {boolean} If request could be sent
	 * @todo Emit event when save is compleated
	 */
	save: function(){
		if (!this.saveData)
			return false;
			
		var data = this.getConfiguration();

		var html = this.settings.btnSave.innerHTML;
		this.settings.btnSave.textContent = '.....';

		//var params = networkMap.toQueryString(data);
		var request = new XMLHttpRequest();

		request.open(this.saveData.method, this.saveData.url, true);
		request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
		
		//request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

		request.onload = function() {
			this.settings.btnSave.innerHTML = html;
			if (request.status >= 200 && request.status < 400){
				data = JSON.parse(request.responseText);
				if (data.status === 'ok'){
					new networkMap.widget.Modal().alert('Weathermap saved');
				}
				if (data.status === 'nok'){
					new networkMap.widget.Modal().alert(data.error, {title: 'Error'});
				}
				if (data.status == 'deleted'){
					new networkMap.widget.Modal().alert('The networkmap is deleted', {title: 'Error'});
				}
			} else {
				new networkMap.widget.Modal()
					.alert('There was an error while saving the weathermap (' + request.status + ')', {title: 'Error'});
			}
		}.bind(this);

		request.onerror = function() {
			this.settings.btnSave.innerHTML = html;
			new networkMap.widget.Modal()
				.alert('There was an error while saving the weathermap', {title: 'Error'});
		};

		request.send(JSON.stringify(data));
	
		return true;
	},

	mode: function(){
		return this._mode;
	},

	/**
	 * Set nodes and links in edit mode
	 *
	 * @ retrun {networkManager.Graph} self
	 */
	enableEditor: function(){
		this.enableDraggableNodes();
		this.nodes.forEach(function(node){
			node.mode('edit');
		});

		this.links.forEach(function(link){
			link.mode('edit');
		});
		
		this._mode = 'edit';

		return this;
	},

	/**
	 * Disable edit mode on nodes and links.
	 *
	 */
	disableEditor: function(){
		this.disableDraggableNodes();
		
		this.nodes.forEach(function(node){
			node.mode('normal');
		});
		this.links.forEach(function(link){
			link.mode('normal');
		});

		this._mode = 'normal';

		return this;
	},
	
	_clickHandler: function(e){
		if (this._mode !== 'edit'){
			return;
		}
		
		if (e.target.instance === this.svg || e.target.instance === this.graph){
			this.settings.displayDefaultView();
		}
		//TODO: REMOVE
		/* 
		if (e.target.instance === this.svg || e.target.instance === this.graph){
			this.publish('edit', new networkMap.event.Configuration({
				deletable: false,
				editable: true,
				editWidget: new networkMap.Graph.Module.Settings(this.defaults.node, this.defaults.link, this.properties).toElement(),
				target: this,
				type: 'graph',
				targetName: 'graph'
			}));
		}
		*/
	},

	/**
	 * Enable draggable nodes
	 *
	 * @ retrun {networkMap.Graph} self
	 */
	enableDraggableNodes: function(){
		this.nodes.forEach(function(node){
			node.draggable();
		});

		return this;		
	},

	/**
	 * disable draggable nodes
	 *
	 * @ retrun {networkMap.Graph} self
	 */
	disableDraggableNodes: function(){
		this.nodes.forEach(function(node){
			node.fixed();	
		});

		return this;
	},

	/**
	 * Fetch configuration from links and nodes
	 *
	 * @ retrun {Object} A networkmap configuration object
	 */
	getConfiguration: function(){
		var configuration = {
			defaults: {
				graph: this.properties.extract(),
				node: this.defaults.node.extract(),
				link: this.defaults.link.extract()
			},
			nodes: [],
			links: [],
			onSave: this.saveData
		};

		// self
		this.exportedOptions.forEach(function(option){
			configuration[option] = this.options[option];
		}.bind(this));
		configuration.onSave = this.saveData;

		// nodes
		this.nodes.forEach(function(node){
			configuration.nodes.push(node.getConfiguration());
		});

		// links
		this.links.forEach(function(link){
			configuration.links.push(link.getConfiguration());
		});

		return configuration;
	},

	registerLinkGenerator: function(component, f){
		this._linkGenerator[component] = f;
	},

	/**
	 * Add a node to the graph
	 *
	 * @param {networkMap.Node} The node to add
	 * @param {Boolean ? true } If set to false the resize event will not be triggered
	 * @ retrun {networkMap.Graph} self
	 * @todo refactor to a factory method
	 */
	addNode: function(node, refresh){
		this.nodes.push(node);

		// listen to the requestHref to provide node href
		node.addEvent('requestHref', this.node.linkGenerator);
		
		// as the node is already created we need to trigger an update of the link
		node.updateLink();

		if (refresh !== false){
			this.triggerEvent('resize', this);	
		}

		return this;
	},

	/**
	 * Get the node with ID = id, returns undefined 
	 * if the node does not exist.
	 *
	 * @param {string} A node id
	 * @ retrun {networkMap.Node} The node or undefined
	 */
	getNode: function(id){
		return networkMap.find(this.nodes, function(node){	
			if (node.options.id === id){
				return true;
			}
		});
	},
	
	/**
	 * Remove a node from the graph
	 *
	 * @param {networkMap.Node} The node to remove
	 * @ retrun {networkMap.Graph} self
	 * @todo refactor so the node is removed by unseting 
	 * the graph reference in the node.
	 */
	removeNode: function(node){
		this.nodes.erase(node);
		node.setGraph(null);

		this.getLinks(node).forEach(function(link){
			this.removeLink(link);
		}.bind(this));		
		
		return this;
	},

	/**
	 * Add a link to the graph
	 *
	 * @param {networkMap.Link} The link to add
	 * @param {Boolean ? true} If set to false the resize event will not be triggered
	 * @ retrun {networkMap.Graph} self
	 * @todo this should happen when the setting 
	 *	the graph in the link.
	 */
	addLink: function(link, refresh){
		
		this.links.push(link);

		// listen to the requestHref to provide link href
		link.addEvent('requestHref', this.link.linkGenerator);
		
		// as the link is already created we need to trigger an update of the link
		link.updateHyperlinks();

		
		if (refresh !== false){
			this.triggerEvent('resize', this);	
		}
		

		return this;
	},	
	
	addLinkBySubsriber: function(e){
		var self = this;
		if (e.nodes){
			e.nodes.each(function(options){
				if (self.getNode(options.id))
					return;
				
				options.graph = options.graph || self;
				var node = new networkMap.Node(options);
				self.addNode(node);
				
				// TODO: The node should now this
				if (self.mode() === 'edit'){
					node.draggable().mode('edit');	
				}
			});	
		}
		
		
		if (!this.getLink(e.link.nodeA.id, e.link.nodeB.id)){
			e.link.graph = e.link.graph || this;
			var link = new networkMap.Link(e.link);
			this.addLink(link);
			link.update(true);
			
			if (this.mode() === 'edit'){
				link.mode('edit')	;
			}
		}
		return this;
	},

	getLink: function(nodeIdA, nodeIdB){
		return networkMap.find(this.links, function(link){
			if (link.nodeA.options.id === nodeIdA && link.nodeB.options.id === nodeIdB){
				return true;
			}
			if (link.nodeA.options.id === nodeIdB && link.nodeB.options.id === nodeIdA){
				return true;
			}

		});
	},

	getLinks: function(node, secondaryNode){
		var links = [];		
		
		this.links.forEach(function(link){
			if (link.connectedTo(node, secondaryNode)){
				links.push(link);
			}
		});
		
		return links;
	},

	/**
	 * Remove a link from the graph
	 *
	 * @param {networkMap.Link} The link to remove
	 * @ retrun {networkMap.Graph} self
	 */
	removeLink: function(link){
		this.links.erase(link);
		link.setGraph(null);
		return this;
	},

	/**
	 * Signal links to call the datasource to refresh.
	 *
	 * @ retrun {networkMap.Graph} self
	 */
	refresh: function(){
		console.log("refresh is depricated, use update instead");

		return this.update();
	},

	registerUpdateEvent: function(datasource, url, link, callback){
		this.$updateQ = this.$updateQ || {}; 
		this.$updateQ[datasource] = this.$updateQ[datasource] || {};
		this.$updateQ[datasource][url] = this.$updateQ[datasource][url] || [];

		// register datasources for internal use in the link
		this.$updateQ[datasource][url].push({
			link: link,
			callback: callback
		});
	},

	/**
	 * Refresh links in batch mode. This method does not work
	 * at the moment.
	 */
	update: function(){
		if (this.properties.get('batchUpdate'))
			return this.batchUpdate();		
		
		this.links.forEach(function(link){
			link.localUpdate();
		});

		return this;
	},
	
	batchUpdate: function(){
		this.$updateQ = this.$updateQ || {};
		networkMap.each(this.$updateQ, function(urls, datasource){
			if (!networkMap.datasource[datasource]){
				throw 'Unknown datasource (' + datasource + ')';
			}
			
			networkMap.each(urls, function(requests, url){
				networkMap.datasource[datasource](url, requests);
			}.bind(this));
		}.bind(this));
		
		return this;
	},
	
	


});;networkMap.Graph.Module = networkMap.Graph.Module || {};

networkMap.Graph.Module.Settings = function(nodeProperties, linkProperties, graphProperties){
	this.nodeProperties = nodeProperties;
	this.linkProperties = linkProperties;
	this.graphProperties = graphProperties;
};

// types: angle, bool, float, int, number, length, list, string, color
// https://api.tinkercad.com/libraries/1vxKXGNaLtr/0/docs/topic/Shape+Generator+Overview.html
networkMap.extend(networkMap.Graph.Module.Settings, {
	toElement: function(nodeProperties, linkProperties, graphProperties){
		nodeProperties = nodeProperties || this.nodeProperties;
		linkProperties = linkProperties || this.linkProperties;
		graphProperties = graphProperties || this.graphProperties;		
		
		var container = new networkMap.widget.Accordion();
		
		var nodeConfiguration = new networkMap.Node.Module.Settings(nodeProperties, {
			onlyGlobals: true,
			header: 'Node Defaults',
			container: container
		});
		
		var linkConfiguration = new networkMap.Link.Module.Settings(linkProperties, {
			onlyGlobals: true,
			header: 'Link Defaults',
			container: container
		});		
		
		var accordionGroup;

		var changeHandler = function(defaults, key){
			return function(e, widget){
				defaults.set(key, widget.value());
			}.bind(this);
		}.bind(this);
	
		accordionGroup = container.add('Globals');
		accordionGroup.appendChild(new networkMap.widget.GridInput('Grid', {
			enabled: graphProperties.get('gridEnabled'),
			grid: graphProperties.get('grid')
		}).addEvent('change', function(e){
				graphProperties.set({'grid': e.value.grid, 'gridEnabled': e.value.enabled});	
		}.bind(this)));
		
		accordionGroup = container.add('Utilization Labels');
		var utilizationLabels = graphProperties.get('utilizationLabels');
		accordionGroup.appendChild(new networkMap.widget.Checkbox('Enabled', utilizationLabels.enabled)
			.addEvent('change', function(e){
				utilizationLabels.enabled = e.value;
				graphProperties.set('utilizationLabels', utilizationLabels);	
			}.bind(this)));
			
		accordionGroup.appendChild(new networkMap.widget.IntegerInput('Padding', utilizationLabels.padding)
			.addEvent('change', function(e){
				utilizationLabels.padding = e.value;
				graphProperties.set('utilizationLabels', utilizationLabels);	
			}.bind(this)));
			
		accordionGroup.appendChild(new networkMap.widget.IntegerInput('Font size', utilizationLabels.fontSize)
			.addEvent('change', function(e){
				utilizationLabels.fontSize = e.value;
				graphProperties.set('utilizationLabels', utilizationLabels);	
			}.bind(this)));
				
		
		nodeConfiguration.toElement();
		linkConfiguration.toElement();
				
		this.el = container;
		
		return container;
	}
});;networkMap.Node = function(options){

	this.graph = options.graph;
	delete options.graph;

	this.properties = new networkMap.Properties(options, networkMap.Node.defaults);

	this.configurationWidget = new networkMap.Node.Module.Settings();

	/** TODO: Replace inline function with this.refresh */
	this.properties.addEvent('change', function(change){
		this.options = this.properties.configuration();

		// TODO: Remove hack for stoping redraw of node when dragged
		// TODO: Prevent click event after drag.
		if (change.length >= 1 && (change[0].key === 'x' || change[0].key === 'y'))
			return;

		this.draw();
	}.bind(this));

	this.options = this.properties.configuration();

	if (!this.options.id){
		throw "Node(create, no id given)";
	}
	
	this.options.x = parseFloat(this.options.x);
	this.options.y = parseFloat(this.options.y);
	this.options.padding = parseFloat(this.options.padding); 

	this.setGraph(this.graph);

};

networkMap.extend(networkMap.Node, networkMap.Options);
networkMap.extend(networkMap.Node, networkMap.Observable);
networkMap.extend(networkMap.Node, {
	
	
	_mode: 'normal',
	exportedOptions: [
		'id',
		'name',
		'comment',
		'x',
		'y',
		'lat',
		'lng',
		'weight',
		'renderer',
		'information',
		'label',
		'padding',
		'href',
		'style',
		'events',
		'fontFamily',
		'fontSize',
		'bgColor',
		'strokeColor',
		'strokeWidth' 
	],
	

	

	/**
	 * Update an option
	 *
	 * @param {string} The property to change
	 * @param {mixed} The value to set
	 * @this {networkMap.Node}
	 * @return {networkMap.Node} self
	 */
	setProperty: function(key, value){
		if (!this.editTemplate[key]){
			throw 'Unknow id: ' + key;
		}
		
		this.properties.set(key, value);
		this.options = this.properties.configuration();
				
		return this;
	},

	/**
	 * Ǵet a property value
	 *
	 * @param {string} The property to get
	 * @this {networkMap.Node}
	 * @return {mixed} The property value
	 */
	getProperty: function(key){
		
		return this.properties.get(key, true).value;
		//return this._localConfig[key];
	},

	/**
	 * Genereats a configuration object
	 *
	 * @this {networkMap.Node}
	 * @return {Object} The node configuration
	 */
	getConfiguration: function(){
		return this.properties.extract();
	},

	
	/**
	 * Enable an event on the node
	 *
	 * @param {string} The type of event [hover|click]
	 * @this {options} The options for event
	 * @return {networkMap.Node} self
	 */
	enableEvent: function(name, options){
		if (name !== 'hover' && name !== 'click'){
			throw "Unknown event";
		}
		
		this.options.events = this.options.events || {};		
		this._localConfig.events = this._localConfig.events || {};
		
		var defaultOptions = {enabled: true};
		this.options.events[name] = options || defaultOptions;
		this._localConfig.events[name] = options || defaultOptions;

		return this;
	},
	
	/**
	 * Disable an event on the node
	 *
	 * @param {string} The type of event [hover|click]
	 * @return {networkMap.Node} self
	 */
	disableEvent: function(name, options){
		if (this.options.events && this.options.events[name]){
			delete this.options.events[name];
			delete this._localConfig.events[name];
		}
		
		return this;
	},
	
	/**
	 * Set the graph that the Node is associated to. 
	 * If set to null the Node will unregister from the 
	 * graph.
	 *
	 * @param {networkMap.Graph} The graph
	 * @this {networkMap.Node}
	 * @return {networkMap.Node} self
	 */
	setGraph: function(graph){

		// remove the current graph if it excists		
		if (this.graph){
			this.graph.removeEvent('redraw', this._redraw.bind(this));
			this.graph = null;
			this.draw();
		}

		// add graph object if it exists
		if (graph){
			this.graph = graph;
			this.properties.setDefaults(graph.getDefaults('node'));
			// TODO: Rework
			this.options = this.properties.configuration();
			this.graph.addEvent('redraw', this._redraw.bind(this));
			this.draw();
		}

		return this;
	},
	
	/* TODO: Depricate function */
	_redraw: function(){
		this.draw();
	},

	/**
	 * Get/set the mode of the node. The mode can either
	 * be "normal" or "edit". In "edit" mode the nodes 
	 * clickHandler will not forward click events to
	 * click events registed with networkMap.registerEvent
	 *
	 * @param {string} The mode or undefined to get the mode
	 * @this {networkMap.Node}
	 * @return {networkMap.Node|String} Returns either the mode or 
	 * self
	 */
	mode: function(mode){
		if (!mode){
			return this._mode;
		}
		
		if (mode === 'edit' || mode === 'normal'){
			this._mode = mode;
		}
		else{
			throw 'Unknown mode: ' + mode;	
		}
		
		return this;
	},

	/**
	 * The clickHandler is an internal function which forwards
	 * click events to either the registed click event or to the 
	 * settingsManager.
	 *
	 * @param {Event} The click event
	 * @this {networkMap.Node}
	 * @return {undefined}
	 */
	_clickhandler: function(e){
		if (e.target.instance.data('dragged')){
			e.preventDefault();
			return;
		}
		
		if (this._mode === 'normal' && this.options.events && this.options.events.click){
			networkMap.events.click(e, this);
		}
		else if (this._mode === 'edit'){
			e.preventDefault();
			
			
			if (this.svg.dragged)
				return;
			
			this.graph.publish('edit', [new networkMap.event.Configuration({
				deletable: true,
				destroy: function(){ 
					this.graph.removeNode(this); 
				}.bind(this),
				editable: true,
				editWidget: this.configurationWidget.toElement(this.properties),
				target: this,
				type: 'node',
				targetName: this.properties.get('name')
			})]);
		}
	},	

	/**
	 * Get the x coordinate of the node
	 *
	 * @this {networkMap.Node}
	 * @return {number} The x coordinate of the node
	 */
	x: function(){
		return this.svg.bbox().x;
	},
	
	/**
	 * Get the y coordinate of the node
	 *
	 * @this {networkMap.Node}
	 * @return {number} The y coordinate of the node
	 */
	y: function(){
		return this.svg.bbox().y;
	},

	/**
	 * Make the node draggable
	 *
	 * @this {networkMap.Node}
	 * @return {networkMap.Node} self
	 */
	draggable: function(){
		this._draggable = true;
		//this.svg.draggable({grid: this.graph.grid()});
		
		var grid = this.graph.grid();
		var dragLimit = 5;
		this.svg.draggable(function(x, y, element, delta){
			if (!element.dragged && (Math.abs(delta.x) <  dragLimit && Math.abs(delta.y) < dragLimit)){
				return false;
			}
			
			if (grid)
				return {
					x: x - x % grid.x,
					y: y - y % grid.y
				};
			else
				return true;
		});
		this.svg.remember('cursor', this.svg.style('cursor'));
		this.svg.style('cursor', 'move');
		
		return this;
	},	

	/**
	 * Make the node fixed, i.e. ńot draggable.
	 *
	 * @this {networkMap.Node}
	 * @return {networkMap.Node} self
	 */
	fixed: function(){
		this._draggable = false;
		this.svg.fixed();
		var cursor = this.svg.remember('cursor');
		this.svg.forget('cursor');
		this.svg.style('cursor', cursor || 'default');
		
		return this;
	},

	/**
	 * Returns true if the node is draggable
	 * false otherwise.
	 *
	 * @this {networkMap.Node}
	 * @return {boolean} The draggable status
	 */
	isDraggable: function(){
		return this._draggable;
	},

	/**
	 * This will create/update a link tag for the
	 * node. Order of presence is:
	 * - options.href
	 * - emit url event
	 *
	 * @this {networkMap.Node}
	 * @return {networkMap.Node} self
	 */
	updateLink: function(){
		var href = this.options.href;
		if (href){
			if (networkMap.isFunction(href))
				this.setLink(href(this));
			else
				this.setLink(href);
			return this;
		}
		
		this.fireEvent('requestHref', [this]);
		return this;
	},
	
	/**
	 * This will create/update the link to
	 * the specified URL.
	 *
	 * @param {string} The URL
	 * @this {networkMap.Node}
	 * @return {networkMap.Node} self
	 * @TODO: Add functionality to remove the link
	 */
	setLink: function(url){
		if (url){
			if (this.link){
				this.link.to(url);
				return this;
			}
			
			// We take the parent object to get the link
			this.link = this.svg.linkTo(url).parent;
			return this;
		}
		
		return this;						
	},

	/**
	 * Get the bonding box of the node.
	 *
	 * @this {networkMap.Node}
	 * @return {SVG.BBox} The nodes bounding box
	 */
	bbox: function(){
		return this.svg.bbox();
	},

	/**
	 * Draw/redraw the node
	 *
	 * @this {networkMap.Node}
	 * @return {networkMap.Node} self
	 */
	draw: function(){
		var redraw = false;
		
		if (this.svg){
			this.svg.remove();
			if (this.link) this.link.remove();
		
			if (!this.graph)
				return false;			
			
			redraw = true;
		}
		
		if (!this.graph){
			return false;
		}
		
		if (this.debug){
			this.debug.remove();
		}
		
		if (this.options.debug){
			this.debug = this.graph.getPaintArea().group();
		}

		// create a group object 
		var svg = this.svg = this.graph.getPaintArea().group();
		
				
		this.updateLink();

		// create the label first to get size
		var label = svg.text(this.options.name)
			.font({
				family:   this.options.fontFamily,
				size:     this.options.fontSize,
				anchor:   'start',
				leading:  this.options.fontSize - 1
			})
			.move(parseFloat(this.options.padding), parseFloat(this.options.padding));

		
		// This is needed to center an scale the comment text
		// as it is not possible to get a bbox on a tspan
		var bboxLabel = label.bbox();
		var comment;
		if (this.options.comment && this.options.comment !== ''){
			label.text(function(add){
				add.tspan(this.options.name).newLine();
				comment = add.tspan(this.options.comment).newLine().attr('font-size', this.options.fontSize - 2);
			}.bind(this));
			comment.attr('text-anchor', 'middle');
			comment.dx(bboxLabel.width / 2);
		}	
		while (bboxLabel.width < label.bbox().width){
			comment.attr('font-size', comment.attr('font-size') - 1);
		}

		// create the rect
		bboxLabel = label.bbox();		
		var rect = svg.rect(1,1)
			.fill({ color: this.options.bgColor})
			.stroke({ color: this.options.strokeColor, width: this.options.strokeWidth })
			.attr({ 
				rx: 4,
				ry: 4
			})
			.size(
				bboxLabel.width + this.options.padding * 2, 
				bboxLabel.height + this.options.padding * 2
			);
							
		label.front();
		

		
		svg.on('click', this._clickhandler.bind(this));
		
		if (this.options.events){
			svg.link = this.options.events;
			
			if (this.options.events.click){
				svg.attr('cursor', 'pointer');
			}	
			
		}

		// this cover is here there to prevent user from selecting 
		// text in the label
		var cover = rect.clone().fill({opacity: 0}).front();

		// move it in place
		svg.move(parseFloat(this.options.x), parseFloat(this.options.y));
		
	
		
		if (this.options.draggable){
			this.draggable();
		}
		
		svg.dragstart = function(){
			this.fireEvent('dragstart');
		}.bind(this);
		svg.dragmove = function(delta, event){
			this.fireEvent('drag', [delta, event]);
		}.bind(this);
		svg.dragend = function(){
			this.properties.set({
				x: this.x(),
				y: this.y()
			});
			this.fireEvent('dragend');
		}.bind(this);
		
		// need to make sure the draggable state persists
		if (this.isDraggable()){
			this.draggable();
		}

		this.fireEvent('dragend');

		return true;
	}
});

networkMap.Node.defaultTemplate = {
	padding: {
		label: 'Padding',
		type: 'number',
		min: 0
	},
	fontSize: {
		label: 'Font size',
		type: 'number',
		min: 1
	},
	bgColor: {
		label: 'Color',
		type: 'color'
	},
	strokeColor: {
		label: 'Stroke color',
		type: 'color'
	},
	strokeWidth: {
		label: 'Stroke width',
		type: 'number',
		min: 0
	}
};

/**
 * Register a global handler to provide a href to Nodes
 * This can be overridden on the networkMap instance or
 * or setting it directly on the node.
 * 
 * The registered function should return a url string 
 * or null if no link should be created. See implementation
 * of networkMap.Node._linkGenerator for a reference 
 * implementation
 *
 * @param {function} A function that returns an URL or null
 */
networkMap.Node.registerLinkGenerator = function(f){
	networkMap.Node._linkGenerator = networkMap.Node.createLinkGenerator(f);
};

networkMap.Node.createLinkGenerator = function(f){
	return function(node){
		var href = node.properties.get('href');
		if (href){
			if (networkMap.isFunction(href))
				node.setLink(href());
			else
				node.setLink(href);
			return;
		}
		
		node.setLink(f(node));
	};
};


/** Register a default link generator which will not create a link */
networkMap.Node.registerLinkGenerator(function(node){return null;});


/** Register defaults properties for networkMap.Node */
networkMap.Node.defaults = new networkMap.Properties({
	name: null,
	comment: null,
	x: 10,
	y: 10,
	lat: null,
	lng: null,
	weight: null,
	fontFamily: 'Helvetica',
	fontSize: 16,
	bgColor: '#dddddd',
	strokeColor: '#000000',
	strokeWidth: 2,
	information: {

	},
	data:{
		value: null,
		realValue: null
	},
	label: {
		position: 'internal',
		visable: true
	},
	renderer: 'rect', //rect, circle, image(url), svg(ulr)
	padding: 10,
	href: null,
	style: null,
	debug: false,
	draggable: false
});


;networkMap.Node.Module = networkMap.Node.Module || {};

networkMap.Node.Module.Settings = function(properties, options){
	this.options = {
		onlyGlobals: false,
		header: 'Globals',
		container: null
	};	
	this.setOptions(options);
	
	this.properties = properties;
};

networkMap.extend(networkMap.Node.Module.Settings, networkMap.Options);

// types: angle, bool, float, int, number, length, list, string, color
// https://api.tinkercad.com/libraries/1vxKXGNaLtr/0/docs/topic/Shape+Generator+Overview.html
networkMap.extend(networkMap.Node.Module.Settings, {

	/** Definitions of the parameters */
	parameters: {
		id: {
			label: 'ID',
			type: 'text',
			disabled: true,
			global: false
		},
		name: {
			label: 'Name',
			type: 'text',
			global: false
		},
		comment: {
			label: 'Comment',
			type: 'text',
			global: false
		},
		padding: {
			label: 'Padding',
			type: 'number',
			min: 0,
			global: true
		},
		fontSize: {
			label: 'Font size',
			type: 'number',
			min: 1,
			global: true
		},
		bgColor: {
			label: 'Color',
			type: 'color',
			global: true
		},
		strokeColor: {
			label: 'Stroke color',
			type: 'color',
			global: true
		},
		strokeWidth: {
			label: 'Stroke width',
			type: 'number',
			min: 0,
			global: true
		}
		
	},

	/**
	 * Generates HTML that is used for configuration
	 *
	 * @this {networkMap.Node}
	 * @return {Element} A HTML Element that contains the UI
	 */
	toElement: function(properties){
		properties = properties || this.properties;
		
		var container = this.options.container || new networkMap.widget.Accordion();
		var accordionGroup;

		var changeHandler = function(key, properties){
			return function(e, widget){
				properties.set(key, widget.value());	
			};
		};
	
		accordionGroup = container.add(this.options.header);		
		networkMap.each(this.parameters, function(option, key){
			if (this.options.onlyGlobals && !option.global)
				return;
				
			if (option.type === 'number'){
				accordionGroup.appendChild(new networkMap.widget.IntegerInput(option.label, properties.get(key), option).addEvent('change', changeHandler(key, properties)));
			}
			else if(option.type === 'text'){
				accordionGroup.appendChild(new networkMap.widget.TextInput(option.label, properties.get(key), option).addEvent('change', changeHandler(key, properties)));
			}
			else if (option.type === 'color'){
				accordionGroup.appendChild(new networkMap.widget.ColorInput(option.label, properties.get(key), option).addEvent('change', changeHandler(key, properties)));	
			}
		}.bind(this));
		
		return container;
	}
});;/**
 * Register global event handlers. These can be over ridden on the 
 * networkMap instance and on the node instance.
 *
 * @param {string} The event name (click, mouseover, mouseout, hover)
 * @param {function} The value to set
 * @this {???}
 * @return {???}
 */
networkMap.Node.registerEvent = function(name, f){
	if (name === 'hover'){
		return this.registerHover(f);
	}

	if (!networkMap._events[name])
		throw "Invalid event: " + name;
		
	networkMap._events[name] = f;
};

networkMap.Node.registerEvent.registerHover = function(f){
	
	/** default mouseover event
	 * By overriding this function the hover 
	 * will stop working event 
	 */
	var mouseover = function(e, options, hover){
		var el = document.id('nm-active-hover');
		var id = e.target.instance.attr('id');
		
		if (el){
			if (el.retrieve('id') === e.target.instance.attr('id')){
				el.store('keep', true);
				return;
			}
			
			el.destroy();	
		}
		
		el = new Element('div', {
			'id': 'nm-active-hover',
			'class': 'nm-hover',
			events: {
				mouseover: function(){
					el.store('mouseover', true);
				},
				mouseout: function(){
					el.eliminate('mouseover');
					(function(){
						if (!el.retrieve('keep'))
							el.destroy();
						else
							el.eliminate('keep');
					}).delay(10);
				},
				click: function(ev){
					node._clickHandler(e);
				}
			}
		})
		.store('id', e.target.instance.attr('id'));
		
		el.setStyles({
			top: -1000,
			left: -1000	
		});
				
		document.id(document.body).grab(el);
					
		f(e, node, el);
		
		var size = el.getSize();
		var bboxClient = e.target.getBoundingClientRect();
		
		el.setStyles({
			top: (bboxClient.top + bboxClient.bottom)/2 - size.y/2,
			left: (bboxClient.left + bboxClient.right)/2 - size.x/2
		});
	};
	
	/** default mouseout event
	 * By overriding this function the hover 
	 * will stop working event 
	 */
	var mouseout = function(e, node){
		var options = e.target.instance.node;
		(function(){
			var el = document.id('nm-active-hover');
			if (el && el.retrieve('id') !== e.target.instance.attr('id')){
				return;	
			}

			if (el && !el.retrieve('mouseover')){
				el.destroy();
			}
		}).delay(10);
	};
	
	networkMap.Node.registerEvent('mouseover', mouseover);
	networkMap.Node.registerEvent('mouseout', mouseout);
};


/** Default implementaion of events */
networkMap.Node._events = {
	/** default click event */
	click: function(e, node){},
	
	mouseover: function(e, options, hover){},	

	mouseout: function(e, node){},	
	
	/** default hover event */
	hover: function(e, node, el){
		el.set('text', node.options.name);
	}
};

;
networkMap.LinkPath = function(subLink, svg, options){
	this.properties = new networkMap.Properties(options, subLink.properties);
	this.properties.addEvent('change', function(change){
		this.fireEvent('change', change);
	}.bind(this));

	this.subLink = subLink;
	this.mediator = this.getLink().graph;
	this.svg = svg;
	this.value = null;
	
	// Hide the SVG node in case we will not use it
	// otherwise it will affect the BBOX calculation
	svg.hide();
	this.setupEvents();
};

networkMap.extend(networkMap.LinkPath, networkMap.Options);
networkMap.extend(networkMap.LinkPath, networkMap.Observable);
networkMap.extend(networkMap.LinkPath, {	
	purge: function(){
		return this;
	},

	hide: function(){
		this.svg.hide();
		
		return this;
	},
	
	show: function(){
		this.svg.show();
		
		return this;
	},

	remove: function(){
		this.svg.remove();
	},
	
	getEditables: function(){
		var editables = {
			width: {
				label: 'Local width',
				type: 'int'	
			}	
		};
		
		return editables;		
	},


	/**
	 * This will create/update a link tag for the
	 * link. Order of presence is:
	 * - options.href
	 * - emit url event
	 *
	 * @this {networkMap.Link}
	 * @return {networkMap.Link} self
	 */
	updateHyperlink: function(){
		var href = this.properties.get('href');
		if (href){
			if (networkMap.isFunction(href))
				this.setLink(href(this));
			else
				this.setLink(href);
			return this;
		}
		
		this.fireEvent('requestHref', [this]);
		return this;
	},

	updateBgColor: function(color){
		if (!color){
			this.svg.fill(this.options.background);
			return this;
		}
		
		this.svg.fill(color);
		return this;
	},

	/**
	 * This will create/update the link to
	 * the specified URL.
	 *
	 * @param {string} The URL
	 * @this {networkMap.Link}
	 * @return {networkMap.Link} self
	 * @TODO: Add functionality to remove the link
	 */
	setLink: function(url){
		if (url){
			if (this.a){
				this.a.to(url);
				return this;
			}

			if (this.svg.parent){
				this.a = this.svg.linkTo(url);
			}
			
			return this;
		}
		
		return this;						
	},	
	
	isDrawable: function(){
		return this.properties.get('requestData') !== undefined && this.properties.get('requestUrl') !== undefined;
	},
	
	getCenter: function(){
		var bbox = this.svg.bbox();
			
		return {
			cx: bbox.x + bbox.height / 2,
			cy: bbox.y + bbox.width / 2
		};	
	},
	
	
	getSubLink: function(){
		return this.subLink;
	},
	
	getLink: function(){
		return this.getSubLink().getLink();
	},
	/**
	 * Get the node which is assosiated to the linkPath
	 *
	 * @retrun {networkMap.Node} The node which this is assosiated with.
	 */
	getNode: function(){
		return this.getSubLink().getNode();
	},
	
	getSibling: function(){
		return undefined;
	},	
	
	getSettingsWidget: function(){
		return this.getLink().getSettingsWidget();
	},
	
	getUtilization: function(){
		return this.value;
	},
	
	getProperty: function(key){
		return this.properties.get(key);
		/* TODO: Remove
		if (key == 'width'){
			var link = this.getMainPath();
			if (link != this){
				return link.getProperty(key);
			}
			else if (!this.options[key]){
				return this.link.options[key];
			}
		}
		
		if (!this.options[key]){
			return null;
		}
		
		return this.options[key];
		*/
	},
	
	setProperty: function(key, value){
		if (key == 'width'){
			var link = this.getMainPath();
			if (link != this){
				return link.setProperty(key, value);
			}
		}
				
		this.properties.set(key, value);
		//TODO: Remove
		//this.options[key] = value;
		this.fireEvent('change', [key]);
		return this;
	},
	
	getConfiguration: function(){
		return this.properties.extract();
	},
		
	
	getMainPath: function(){
		var link;
		
		if (this.link.subpath.nodeA){
			this.link.subpath.nodeA.forEach(function(sublink){
				if (this == sublink){
					link = this.link.path.nodeA;
				}
			}.bind(this));
			
			if (link){
				return link;
			}		
		}
		
		if (this.link.subpath.nodeB){
			this.link.subpath.nodeB.forEach(function(sublink){
				if (this == sublink){
					link = this.link.path.nodeB;
				}
			}.bind(this));
			
			if (link){
				return link;
			}		
		}
		
		return this;
		
	},
	
	setupEvents: function(){
		this.svg.on('click', this._clickHandler.bind(this));
		
		if (this.properties.get('events')){
			if (this.properties.get('events.click')){
				this.svg.attr('cursor', 'pointer');
			}

			if (this.properties.get('events.hover')){
				this.svg.on('mouseover', this._hoverHandler.bind(this));
				this.svg.on('mouseout', this._hoverHandler.bind(this));
			}
		}
		
		// Check if we should setup an update event
		if (this.properties.get('requestUrl')) {
			this.getLink().registerUpdateEvent(
				this.getLink().properties.get('datasource'),
				this.properties.get('requestUrl'),
				this,
				function(response){
					// Refactor
					this.value = response.value;
					this.updateBgColor(this.getLink().colormap.translate(response.value));
					
					// update utilization label
					this.getSubLink().setUtilizationLabel();
				}.bind(this)
			);
		}
	},
	
	
	
	_clickHandler: function(e){
		// TODO: Move this logic to the link by sending an event 
		if (this.getLink().mode() === 'normal' && this.properties.get('events.click')){
			networkMap.events.click(e, this);
		}
		else if (this.getLink().mode() === 'edit'){
			e.preventDefault();
			
			// TODO: This is temporary code to test a feature
			this.getLink().drawEdgeHandles();
			
			this.mediator.publish('edit', [new networkMap.event.Configuration({
				deletable: true,
				destroy: function(){
					// TODO: Refacor with an event
					this.getLink().graph.removeLink(this.getLink()); 
				}.bind(this),
				cancel: function(){
					this.getLink().hideEdgeHandles();
				}.bind(this),
				editable: true,
				editWidget: this.getLink().configurationWidget.toElement(this.getLink(), this.getLink().properties),
				target: this,
				type: 'link',
				targetName: this.properties.get('name')
			})]);
		}
	},
	
	_hoverHandler: function(e){
		if (this.getLink().mode() === 'edit'){
			return;
		}
		
		if (e.type === 'mouseover'){
			networkMap.events.mouseover(e, this);
		}
		if (e.type === 'mouseout'){
			networkMap.events.mouseout(e, this);
		}
	}
	
});

networkMap.PrimaryLink = function(link, svg, options){
	networkMap.LinkPath.call(this, link, svg, options);	
};

networkMap.PrimaryLink.prototype = Object.create(networkMap.LinkPath.prototype);
networkMap.PrimaryLink.constructor = networkMap.PrimaryLink;

networkMap.extend(networkMap.PrimaryLink, {
	getSibling: function(){
		return this.getSubLink().getSibling(this);
	},
	
	draw: function(pathPoints, width, arrowHeadLength, memberLinkCount){
		if (!this.isDrawable())
			return this;		
		
		if (memberLinkCount === 0){
			return this.drawFullPath(pathPoints, width, arrowHeadLength, memberLinkCount);	
		}
		
		if (memberLinkCount > 0){
			return this.drawShortPath(pathPoints, width, arrowHeadLength, memberLinkCount);		
		}
		
		throw "Invalid member link count";
	},	
	
	drawFullPath: function(pathPoints, width, arrowHeadLength, memberLinkCount){
		this.svg.show();
		memberLinkCount = memberLinkCount || 1;

		var firstSegment = new SVG.math.Line(pathPoints[0], pathPoints[2]);
		var midSegment = new SVG.math.Line(pathPoints[2], pathPoints[3]);

		// perpendicular line with last point in firstList
		var helpLine1 = firstSegment.perpendicularLine(pathPoints[1], memberLinkCount * width);
		var helpLine2 = firstSegment.perpendicularLine(pathPoints[2], memberLinkCount * width);
		var helpLine3 = midSegment.perpendicularLine(pathPoints[2], memberLinkCount * width);
		
		var midPoint = midSegment.midPoint();
		var helpPoint1 = midSegment.move(midPoint, midSegment.p1, arrowHeadLength);
		var helpPoint2 = midSegment.move(midPoint, midSegment.p2, arrowHeadLength);
		
		var helpLine4 = midSegment.perpendicularLine(helpPoint1, memberLinkCount * width);

		// find intersection point 1
		var helpLine5 = new SVG.math.Line(helpLine1.p1, helpLine2.p1);
		var helpLine6 = new SVG.math.Line(helpLine3.p1, helpLine4.p1);
		var intersectPoint1 = helpLine6.intersection(helpLine5);

		if (intersectPoint1.parallel === true){
			intersectPoint1 = helpLine1.p1;
		}

		// find intersection point 2
		helpLine5 = new SVG.math.Line(helpLine1.p2, helpLine2.p2);
		helpLine6 = new SVG.math.Line(helpLine3.p2, helpLine4.p2);
		var intersectPoint2 = helpLine6.intersection(helpLine5);

		if (intersectPoint2.parallel === true){
			intersectPoint2 = helpLine1.p2;
		}
		
		this.svg.clear();
		
		this.svg
			.M(pathPoints[0])
			.L(helpLine1.p1).L(intersectPoint1).L(helpLine4.p1)
			.L(midPoint)
			.L(helpLine4.p2).L(intersectPoint2).L(helpLine1.p2)
			.Z().front();
		
		return this;
	},

	drawShortPath: function(pathPoints, width, arrowHeadLength, memberLinkCount){		
		this.svg.show();
		var midSegment = new SVG.math.Line(pathPoints[2], pathPoints[3]);
		
		var midPoint = midSegment.midPoint();
		var helpPoint1 = midSegment.move(midPoint, midSegment.p1, arrowHeadLength);
		
		var helpLine4 = midSegment.perpendicularLine(helpPoint1, memberLinkCount * width / 2);
		
		var startPoint = new SVG.math.Line(pathPoints[2], midPoint).midPoint();
		var helpLine7 = midSegment.perpendicularLine(
			startPoint, 
			memberLinkCount * width / 2
		);

		this.svg.clear();
		
		this.svg
			.M(startPoint)
			.L(helpLine7.p1).L(helpLine4.p1)
			.L(midPoint)
			.L(helpLine4.p2).L(helpLine7.p2)
			.Z().front();
			
		return this;
	}

});









networkMap.MemberLink = function(link, svg, options){
	networkMap.LinkPath.call(this, link, svg, options);
};

networkMap.MemberLink.prototype = Object.create(networkMap.LinkPath.prototype);
networkMap.MemberLink.constructor = networkMap.MemberLink;

networkMap.extend(networkMap.MemberLink, {
	getSibling: function(){	
		return this.getSubLink().getSibling(this);		
	},
	
	draw: function(pathPoints, width, arrowHeadLength, memberLinkCount, position){
		return this.drawSublink(pathPoints, width, arrowHeadLength, memberLinkCount, position);
	},
	
	drawSublink: function(pathPoints, width, arrowHeadLength, memberLinkCount, position){
		this.svg.show();
		
		// This is needed to draw one side of the links in reverse order
		var sign = (SVG.math.angle(pathPoints[0], pathPoints[1]) < Math.PI) ? 1 : -1;
		
		var offset = -memberLinkCount / 2 + position;
		
		var path = [
			pathPoints[0],
			pathPoints[1],
			pathPoints[2],
			new SVG.math.Line(pathPoints[2], pathPoints[3]).midPoint()
		];


		var lastSegment = this.calculateSublinkPath(path, width, arrowHeadLength, memberLinkCount, sign * offset);		
		var currentSegment = this.calculateSublinkPath(path, width, arrowHeadLength, memberLinkCount, sign * (offset + 1));

		var startPoint = pathPoints[0];
			
		this.svg.clear();

		// Special case when we are ploting a odd number
		// of sublinks. We must add the middlepoint manually
		if (offset === -0.5){
			this.svg
				.M(startPoint)
				.L(lastSegment[0]).L(lastSegment[1]).L(lastSegment[2])
				.L(path[path.length - 1])
				.L(currentSegment[2]).L(currentSegment[1]).L(currentSegment[0])
				.Z().back();
		}
		else{
			this.svg
				.M(startPoint)
				.L(lastSegment[0]).L(lastSegment[1]).L(lastSegment[2])
				.L(currentSegment[2]).L(currentSegment[1]).L(currentSegment[0])
				.Z().back();
		}

		return this;
	},
	
	calculateSublinkPath: function(path, width, arrowHeadLength, memberLinkCount, offset){
		
		var angle = Math.atan2(arrowHeadLength, Math.abs(width * memberLinkCount / 2));
		var localArrowHeadLength = Math.abs(width * offset * Math.tan(angle)); 

		var firstSegment = new SVG.math.Line(path[0], path[2]);
		var midSegment = new SVG.math.Line(path[2], path[3]);

		// perpendicular line with last point in firstList
		var helpLine1 = firstSegment.perpendicularLine(path[1], width * offset);
		var helpLine2 = firstSegment.perpendicularLine(path[2], width * offset);
		var helpLine3 = midSegment.perpendicularLine(path[2], width * offset);

		// find the arrowhead distance
		var arrowHeadInset = midSegment.move(midSegment.p2, midSegment.p1, localArrowHeadLength);
		var arrowHeadStart = midSegment.perpendicularLine(arrowHeadInset, width * offset);

		// find intersection point 1
		var helpLine5 = new SVG.math.Line(helpLine1.p1, helpLine2.p1);
		var helpLine6 = new SVG.math.Line(helpLine3.p1, arrowHeadStart.p1);
		var intersectPoint1 = helpLine6.intersection(helpLine5);

		if (intersectPoint1.parallel === true){
			intersectPoint1 = helpLine1.p1;
		}

		return [
			helpLine1.round(2).p1,
			intersectPoint1.round(2),
			arrowHeadStart.round(2).p1
		];
	}
});
;networkMap.SubLink = function(link, node, edge, svg, options){
	this.link = link;
	this.node = node;
	this.edge = edge;
	this.svg = svg;

	this.primaryLink = null;
	this.memberLinks = [];
	this.utilizationLabelsConfiguration = null;
	this.utilizationLabel = null;
	this.pathPoints = null;
	
	this.initializeUtilizationLabel();
};


networkMap.extend(networkMap.SubLink, networkMap.Options);
networkMap.extend(networkMap.SubLink, networkMap.Observable);

networkMap.extend(networkMap.SubLink, {
	purge: function(){
		this.link = null;
		this.node = null;
		this.svg = null;
		
		this.primaryLink.purge();
		
		for (var i = 0, len = this.memberLinks.length; i < len; i++){
			this.memberLinks[i].purge();
		}
		this.memberLinks.lenght = 0;
		
		this.utilizationLabelsConfiguration = null;
		this.utilizationLabel = null;
		this.pathPoints = null;
	},	
	
	load: function(options){
		if (options.sublinks){
			this.loadMemberLinks(options.sublinks);	
		}
		
		this.loadPrimaryLink(options);
		
		return this;
	},
	
	loadPrimaryLink: function(options){
		this.primaryLink = new networkMap.PrimaryLink(
			this,
			networkMap.path(this.svg),
			options
		)
		.addEvent('change', function(){
			this.fireEvent('redraw');
		}.bind(this))
		.addEvent('requestHref', function(sublink){
			this.fireEvent('requestHref', [sublink]);
		}.bind(this));
		
		return this;
	},
	
	loadMemberLinks: function(memberLinks){
		for (var i = 0, len = memberLinks.length; i < len; i++){
			this.loadMemberLink(memberLinks[i]);
		}
		
		return this;		
	},
		
	loadMemberLink: function(memberLink){
		this.memberLinks.push(
			new networkMap.MemberLink(
				this, 
				networkMap.path(this.svg), 
				memberLink
			)
			.addEvent('change', this.redraw.bind(this))
			.addEvent('requestHref', function(sublink){
				this.fireEvent('requestHref', [sublink]);
			}.bind(this))
		);
		
		return this;
	},

	getConfiguration: function(){
		var configuration = this.primaryLink.getConfiguration();
		configuration.sublinks = [];		
		
		for (var i = 0, len = this.memberLinks.length; i < len; i++){
			configuration.sublinks.push(this.memberLinks[i].getConfiguration());
		}

		if (configuration.sublinks.length === 0)
			delete configuration.sublinks;		
		
		configuration.edge = this.edge.getConfiguration();
		
		return configuration;
	},	
	
	draw: function(pathPoints, properties){
		// TODO: Remove hack
		this.pathPoints = pathPoints;
		
		this.primaryLink.draw(pathPoints, properties.get('width'), properties.get('arrowHeadLength'), this.memberLinks.length);
		
		for (var i = 0, len = this.memberLinks.length; i < len; i++){
			this.memberLinks[i].draw(pathPoints, properties.get('width'), properties.get('arrowHeadLength'), this.memberLinks.length, i);
		}
		
		this.setUtilizationLabelPosition();		
		
		return this;
	},	
	
	redraw: function(){
		return this;
	},
	
	setPath: function(pathPoints){
		this.pathPoints = pathPoints;
		
		return this;
	},
	
	hide: function(){
		this.primaryLink.hide();
		
		for (var i = 0, len = this.memberLinks.length; i < len; i++){
			this.memberLinks[i].hide();
		}

		this.utilizationLabel.hide();		
		
		return this;
	},
	
	show: function(){
		this.primaryLink.show();
		
		for (var i = 0, len = this.memberLinks.length; i < len; i++){
			this.memberLinks[i].show();
		}
		
		this.utilizationLabel.show();		

		return this;
	},
	
	initializeUtilizationLabel: function(){
		this.utilizationLabelConfiguration = networkMap.defaults(this.utilizationLabelsConfiguration, this.link.graph.properties.get('utilizationLabels'));
		
		this.utilizationLabel = new networkMap.renderer.link.UtilizationLabel(this.svg.group(), this.utilizationLabelsConfiguration);
		
		return this;
	},
	
	setUtilizationLabelPosition: function(){
		var center;
		var midpoint = new SVG.math.Line(this.pathPoints[2], this.pathPoints[3]).midPoint();
		
		center = new SVG.math.Line(this.pathPoints[2], midpoint).midPoint();
		this.utilizationLabel.setPosition(center.x, center.y).render();

		center = null;
		midpoint = null;
	
		return this;
	},
	
	setUtilizationLabelOptions: function(options){
		options = options || {};
		this.utilizationLabelConfiguration.enabled = (options.enabled === undefined) ? this.utilizationLabelConfiguration.enabled : options.enabled;
		this.utilizationLabelConfiguration.fontSize = options.fontSize || this.utilizationLabelConfiguration.fontSize;
		this.utilizationLabelConfiguration.padding = options.padding || this.utilizationLabelConfiguration.padding;
				
		this.utilizationLabel.setOptions(this.utilizationLabelConfiguration);
		this.setUtilizationLabel();
		
		return this;
	},
	
	setUtilizationLabel: function(value){
		if (value === undefined)
			value = this.getUtilization();
			
		this.utilizationLabel.render(value);
		
		return this;
	},
	
	hideUtilizationLabel: function(){
		this.utilizationLabel.hide();
		
		return this;
	},
	
	showUtilizationLabel: function(){
		this.utilizationLabel.show();
		
		return this;
	},

	updateHyperlinks: function(){		
		for (var i = 0, len = this.memberLinks.length; i < len; i++){
			this.memberLinks[i].updateHyperlink();
		}
		
		this.primaryLink.updateHyperlink();
		
		return this;
	},

	getLink: function(){
		return this.link;		
	},
	
	getNode: function(){
		return this.node;
	},
	
	getSibling: function(linkPath){
		if (linkPath instanceof networkMap.MemberLink){
			var mySibling = this.getLink().getSibling(this);
			
			if (this.memberLinks.length !== mySibling.memberLinks.length){
				return undefined;
			}
		
			var index = this.memberLinks.indexOf(linkPath);
			return mySibling.memberLinks[index];
		}
		
		if (linkPath instanceof networkMap.PrimaryLink){
			return this.getLink().getSibling(this).primaryLink;
		}
		
		return undefind;
	},	
	
	/**
	 *	Returns the primaryLink utilization. In case the primaryLink
	 * utilization is undefined the maximum utilization if the memberLinks
	 * is returned.
	 */
	getUtilization: function(){
		var max = null;
		
		var checkPath = function(value){
			// We are using the fact that 0 >= null => true
			if (value === null)
				return;
				
			if (value >= max){
				max = value;
			}	
		};	
		
		max = this.primaryLink.getUtilization();
		if (max === undefined || max === null){
			for (var i = 0, len = this.memberLinks.length; i < len; i++){
				checkPath(this.memberLinks[i].getUtilization());
			}	
		}
			
		checkPath = null;
		
		return max;
	}
});;networkMap.Link = function(options){
	
	/** contains referenses to sublinks */
	this.subLinks = {
		nodeA: null,
		nodeB: null	
	};	
	
	// Old structure
	this.pathPoints = [];
	this.updateQ = {};
	this._mode = 'normal';	
	
	/** The current configuration of the utilization label */
	this.utilizationLabelConfiguration = {
		enabled: false,
		fontSize: 8,
		padding: 2
	};
	
	this.graph = options.graph;
	delete options.graph;		

	this.properties = new networkMap.Properties(options, networkMap.Link.defaults);
	this.properties.addEvent('change', function(change){
		this.options = this.properties.configuration();
		this.draw();
	}.bind(this));

	// TODO: Remove this hack
	this.options = this.properties.configuration();

	this.configurationWidget = new networkMap.Link.Module.Settings(this.properties);

	this.colormap = networkMap.colormap[this.properties.get('colormap')];

	// setup datasource
	this.datasource = networkMap.datasource[this.properties.get('datasource')];


	this.setGraph(this.graph);
};

networkMap.extend(networkMap.Link, networkMap.Options);
networkMap.extend(networkMap.Link, networkMap.Observable);

networkMap.extend(networkMap.Link, {

	setProperty: function(key, value){
		if (!this.editTemplate[key]){
			throw 'Unknow id: ' + key;
		}
		
		this.options[key] = value;
		this._localConfig[key] = value;
		
		this.redraw();
	},
	
	getProperty: function(key){
		if (!this.editTemplate[key]){
			throw 'Unknow id: ' + key;
		}
		
		return this.properties.get(key);
	},
	
	/**
	 * This will create/update a link tag for the
	 * node. Order of presence is:
	 * - options.href
	 * - emit url event
	 *
	 * @this {networkMap.Node}
	 * @return {networkMap.Node} self
	 */
	
	updateHyperlinks: function(){
		this.subLinks.nodeA.updateHyperlinks();
		this.subLinks.nodeB.updateHyperlinks();
		
		return this;
	},	
	
	connectedTo: function(node, secondaryNode){
		if (secondaryNode){
			return (this.subLinks.nodeA.node == node || this.subLinks.nodeB.node == node) && (this.subLinks.nodeA.node == secondaryNode || this.subLinks.nodeB.node == secondaryNode);
		}
		
		return (this.subLinks.nodeA.node == node || this.subLinks.nodeB.node == node); 
	},
	
	mode: function(mode){
		if (!mode){
			return this._mode;
		}
		
		if (mode === 'edit' || mode === 'normal'){
			this._mode = mode;
		}
		else{
			throw 'Unknown mode: ' + mode;	
		}
		
		return this;
	},
	
	getConfiguration: function(){
		var configuration = this.properties.extract();

		configuration.nodeA = this.subLinks.nodeA.getConfiguration();
		configuration.nodeB = this.subLinks.nodeB.getConfiguration();
		
		return configuration;
	},

	getSibling: function(subLink){
		return (this.subLinks.nodeA === subLink) ? this.subLinks.nodeB : this.subLinks.nodeA;
	},	
	
	setGraph: function(graph){	
		// remove the object from the graph
		if (graph === null){
			this.graph = null;
			this.draw();
		}

		// if a graph is defined draw 
		if (graph){
			this.graph = graph;
			this.properties.setDefaults(this.graph.getDefaults('link'));
			
			// TODO: Setting the colormap and datasource like this is error prone
			this.datasource = this.properties.get('datasource');
			this.colormap = networkMap.colormap[this.properties.get('colormap')];
		
			// TODO: Remove this hack
			this.options = this.properties.configuration();

			// TODO: Legacy code
			this.graph.addEvent('redraw', function(e){
				this.draw();
			}.bind(this));

			this._setupSVG(this.properties.configuration());
			
			this.draw();
		}
	},
	
	_setupSVG: function(options){
		var svg = this.svg = this.graph.getPaintArea().group().back();
		var edge;
		
		this.shadowPath = this.createShadowPath(svg);

		if (!options.nodeA || !options.nodeB){
			throw "Link(create, missing node in link definition)";
		}

		/* NODE A */
		this.nodeA = this.graph.getNode(options.nodeA.id);
		if (!this.nodeA){
			throw "Link(create, nodeA does not exist (" + options.nodeA.id + ")";
		}
		
		edge = new networkMap.Link.Module.Edge(
			this.graph.getPaintArea().group(),
			this.nodeA.bbox(),
			SVG.math.Point.create(0, 0),
			SVG.math.Point.create(0, 0),
			options.nodeA.edge
		)
		.addEvent('updated', this.redrawShadowPath.bind(this))
		.addEvent('dragstart', function(){
			this.hidePaths();
			this.showShadowPath();
		}.bind(this))
		.addEvent('dragend', this.redraw.bind(this));	
	
		
		this.subLinks.nodeA = new networkMap.SubLink(this, this.nodeA, edge, svg)
			.load(options.nodeA)
			.addEvent('redraw', this.redraw.bind(this))
			.addEvent('requestHref', function(sublink){
				this.fireEvent('requestHref', [sublink]);
			}.bind(this));



		/* NODE B */
		this.nodeB = this.graph.getNode(options.nodeB.id);
		if (!this.nodeB){
			throw "Link(create, nodeA does not exist (" + options.nodeB.id + ")";
		}
		
		edge = new networkMap.Link.Module.Edge(
			this.graph.getPaintArea().group(),
			this.nodeB.bbox(),
			SVG.math.Point.create(0, 0),
			SVG.math.Point.create(0, 0),
			options.nodeB.edge
		)
		.addEvent('updated', this.redrawShadowPath.bind(this))
		.addEvent('dragstart', function(){
			this.hidePaths();
			this.showShadowPath();
		}.bind(this))
		.addEvent('dragend', this.redraw.bind(this));	

		this.subLinks.nodeB = new networkMap.SubLink(this, this.nodeB, edge, svg)
			.load(options.nodeB)
			.addEvent('redraw', this.redraw.bind(this))
			.addEvent('requestHref', function(sublink){
				this.fireEvent('requestHref', [sublink]);
			}.bind(this));

		return this;
	},
	
	
	createShadowPath: function(svg){
		return svg.path().attr({ 
			fill: 'none',
			stroke: '#000', 
			'stroke-dasharray': '3,5',
			'stroke-width': 2 
		});
	},
	
	redraw: function(){
		this.redrawShadowPath();
		this.subLinks.nodeA.draw(this.pathPoints, this.properties);
		this.subLinks.nodeB.draw(Array.prototype.slice.call(this.pathPoints).reverse(), this.properties);	
		return this;
	},

	draw: function(){
		if (this.svg && !this.graph){
			this.svg.remove();
			return false;
		}

		if (!this.graph){
			return false;
		}
		
		this.redrawShadowPath().hideShadowPath();
		this.subLinks.nodeA.draw(this.pathPoints, this.properties);
		this.subLinks.nodeB.draw(Array.prototype.slice.call(this.pathPoints).reverse(), this.properties);	
		
		this.update();

		this.nodeA.addEvent('dragstart', this.onNodeDragStart.bind(this));
		this.nodeB.addEvent('dragstart', this.onNodeDragStart.bind(this));

		this.nodeA.addEvent('drag', this.onNodeDrag.bind(this));
		this.nodeB.addEvent('drag', this.onNodeDrag.bind(this));

		this.nodeA.addEvent('dragend', this.onNodeDragEnd.bind(this));
		this.nodeB.addEvent('dragend', this.onNodeDragEnd.bind(this));

	},

	onNodeDragStart: function(){
		this.shadowPath.show();
		this.hidePaths();
	},	
	
	onNodeDrag: function(){
		this.subLinks.nodeA.edge.setBbox(this.nodeA.bbox());
		this.subLinks.nodeB.edge.setBbox(this.nodeB.bbox());
			
		this.redrawShadowPath();
	},
	
	onNodeDragEnd: function(){
		this.redrawShadowPath().hideShadowPath();
		this.subLinks.nodeA.draw(this.pathPoints, this.properties);
		this.subLinks.nodeB.draw(Array.prototype.slice.call(this.pathPoints).reverse(), this.properties);	
		this.showPaths();
	},

	edgePoints: function(){
		var vec2 = networkMap.vec2;
		
		var bboxA = this.subLinks.nodeA.node.bbox();
		var bboxB = this.subLinks.nodeB.node.bbox();
		
		var confinmentA = vec2.create(bboxA.width/2, bboxA.height/2);
		var confinmentB = vec2.create(bboxB.width/2, bboxB.height/2);

		var path = [];
		
		var inset = parseInt(this.properties.get('inset')) || 1;
		var connectionDistance = parseInt(this.properties.get('connectionDistance')) || 1;
		var staticConnectionDistance = parseInt(this.properties.get('staticConnectionDistance')) || 1;
		
		var a = vec2.create(bboxA.cx, bboxA.cy);
		var b = vec2.create(bboxB.cx, bboxB.cy);
		
		var ab = b.clone().sub(a);
		var dirA = ab.clone().maxDir();	
		var edgePointA = dirA.clone().mul(confinmentA);
		edgePointA.sub(dirA.clone().scale(inset));
		var edgePointerA = edgePointA.clone();
		edgePointA.add(a);
		
		
	
		/* AND NOW FROM THE OTHER SIDE */
		var ba = ab.clone().scale(-1);
		var dirB = ba.clone().maxDir();
		var edgePointB = dirB.clone().mul(confinmentB);
		edgePointB.sub(dirB.clone().scale(inset));
		var edgePointerB = edgePointB.clone();
		edgePointB.add(b);

		this.$edgePoints = this.$edgePoints || {};
		this.$edgePoints = {
			nodeA: {
				point: new SVG.math.Point(edgePointA.x, edgePointA.y),
				pointer: edgePointerA,
				direction: dirA
			},
			nodeB: {
				point: new SVG.math.Point(edgePointB.x, edgePointB.y),
				pointer: edgePointerB,
				direction: dirB
			}
		};
		
		/*
		if (!this.edgeHandle){
			var edgeHandle = this.edgeHandle = new networkMap.Link.Module.Edge(
				this.graph.getPaintArea().group(),
				this.nodeA.bbox(),
				this.$edgePoints.calculated.nodeA.point,
				this.$edgePoints.calculated.nodeA.direction
			);
			
			edgeHandle.addEvent('updated', this.redrawShadowPath.bind(this));
			edgeHandle.addEvent('dragstart', function(){
				this.hidePaths();
				this.showShadowPath();
			}.bind(this));
			edgeHandle.addEvent('dragend', this.redraw.bind(this));
			
			
		} else {
			this.subLinks.nodeB
			this.edgeHandle.setDefaults(edgePointA, dirA);
		}
		
		var edge = this.edgeHandle.getEdge();		
		*/

		

		
		//this.$edgePoints.path = path;
		
		
		
		
		return this.$edgePoints;
	},

	

	redrawShadowPath: function(){
		var edge;
		var path = [];
		var connectionDistance = parseInt(this.properties.get('connectionDistance')) || 1;
		var staticConnectionDistance = parseInt(this.properties.get('staticConnectionDistance')) || 1;

		var edgePoints = this.edgePoints();

		this.pathPoints.length = 0;
		
		this.subLinks.nodeA.edge.setDefaults(edgePoints.nodeA.point, edgePoints.nodeA.direction);		
		this.subLinks.nodeB.edge.setDefaults(edgePoints.nodeB.point, edgePoints.nodeB.direction);		
		
		edge = this.subLinks.nodeA.edge.getEdge();
		path.push(edge.point.clone());
		path.push(edge.point.clone().add(edge.direction.clone().scale(connectionDistance)));
		path.push(edge.point.clone().add(edge.direction.clone().scale(connectionDistance + staticConnectionDistance)));

		edge = this.subLinks.nodeB.edge.getEdge();
		path.push(edge.point.clone().add(edge.direction.clone().scale(connectionDistance + staticConnectionDistance)));
		path.push(edge.point.clone().add(edge.direction.clone().scale(connectionDistance)));
		path.push(edge.point.clone());
		
		
		// TODO: Rewrite, add vec2 functionality to SVG.math.Point
		/*
		edgePoints.path.forEach(function(point){
			this.pathPoints.push(new SVG.math.Point(point.x, point.y));
		}.bind(this));
		*/
		this.pathPoints = path;		
		
		this.shadowPath
			.clear()
			.M(path[0])  //.apply(this.shadowPath, edgePoints.path[0])
			.L(path[2])  //.apply(this.shadowPath, edgePoints.path[2])
			.L(path[3])  //.apply(this.shadowPath, edgePoints.path[3])
			.L(path[5]); //.apply(this.shadowPath, edgePoints.path[5]);

		return this;
	},
	
	removeMainPath: function(){
		if (this.mainPathA)
			this.mainPathA.remove();

		if(this.mainPathB)
			this.mainPathB.remove();
	},
	
	hidePaths: function(){
		this.subLinks.nodeA.hide();
		this.subLinks.nodeB.hide();

		return this;
	},
	showPaths: function(){
		this.subLinks.nodeA.show();
		this.subLinks.nodeB.show();

		return this;
	},
	showShadowPath: function(){
		this.shadowPath.show();
		return this;
	},
	
	hideShadowPath: function(){
		this.shadowPath.hide();
		return this;
	},


	drawEdgeHandles: function(){
		
		this.subLinks.nodeA.edge.show(this.nodeA.bbox());
		this.subLinks.nodeB.edge.show(this.nodeB.bbox());
		
		return this;
	},
	
	hideEdgeHandles: function(){
		this.subLinks.nodeA.edge.hide();
		this.subLinks.nodeB.edge.hide();
		
		return this;
	},

	setUtilizationLabel: function(){
		this.subLinks.nodeA.setUtilizationLabel();
		this.subLinks.nodeB.setUtilizationLabel();
		
		return this;
	},
	
	setUtilizationLabelOptions: function(options){
		this.subLinks.nodeA.setUtilizationLabelOptions(options);
		this.subLinks.nodeB.setUtilizationLabelOptions(options);
		
		return this;
	},
	
	showUtilizationLabels: function(){
		this.subLinks.nodeA.showUtilizationLabel();
		this.subLinks.nodeB.showUtilizationLabel();
		
		return this;
	},
	
	hideUtilizationLabels: function(){
		this.subLinks.nodeA.hideUtilizationLabel();
		this.subLinks.nodeB.hideUtilizationLabel();
		
		return this;
	},
	
	updateUtilizationLabels: function(){
		this.setUtilizationLabelPositions();
		
		return this;
	},

	setUtilizationLabelPositions: function(){
		this.subLinks.nodeA.setUtilizationLabelPosition();
		this.subLinks.nodeB.setUtilizationLabelPosition();
	
		return this;
	},

	/* TODO: This should not be used, the graph should collect this data */
	registerUpdateEvent: function(datasource, url, link, callback){
		var graph;
		
		this.updateQ[datasource] = this.updateQ[datasource] || {};
		this.updateQ[datasource][url] = this.updateQ[datasource][url] || [];

		// register datasources for internal use in the link
		this.updateQ[datasource][url].push({
			link: link,
			callback: callback
		});
		
		// register the update event in the graf
		this.graph.registerUpdateEvent(datasource, url, link, callback);
	},
	

	update: function(force){
		if (this.properties.get('globalRefresh') && force !== true)
			return this;

		if (!this.graph.properties.get('batchUpdate') || force === true)
		networkMap.each(this.updateQ, function(urls, datasource){
			if (!networkMap.datasource[datasource]){
				throw 'Unknown datasource (' + datasource + ')';
			}
			networkMap.each(urls, function(requests, url){
				if (this.properties.get('batchUpdate')){
					networkMap.datasource[datasource](url, requests);
				}
				else{
					requests.forEach(function(request){
						networkMap.datasource[datasource](url, request);
					});
				}
			}.bind(this));
		}.bind(this));
		
		return this;
	}

});

networkMap.Link.defaultTemplate = {
	width: {
		label: 'Width',
		type: 'number',
		min: 0
	},
	inset: {
		label: 'Inset',
		type: 'number',
		min: 1
	},
	connectionDistance: {
		label: 'Chamfer',
		type: 'number',
		min: 0
	},
	staticConnectionDistance: {
		label: 'Offset',
		type: 'number',
		min: 1
	},
	arrowHeadLength: {
		label: 'Arrow Head',
		type: 'number',
		min: 0
	}
};

/**
 * Register a global handler to provide a href to Links
 * This can be overridden on the networkMap instance or
 * or setting it directly on the link.
 * 
 * The registered function should return a url string 
 * or null if no link should be created.
 *
 * @param {function} A function that returns a URL or null
 */
networkMap.Link.registerLinkGenerator = function(f){
	networkMap.Link._linkGenerator = networkMap.Link.createLinkGenerator(f);
};

networkMap.Link.createLinkGenerator = function(f){
	return function(sublink){
		var href = sublink.properties.get('href');
		if (href){
			if (networkMap.isFunction(href))
				sublink.setLink(href());
			else
				sublink.setLink(href);
			return;
		}
		
		sublink.setLink(f(sublink));
	};
};

/** Register a default link generator which will not create a link */
networkMap.Link.registerLinkGenerator(function(sublink){return null;});

/** Register defaults properties for networkMap.Node */
networkMap.Link.defaults = new networkMap.Properties({
	inset: 10,
	connectionDistance: 10,
	staticConnectionDistance: 30,
	arrowHeadLength: 10,
	width: 10,
	background: '#777',
	globalRefresh: true,
	refreshInterval: 300000,
	datasource: 'simulate',
	batchUpdate: true,
	colormap: 'flat5'
});
;networkMap.Link.Module = networkMap.Link.Module || {};

networkMap.Link.Module.Settings = function(properties, options){
	this.options = {
		onlyGlobals: false,
		header: 'Globals',
		container: null
	};
	this.setOptions(options);

	this.properties = properties;
};


networkMap.extend(networkMap.Link.Module.Settings, networkMap.Options);

// types: angle, bool, float, int, number, length, list, string, color
// https://api.tinkercad.com/libraries/1vxKXGNaLtr/0/docs/topic/Shape+Generator+Overview.html
networkMap.extend(networkMap.Link.Module.Settings, {

	/** Definitions of the parameters */
	parameters: {
		width: {
			label: 'Width',
			type: 'number',
			min: 0,
			global: true
		},
		inset: {
			label: 'Inset',
			type: 'number',
			min: 1,
			global: true
		},
		connectionDistance: {
			label: 'Chamfer',
			type: 'number',
			min: 0,
			global: true
		},
		staticConnectionDistance: {
			label: 'Offset',
			type: 'number',
			min: 1,
			global: true
		},
		arrowHeadLength: {
			label: 'Arrow Head',
			type: 'number',
			min: 0,
			global: true
		}
	},

	/**
	 * Generates HTML that is used for configuration
	 * @param  {networkMap.Link} link       The link object
	 * @param  {networkMap.Properties} properties The properties of the link object
	 * @return {HTMLElement}            A HTMLElement containing the widget
	 */	
	toElement: function(link, properties){
		properties = properties || this.properties;
		var container = this.options.container || new networkMap.widget.Accordion();
		var accordionGroup;

		var changeHandler = function(key, obj){
			return function(e, widget){
				obj.set(key, widget.value());	
			};
		};
	
		accordionGroup = container.add(this.options.header);		
		networkMap.each(this.parameters, function(option, key){
			accordionGroup.appendChild(new networkMap.widget.IntegerInput(option.label, properties.get(key, true), option)
				.addEvent('change', changeHandler(key, properties))
			);
		}.bind(this));		
		
		// This is added to prevent non global configuration to be added
		if (this.options.onlyGlobals){
			return container;
		}
		
		var linkTemplate = {
			id: {
				label: 'Node',
				type: 'text',
				disabled: true,
				global: false
			},
			name: {
				label: 'Interface',
				type: 'text',
				disabled: true,
				global: false
			}
			/* TODO: Descide if this is needed
			, 
			width: {
				label: 'Width',
				type: 'number',
				min: 0,
				global: false
			}
			*/
		};		
		
		var sublinkConf = function(label, node){
			accordionGroup = container.add(label);
			networkMap.each(linkTemplate, function(option, key){
				if (['id'].some(function(item){ return item == key;})){
					accordionGroup.appendChild(new networkMap.widget.TextInput(option.label, properties.get(node + '.' + key), option)
						.addEvent('change', changeHandler(key, link.properties))
					);
				}
				else{
					if (option.type === 'number'){
						accordionGroup.appendChild(
							new networkMap.widget.IntegerInput(
								option.label, 
								link.subLinks[node].primaryLink.properties.get(key, true), 
								option
							)
							.addEvent('change', changeHandler(key, link.subLinks[node].primaryLink.properties))
						);
					}
					else if(option.type === 'text'){
						accordionGroup.appendChild(
							new networkMap.widget.TextInput(
								option.label, 
								link.subLinks[node].primaryLink.properties.get(key), 
								option
							)
							.addEvent('change', changeHandler(key, link.subLinks[node].primaryLink.properties))
						);
					}
					else if(option.type === 'color'){
						accordionGroup.appendChild(
							new networkMap.widget.ColorInput(
								option.label, 
								link.subLinks[node].primaryLink.properties.get(key), 
								option
							)
							.addEvent('change', changeHandler(key, link.subLinks[node].primaryLink.properties))
						);
					}
				}
			}.bind(this));
		}.bind(this);
		
		sublinkConf('Node A', 'nodeA');
		sublinkConf('Node B', 'nodeB');
		

		
		// Add sublinks
		var sublinkList;
		if (link.subLinks.nodeA && link.subLinks.nodeB && link.subLinks.nodeA.memberLinks.length === link.subLinks.nodeB.memberLinks.length) {
			accordionGroup = container.add('Sublinks');
			sublinkList = new networkMap.widget.List();
			link.subLinks.nodeA.memberLinks.forEach(function(subpath, index){
				sublinkList.add(subpath.properties.get('name') + ' - ' + link.subLinks.nodeB.memberLinks[index].properties.get('name'), {enableDelete: false});
			});
			accordionGroup.appendChild(sublinkList);
		}
		else{ // Asymetric link
			if (link.subLinks.nodeA || link.subLinks.nodeB){
				accordionGroup = container.add('Sublinks');
				sublinkList = new networkMap.widget.List();
			}

			if (link.subLinks.nodeA){
				link.subLinks.nodeA.memberLinks.forEach(function(sublink, index){
					sublinkList.add(sublink.properties.get('name') + ' - ' + 'N/A', {enableDelete: false});
				});
			}

			if (link.subLinks.nodeB){
				link.subLinks.nodeB.memberLinks.forEach(function(sublink, index){
					sublinkList.add('N/A' + ' - ' + sublink.properties.get('name'), {enableDelete: false});
				});
			}

			if (link.subLinks.nodeA || link.subLinks.nodeB){
				accordionGroup.appendChild(sublinkList);
			}
		}
		
		return container;
	}
});;networkMap.Link.Module = networkMap.Link.Module || {};

/**
 * The Edge module is an UI widget for controling
 * the edge point of the link.
 *
 * @param {object} options Options to override defaults.
 * @constructor
 * @borrows networkMap.Options#setOptions as #setOptions
 */
networkMap.Link.Module.Edge = function(svg, bbox, edgePoint, edgeDirection, userDefined){

	
	this.svg = svg;
	this.bbox = bbox;	
	
	this.defaults = {};
	this.setDefaults(edgePoint, edgeDirection);
		
	function convert(obj){
		return SVG.math.Point.create(obj.x, obj.y);	
	}
	
	if (userDefined){
		this.setUserDefined(convert(userDefined.point), convert(userDefined.pointer), convert(userDefined.direction));		
	}
	

	this.size = 15;
	this.angleSnap = Math.PI / 14;
	this.pointSnap = 5;

	this.state = this.states.hidden;
};

networkMap.extend(networkMap.Link.Module.Edge, networkMap.Options);
networkMap.extend(networkMap.Link.Module.Edge, networkMap.Observable);

/**
 * @lends networkMap.Link.Module.Edge
 */
networkMap.extend(networkMap.Link.Module.Edge, {
	setDefaults: function(edgePoint, edgeDirection){
		this.defaults.point = edgePoint;
		this.defaults.direction = edgeDirection; 
		
		return this;	
	},	
	
	getDefaults: function(){
		return this.defaults;
	},
	
	setUserDefined: function(edgePoint, edgePointer, edgeDirection){
		this.userDefined = {
			point: edgePoint,
			pointer: edgePointer,
			direction: edgeDirection
		};
		
		return this;
	},
	
	getUserDefined: function(){
		return this.userDefined;
	},
	
	getEdge: function(){
		return (this.userDefined) ? this.userDefined : this.defaults;
	},
	
	setBbox: function(bbox){
		this.bbox = bbox;
		
		return this.redraw();
	},
	
	getBbox: function(){
		return this.bbox;
	},
	
	show: function(bbox){
		this.state.show.call(this, bbox);
		return this;	
	},
	
	hide: function(){
		this.state.hide.call(this);
		return this;
	},

	redraw: function(){
		this.state.redraw.call(this);
		return this;	
	},

	getConfiguration: function(){
		return this.getUserDefined();
	},
	
	states: {
		hidden: {
			show: function(bbox){
				this.setBbox(bbox);

				var svg = this.svg;
				
				var edge = this.getEdge();
				
				var vec = edge.direction.clone().scale(30);
				vec.add(edge.point);		
						
				var line = this.line = svg.line(edge.point.x, edge.point.y, vec.x, vec.y)
					.stroke({
						fill: 'none',
						color: '#000',
						width: 2,
		
					});
		
				var directionHandle = this.directionHandle = this.svg.circle(this.size)
					.center(vec.x, vec.y)
					.fill('#fff')
					.stroke({
						color: '#000'
					})
					.draggable(function(x, y){
						var edge = this.getEdge();
						var vec2 = networkMap.vec2.create(x, y);
						var edge2 = edge.point.clone();
						var res = vec2.sub(edge2).normalize().scale(30);
						res.roundDir(this.angleSnap).add(edge2);
						
						return {x: res.x, y: res.y};
					}.bind(this));
				
				var radius = this.size / 2;
				var edgeHandle = this.edgeHandle = this.svg.circle(this.size)
					.fill('#fff')
					.stroke({
						color: '#000'
					})
					.center(edge.point.x, edge.point.y)
					.draggable(function(x, y){
						x = x < this.bbox.x - radius  ? this.bbox.x - radius : x - x % this.pointSnap;
						x = x > (this.bbox.x + this.bbox.width - radius) ? this.bbox.x + this.bbox.width - radius : x - x % this.pointSnap;
						y = y < this.bbox.y - radius ? this.bbox.y - radius : y - y % this.pointSnap;
						y = y > (this.bbox.y + this.bbox.height - radius) ? this.bbox.y + this.bbox.height - radius : y - y % this.pointSnap;
						
						return {
							x: x,
							y: y
						};
					}.bind(this));
					
		
				svg.on('dblclick', this.onDoubleClick.bind(this));				
				
				directionHandle.dragstart = this.onDragStart.bind(this);
				directionHandle.dragmove = this.onDirectionHandleMove.bind(this);
				directionHandle.dragend = this.onDragEnd.bind(this);
				
				edgeHandle.dragstart = this.onDragStart.bind(this);
				edgeHandle.dragmove = this.onEdgeHandleMove.bind(this);
				edgeHandle.dragend = this.onDragEnd.bind(this);
				
				svg.front();
		
				this.state = this.states.rendered;
				return this;
			},

			redraw: function(){
				var edge = this.getEdge();
				
				if (edge.pointer){
					edge.point = SVG.math.Point.create(this.bbox.cx, this.bbox.cy).add(edge.pointer);	
				}
								
				return this;
			},

			hide: function(){
				return this;
			}
		},
		rendered: {
			show: function(bbox){
				this.bbox = bbox;
				return this.redraw();
			},
			
			redraw: function(){
				var edge = this.getEdge();
				
				if (edge.pointer){
					edge.point = SVG.math.Point.create(this.bbox.cx, this.bbox.cy).add(edge.pointer);	
				}
				var vec = edge.direction.clone().scale(30).add(edge.point);

				this.line.plot(edge.point.x, edge.point.y, vec.x, vec.y); 
				this.directionHandle.center(vec.x, vec.y);
				this.edgeHandle.center(edge.point.x, edge.point.y);
				return this;
			},
			
			hide: function(){
				this.directionHandle.dragmove = null;
				this.edgeHandle.dragmove = null;
				
				this.line.remove();
				this.directionHandle.remove();
				this.edgeHandle.remove();
				this.line = null;
				this.directionHandle = null;
				this.edgeHandle = null;
				
				this.state = this.states.hidden;
			}
			
		}	
	},

	onDoubleClick: function(){
		this.reset();
		this.fireEvent('dragend');
	},

	onDragStart: function(){
		this.fireEvent('dragstart');
	},
	
	onDragEnd: function(){
		this.fireEvent('dragend');
	},

	onDirectionHandleMove: function(event){
		var edge = this.getEdge();

		this.setUserDefined(
			edge.point,
			edge.point.clone().sub(SVG.math.Point.create(this.bbox.cx, this.bbox.cy)),
			SVG.math.Point.create(event.target.cx(), event.target.cy()).sub(edge.point).normalize()
		);
		
		this.redraw();
		this.fireEvent('updated');
	},
	
	onEdgeHandleMove: function(event){
		var edge = this.getEdge();
		var edgePoint = SVG.math.Point.create(event.target.cx(), event.target.cy());
		
		this.setUserDefined(
			edgePoint,
			edgePoint.clone().sub(SVG.math.Point.create(this.bbox.cx, this.bbox.cy)),
			edge.direction
		);
		
		this.fireEvent('updated');
		this.redraw();
	},

	
	reset: function(){
		this.userDefined = undefined;
		this.redraw();
		
		return this;
	}
});

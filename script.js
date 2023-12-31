function Geometry(faces) {
    this.faces = faces || []
}

// Parses an OBJ file, passed as a string
Geometry.parseOBJ = function (src) {
    var POSITION = /^v\s+([\d\.\+\-eE]+)\s+([\d\.\+\-eE]+)\s+([\d\.\+\-eE]+)/
    var NORMAL = /^vn\s+([\d\.\+\-eE]+)\s+([\d\.\+\-eE]+)\s+([\d\.\+\-eE]+)/
    var UV = /^vt\s+([\d\.\+\-eE]+)\s+([\d\.\+\-eE]+)/
    var FACE =
        /^f\s+(-?\d+)\/(-?\d+)\/(-?\d+)\s+(-?\d+)\/(-?\d+)\/(-?\d+)\s+(-?\d+)\/(-?\d+)\/(-?\d+)(?:\s+(-?\d+)\/(-?\d+)\/(-?\d+))?/

    lines = src.split('\n')
    var positions = []
    var uvs = []
    var normals = []
    var faces = []
    lines.forEach(function (line) {
        // Match each line of the file against various RegEx-es
        var result
        if ((result = POSITION.exec(line)) != null) {
            // Add new vertex position
            positions.push(new Vector3(parseFloat(result[1]), parseFloat(result[2]), parseFloat(
                result[3])))
        } else if ((result = NORMAL.exec(line)) != null) {
            // Add new vertex normal
            normals.push(new Vector3(parseFloat(result[1]), parseFloat(result[2]), parseFloat(
                result[3])))
        } else if ((result = UV.exec(line)) != null) {
            // Add new texture mapping point
            uvs.push(new Vector2(parseFloat(result[1]), 1 - parseFloat(result[2])))
        } else if ((result = FACE.exec(line)) != null) {
            // Add new face
            var vertices = []
            // Create three vertices from the passed one-indexed indices
            for (var i = 1; i < 10; i += 3) {
                var part = result.slice(i, i + 3)
                var position = positions[parseInt(part[0]) - 1]
                var uv = uvs[parseInt(part[1]) - 1]
                var normal = normals[parseInt(part[2]) - 1]
                vertices.push(new Vertex(position, normal, uv))
            }
            faces.push(new Face(vertices))
        }
    })

    return new Geometry(faces)
}

// Loads an OBJ file from the given URL, and returns it as a promise
Geometry.loadOBJ = function (ObjText) {
    return Geometry.parseOBJ(ObjText)
}

function Face(vertices) {
    this.vertices = vertices || []
}

function Vertex(position, normal, uv) {
    this.position = position || new Vector3()
    this.normal = normal || new Vector3()
    this.uv = uv || new Vector2()
}

function Vector3(x, y, z) {
    this.x = Number(x) || 0
    this.y = Number(y) || 0
    this.z = Number(z) || 0
}

function Vector2(x, y) {
    this.x = Number(x) || 0
    this.y = Number(y) || 0
}

function Transformation() {
    // Create an identity transformation
    this.fields = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
}

// Multiply matrices, to chain transformations
Transformation.prototype.mult = function (t) {
    var output = new Transformation()
    for (var row = 0; row < 4; ++row) {
        for (var col = 0; col < 4; ++col) {
            var sum = 0
            for (var k = 0; k < 4; ++k) {
                sum += this.fields[k * 4 + row] * t.fields[col * 4 + k]
            }
            output.fields[col * 4 + row] = sum
        }
    }
    return output
}

// Multiply by translation matrix
Transformation.prototype.translate = function (x, y, z) {
    var mat = new Transformation()
    mat.fields[12] = Number(x) || 0
    mat.fields[13] = Number(y) || 0
    mat.fields[14] = Number(z) || 0
    return this.mult(mat)
}

// Multiply by scaling matrix
Transformation.prototype.scale = function (x, y, z) {
    var mat = new Transformation()
    mat.fields[0] = Number(x) || 0
    mat.fields[5] = Number(y) || 0
    mat.fields[10] = Number(z) || 0
    return this.mult(mat)
}

// Multiply by rotation matrix around X axis
Transformation.prototype.rotateX = function (angle) {
    angle = Number(angle) || 0
    var c = Math.cos(angle)
    var s = Math.sin(angle)
    var mat = new Transformation()
    mat.fields[5] = c
    mat.fields[10] = c
    mat.fields[9] = -s
    mat.fields[6] = s
    return this.mult(mat)
}

// Multiply by rotation matrix around Y axis
Transformation.prototype.rotateY = function (angle) {
    angle = Number(angle) || 0
    var c = Math.cos(angle)
    var s = Math.sin(angle)
    var mat = new Transformation()
    mat.fields[0] = c
    mat.fields[10] = c
    mat.fields[2] = -s
    mat.fields[8] = s
    return this.mult(mat)
}

// Multiply by rotation matrix around Z axis
Transformation.prototype.rotateZ = function (angle) {
    angle = Number(angle) || 0
    var c = Math.cos(angle)
    var s = Math.sin(angle)
    var mat = new Transformation()
    mat.fields[0] = c
    mat.fields[5] = c
    mat.fields[4] = -s
    mat.fields[1] = s
    return this.mult(mat)
}




function Camera() {
    this.position = new Transformation()
    this.projection = new Transformation()
}

Camera.prototype.setOrthographic = function (width, height, depth) {
    this.projection = new Transformation()
    this.projection.fields[0] = 2 / width
    this.projection.fields[5] = 2 / height
    this.projection.fields[10] = -2 / depth
}

Camera.prototype.setPerspective = function (verticalFov, aspectRatio, near, far) {
    var height_div_2n = Math.tan(verticalFov * Math.PI / 360)
    var width_div_2n = aspectRatio * height_div_2n
    this.projection = new Transformation()
    this.projection.fields[0] = 1 / height_div_2n
    this.projection.fields[5] = 1 / width_div_2n
    this.projection.fields[10] = (far + near) / (near - far)
    this.projection.fields[10] = -1
    this.projection.fields[14] = 2 * far * near / (near - far)
    this.projection.fields[15] = 0
}

Camera.prototype.getInversePosition = function () {
    var orig = this.position.fields
    var dest = new Transformation()
    var x = orig[12]
    var y = orig[13]
    var z = orig[14]
    // Transpose the rotation matrix
    for (var i = 0; i < 3; ++i) {
        for (var j = 0; j < 3; ++j) {
            dest.fields[i * 4 + j] = orig[i + j * 4]
        }
    }

    // Translation by -p will apply R^T, which is equal to R^-1
    return dest.translate(-x, -y, -z)
}

function Renderer(canvas) {
    var gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    gl.enable(gl.DEPTH_TEST)
    this.gl = gl
}

Renderer.prototype.setClearColor = function (red, green, blue) {
    this.gl.clearColor(red / 255, green / 255, blue / 255, 1)
}

Renderer.prototype.getContext = function () {
    return this.gl
}

Renderer.prototype.render = function () {
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT)
}

var renderer = new Renderer(document.getElementById('webgl-canvas'))
renderer.setClearColor(100, 149, 237)

Geometry.prototype.vertexCount = function () {
    return this.faces.length * 3
  }
  
  Geometry.prototype.positions = function () {
    var answer = []
    this.faces.forEach(function (face) {
      face.vertices.forEach(function (vertex) {
        var v = vertex.position
        answer.push(v.x, v.y, v.z)
      })
    })
    return answer
  }
  
  Geometry.prototype.normals = function () {
    var answer = []
    this.faces.forEach(function (face) {
      face.vertices.forEach(function (vertex) {
        var v = vertex.normal
        answer.push(v.x, v.y, v.z)
      })
    })
    return answer
  }
  
  Geometry.prototype.uvs = function () {
    var answer = []
    this.faces.forEach(function (face) {
      face.vertices.forEach(function (vertex) {
        var v = vertex.uv
        answer.push(v.x, v.y)
      })
    })
    return answer
  }
  
  ////////////////////////////////
  
  function VBO (gl, data, count) {
    // Creates buffer object in GPU RAM where we can store anything
    var bufferObject = gl.createBuffer()
    // Tell which buffer object we want to operate on as a VBO
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferObject)
    // Write the data, and set the flag to optimize
    // for rare changes to the data we're writing
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW)
    this.gl = gl
    this.size = data.length / count
    this.count = count
    this.data = bufferObject
  }
  
  VBO.prototype.destroy = function () {
    // Free memory that is occupied by our buffer object
    this.gl.deleteBuffer(this.data)
  }

  function Mesh (gl, geometry) {
    var vertexCount = geometry.vertexCount()
    this.positions = new VBO(gl, geometry.positions(), vertexCount)
    this.normals = new VBO(gl, geometry.normals(), vertexCount)
    this.uvs = new VBO(gl, geometry.uvs(), vertexCount)
    this.vertexCount = vertexCount
    this.position = new Transformation()
    this.gl = gl
  }
  
  Mesh.prototype.destroy = function () {
    this.positions.destroy()
    this.normals.destroy()
    this.uvs.destroy()
  }

  function ShaderProgram (gl, vertSrc, fragSrc) {
    var vert = gl.createShader(gl.VERTEX_SHADER)
    gl.shaderSource(vert, vertSrc)
    gl.compileShader(vert)
    if (!gl.getShaderParameter(vert, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(vert))
      throw new Error('Failed to compile shader')
    }
  
    var frag = gl.createShader(gl.FRAGMENT_SHADER)
    gl.shaderSource(frag, fragSrc)
    gl.compileShader(frag)
    if (!gl.getShaderParameter(frag, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(frag))
      throw new Error('Failed to compile shader')
    }
  
    var program = gl.createProgram()
    gl.attachShader(program, vert)
    gl.attachShader(program, frag)
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(program))
      throw new Error('Failed to link program')
    }
  
    this.gl = gl
    this.position = gl.getAttribLocation(program, 'position')
    this.normal = gl.getAttribLocation(program, 'normal')
    this.uv = gl.getAttribLocation(program, 'uv')
    this.model = gl.getUniformLocation(program, 'model')
    this.view = gl.getUniformLocation(program, 'view')
    this.projection = gl.getUniformLocation(program, 'projection')
    this.vert = vert
    this.frag = frag
    this.program = program
  }
  
  // Loads shader files from the given URLs, and returns a program as a promise
  ShaderProgram.load = function (gl, vertUrl, fragUrl) {
    return Promise.all([loadFile(vertUrl), loadFile(fragUrl)]).then(function (files) {
      return new ShaderProgram(gl, files[0], files[1])
    })
  
    function loadFile (url) {
      return new Promise(function (resolve) {
        var xhr = new XMLHttpRequest()
        xhr.onreadystatechange = function () {
          if (xhr.readyState == XMLHttpRequest.DONE) {
            resolve(xhr.responseText)
          }
        }
        xhr.open('GET', url, true)
        xhr.send(null)
      })
    }
  }

  

  ShaderProgram.prototype.use = function () {
    this.gl.useProgram(this.program)
  }

  Transformation.prototype.sendToGpu = function (gl, uniform, transpose) {
    gl.uniformMatrix4fv(uniform, transpose || false, new Float32Array(this.fields))
  }
  
  Camera.prototype.use = function (shaderProgram) {
    this.projection.sendToGpu(shaderProgram.gl, shaderProgram.projection)
    this.getInversePosition().sendToGpu(shaderProgram.gl, shaderProgram.view)
  }

  VBO.prototype.bindToAttribute = function (attribute) {
    var gl = this.gl
    // Tell which buffer object we want to operate on as a VBO
    gl.bindBuffer(gl.ARRAY_BUFFER, this.data)
    // Enable this attribute in the shader
    gl.enableVertexAttribArray(attribute)
    // Define format of the attribute array. Must match parameters in shader
    gl.vertexAttribPointer(attribute, this.size, gl.FLOAT, false, 0, 0)
  }

  Mesh.prototype.draw = function (shaderProgram) {
    this.positions.bindToAttribute(shaderProgram.position)
    this.normals.bindToAttribute(shaderProgram.normal)
    this.uvs.bindToAttribute(shaderProgram.uv)
    this.position.sendToGpu(this.gl, shaderProgram.model)
    this.gl.drawArrays(this.gl.TRIANGLES, 0, this.vertexCount)
  }

  Renderer.prototype.setShader = function (shader) {
    this.shader = shader
  }
  
  Renderer.prototype.render = function (camera, objects) {
    this.gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    var shader = this.shader
    if (!shader) {
      return
    }
    shader.use()
    camera.use(shader)
    objects.forEach(function (mesh) {
      mesh.draw(shader)
    })
  }
  

var renderer = new Renderer(document.getElementById('webgl-canvas'))
renderer.setClearColor(100, 149, 237)
var gl = renderer.getContext()

var objects = []


objects.push(new Geometry.loadOBJ(sphere))

ShaderProgram.load(gl, '/shaders/basic.vert', '/shaders/basic.frag')
             .then(function (shader) {
               renderer.setShader(shader)
             })

var camera = new Camera()
camera.setOrthographic(16, 10, 10)

loop()

function loop () {
  renderer.render(camera, objects)
  requestAnimationFrame(loop)
}
// Modified from Claude
// Vars
const FOV_DEG = 90;
const RPM = -0.2;
//

const idx = 1
const FACES = [
  { target: 'TEXTURE_CUBE_MAP_POSITIVE_X', src: 'image/cube/' + idx + '/px.webp' },
  { target: 'TEXTURE_CUBE_MAP_NEGATIVE_X', src: 'image/cube/' + idx + '/nx.webp' },
  { target: 'TEXTURE_CUBE_MAP_POSITIVE_Y', src: 'image/cube/' + idx + '/py.webp' },
  { target: 'TEXTURE_CUBE_MAP_NEGATIVE_Y', src: 'image/cube/' + idx + '/ny.webp' },
  { target: 'TEXTURE_CUBE_MAP_POSITIVE_Z', src: 'image/cube/' + idx + '/pz.webp' },
  { target: 'TEXTURE_CUBE_MAP_NEGATIVE_Z', src: 'image/cube/' + idx + '/nz.webp' },
];

const canvas = document.getElementById('panorama');
const gl = canvas.getContext('webgl2');

// --- Shaders ---
function makeShader(type, src) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  return shader;
}

const prog = gl.createProgram();
gl.attachShader(prog, makeShader(gl.VERTEX_SHADER, `#version 300 es
  in vec2 p;
  out vec3 dir;
  uniform mat3 rot;
  uniform float tanFov;
  uniform float aspect;
  void main() {
    dir = rot * normalize(vec3(p.x * tanFov * aspect, p.y * tanFov, -1.0));
    gl_Position = vec4(p, 0.0, 1.0);
  }
`));
gl.attachShader(prog, makeShader(gl.FRAGMENT_SHADER, `#version 300 es
  precision highp float;
  in vec3 dir;
  out vec4 color;
  uniform samplerCube cube;
  void main() { color = texture(cube, dir); }
`));
gl.linkProgram(prog);

// --- Full-screen quad ---
const buf = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buf);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
const vao = gl.createVertexArray();
gl.bindVertexArray(vao);
const loc = gl.getAttribLocation(prog, 'p');
gl.enableVertexAttribArray(loc);
gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

// --- Cubemap texture ---
const tex = gl.createTexture();
gl.bindTexture(gl.TEXTURE_CUBE_MAP, tex);
gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);

let loaded = 0;
for (const { target, src } of FACES) {
  const img = new Image();
  img.onload = () => {
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, tex);
    gl.texImage2D(gl[target], 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    if (++loaded === 6) loop();
  };
  img.src = src;
}

// --- Render loop ---
const uRot = gl.getUniformLocation(prog, 'rot');
const uTanFov = gl.getUniformLocation(prog, 'tanFov');
const uAspect = gl.getUniformLocation(prog, 'aspect');

function loop() {
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
  gl.viewport(0, 0, canvas.width, canvas.height);

  const yaw = (performance.now() / 1000) * (RPM / 60) * Math.PI * 2;
  const cy = Math.cos(yaw), sy = Math.sin(yaw);
  // Y-axis rotation matrix (column-major for WebGL)
  const rot = [cy, 0, -sy, 0, 1, 0, sy, 0, cy];

  gl.useProgram(prog);
  gl.bindVertexArray(vao);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_CUBE_MAP, tex);
  gl.uniform1i(gl.getUniformLocation(prog, 'cube'), 0);
  gl.uniform1f(uTanFov, Math.tan((FOV_DEG * Math.PI / 180) / 2));
  gl.uniform1f(uAspect, canvas.width / canvas.height);
  gl.uniformMatrix3fv(uRot, false, rot);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

  requestAnimationFrame(loop);
}
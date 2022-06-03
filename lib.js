const canvas = document.createElement("canvas");
document.body.appendChild(canvas);

let canvas_context = canvas.getContext("2d", { alpha: false });
let canvas_buffer = canvas_context.getImageData(
  0,
  0,
  canvas.width,
  canvas.height
);

Array.prototype.customFill = function (value, start = 0, end = this.length) {
  var count = end - start;
  if (count > 0 && count === Math.floor(count)) {
    while (count--) this[start++] = value;
  }
  return this;
};

let canvas_pitch = canvas_buffer.width * 4;

let translation = vec2d(0, 0);
let scaling = vec2d(0, 0);
let shader_function = undefined;
let shader_inputs = [];

function resize(size) {
  canvas.width = size.x;
  canvas.height = size.y;

  canvas_buffer = canvas_context.getImageData(
    0,
    0,
    canvas.width,
    canvas.height
  );

  canvas_pitch = canvas_buffer.width * 4;
}

function pageWidth() {
  return window.innerWidth;
}

function pageHeight() {
  return window.innerHeight;
}

function pageSize() {
  return vec2d(pageWidth(), pageHeight());
}

function addClass(className) {
  canvas.classList.add(className);
}

function pixel(x, y, color) {
  x = x | 0;
  y = (y | 0) - 1;

  if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) {
    return;
  }

  let offset = 4 * x + canvas_pitch * y;
  canvas_buffer.data[offset++] = color.r;
  canvas_buffer.data[offset++] = color.g;
  canvas_buffer.data[offset++] = color.b;
  canvas_buffer.data[offset++] = 255;
}

function flush() {
  canvas_buffer.data.fill(0);
  shader_inputs = [];
}

function swap() {
  canvas_context.putImageData(canvas_buffer, 0, 0);

  requestAnimationFrame(render);
}

function useShader(func) {
  shader_function = func;
  shader_inputs = [];
}

function shaderInputs(...inputs) {
  shader_inputs = inputs;
}

function vec2d(x, y) {
  if (!(this instanceof vec2d)) {
    return new vec2d(x, y);
  }

  this.x = x;
  this.y = y;
}

function rgb(r, g, b) {
  if (!(this instanceof rgb)) {
    return new rgb(r, g, b);
  }

  this.r = r;
  this.g = g;
  this.b = b;
}

function line(p0, p1, color) {
  let dx = p1.x - p0.x,
    dy = p1.y - p0.y;

  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx < 0) {
      let swap = p0;
      p0 = p1;
      p1 = swap;
    }

    let ys = _INTERNAL_INTERPOLATE(p0.x, p0.y, p1.x, p1.y);
    for (let x = p0.x; x <= p1.x; x++) {
      pixel(translation.x + x, translation.y + ys[(x - p0.x) | 0], color);
    }
  } else {
    if (dy < 0) {
      let swap = p0;
      p0 = p1;
      p1 = swap;
    }

    let xs = _INTERNAL_INTERPOLATE(p0.y, p0.x, p1.y, p1.x);
    for (let y = p0.y; y <= p1.y; y++) {
      pixel(translation.x + xs[(y - p0.y) | 0], translation.y + y, color);
    }
  }
}

function mapTexture(aPos, texture) {
  let plottedPos = vec2d(
    Math.round(aPos.x * texture.width),
    Math.round(aPos.y * texture.height)
  );

  let i = plottedPos.x * texture.width + plottedPos.y;
  return rgb(
    texture.data[i * 4],
    texture.data[i * 4 + 1],
    texture.data[i * 4 + 2]
  );
}

function triangle(p0, p1, p2, color) {
  p0.x *= scaling.x;
  p0.y *= scaling.y;
  p1.x *= scaling.x;
  p1.y *= scaling.y;
  p2.x *= scaling.x;
  p2.y *= scaling.y;

  line(p0, p1, color);
  line(p1, p2, color);
  line(p0, p2, color);
}

function translate(p) {
  translation = p;
}

function scale(s) {
  scaling = s;
}

function loadTexture(imgElement, width = undefined, height = undefined) {
  var textureCanvas = document.createElement("canvas");
  var textureContext = textureCanvas.getContext("2d");

  textureCanvas.width = width ? width : imgElement.width;
  textureCanvas.height = height ? height : imgElement.height;

  textureContext.translate(0, imgElement.width);
  textureContext.rotate((-90 * Math.PI) / 180);
  textureContext.translate(imgElement.width, 0);
  textureContext.scale(-1, 1);

  textureContext.drawImage(
    imgElement,
    0,
    0,
    textureCanvas.width,
    textureCanvas.height
  );

  let data = textureContext.getImageData(
    0,
    0,
    textureCanvas.width,
    textureCanvas.height
  );

  return data;
}

function fillTriangle(p0, p1, p2) {
  p0.x *= scaling.x;
  p0.y *= scaling.y;
  p1.x *= scaling.x;
  p1.y *= scaling.y;
  p2.x *= scaling.x;
  p2.y *= scaling.y;

  let maxX = 0;
  let maxY = 0;

  if (p0.x > maxX) maxX = p0.x;
  if (p1.x > maxX) maxX = p1.x;
  if (p2.x > maxX) maxX = p2.x;

  if (p0.y > maxY) maxY = p0.y;
  if (p1.y > maxY) maxY = p1.y;
  if (p2.y > maxY) maxY = p2.y;

  if (p1.y < p0.y) {
    let swap = p0;
    p0 = p1;
    p1 = swap;
  }
  if (p2.y < p0.y) {
    let swap = p0;
    p0 = p2;
    p2 = swap;
  }
  if (p2.y < p1.y) {
    let swap = p1;
    p1 = p2;
    p2 = swap;
  }

  let x01 = _INTERNAL_INTERPOLATE(p0.y, p0.x, p1.y, p1.x);
  let x12 = _INTERNAL_INTERPOLATE(p1.y, p1.x, p2.y, p2.x);
  let x02 = _INTERNAL_INTERPOLATE(p0.y, p0.x, p2.y, p2.x);

  x01.pop();
  let x012 = x01.concat(x12);

  let x_left, x_right;
  let m = (x02.length / 2) | 0;
  if (x02[m] < x012[m]) {
    x_left = x02;
    x_right = x012;
  } else {
    x_left = x012;
    x_right = x02;
  }

  for (let y = p0.y; y <= p2.y; y++) {
    for (let x = x_left[y - p0.y]; x <= x_right[y - p0.y]; x++) {
      pixel(
        translation.x + x,
        translation.y + y,
        shader_function(vec2d(x / maxX, y / maxY), ...shader_inputs)
      );
    }
  }
}

function _INTERNAL_INTERPOLATE(i0, d0, i1, d1) {
  if (i0 == i1) {
    return [d0];
  }

  let values = [];
  let a = (d1 - d0) / (i1 - i0);
  let d = d0;
  for (let i = i0; i <= i1; i++) {
    values.push(d);
    d += a;
  }

  return values;
}

window.addEventListener("load", function () {
  setup();
  requestAnimationFrame(render);
});

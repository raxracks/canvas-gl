const canvas = document.createElement("canvas");
document.body.appendChild(canvas);

let canvas_context = canvas.getContext("2d", { alpha: false });
let canvas_buffer = canvas_context.getImageData(
  0,
  0,
  canvas.width,
  canvas.height
);

let canvas_pitch = canvas_buffer.width * 4;

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

function clear() {
  canvas_buffer.data.fill(255);
}

function swap() {
  canvas_context.putImageData(canvas_buffer, 0, 0);
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
      PutPixel(x, ys[(x - p0.x) | 0], color);
    }
  } else {
    if (dy < 0) {
      let swap = p0;
      p0 = p1;
      p1 = swap;
    }

    let xs = _INTERNAL_INTERPOLATE(p0.y, p0.x, p1.y, p1.x);
    for (let y = p0.y; y <= p1.y; y++) {
      pixel(xs[(y - p0.y) | 0], y, color);
    }
  }
}

function triangle(p0, p1, p2, color) {
  line(p0, p1, color);
  line(p1, p2, color);
  line(p0, p2, color);
}

function fillTriangle(p0, p1, p2, color) {
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
      pixel(x, y, color);
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

setup();
render();

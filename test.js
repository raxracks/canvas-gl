function setup() {
  resize(pageSize());
  addClass("topLeft");
}

function render() {
  requestAnimationFrame(render);

  clear();

  fillTriangle(vec2d(0, 0), vec2d(100, 0), vec2d(0, 100), rgb(0, 255, 0));
  fillTriangle(vec2d(100, 0), vec2d(100, 100), vec2d(0, 100), rgb(0, 255, 0));

  swap();
}

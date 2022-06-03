let texData;

function setup() {
  resize(pageSize());
  addClass("topLeft");
  useShader(shader_main);

  texData = loadTexture(document.getElementById("tex"));
}

function render() {
  flush();

  scale(vec2d(texData.width, texData.height));
  shaderInputs(texData);

  fillTriangle(vec2d(0, 0), vec2d(1, 0), vec2d(0, 1));
  fillTriangle(vec2d(1, 0), vec2d(1, 1), vec2d(0, 1));

  swap();
}

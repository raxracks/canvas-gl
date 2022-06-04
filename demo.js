let texData;
let quadData;
let realtime = false;
let x = 0;

function setup() {
  resize(pageSize());
  addClass("topLeft");
  useShader(shader_main);

  texData = loadTexture(document.getElementById("tex"));

  /* generate a cached version of the calculated pixels */
  shaderInputs(texData);
  quadData = fillQuad(vec2d(x, 0), vec2d(texData.width, texData.height), true);

  x = pageWidth();
}

function render(dt) {
  flush();

  // real time calculations
  if (realtime) {
    shaderInputs(texData);
    for (let xOffset = 0; xOffset < pageWidth() * 2; xOffset += 100) {
      for (let yOffset = 0; yOffset < pageHeight(); yOffset += 100) {
        fillQuad(
          vec2d(x - xOffset, yOffset),
          vec2d(texData.width, texData.height)
        );
      }
    }
  }

  swap();

  // drawing cached data to main canvas
  // cached data must be drawn after swap
  if (!realtime) {
    for (let xOffset = 0; xOffset < pageWidth() * 2; xOffset += 100) {
      for (let yOffset = 0; yOffset < pageHeight(); yOffset += 100) {
        putImageData(vec2d(x - xOffset, yOffset), quadData);
      }
    }
  }

  if (x + 100 > pageWidth() * 2) x = pageWidth();
  else x += 5;
}

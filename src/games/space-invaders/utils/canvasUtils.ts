export function drawIntoCanvas(
  width: number,
  height: number,
  drawFunc: (ctx: CanvasRenderingContext2D) => void
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
  drawFunc(ctx);
  return canvas;
}

export function preDrawBulletImage(): HTMLImageElement {
  const canvas = drawIntoCanvas(2, 8, (ctx) => {
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  });
  
  const bulletImg = new Image();
  bulletImg.src = canvas.toDataURL();
  return bulletImg;
}
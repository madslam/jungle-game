export const drawGrid = (context, width, height) => {
  let s = 20;
  let pL = s;
  let pT = s;
  let pR = s;
  let pB = s;

  context.strokeStyle = 'white';
  context.beginPath ();
  for (var x = pL; x <= width - pR; x += s) {
    context.moveTo (x, pT);
    context.lineTo (x, height - pB);
  }
  for (var y = pT; y <= height - pB; y += s) {
    context.moveTo (pL, y);
    context.lineTo (width - pR, y);
    context.font = '15px Comic Sans MS';
    context.textAlign = 'center';
    context.textAlign = 'center';
    context.fillStyle = 'steelblue';
    context.fillText (`${y}`, pL, y);
  }
  context.stroke ();
};

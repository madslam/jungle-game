export const drawGrid = (context, width, height) => {
  let s = 30;
  let pL = s;
  let pT = s;
  let pR = s;
  let pB = s;

  context.strokeStyle = 'lightgrey';
  context.beginPath ();
  for (var x = pL; x <= width - pR; x += s) {
    context.moveTo (x, pT);
    context.lineTo (x, height - pB);
  }
  for (var y = pT; y <= height - pB; y += s) {
    context.moveTo (pL, y);
    context.lineTo (width - pR, y);
  }
  context.stroke ();
};

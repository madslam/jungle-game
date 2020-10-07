export const drawCircularAnimation = (
  angleX,
  angleY,
  angleT,
  angleI,
  context
) => {
  context.clearRect (0, 0, 900, 900);
  let newX = angleX + 0.01;
  let newY = angleY + 0.01;
  let newT = angleT + 0.01;
  let newI = angleI + 0.01;
  if (newX >= 6.30) {
    newX = 0;
  }
  if (newY >= 6.30) {
    newY = 0;
  }
  if (newT >= 6.30) {
    newT = 0;
  }
  if (newI >= 6.30) {
    newI = 0;
  }

  context.strokeStyle = 'red';
  context.lineWidth = 2;
  context.beginPath ();
  context.arc (450, 450, 100, newT, newI, true);
  context.stroke ();
  context.beginPath ();
  context.fillStroke = 'red';
  context.arc (450, 450, 100, newX, newY, false);
  context.stroke ();

  requestAnimationFrame (() =>
    drawCircularAnimation (newX, newY, newT, newI, context)
  );
};

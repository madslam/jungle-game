export const drawCircularAnimation = (context, speed, timer) => {
  timer += speed;
  context.save ();

  context.clearRect (0, 0, 900, 900);
  context.translate (900 / 2, 900 / 2);
  context.rotate (timer);

  context.save ();
  context.beginPath ();
  context.arc (50, 50, 8, 0, Math.PI * 2, false);
  context.arc (-50, -50, 8, 0, Math.PI * 2, false);

  context.fillStyle = 'white';
  context.fill ();
  context.closePath ();
  context.restore ();

  context.restore ();

  requestAnimationFrame (() => drawCircularAnimation (context, speed, timer));
};

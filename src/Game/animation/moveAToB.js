export const easeOutBounce = (t, b, c, d) => {
  if ((t /= d) < 1 / 2.75) {
    return c * (7.5625 * t * t) + b;
  } else if (t < 2 / 2.75) {
    return c * (7.5625 * (t -= 1.5 / 2.75) * t + 0.75) + b;
  } else if (t < 2.5 / 2.75) {
    return c * (7.5625 * (t -= 2.25 / 2.75) * t + 0.9375) + b;
  } else {
    return c * (7.5625 * (t -= 2.625 / 2.75) * t + 0.984375) + b;
  }
};
var animationLength = 500;
export const objectReturn = (time, object, basePosition) => {
  time = time + 2;

  let elapsed = time;
  if (elapsed > animationLength) {
    elapsed = animationLength;
  }

  var x = easeOutBounce (
    elapsed,
    object.position.x,
    basePosition.x - object.position.x,
    animationLength
  );
  var y = easeOutBounce (
    elapsed,
    object.position.y,
    basePosition.y - object.position.y,
    animationLength
  );

  const objectPosition = {
    x: x * 100 / 100,
    y: y * 100 / 100,
  };
  object.position = objectPosition;

  const size = Math.sqrt (
    Math.pow (object.position.x - basePosition.x, 2) +
      Math.pow (object.position.y - basePosition.y, 2)
  );

  if (size < 0.5) {
    time = 0;
  }
  return time;
};

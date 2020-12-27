export const GAME_WIDTH = 1000;

export const GAME_HEIGHT = 900;

export const FRAMES_PER_SECOND = 30; // Valid values are 60,30,20,15,10...
// set the mim time to render the next frame
export const FRAME_MIN_TIME =
  1000 / 60 * (60 / FRAMES_PER_SECOND) - 1000 / 60 * 0.5;
function rotate (x, y, angle) {
  const cx = GAME_WIDTH / 2;
  const cy = GAME_HEIGHT / 2;
  var radians = Math.PI / 180 * angle;
  const cos = Math.cos (radians);
  const sin = Math.sin (radians);
  const newX = cos * (x - cx) + sin * (y - cy) + cx;
  const newY = cos * (y - cy) - sin * (x - cx) + cy;
  return {x: Math.round (newX), y: Math.round (newY)};
}
export const updatePosition = (player, position) => {
  const {angle} = player;
  const {x, y} = rotate (position.x, position.y, 360 - angle);
  return {
    x: Math.round (x),
    y: Math.round (y),
  };
};

export const updateMousePosition = (player, position) => {
  const {angle} = player;
  const {x, y} = rotate (position.x, position.y, angle - 360);
  return {
    x: Math.round (x),
    y: Math.round (y),
  };
};

export const checkCollision = (obj1, obj2) => {
  var vx = obj1.position.x - obj2.position.x;
  var vy = obj1.position.y - obj2.position.y;
  var length = Math.sqrt (vx * vx + vy * vy);

  if (length < obj1.radius + obj2.radius) {
    return true;
  }
  return false;
};

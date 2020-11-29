export const GAME_WIDTH = 1000;

export const GAME_HEIGHT = 900;

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
    x,
    y,
  };
};

export const updateMousePosition = (player, position) => {
  const {angle} = player;
  const {x, y} = rotate (position.x, position.y, angle - 360);
  return {
    x,
    y,
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

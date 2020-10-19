export const GAME_WIDTH = 900;

export const GAME_HEIGHT = 900;

export const updatePosition = (player, position) => {
  if (player.type === 2) {
    return {
      x: GAME_WIDTH - position.x,
      y: GAME_HEIGHT - position.y,
    };
  }
  if (player.type === 3) {
    return {
      x: GAME_HEIGHT - position.y,
      y: GAME_WIDTH - position.x,
    };
  }
  if (player.type === 4) {
    return {
      x: position.y,
      y: position.x,
    };
  }
  return position;
};

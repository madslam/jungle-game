export const drawFallAnimation = (x, y, newY, context) => {
  context.fillStyle = 'red';
  context.font = '20px Comic Sans MS';

  context.fillText ('+5', x, newY);
};

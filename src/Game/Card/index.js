import {GAME_HEIGHT, GAME_WIDTH} from '../utils';
import {CARD_COLOR} from '../colors';

CanvasRenderingContext2D.prototype.roundRect2 = function (
  posx,
  posy,
  width,
  height,
  radius
) {
  const x = posx - width / 2;
  const y = posy - height / 2;
  if (width < 2 * radius) radius = width / 2;
  if (height < 2 * radius) radius = height / 2;
  radius = radius < 1 ? 1 : radius;

  this.save ();
  this.beginPath ();
  this.moveTo (x + radius, y);
  this.arcTo (x + width, y, x + width, y + height, radius);
  this.arcTo (x + width, y + height, x, y + height, radius);
  this.arcTo (x, y + height, x, y, radius);
  this.arcTo (x, y, x + width, y, radius);
  this.closePath ();
  this.stroke ();
  this.restore ();
  return this;
};
// Load images
export function loadImages () {
  // Initialize variables
  let loadcount = 0;
  const loadtotal = 11;
  let preloaded = false;
  // Load the images
  var loadedimages = {};

  for (var i = 1; i < 11; i++) {
    // Create the image object
    var image = new Image ();

    // Add onload event handler
    // eslint-disable-next-line no-loop-func
    image.onload = function () {
      loadcount++;
      if (loadcount === loadtotal) {
        // Done loading
        preloaded = true;
      }
    };

    // Set the source url of the image
    image.src = process.env.PUBLIC_URL + `/img/card-${i}.png`;

    // Save to the image array
    if (!loadedimages['card-' + i]) {
      loadedimages['card-' + i] = image;
      //  console.log ('oui', loadedimages['card-' + i]);
    }
  }

  // Return an array of images
  return loadedimages;
}
export default class Card {
  constructor({
    position,
    move,
    value,
    show,
    rotation,
    skinCard,
    image,
    rotationAuto = true,
  }) {
    this.position = position;
    this.move = move;
    this.show = show;
    this.radius = 80;
    this.value = value;
    this.image = image;
    this.rotation = rotation;
    this.rotationAuto = rotationAuto;
    this.skinCard = skinCard;
    this.translation = 4;
    this.height = 100;
    this.flip = false;
    this.time = 0;
    this.animation = false;
    this.shadowOffsetX = 20;
    this.shadowOffsetY = 20;
    this.shadowBlur = 20;
  }
  flipAnimation () {
    if (this.height < 0) {
      this.show = !this.show;
      this.height = 1;
      this.translation = this.translation * -1;
    }
    const newHeight = this.height - this.translation;
    if (newHeight > 100) {
      this.height = 100;
      this.translation = this.translation * -1;
      this.flip = false;

      return null;
    } else {
      this.height = newHeight;
    }
  }
  render (state, context) {
    if (this.position) {
      context.save ();

      //context.lineheight = 1;

      context.font = '20px Comic Sans MS';
      context.textAlign = 'center';

      context.beginPath ();
      context.strokeStyle = '#1b1b21';

      context.lineWidth = '3';
      context.fillStyle = CARD_COLOR;

      context.translate (this.position.x, this.position.y);

      if (this.rotationAuto) {
        // angle in degrees
        var angleDeg =
          Math.atan2 (
            GAME_HEIGHT / 2 - this.position.y,
            GAME_WIDTH / 2 - this.position.x
          ) *
          180 /
          Math.PI;
        context.rotate ((angleDeg + this.rotation + 90) * Math.PI / 180);
      } else {
        context.rotate (this.rotation * Math.PI / 180);
      }
      //  context.arc (0, 0, this.radius, 0, 2 * Math.PI);
      context.roundRect2 (0, 0, 100, this.height, 5);
      context.save ();
      if (this.move) {
        context.shadowColor = 'black';
        context.shadowBlur = this.shadowBlur;
        context.shadowOffsetX = this.shadowOffsetX;
        context.shadowOffsetY = this.shadowOffsetY;
      }
      context.fill ();
      context.restore ();
      context.stroke ();

      context.fillStyle = 'white';
      if (this.show) {
        // context.fillText (`${this.value}`, 0, 0);

        if (this.image) {
          context.drawImage (
            this.image,
            -50,
            0 - this.height / 2,
            100,
            this.height
          );
        }
      } else {
        if (this.skinCard) {
          const img = new Image ();

          img.src =
            process.env.PUBLIC_URL + `/img/front-cards/${this.skinCard}.png`;

          context.drawImage (img, -50, 0 - this.height / 2, 100, this.height);
        } else {
          context.font = '20px Balsamiq Sans';
          context.textAlign = 'center';
          context.fillStyle = 'white';
          context.fillText ('Drag', 0, 0);
          context.fillText ('Me', 0, 15);
        }
      }
      context.restore ();
    }
  }
}

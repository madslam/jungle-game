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
  const loadtotal = 10;
  let preloaded = false;
  // Load the images
  var loadedimages = [];
  var image = new Image ();

  // Set the source url of the image
  image.src = process.env.PUBLIC_URL + `/img/front-cards/pokemon.png`;

  // Save to the image array
  loadedimages[i] = image;

  for (var i = 1; i < 10; i++) {
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
    loadedimages[i] = image;
  }

  // Return an array of images
  return loadedimages;
}
export default class Card {
  constructor({position, move, value, show, rotation, skinCard}) {
    this.position = position;
    this.move = move;
    this.show = show;
    this.radius = 80;
    this.intervalId = () => null;
    this.value = value;
    this.rotation = rotation;
    this.skinCard = skinCard;
    this.translation = 4;
    this.height = 100;
    this.flip = false;
    this.time = 0;
    this.animation = false;
  }
  flipAnimation () {
    if (this.height < 0) {
      this.show = !this.show;
      this.height = 1;
      this.translation = this.translation * -1;
      console.log ('on resoip');
    }
    const newHeight = this.height - this.translation;
    console.log ('lol', this.translation, newHeight);
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
      context.strokeStyle = 'white';

      context.fillStyle = 'black';

      context.translate (this.position.x, this.position.y);
      context.rotate (this.rotation * Math.PI / 180);
      context.roundRect2 (0, 0, 100, this.height, 10);

      context.fill ();
      context.stroke ();

      context.fillStyle = 'white';
      if (this.show) {
        //  context.fillText (`${this.value}`, 0, 0);
        const img = new Image ();

        img.src = process.env.PUBLIC_URL + `/img/card-${this.value}.png`;

        context.drawImage (img, -50, 0 - this.height / 2, 100, this.height);
      } else {
        if (this.skinCard) {
          const img = new Image ();

          img.src =
            process.env.PUBLIC_URL + `/img/front-cards/${this.skinCard}.png`;

          context.drawImage (img, -50, 0 - this.height / 2, 100, this.height);
        }
      }
      context.restore ();
    }
  }
}

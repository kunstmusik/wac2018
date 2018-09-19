let csoundObj;
let btn = document.querySelector("#start");
let canvas = document.querySelector("#touch");
let ctx = canvas.getContext('2d', {alpha:false});

let w,h, bgGradient;

function updateCanvasSize() {
  w = window.innerWidth;
  h = window.innerHeight;
  canvas.width = w;
  canvas.height = h;
  imageData = ctx.createImageData(w,h);
  data = imageData.data;
  bgGradient = ctx.createLinearGradient(w/2, 0, w/2, h);
  bgGradient.addColorStop(0, '#003')
  bgGradient.addColorStop(1, '#000')

  console.log(`width: ${w} height: ${h}`)
}
updateCanvasSize();
window.addEventListener('resize',  updateCanvasSize);

let particles = []

let Particle = (x, y, delay) => {
  let gradient = ctx.createRadialGradient(x, y, 2, x, y, 10);
  gradient.addColorStop(0, 'aliceblue');
  gradient.addColorStop(1, '#0000');

  return {
    x, y, delay, counter: Math.floor(2 * 30), gradient,
    draw(ctx) {
      if(this.delay < 0) {
        ctx.fillStyle = this.gradient;
        ctx.beginPath();
        ctx.arc(this.x,this.y, 8 * this.counter / 240 ,  0, Math.PI * 2);
        ctx.fill();
      }
    },
    update() {
      if(this.delay > 0) {
        this.delay -= 1;
      } else {
        this.counter -= 1;
      }
    }

  }
};


function handleClick() {
  for(let i = 0; i < 10; i++) {

    let freq = Math.random();
    let py = h - freq * h;
    freq *= 1000 + 50;
    let amp = Math.random();
    let px = w * amp; 
    amp = Math.pow(amp, 4) * 0.25;
    let start = Math.random() * 2;
    csoundObj.readScore(`i "Syn" ${start} 0.1 ${freq} ${amp}`);

    particles.push(Particle(px, py, start * 30));

  }
}


function main() {
  btn.parentNode.removeChild(btn);
  csoundObj.enableAudioInput((success) => {


    csoundObj.setOption("-iadc");
    csoundObj.compileCSD(TEST_CSD);
    csoundObj.start();

    canvas.addEventListener("click", handleClick);

  });

}


function draw() {
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0,0,w,h);

  for(let i = particles.length -1; i >= 0; i--) {
    let p = particles[i];
    p.draw(ctx);
    p.update();
    if(p.counter <= 0) {
      particles.splice(i, 1);
    }
  }
}

let counter = 0;
function animate(t) {
  if((counter % 2) == 0) {
    draw();
  }
  counter += 1;
  requestAnimationFrame(animate);
}

requestAnimationFrame(animate);


CsoundObj.importScripts("./csound/").then(() => {
  csoundObj = new CsoundObj();

  btn.disabled = false; 
  btn.addEventListener("click", () => main());

});


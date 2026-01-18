document.addEventListener('DOMContentLoaded', ()=>{
  const cols = 12;
  const rows = 8;
  const rectW = 500;
  const rectH = 500;

  // root container
  const root = document.createElement('div');
  root.className = 'mosaic-root';
  root.style.width = rectW + 'px';
  root.style.height = rectH + 'px';
  document.body.appendChild(root);

  // full rectangle (final object) - hidden until tiles assemble
  const full = document.createElement('div');
  full.className = 'mosaic-rect';
  root.appendChild(full);

  // tiles layer
  const tilesLayer = document.createElement('div');
  tilesLayer.className = 'mosaic-tiles';
  tilesLayer.style.position = 'absolute';
  tilesLayer.style.left = '0';
  tilesLayer.style.top = '0';
  tilesLayer.style.width = rectW + 'px';
  tilesLayer.style.height = rectH + 'px';
  tilesLayer.style.pointerEvents = 'none';
  root.appendChild(tilesLayer);

  // tile sizes
  const tileW = rectW / cols;
  const tileH = rectH / rows;

  // set full rect style explicitly so backgrounds align
  full.style.width = rectW + 'px';
  full.style.height = rectH + 'px';
  // ensure a consistent gradient image available to copy
  full.style.background = getComputedStyle(document.documentElement).getPropertyValue('--mosaic-bg') || 'linear-gradient(135deg,#131212,#302e2e6c,#180000)';
  full.style.backgroundSize = `${rectW}px ${rectH}px`;

  const tiles = [];

  // helper: random between
  const rand = (a,b)=> Math.random()*(b-a)+a;

  for(let r=0;r<rows;r++){
    for(let c=0;c<cols;c++){
      const finalLeft = Math.round(c * tileW);
      const finalTop = Math.round(r * tileH);
      const t = document.createElement('div');
      t.className = 'mosaic-tile';
      t.style.width = Math.ceil(tileW) + 'px';
      t.style.height = Math.ceil(tileH) + 'px';

      // scatter start: random offset around (so pieces come from different places)
      const offsetX = Math.round(rand(-800,800));
      const offsetY = Math.round(rand(-600,600));
      const startLeft = finalLeft + offsetX;
      const startTop = finalTop + offsetY;

      // initial placement (scattered)
      t.style.left = startLeft + 'px';
      t.style.top = startTop + 'px';

      // background slice so the gradient looks continuous when assembled
      t.style.background = full.style.background;
      t.style.backgroundSize = `${rectW}px ${rectH}px`;
      t.style.backgroundPosition = `-${finalLeft}px -${finalTop}px`;

      // random initial small scale and rotation
      const rot = rand(-45,45);
      t.style.transform = `scale(${rand(0.08,0.22)}) rotate(${rot}deg)`;
      t.style.opacity = '0';

      tilesLayer.appendChild(t);
      tiles.push({el:t, finalLeft, finalTop, r, c});
    }
  }

  // shuffle tiles for random reveal order
  for(let i = tiles.length -1; i>0; i--){
    const j = Math.floor(Math.random()*(i+1));
    [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
  }

  // reveal: animate tiles from scattered positions into their final grid positions
  function revealAndAssemble(){
    tiles.forEach((tile, idx)=>{
      // randomized stagger
      const delay = Math.floor(idx * 18 + Math.random()*220);
      setTimeout(()=>{
        // move to final position, remove rotation and scale to 1
        tile.el.style.left = tile.finalLeft + 'px';
        tile.el.style.top = tile.finalTop + 'px';
        tile.el.style.transform = 'scale(1) rotate(0deg)';
        tile.el.style.opacity = '1';
      }, delay);
    });

    // when all tiles should have finished moving, remove them and reveal full rect
    const maxDelay = tiles.length * 18 + 600;
    setTimeout(()=>{
      // small fade to full: remove tiles and show full rect
      tilesLayer.remove();
      full.classList.add('visible');
    }, maxDelay);
  }

  // start sequence a bit after load
  setTimeout(()=>{
    revealAndAssemble();
  }, 120);

});

// Initialize particles.js for animated background network
if(typeof particlesJS !== 'undefined'){
  particlesJS('particles-js', {
    particles: {
      number: {
        value: 80,
        density: { enable: true, value_area: 800 }
      },
      color: { value: '#ff9966' },
      shape: { type: 'circle' },
      opacity: {
        value: 0.5,
        random: true,
        anim: { enable: true, speed: 1, opacity_min: 0.1, sync: false }
      },
      size: {
        value: 3,
        random: true,
        anim: { enable: false, speed: 40, size_min: 0.1, sync: false }
      },
      line_linked: {
        enable: true,
        distance: 150,
        color: '#dd6644',
        opacity: 0.4,
        width: 1.5,
        condensed_mode: { enable: true, rotated: true }
      },
      move: {
        enable: true,
        speed: 2,
        direction: 'none',
        random: false,
        straight: false,
        out_mode: 'out',
        bounce: false,
        attract: { enable: false, rotateX: 600, rotateY: 1200 }
      }
    },
    interactivity: {
      detect_on: 'canvas',
      events: {
        onhover: { enable: true, mode: 'grab' },
        onclick: { enable: true, mode: 'push' },
        resize: true
      },
      modes: {
        grab: { distance: 200, line_linked: { opacity: 0.7 } },
        bubble: { distance: 400, size: 40, duration: 2, opacity: 8, speed: 3 },
        repulse: { distance: 200, duration: 0.4 },
        push: { particles_nb: 4 },
        remove: { particles_nb: 2 }
      }
    },
    retina_detect: true
  });
}


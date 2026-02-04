document.addEventListener('DOMContentLoaded', ()=>{
  const cols = 12;
  const rows = 8;
  
  // Calculate responsive dimensions
  function getResponsiveDimensions() {
    // Get the computed style of the root element to get actual dimensions
    const root = document.querySelector('.mosaic-root');
    if (root) {
      const rect = root.getBoundingClientRect();
      return { width: rect.width, height: rect.height };
    }
    // Fallback calculation based on CSS
    const maxWidth = 600;
    const width = Math.min(window.innerWidth * 0.8, maxWidth);
    const height = width; // aspect-ratio: 1 / 1
    return { width, height };
  }

  // Get or create root container
  let root = document.querySelector('.mosaic-root');
  if (!root) {
    root = document.createElement('div');
    root.className = 'mosaic-root';
    document.body.appendChild(root);
  }

  // Create container for the mosaic
  let container = root.querySelector('.mosaic-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'mosaic-container';
    root.appendChild(container);
  }

  // Wait for CSS to be applied, then get actual dimensions
  setTimeout(() => {
    const { width: rectW, height: rectH } = getResponsiveDimensions();

    // full rectangle (final object) - hidden until tiles assemble
    const full = document.createElement('div');
    full.className = 'mosaic-rect';
    container.appendChild(full);

    // tiles layer
    const tilesLayer = document.createElement('div');
    tilesLayer.className = 'mosaic-tiles';
    tilesLayer.style.position = 'absolute';
    tilesLayer.style.left = '0';
    tilesLayer.style.top = '0';
    tilesLayer.style.width = rectW + 'px';
    tilesLayer.style.height = rectH + 'px';
    tilesLayer.style.pointerEvents = 'none';
    container.appendChild(tilesLayer);

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
        // Scale offsets based on screen size for better responsiveness
        const maxOffset = Math.max(rectW, rectH) * 1.5;
        const offsetX = Math.round(rand(-maxOffset, maxOffset));
        const offsetY = Math.round(rand(-maxOffset, maxOffset));
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
        
        // Add avatar frame after animation completes
        addAvatarFrame(full, rectW, rectH);
      }, maxDelay);
    }

    // start sequence a bit after load
    setTimeout(()=>{
      revealAndAssemble();
    }, 120);
  }, 50); // Small delay to ensure CSS is applied

  // Add avatar frame function
  function addAvatarFrame(container, rectW, rectH) {
    // Create avatar frame container
    const avatarFrame = document.createElement('div');
    avatarFrame.className = 'avatar-frame';

    // Create image element
    const avatarImg = document.createElement('img');
    avatarImg.src = 'assets/art_profile.jpg';
    avatarImg.alt = 'Profile Avatar';
    avatarImg.onerror = function() {
      // Fallback if image fails to load
      this.style.display = 'none';
      this.parentElement.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
      this.parentElement.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:white;font-weight:bold;font-size:24px;">A</div>';
    };

    avatarFrame.appendChild(avatarImg);
    container.appendChild(avatarFrame);

    // Add NFT sticker to mosaic container (outside avatar frame)
    addNFTSticker(container, avatarFrame);

    // Trigger animation
    setTimeout(() => {
      avatarFrame.classList.add('visible');
    }, 100);
  }

  // Function to update sticker position relative to avatar frame
  function updateStickerPosition(avatarFrame, stickerContainer) {
    // Get computed styles to get actual dimensions
    const avatarStyle = getComputedStyle(avatarFrame);
    const stickerStyle = getComputedStyle(stickerContainer);
    
    // Get actual dimensions
    const avatarWidth = parseFloat(avatarStyle.width);
    const avatarHeight = parseFloat(avatarStyle.height);
    const stickerWidth = parseFloat(stickerStyle.width);
    const stickerHeight = parseFloat(stickerStyle.height);
    
    // Calculate responsive offset based on avatar size
    // Use 5% of avatar size as offset, with minimum 5px and maximum 10px for closer positioning
    const minOffset = 5;
    const maxOffset = 10;
    const baseOffset = Math.min(avatarWidth, avatarHeight) * 0.05;
    const offset = Math.max(minOffset, Math.min(maxOffset, baseOffset));

    // Calculate position to place sticker outside the top-left corner
    const stickerTop = -offset;
    const stickerLeft = -offset;

    stickerContainer.style.top = stickerTop + 'px';
    stickerContainer.style.left = stickerLeft + 'px';
  }

  // Add NFT sticker function
  async function addNFTSticker(container, avatarFrame) {
    // Create container for Lottie animation
    const stickerContainer = document.createElement('div');
    stickerContainer.className = 'nft-sticker-container nft-sticker-top-left';
    stickerContainer.style.width = '60px';
    stickerContainer.style.height = '60px';
    stickerContainer.style.position = 'absolute';
    stickerContainer.style.zIndex = '999';
    stickerContainer.style.pointerEvents = 'none';
    stickerContainer.style.transform = 'rotate(-45deg)';

    // Add sticker to container but position it relative to avatar frame
    container.appendChild(stickerContainer);

    // Set initial position relative to avatar frame
    updateStickerPosition(avatarFrame, stickerContainer);

    // Load and play TGS animation
    try {
      const animationData = await loadTGSAnimation('assets/sticker.tgs');
      playLottieAnimation(stickerContainer, animationData);

      // Add hover effects
      avatarFrame.addEventListener('mouseenter', () => {
        stickerContainer.style.transform = 'scale(1.1)';
        // Update position when frame scales up
        setTimeout(() => {
          updateStickerPosition(avatarFrame, stickerContainer);
        }, 10);
      });

      avatarFrame.addEventListener('mouseleave', () => {
        stickerContainer.style.transform = 'scale(1)';
        // Update position when frame scales down
        setTimeout(() => {
          updateStickerPosition(avatarFrame, stickerContainer);
        }, 10);
      });
    } catch (error) {
      console.error('Error loading NFT sticker animation:', error);
      // Fallback to static image if animation fails
      const fallbackSticker = document.createElement('div');
      fallbackSticker.className = 'nft-sticker nft-sticker-top-right';
      fallbackSticker.style.backgroundImage = 'url("assets/sticker.tgs")';
      avatarFrame.appendChild(fallbackSticker);
    }
  }

  // Load TGS animation data
  async function loadTGSAnimation(filePath) {
    const response = await fetch(filePath);
    const buffer = await response.arrayBuffer();
    const inflated = pako.inflate(new Uint8Array(buffer), {
      to: 'string'
    });
    return JSON.parse(inflated);
  }

  // Play Lottie animation
  function playLottieAnimation(container, animationData) {
    lottie.loadAnimation({
      container: container,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      animationData: animationData
    });
  }

  // Handle window resize
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      // Recalculate dimensions and restart animation if needed
      const { width: rectW, height: rectH } = getResponsiveDimensions();
      // Update container size
      container.style.width = rectW + 'px';
      container.style.height = rectH + 'px';
      
      // Update sticker position for responsiveness
      const avatarFrame = container.querySelector('.avatar-frame');
      const stickerContainer = container.querySelector('.nft-sticker-container');
      if (avatarFrame && stickerContainer) {
        updateStickerPosition(avatarFrame, stickerContainer);
      }
    }, 100);
  });

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

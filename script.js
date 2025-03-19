// Welcome Modal Functions
function showWelcome() {
    const welcomeModal = document.getElementById('welcome-modal');
    welcomeModal.style.display = 'flex';
    
    // Button handler
    welcomeModal.querySelector('.explore-btn').onclick = function() {
      welcomeModal.style.display = 'none';
      // Start any interactions
    };
  }
  
  // Modified Celebration Modal Handler
  function showCongratulations() {
    const modal = document.getElementById('custom-modal');
    modal.style.display = 'flex';
  
    modal.querySelector('.yes-btn').onclick = function() {
      // Reset garden
      flowers.forEach(flower => {
        flower.bloomProgress = 0;
        flower.fullyBloomed = false;
        flower.hovered = false;
      });
      hoveredFlowers.clear();
      allFlowersBloomedCelebrated = false;
      
      // Hide modals and show welcome
      document.getElementById('celebration-overlay').style.display = 'none';
      modal.style.display = 'none';
      showWelcome();
    };
  
    modal.querySelector('.no-btn').onclick = function() {
      modal.style.display = 'none';
    };
  }

  // Check if any modal is open
  function isModalOpen() {
    return document.getElementById('welcome-modal').style.display === 'flex' || 
           document.getElementById('custom-modal').style.display === 'flex';
  }
  
    // Wait for all scripts to load before initializing
    window.onload = function() {
      showWelcome(); // Show welcome modal first
      // ===== THREE.JS BACKGROUND =====
      let scene, camera, renderer;
      let particles;
      
      function initThree() {
        // Create scene
        scene = new THREE.Scene();
        
        // Create camera
        camera = new THREE.PerspectiveCamera(
          75,
          window.innerWidth / window.innerHeight,
          0.1,
          1000
        );
        camera.position.z = 5;
        
        // Create renderer
        renderer = new THREE.WebGLRenderer({ alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(0x000000, 0);
        renderer.domElement.id = 'threeCanvas';
        document.body.appendChild(renderer.domElement);
        
        // Create particles
        const particleCount = 500;
        const particleGeometry = new THREE.BufferGeometry();
        const particlePositions = new Float32Array(particleCount * 3);
        const particleSizes = new Float32Array(particleCount);
        
        for (let i = 0; i < particleCount; i++) {
          // Position
          particlePositions[i * 3] = (Math.random() - 0.5) * 10;
          particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 10;
          particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 10;
          
          // Size
          particleSizes[i] = Math.random() * 0.05 + 0.01;
        }
        
        particleGeometry.setAttribute(
          "position",
          new THREE.BufferAttribute(particlePositions, 3)
        );
        particleGeometry.setAttribute(
          "size",
          new THREE.BufferAttribute(particleSizes, 1)
        );
        
        // Create particle material
        const particleMaterial = new THREE.PointsMaterial({
          color: 0xffffff,
          size: 0.1,
          transparent: true,
          opacity: 0.5,
          blending: THREE.AdditiveBlending,
          sizeAttenuation: true,
        });
        
        // Create particle system
        particles = new THREE.Points(particleGeometry, particleMaterial);
        scene.add(particles);
        
        // Animation loop
        function animate() {
          requestAnimationFrame(animate);
          
          // Rotate particles
          particles.rotation.x += 0.0003;
          particles.rotation.y += 0.0005;
          
          // Move particles
          const positions = particles.geometry.attributes.position.array;
          for (let i = 0; i < positions.length; i += 3) {
            positions[i + 1] += 0.001 * (Math.random() - 0.5);
            
            // Reset position if particle goes out of bounds
            if (positions[i + 1] > 5) positions[i + 1] = -5;
            if (positions[i + 1] < -5) positions[i + 1] = 5;
          }
          particles.geometry.attributes.position.needsUpdate = true;
          
          renderer.render(scene, camera);
        }
        
        animate();
        
        // Handle window resize
        window.addEventListener("resize", () => {
          camera.aspect = window.innerWidth / window.innerHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(window.innerWidth, window.innerHeight);
        });
      }
      
      // ===== P5.JS FLOWER GARDEN =====
      let sounds = [];
      let isPlaying = false;
      let flowers = [];
      let trees = [];
      let bees = [];
      let butterflies = [];
      let birds = [];
      let fishes = []; 
      let grassPatches = [];
      let allFlowersBloomedCelebrated = false;
      let hoveredFlowers = new Set();
      let isMobile = false;
      
      // Define flower colors (16 different colors)
      const flowerColors = [
        { r: 255, g: 100, b: 100 },  // Red
        { r: 255, g: 150, b: 50 },   // Orange
        { r: 255, g: 255, b: 50 },   // Yellow
        { r: 150, g: 255, b: 50 },   // Lime
        { r: 50, g: 255, b: 50 },    // Green
        { r: 50, g: 255, b: 150 },   // Mint
        { r: 50, g: 255, b: 255 },   // Cyan
        { r: 50, g: 150, b: 255 },   // Light Blue
        { r: 50, g: 50, b: 255 },    // Blue
        { r: 150, g: 50, b: 255 },   // Purple
        { r: 255, g: 50, b: 255 },   // Magenta
        { r: 255, g: 50, b: 150 },   // Pink
        { r: 200, g: 180, b: 255 },  // Lilac
        { r: 255, g: 127, b: 80 },   // Coral
        { r: 255, g: 218, b: 185 },  // Peach
        { r: 152, g: 251, b: 152 }   // Pale Green
      ];
      
      // Bird colors
      const birdColors = [
        { body: '#E63946', wing: '#F1FAEE' },  // Red/White
        { body: '#457B9D', wing: '#A8DADC' },  // Blue/Light Blue
        { body: '#FFB703', wing: '#FB8500' },  // Yellow/Orange
        { body: '#2A9D8F', wing: '#E9C46A' },  // Teal/Yellow
        { body: '#9B5DE5', wing: '#F15BB5' }   // Purple/Pink
      ];
      
      // Fish colors
      const fishColors = [
        { body: '#4CC9F0', fins: '#F72585' },  // Blue/Pink
        { body: '#7209B7', fins: '#F8F9FA' },  // Purple/White
        { body: '#FF9E00', fins: '#3A86FF' },  // Orange/Blue
        { body: '#06D6A0', fins: '#EF476F' },  // Teal/Red
        { body: '#118AB2', fins: '#FFD166' }   // Blue/Yellow
      ];
      
      // P5.js sketch
      new p5((p) => {
        // Check if device is mobile
        function checkMobile() {
          isMobile = p.windowWidth <= 768;
          return isMobile;
        }

        // Preload sounds
        p.preload = function() {
          // Create placeholder sounds (you can replace these with actual sound files)
          for (let i = 0; i < 3; i++) {
            sounds.push(new p5.Oscillator('sine'));
            sounds[i].freq(220 * (i + 1));
            sounds[i].amp(0);
          }
        };
        
        // Setup function
        p.setup = function() {
          // Adjust canvas to account for header and footer
          let canvas = p.createCanvas(p.windowWidth, p.windowHeight);
          canvas.id('p5Canvas');
          
          // Check if mobile
          checkMobile();
          
          // Create 16 flowers with fixed positions
          createFlowers();
          
          // Create 3 trees positioned for visibility
          createTrees();
          
          // Create honeybees
          const beeCount = isMobile ? 3 : 5;
          for (let i = 0; i < beeCount; i++) {
            bees.push({
              x: p.random(p.width),
              y: p.random(p.height),
              size: p.random(isMobile ? 12 : 20, isMobile ? 18 : 25),
              speed: p.random(1, 3),
              angle: p.random(0, p.TWO_PI),
              wingAngle: 0,
              wingSpeed: p.random(0.2, 0.3),
              targetFlower: null,
              state: 'searching', // searching, approaching, visiting, leaving
              visitTimer: 0,
              visitDuration: p.random(100, 200)
            });
          }
          
          // Create butterflies (more of them)
          const butterflyCount = isMobile ? 6 : 10;
          for (let i = 0; i < butterflyCount; i++) {
            butterflies.push({
              x: p.random(p.width),
              y: p.random(p.height),
              size: p.random(isMobile ? 15 : 20, isMobile ? 25 : 35),
              speed: p.random(0.8, 2),
              angle: p.random(0, p.TWO_PI),
              wingAngle: 0,
              wingSpeed: p.random(0.1, 0.2),
              color: flowerColors[Math.floor(p.random(flowerColors.length))],
              turnChance: 0.02,
              turnAmount: p.random(0.1, 0.3)
            });
          }
          
          // Create birds
          const birdCount = isMobile ? 3 : 5;
          for (let i = 0; i < birdCount; i++) {
            const colorIndex = Math.floor(p.random(birdColors.length));
            birds.push({
              x: p.random(p.width),
              y: p.random(p.height * 0.3), // Birds fly higher
              size: p.random(isMobile ? 20 : 30, isMobile ? 30 : 45),
              speed: p.random(1.5, 3),
              angle: p.random(0, p.TWO_PI),
              wingAngle: 0,
              wingSpeed: p.random(0.15, 0.25),
              color: birdColors[colorIndex],
              turnChance: 0.01,
              turnAmount: p.random(0.05, 0.15),
              soarTimer: 0,
              soarDuration: p.random(100, 300),
              soaring: false
            });
          }
          
          // Create flying fish
          const fishCount = 5; // 3-5 fish as requested
          for (let i = 0; i < fishCount; i++) {
            const colorIndex = Math.floor(p.random(fishColors.length));
            fishes.push({
              x: p.random(p.width),
              y: p.random(p.height * 0.4, p.height * 0.7), // Fish fly in the middle area
              size: p.random(isMobile ? 25 : 35, isMobile ? 40 : 55),
              speed: p.random(1.2, 2.5),
              angle: p.random(0, p.TWO_PI),
              finAngle: 0,
              finSpeed: p.random(0.2, 0.3),
              color: fishColors[colorIndex],
              turnChance: 0.03,
              turnAmount: p.random(0.1, 0.2),
              jumpTimer: 0,
              jumpDuration: p.random(50, 150),
              jumping: false,
              jumpHeight: 0,
              maxJumpHeight: p.random(30, 80),
              bubbles: []
            });
          }
          
          // Create grass patches
          const grassPatchCount = isMobile ? 10 : 20;
          for (let i = 0; i < grassPatchCount; i++) {
            grassPatches.push({
              x: p.random(p.width),
              y: p.random(p.height),
              width: p.random(isMobile ? 80 : 100, isMobile ? 150 : 200),
              height: p.random(isMobile ? 20 : 30, isMobile ? 40 : 50),
              bladeCount: p.floor(p.random(isMobile ? 15 : 20, isMobile ? 25 : 40)),
              blades: []
            });
            
            // Create individual grass blades for each patch
            const patch = grassPatches[i];
            for (let j = 0; j < patch.bladeCount; j++) {
              patch.blades.push({
                x: p.random(-patch.width/2, patch.width/2),
                height: p.random(15, 30),
                width: p.random(2, 4),
                swayAmount: p.random(0.05, 0.1),
                swaySpeed: p.random(0.02, 0.04),
                swayOffset: p.random(0, p.TWO_PI)
              });
            }
          }
        };
        
        // Create flowers with fixed positions
        function createFlowers() {
          flowers = [];
          
          // Calculate grid dimensions
          const cols = 4;
          const rows = 4;
          
          // Calculate cell size with margins
          const marginPercent = 0.15; // 15% margin
          const cellWidth = p.width / cols;
          const cellHeight = p.height / rows;
          
          // Calculate usable area within each cell
          const usableWidth = cellWidth * (1 - marginPercent * 2);
          const usableHeight = cellHeight * (1 - marginPercent * 2);
          
          // Calculate starting position (with margin)
          const startX = cellWidth * marginPercent;
          const startY = cellHeight * marginPercent;
          
          // Adjust for header
          const headerOffset = 60; // Approximate header height
          
          for (let i = 0; i < 16; i++) {
            const col = i % cols;
            const row = Math.floor(i / cols);
            
            // Calculate center position of this cell
            const centerX = startX + col * cellWidth + usableWidth / 2;
            const centerY = startY + row * cellHeight + usableHeight / 2 + headerOffset;
            
            // Create flower with larger size
            const baseSize = isMobile ? 80 : 150; // Bigger flowers
            flowers.push({
              x: centerX,
              y: centerY,
              size: p.random(baseSize * 0.8, baseSize * 1.2),
              color: flowerColors[i % flowerColors.length],
              bloomProgress: 0,
              bloomSpeed: p.random(0.003, 0.007), // 3x slower blooming (was 0.01-0.02)
              hovered: false,
              fullyBloomed: false,
              id: i
            });
          }
        }
        
        // Create trees positioned for visibility with more intricate design and 150% larger
        function createTrees() {
          trees = [];
          
          // Fixed positions for trees that will always be visible
          // Positioned to avoid overlapping with flowers
          // Adjust for header
          const headerOffset = 60; // Approximate header height
          
          const treePositions = [
            { x: p.width * 0.25, y: p.height * 0.5 + headerOffset/2 },  // Top left
            { x: p.width * 0.75, y: p.height * 0.65 + headerOffset/2 },  // Top right
            { x: p.width * 0.5, y: p.height * 0.85 }    // Bottom center
          ];
          
          const treeTypes = ['round', 'triangular', 'oval'];
          
          for (let i = 0; i < 3; i++) {
            // Scale tree size based on screen dimensions to ensure visibility
            // Increased by 150% as requested
            const minDimension = Math.min(p.width, p.height);
            const treeSize = minDimension * (isMobile ? 0.75 : 0.30); // 150% larger
            
            trees.push({
              x: treePositions[i].x,
              y: treePositions[i].y,
              type: treeTypes[i],
              size: p.random(treeSize * 0.9, treeSize * 1.1),
              trunkHeight: treeSize * 0.6,
              trunkWidth: treeSize * 0.12,
              leafColor: { 
                r: p.random(30, 100), 
                g: p.random(100, 200), 
                b: p.random(30, 100) 
              },
              barkColor: {
                r: p.random(80, 120),
                g: p.random(50, 80),
                b: p.random(20, 40)
              },
              swayAmount: p.random(0.01, 0.03),
              swaySpeed: p.random(0.005, 0.01),
              swayOffset: p.random(0, p.TWO_PI),
              leafMovement: 0,

              branchCount: p.floor(p.random(3, 6)),
              branches: [],
              leafClusters: p.floor(p.random(5, 10)),
              barkTexture: p.floor(p.random(5, 10)),
              hasFruits: p.random() > 0.5,
              fruitColor: {
                r: p.random(200, 255),
                g: p.random(50, 150),
                b: p.random(50, 150)
              },
              fruitCount: p.floor(p.random(3, 8))
            });
            
            // Generate branches for each tree
            const tree = trees[i];
            for (let j = 0; j < tree.branchCount; j++) {
              tree.branches.push({
                angle: p.random(-p.PI/4, p.PI/4) + (j * p.TWO_PI / tree.branchCount),
                length: p.random(tree.size * 0.3, tree.size * 0.5),
                width: p.random(tree.trunkWidth * 0.3, tree.trunkWidth * 0.5),
                startHeight: p.random(0.2, 0.8) * tree.trunkHeight,
                hasLeaves: p.random() > 0.3
              });
            }
          }
        }
        
        // Draw function
        p.draw = function() {
          p.clear();
          
          // Draw grass patches
          drawGrass();
          
          // Draw trees
          trees.forEach(tree => {
            drawTree(tree);
          });
          
          // Draw and update all flowers
          flowers.forEach((flower, index) => {
            // If flower has been hovered, make it fully bloom
            // Only allow interaction if no modal is open
            if (flower.hovered && !flower.fullyBloomed && !isModalOpen()) {
              flower.bloomProgress += flower.bloomSpeed;
              if (flower.bloomProgress >= 1) {
                flower.bloomProgress = 1;
                flower.fullyBloomed = true;
                hoveredFlowers.add(flower.id);
              }
            }
            
            // Draw flower
            drawFlower(flower);
          });
          
          // Draw and update birds
          birds.forEach(bird => {
            updateBird(bird);
            drawBird(bird);
          });
          
          // Draw and update butterflies
          butterflies.forEach(butterfly => {
            updateButterfly(butterfly);
            drawButterfly(butterfly);
          });
          
          // Draw and update bees
          bees.forEach(bee => {
            updateBee(bee);
            drawBee(bee);
          });
          
          // Draw and update flying fish
          fishes.forEach(fish => {
            updateFish(fish);
            drawFish(fish);
          });
          
          // Check if all flowers have bloomed
          if (hoveredFlowers.size === flowers.length && !allFlowersBloomedCelebrated) {
            celebrateAllFlowersBloom();
            allFlowersBloomedCelebrated = true;
          }
        };
        
        // Draw grass patches
        function drawGrass() {
          grassPatches.forEach(patch => {
            p.push();
            p.translate(patch.x, patch.y);
            
            patch.blades.forEach(blade => {
              const swayAngle = Math.sin(p.frameCount * blade.swaySpeed + blade.swayOffset) * blade.swayAmount;
              
              p.push();
              p.translate(blade.x, 0);
              p.rotate(swayAngle);
              
              // Draw grass blade
              p.noStroke();
              p.fill(30, 150, 50);
              p.beginShape();
              p.vertex(-blade.width/2, 0);
              p.vertex(blade.width/2, 0);
              p.vertex(0, -blade.height);
              p.endShape(p.CLOSE);
              
              p.pop();
            });
            
            p.pop();
          });
        }
        
        // Draw a tree with more intricate details
        function drawTree(tree) {
          p.push();
          p.translate(tree.x, tree.y);
          
          // Update leaf movement
          tree.leafMovement = Math.sin(p.frameCount * tree.swaySpeed + tree.swayOffset) * tree.swayAmount;
          
          // Draw trunk with texture
          p.fill(tree.barkColor.r, tree.barkColor.g, tree.barkColor.b);
          p.noStroke();
          
          // Draw trunk with texture
          p.rect(-tree.trunkWidth/2, -tree.trunkHeight, tree.trunkWidth, tree.trunkHeight);
          
          // Add bark texture
          p.fill(tree.barkColor.r - 20, tree.barkColor.g - 20, tree.barkColor.b - 10);
          for (let i = 0; i < tree.barkTexture; i++) {
            const barkX = p.random(-tree.trunkWidth/2, tree.trunkWidth/2);
            const barkY = p.random(-tree.trunkHeight, 0);
            const barkW = p.random(2, 5);
            const barkH = p.random(5, 15);
            p.rect(barkX, barkY, barkW, barkH);
          }
          
          // Draw branches
          tree.branches.forEach(branch => {
            p.push();
            p.translate(0, -branch.startHeight);
            p.rotate(branch.angle);
            
            // Draw branch
            p.fill(tree.barkColor.r, tree.barkColor.g, tree.barkColor.b);
            p.rect(-branch.width/2, 0, branch.width, -branch.length);
            
            // Draw leaves on branch
            if (branch.hasLeaves) {
              p.push();
              p.translate(0, -branch.length);
              p.rotate(tree.leafMovement);
              p.fill(tree.leafColor.r, tree.leafColor.g, tree.leafColor.b);
              
              // Draw leaf cluster
              for (let i = 0; i < 5; i++) {
                const angle = (i / 4) * p.TWO_PI;
                const leafSize = tree.size * 0.1;
                p.push();
                p.rotate(angle);
                p.ellipse(leafSize/2, 0, leafSize, leafSize * 0.7);
                p.pop();
              }
              
              p.pop();
            }
            
            p.pop();
          });
          
          // Draw leaves based on tree type
          p.fill(tree.leafColor.r, tree.leafColor.g, tree.leafColor.b);
          
          p.push();
          p.rotate(tree.leafMovement);
          
          switch(tree.type) {
            case 'round':
              // More intricate round tree top
              for (let i = 0; i < tree.leafClusters; i++) {
                const angle = (i / tree.leafClusters) * p.TWO_PI;
                const distance = tree.size * 0.2 * p.random(0.2, 1);
                const leafSize = tree.size * 0.3 * p.random(0.8, 1.2);
                p.push();
                p.rotate(angle);
                p.translate(0, -tree.trunkHeight - distance);
                p.ellipse(0, 0, leafSize, leafSize);
                p.pop();
              }
              break;
              
            case 'triangular':
              // More intricate pine tree
              for (let i = 0; i < 5; i++) {
                const layerSize = tree.size * (1 - i * 0.15);
                const layerHeight = tree.trunkHeight + i * tree.size * 0.2;
                p.triangle(
                  -layerSize/2, -layerHeight,
                  layerSize/2, -layerHeight,
                  0, -layerHeight - layerSize * 0.4
                );
              }
              break;
              
            case 'oval':
              // More intricate oval tree top
              for (let i = 0; i < tree.leafClusters; i++) {
                const angle = (i / tree.leafClusters) * p.TWO_PI;
                const distance = tree.size * 0.3 * p.random(0.2, 1);
                const leafSizeX = tree.size * 0.25 * p.random(0.8, 1.2);
                const leafSizeY = tree.size * 0.4 * p.random(0.8, 1.2);
                p.push();
                p.rotate(angle);
                p.translate(0, -tree.trunkHeight - distance);
                p.ellipse(0, 0, leafSizeX, leafSizeY);
                p.pop();
              }
              break;
          }
          
          // Add fruits if the tree has them
          if (tree.hasFruits) {
            p.fill(tree.fruitColor.r, tree.fruitColor.g, tree.fruitColor.b);
            for (let i = 0; i < tree.fruitCount; i++) {
              const angle = (i / tree.fruitCount) * p.TWO_PI + p.random(-0.2, 0.2);
              const distance = tree.size * 0.3 * p.random(0.7, 0.9);
              const fruitSize = tree.size * 0.06;
              p.push();
              p.rotate(angle);
              p.translate(0, -tree.trunkHeight - distance);
              p.ellipse(0, 0, fruitSize, fruitSize);
              p.pop();
            }
          }
          
          p.pop();
          p.pop();
        }
        
        // Draw a flower (using the original design but with animation)
        function drawFlower(flower) {
          const { x, y, size, color, bloomProgress } = flower;
          
          // Calculate actual size based on bloom progress
          const actualSize = size * (0.2 + bloomProgress * 0.8);
          
          // Draw stem
          p.push();
          p.stroke(25, 100, 25);
          p.strokeWeight(actualSize / 15);
          p.line(x, y + actualSize / 2, x, y + actualSize);
          p.pop();
          
          // Draw flower
          p.push();
          p.fill(color.r, color.g, color.b);
          p.noStroke();
          
          // Draw petals
          const petalCount = 8;
          const petalSize = actualSize / 2;
          
          for (let i = 0; i < petalCount; i++) {
            const angle = (i / petalCount) * p.TWO_PI;
            const px = x + p.cos(angle) * petalSize * bloomProgress;
            const py = y + p.sin(angle) * petalSize * bloomProgress;
            p.ellipse(px, py, petalSize, petalSize);
          }
          
          // Draw center
          p.fill(255, 220, 220);
          p.ellipse(x, y, actualSize / 3, actualSize / 3);
          p.pop();
        }
        
        // Update bird behavior
        function updateBird(bird) {
          // Update wing animation
          bird.wingAngle += bird.wingSpeed;
          
          // Soaring behavior
          bird.soarTimer++;
          if (bird.soarTimer > bird.soarDuration) {
            bird.soaring = !bird.soaring;
            bird.soarTimer = 0;
            bird.soarDuration = p.random(100, 300);
          }
          
          // Random turns (less frequent when soaring)
          if (p.random() < (bird.soaring ? bird.turnChance * 0.5 : bird.turnChance)) {
            bird.angle += p.random(-bird.turnAmount, bird.turnAmount);
          }
          
          // Move bird (faster when not soaring)
          const currentSpeed = bird.soaring ? bird.speed * 0.5 : bird.speed;
          bird.x += Math.cos(bird.angle) * currentSpeed;
          bird.y += Math.sin(bird.angle) * (bird.soaring ? 0.1 : currentSpeed * 0.5);
          
          // Wrap around screen
          if (bird.x < -bird.size) bird.x = p.width + bird.size;
          if (bird.x > p.width + bird.size) bird.x = -bird.size;
          if (bird.y < -bird.size) bird.y = p.height + bird.size;
          if (bird.y > p.height + bird.size) bird.y = -bird.size;
        }
        
        // Draw a bird
        function drawBird(bird) {
          p.push();
          p.translate(bird.x, bird.y);
          p.rotate(bird.angle);
          
          // Wing flap animation (less when soaring)
          const wingFlapAmplitude = bird.soaring ? 0.2 : 0.5;
          const wingFlap = Math.sin(bird.wingAngle) * wingFlapAmplitude;
          
          // Body
          p.fill(bird.color.body);
          p.noStroke();
          p.ellipse(0, 0, bird.size * 0.8, bird.size * 0.4);
          
          // Tail
          p.triangle(
            -bird.size * 0.4, 0,
            -bird.size * 0.7, -bird.size * 0.15,
            -bird.size * 0.7, bird.size * 0.15
          );
          
          // Head
          p.ellipse(bird.size * 0.3, 0, bird.size * 0.25, bird.size * 0.25);
          
          // Beak
          p.fill('#FF9800');
          p.triangle(
            bird.size * 0.4, -bird.size * 0.02,
            bird.size * 0.4, bird.size * 0.02,
            bird.size * 0.55, 0
          );
          
          // Wings
          p.fill(bird.color.wing);
          
          // Left wing
          p.push();
          p.rotate(wingFlap - 0.2);
          p.ellipse(0, -bird.size * 0.2, bird.size * 0.6, bird.size * 0.2);
          p.pop();
          
          // Right wing
          p.push();
          p.rotate(-wingFlap + 0.2);
          p.ellipse(0, bird.size * 0.2, bird.size * 0.6, bird.size * 0.2);
          p.pop();
          
          // Eye
          p.fill(0);
          p.ellipse(bird.size * 0.35, -bird.size * 0.05, bird.size * 0.05, bird.size * 0.05);
          
          p.pop();
        }
        
        // Update butterfly behavior
        function updateButterfly(butterfly) {
          // Update wing animation
          butterfly.wingAngle += butterfly.wingSpeed;
          
          // Random turns
          if (p.random() < butterfly.turnChance) {
            butterfly.angle += p.random(-butterfly.turnAmount, butterfly.turnAmount);
          }
          
          // Move butterfly
          butterfly.x += Math.cos(butterfly.angle) * butterfly.speed;
          butterfly.y += Math.sin(butterfly.angle) * butterfly.speed;
          
          // Wrap around screen
          if (butterfly.x < -butterfly.size) butterfly.x = p.width + butterfly.size;
          if (butterfly.x > p.width + butterfly.size) butterfly.x = -butterfly.size;
          if (butterfly.y < -butterfly.size) butterfly.y = p.height + butterfly.size;
          if (butterfly.y > p.height + butterfly.size) butterfly.y = -butterfly.size;
        }
        
        // Draw a butterfly
        function drawButterfly(butterfly) {
          p.push();
          p.translate(butterfly.x, butterfly.y);
          p.rotate(butterfly.angle);
          
          // Wing flap animation
          const wingFlap = Math.sin(butterfly.wingAngle) * 0.5;
          
          // Draw wings
          p.fill(butterfly.color.r, butterfly.color.g, butterfly.color.b, 200);
          p.noStroke();
          
          // Left wing
          p.push();
          p.rotate(wingFlap);
          p.ellipse(-butterfly.size/2, 0, butterfly.size, butterfly.size * 0.6);
          p.pop();
          
          // Right wing
          p.push();
          p.rotate(-wingFlap);
          p.ellipse(butterfly.size/2, 0, butterfly.size, butterfly.size * 0.6);
          p.pop();
          
          // Body
          p.fill(40, 40, 40);
          p.ellipse(0, 0, butterfly.size * 0.2, butterfly.size * 0.5);
          
          // Antennae
          p.stroke(40, 40, 40);
          p.strokeWeight(1);
          p.line(0, -butterfly.size * 0.2, -butterfly.size * 0.15, -butterfly.size * 0.4);
          p.line(0, -butterfly.size * 0.2, butterfly.size * 0.15, -butterfly.size * 0.4);
          p.fill(40, 40, 40);
          p.noStroke();
          p.ellipse(-butterfly.size * 0.15, -butterfly.size * 0.4, 3, 3);
          p.ellipse(butterfly.size * 0.15, -butterfly.size * 0.4, 3, 3);
          
          p.pop();
        }
        
        // Update bee behavior
        function updateBee(bee) {
          // Update wing animation
          bee.wingAngle += bee.wingSpeed;
          
          // State machine for bee behavior
          switch(bee.state) {
            case 'searching':
              // Look for a flower to visit
              if (!bee.targetFlower) {
                // Find a blooming flower
                const bloomingFlowers = flowers.filter(f => f.bloomProgress > 0.7);
                if (bloomingFlowers.length > 0) {
                  bee.targetFlower = bloomingFlowers[Math.floor(p.random(bloomingFlowers.length))];
                  bee.state = 'approaching';
                } else {
                  // No blooming flowers, just fly around
                  bee.angle += p.random(-0.1, 0.1);
                  bee.x += Math.cos(bee.angle) * bee.speed;
                  bee.y += Math.sin(bee.angle) * bee.speed;
                  
                  // Wrap around screen
                  if (bee.x < -bee.size) bee.x = p.width + bee.size;
                  if (bee.x > p.width + bee.size) bee.x = -bee.size;
                  if (bee.y < -bee.size) bee.y = p.height + bee.size;
                  if (bee.y > p.height + bee.size) bee.y = -bee.size;
                }
              }
              break;
              
            case 'approaching':
              // Move towards target flower
              if (bee.targetFlower) {
                const dx = bee.targetFlower.x - bee.x;
                const dy = bee.targetFlower.y - bee.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                // Update angle to point towards flower
                bee.angle = Math.atan2(dy, dx);
                
                // Move towards flower
                bee.x += Math.cos(bee.angle) * bee.speed;
                bee.y += Math.sin(bee.angle) * bee.speed;
                
                // Check if we've reached the flower
                if (distance < bee.targetFlower.size / 2) {
                  bee.state = 'visiting';
                  bee.visitTimer = 0;
                }
              } else {
                // Target flower no longer exists, go back to searching
                bee.state = 'searching';
                bee.targetFlower = null;
              }
              break;
              
            case 'visiting':
              // Stay at flower for a while
              bee.visitTimer++;
              
              // Small random movement while visiting
              bee.x += p.random(-0.5, 0.5);
              bee.y += p.random(-0.5, 0.5);
              
              // Check if visit is complete
              if (bee.visitTimer > bee.visitDuration) {
                bee.state = 'leaving';
                bee.angle = p.random(0, p.TWO_PI); // Choose random direction to leave
              }
              break;
              
            case 'leaving':
              // Fly away from flower
              bee.x += Math.cos(bee.angle) * bee.speed;
              bee.y += Math.sin(bee.angle) * bee.speed;
              
              // After flying a bit, go back to searching
              const distanceFromFlower = Math.sqrt(
                Math.pow(bee.x - bee.targetFlower.x, 2) + 
                Math.pow(bee.y - bee.targetFlower.y, 2)
              );
              
              if (distanceFromFlower > 100) {
                bee.state = 'searching';
                bee.targetFlower = null;
              }
              break;
          }
        }
        
        // Draw a bee
        function drawBee(bee) {
          p.push();
          p.translate(bee.x, bee.y);
          p.rotate(bee.angle);
          
          // Body
          p.fill(255, 215, 0);
          p.ellipse(0, 0, bee.size, bee.size * 1.5);
          
          // Stripes
          p.fill(0);
          for (let i = 0; i < 3; i++) {
            p.rect(-bee.size/4, -bee.size/2 + i * bee.size/3, bee.size/2, bee.size/6);
          }
          
          // Wings
          p.fill(255, 255, 255, 180);
          p.push();
          p.rotate(Math.sin(bee.wingAngle) * 0.5);
          p.ellipse(0, -bee.size/3, bee.size * 0.8, bee.size * 0.4);
          p.pop();
          
          p.push();
          p.rotate(-Math.sin(bee.wingAngle) * 0.5);
          p.ellipse(0, bee.size/3, bee.size * 0.8, bee.size * 0.4);
          p.pop();
          
          // Eyes
          p.fill(0);
          p.ellipse(bee.size/3, -bee.size/4, bee.size/5, bee.size/5);
          p.ellipse(bee.size/3, bee.size/4, bee.size/5, bee.size/5);
          
          p.pop();
        }
        
        // Update fish behavior
        function updateFish(fish) {
          // Update fin animation
          fish.finAngle += fish.finSpeed;
          
          // Jumping behavior
          fish.jumpTimer++;
          if (fish.jumpTimer > fish.jumpDuration) {
            fish.jumping = !fish.jumping;
            fish.jumpTimer = 0;
            fish.jumpDuration = p.random(100, 300);
            
            // Create bubbles when fish starts jumping
            if (fish.jumping) {
              for (let i = 0; i < 5; i++) {
                fish.bubbles.push({
                  x: p.random(-fish.size * 0.3, fish.size * 0.3),
                  y: p.random(-fish.size * 0.2, fish.size * 0.2),
                  size: p.random(3, 8),
                  speed: p.random(0.5, 1.5),
                  life: p.random(30, 60)
                });
              }
            }
          }
          
          // Calculate jump height
          if (fish.jumping) {
            fish.jumpHeight = Math.sin(fish.jumpTimer / fish.jumpDuration * Math.PI) * fish.maxJumpHeight;
          } else {
            fish.jumpHeight = 0;
          }
          
          // Random turns (less frequent when jumping)
          if (p.random() < (fish.jumping ? fish.turnChance * 0.3 : fish.turnChance)) {
            fish.angle += p.random(-fish.turnAmount, fish.turnAmount);
          }
          
          // Move fish (slower when jumping)
          const currentSpeed = fish.jumping ? fish.speed * 0.7 : fish.speed;
          fish.x += Math.cos(fish.angle) * currentSpeed;
          fish.y += Math.sin(fish.angle) * currentSpeed * 0.3; // Fish move more horizontally
          
          // Update bubbles
          for (let i = fish.bubbles.length - 1; i >= 0; i--) {
            const bubble = fish.bubbles[i];
            bubble.y -= bubble.speed;
            bubble.life--;
            
            if (bubble.life <= 0) {
              fish.bubbles.splice(i, 1);
            }
          }
          
          // Wrap around screen
          if (fish.x < -fish.size) fish.x = p.width + fish.size;
          if (fish.x > p.width + fish.size) fish.x = -fish.size;
          if (fish.y < -fish.size) fish.y = p.height + fish.size;
          if (fish.y > p.height + fish.size) fish.y = -fish.size;
        }
        
        // Draw a flying fish
        function drawFish(fish) {
          p.push();
          p.translate(fish.x, fish.y - fish.jumpHeight);
          p.rotate(fish.angle);
          
          // Fin animation
          const finFlap = Math.sin(fish.finAngle) * 0.4;
          
          // Draw body
          p.fill(fish.color.body);
          p.noStroke();
          p.ellipse(0, 0, fish.size, fish.size * 0.4);
          
          // Draw tail
          p.fill(fish.color.fins);
          p.triangle(
            -fish.size * 0.4, 0,
            -fish.size * 0.7, -fish.size * 0.2,
            -fish.size * 0.7, fish.size * 0.2
          );
          
          // Draw fins (wings)
          // Top fin
          p.push();
          p.rotate(finFlap - 0.2);
          p.ellipse(0, -fish.size * 0.2, fish.size * 0.7, fish.size * 0.15);
          p.pop();
          
          // Bottom fin
          p.push();
          p.rotate(-finFlap + 0.2);
          p.ellipse(0, fish.size * 0.2, fish.size * 0.7, fish.size * 0.15);
          p.pop();
          
          // Side fins
          p.ellipse(fish.size * 0.1, -fish.size * 0.15, fish.size * 0.2, fish.size * 0.1);
          p.ellipse(fish.size * 0.1, fish.size * 0.15, fish.size * 0.2, fish.size * 0.1);
          
          // Head
          p.fill(fish.color.body);
          p.ellipse(fish.size * 0.3, 0, fish.size * 0.25, fish.size * 0.25);
          
          // Eye
          p.fill(255);
          p.ellipse(fish.size * 0.4, -fish.size * 0.05, fish.size * 0.1, fish.size * 0.1);
          p.fill(0);
          p.ellipse(fish.size * 0.42, -fish.size * 0.05, fish.size * 0.05, fish.size * 0.05);
          
          // Draw bubbles
          p.fill(255, 255, 255, 150);
          fish.bubbles.forEach(bubble => {
            p.ellipse(bubble.x, bubble.y, bubble.size, bubble.size);
          });
          
          p.pop();
        }
        
        // Mouse moved function for hover detection
        p.mouseMoved = function() {
          // Only allow interaction if no modal is open
          if (isModalOpen()) return;
          
          // Check if hovering over a flower
          flowers.forEach((flower) => {
            const d = p.dist(p.mouseX, p.mouseY, flower.x, flower.y);
            if (d < flower.size / 2) {
              flower.hovered = true;
              
              // Play sound if not already playing
              if (!isPlaying && !flower.fullyBloomed) {
                playRandomSound();
              }
            }
          });
        };
        
        // Touch moved function for mobile
        p.touchMoved = function() {
          // Only allow interaction if no modal is open
          if (isModalOpen()) return false;
          
          // Check if touching a flower
          flowers.forEach((flower) => {
            const d = p.dist(p.touchX || p.mouseX, p.touchY || p.mouseY, flower.x, flower.y);
            if (d < flower.size / 2) {
              flower.hovered = true;
              
              // Play sound if not already playing
              if (!isPlaying && !flower.fullyBloomed) {
                playRandomSound();
              }
            }
          });
          return false; // Prevent default
        };
        
        // Touch started function for mobile
        p.touchStarted = function() {
          // Only allow interaction if no modal is open
          if (isModalOpen()) return false;
          
          // Check if touching a flower
          flowers.forEach((flower) => {
            const d = p.dist(p.touchX || p.mouseX, p.touchY || p.mouseY, flower.x, flower.y);
            if (d < flower.size / 2) {
              flower.hovered = true;
              
              // Play sound if not already playing
              if (!isPlaying && !flower.fullyBloomed) {
                playRandomSound();
              }
            }
          });
          return false; // Prevent default
        };
        
        // Window resized function
        p.windowResized = function() {
          p.resizeCanvas(p.windowWidth, p.windowHeight);
          checkMobile();
          
          // Reposition elements for new screen size
          repositionElements();
        };
        
        // Reposition elements when screen size changes
        function repositionElements() {
          // Recreate flowers with new positions
          createFlowers();
          
          // Recreate trees with new positions
          createTrees();
        }
        
        // Play a random sound
        function playRandomSound() {
          if (isPlaying) return;
          
          isPlaying = true;
          
          // Select random sound
          const randomIndex = Math.floor(p.random(sounds.length));
          const sound = sounds[randomIndex];
          
          // Play sound
          sound.start();
          sound.amp(0.2, 0.1);
          
          // Stop sound after a short time
          setTimeout(() => {
            sound.amp(0, 0.1);
            setTimeout(() => {
              sound.stop();
              isPlaying = false;
            }, 100);
          }, 300);
        }
      });
      
      // Initialize Three.js after everything is loaded
      initThree();
      
      // Add this JavaScript function and modify the celebration function
function showCongratulations() {
    const modal = document.getElementById('custom-modal');
    modal.style.display = 'flex';
  
    // Button handlers
    modal.querySelector('.yes-btn').onclick = function() {
      // Reset the garden
      flowers.forEach(flower => {
        flower.bloomProgress = 0;
        flower.fullyBloomed = false;
        flower.hovered = false;
      });
      hoveredFlowers.clear();
      allFlowersBloomedCelebrated = false;
      document.getElementById('celebration-overlay').style.display = 'none';
      modal.style.display = 'none';
    };
  
    modal.querySelector('.no-btn').onclick = function() {
      modal.style.display = 'none';
      // Add sparkle effect when closing
      modal.style.backdropFilter = 'blur(5px) brightness(1.1)';
      setTimeout(() => {
        modal.style.backdropFilter = 'blur(5px)';
      }, 500);
    };
  }

      // Function to celebrate when all flowers have bloomed
      function celebrateAllFlowersBloom() {
        const overlay = document.getElementById('celebration-overlay');
        overlay.style.display = 'block';
        
        // Create flower and confetti elements
        const colors = [
          '#ff6b6b', '#ff9e7d', '#ffda77', '#bbf0c8', '#a5dee5', '#c5a3ff', '#ffc6e5'
        ];
        
        // Create 100 confetti/flower elements
        for (let i = 0; i < 100; i++) {
          const isFlower = Math.random() > 0.5;
          const element = document.createElement('div');
          
          if (isFlower) {
            element.className = 'flower-overlay';
            
            // Create SVG flower
            const flowerColor = colors[Math.floor(Math.random() * colors.length)];
            element.innerHTML = `
              <svg viewBox="0 0 100 100" width="100%" height="100%">
                <circle cx="50" cy="50" r="20" fill="${flowerColor}" />
                <circle cx="50" cy="50" r="10" fill="#ffdd00" />
                ${Array.from({length: 8}, (_, i) => {
                  const angle = (i / 8) * Math.PI * 2;
                  const x1 = 50 + Math.cos(angle) * 20;
                  const y1 = 50 + Math.sin(angle) * 20;
                  const x2 = 50 + Math.cos(angle) * 40;
                  const y2 = 50 + Math.sin(angle) * 40;
                  return `<ellipse cx="${(x1+x2)/2}" cy="${(y1+y2)/2}" rx="15" ry="10" 
                           fill="${flowerColor}" 
                           transform="rotate(${angle * 180 / Math.PI + 90}, ${(x1+x2)/2}, ${(y1+y2)/2})" />`;
                }).join('')}
              </svg>
            `;
          } else {
            element.className = 'confetti';
            element.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            element.style.width = Math.random() * 15 + 5 + 'px';
            element.style.height = Math.random() * 15 + 5 + 'px';
            element.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
          }
          
          // Position randomly
          element.style.left = Math.random() * 100 + 'vw';
          element.style.top = -Math.random() * 100 + 'px';
          
          // Animation delay
          element.style.animationDelay = Math.random() * 2 + 's';
          
          // Add to overlay
          overlay.appendChild(element);
        }
        
        // Remove overlay after 5 seconds
        setTimeout(() => {
          overlay.style.display = 'none';
          overlay.innerHTML = ''; // Clear all elements
        }, 5000);

        setTimeout(showCongratulations, 5000);
      }
    };
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as THREE from 'three';
import { texture } from 'three/examples/jsm/nodes/Nodes.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { useEffect, useState } from 'react';



let score = 0;
let isCollision = false;
function doThreeJS(){
  let area = 400;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

  function showCollisionText() {
    const collisionText = document.getElementById("gameover");
    if (collisionText) {
      collisionText.style.display = "block";
    }
  }

  function updateScore(newScore: number) {
    audioLoader.load("audios/Quack.mp3", function (buffer: any) {
      sound.setBuffer(buffer);
      sound.setLoop(false);
      sound.setVolume(0.28);
      sound.hasPlaybackControl;
      sound.play();
    });
    const maxscore = localStorage.getItem("maxscore");

    if (!maxscore || newScore > parseInt(maxscore)) {

      localStorage.setItem("maxscore", newScore.toString());

    }

  }
  
  const loader = new RGBELoader();

  loader.load(
    '/environments/christmas_photo_studio_07_1k.hdr',
    (texture) => {

      texture.mapping = THREE.EquirectangularRefractionMapping;
      scene.environment = texture;

    }
  )

  const jpgloader = new THREE.TextureLoader();
  jpgloader.load (
    '/environments/christmas_photo_studio_07.jpg',
    (texture) => {

      texture.mapping = THREE.EquirectangularRefractionMapping;
      scene.background = texture;

    }

  )
 
  const ambientLight = new THREE.AmbientLight(0xe0e0e0, 1);

  scene.add(ambientLight);

  const renderer = new THREE.WebGLRenderer();

  renderer.toneMapping = THREE.ACESFilmicToneMapping; 
  
  renderer.outputColorSpace = THREE.SRGBColorSpace; 
  
  renderer.setPixelRatio(window.devicePixelRatio);
  
  renderer.setSize(window.innerWidth, window.innerHeight);

  document.body.appendChild(renderer.domElement);

  camera.position.set(0, 0, 500);
  scene.fog = new THREE.Fog( 'black', 100, 500 );



  renderer.setSize( window.innerWidth, window.innerHeight );


  document.body.appendChild( renderer.domElement );

  
  const listener = new THREE.AudioListener();
  camera.add(listener);
  const sound = new THREE.Audio(listener);
  const audioLoader = new THREE.AudioLoader();


  
  const jokergltfloader = new GLTFLoader();
  let joker: THREE.Object3D<THREE.Object3DEventMap>;
  const jokerSpeed = 2; 
  let loaded = false;
  const jokerBoundingBox = new THREE.Box3();

  jokergltfloader.load(

    "models/Joker/scene.gltf",
    // called when the resource is loaded
    function (gltf) {

      joker = gltf.scene;
      scene.add(joker);
      loaded = true;
      joker.position.set(0, 0, 450); 
      joker.scale.set(8,8,8)
      const rotation = new THREE.Euler(-Math.PI / 6, Math.PI, 0); 
      joker.setRotationFromEuler(rotation);

    },
    // called while loading is progressing
    function (xhr) {
      console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
    },
    // called when loading has errors
    function (_error) {
      console.log("An error happened");
    }
  );
  
  
  const batmanObjects: THREE.Group<THREE.Object3DEventMap>[] = [];
  const batmanBoundingBoxes: any[] = [];
  function spawnBatman(area: number) {
    const batmangltfloader = new GLTFLoader();

    batmangltfloader.load(

      'models/Batman/scene.gltf',
      function (gltf) {
        const batman = gltf.scene;
        scene.add(batman);
        batman.position.set(Math.random() * (area ) - (area / 2), Math.random() * (area ) - (area / 2), -300 );
        batman.scale.set(0.5, 0.5, 0.5); 
        batmanObjects.push(batman);
        const batmanBoundingBox = new THREE.Box3().setFromObject(batman);
        batmanBoundingBoxes.push(batmanBoundingBox);
      },
      // Called when loading is in progress
      function (xhr) {
        console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
      },
      // Called when loading has errors
      function (_error) {
        console.log("An error happened");
      }
    );
  }

  function transformbatmanPosition(
    batmanObjects: string | any[],
    batmanBoundingBoxes: any[],
    time: number
  ) {
    for (let i = 0; i < batmanObjects.length; i++) {
      const batman = batmanObjects[i];
      const batmanBoundingBox = batmanBoundingBoxes[i];

      if (batman) {
        const incre = time * 100;
        batman.position.z += incre;

        
        if (batman.position.z > 500 ) {
          scene.remove(batmanBoundingBox);
          scene.remove(batman);
          score += 1;
         
          updateScore(score);
        } else {

          batmanBoundingBox.copy(new THREE.Box3().setFromObject(batman));
        }
      }
    }
    
  }
  const robinObjects: THREE.Group<THREE.Object3DEventMap>[] = [];
  const robinBoundingBoxes: any[] = [];
  function spawnRobin(area: number) {
    const robinLoader = new GLTFLoader();
  
    robinLoader.load(
      'models/Robin/scene.gltf', 
      function (gltf) {
        const robin = gltf.scene;
        scene.add(robin);
  
        robin.position.set(400, 100 , 150);
        robin.scale.set(0.2, 0.2, 0.2);
        robinObjects.push(robin);
        const robinBoundingBox = new THREE.Box3().setFromObject(robin);
        robinBoundingBoxes.push(robinBoundingBox);

      },
      function (xhr) {
        console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
      },
      function (_error) {
        console.log('An error happened');
      }
    );
  }

  const clock = new THREE.Clock()

  const delta = clock.getDelta();

  // audioLoader.load("audios/Soundtrack.mp3", function (buffer: any) {
  //   sound.setBuffer(buffer);
  //   sound.setLoop(true);
  //   sound.setVolume(0.28);
  //   sound.play();
  // });
  
  function checkCollision() {
    for (let i = 0; i < batmanObjects.length; i++) {
     const batmanBoundingBox = batmanBoundingBoxes[i];
      if (jokerBoundingBox.intersectsBox(batmanBoundingBox)) {
        sound.stop();

        audioLoader.load("audios/Gameover.mp3", function (buffer) {
          sound.setBuffer(buffer);
          sound.setLoop(false);
          sound.setVolume(0.5);
          sound.play();
        });
        gameOver();
        break;
      }
    }
  }

  function gameOver() {
    isCollision = true;
    showCollisionText();
      
  }
  const keyboardState: { [key: string]: boolean } = {};

  document.addEventListener('keydown', (event) => {
    keyboardState[event.key] = true;
  });
  document.addEventListener('keyup', (event) => {
    keyboardState[event.key] = false;
  });
  function jokerMovement() {
    
  
    if (keyboardState['w']) {
      joker.position.y += jokerSpeed;
    }
    if (keyboardState['s']) {
      joker.position.y -= jokerSpeed;
    }
    if (keyboardState['a']) {
      joker.position.x -= jokerSpeed;
    }
    if (keyboardState['d']) {
      joker.position.x += jokerSpeed;
    }
  }
  spawnRobin(area);

  function animate() {

    requestAnimationFrame(animate);
    
    const scoreDisplay = document.getElementById("score-display");
    if (scoreDisplay) {
      
      scoreDisplay.textContent = `Score: ${score}`;
    }
   
    const deltaTime = clock.getDelta();

    const movementDirection = new THREE.Vector3(0, 0, 0);

    if (!isCollision) {
     
      jokerMovement();
      spawnBatman(area);
      transformbatmanPosition(batmanObjects, batmanBoundingBoxes, deltaTime*2);

      if (loaded) {
        joker.position.add(movementDirection);

        jokerBoundingBox.setFromObject(joker);

        
      }
    }
    checkCollision()
  
    renderer.render(scene, camera);

  
  }
  



  window.addEventListener("resize", onWindowResize, false);

  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  animate(); 
}


const App = () => {
  const [showApp, setShowApp] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);

  const handleStart = () => {
    setGameStarted(true);
  };

  const handleRestart = () => {
    window.location.reload();
  };

  useEffect(() => {
    if (showApp && gameStarted) {
      doThreeJS();
    }
  }, [showApp, gameStarted]);

  return (
    <div>
      {showApp ? (
        <>
          {gameStarted ? (
            <>
              <p>"Sé fuerte para que nadie te derrote, noble para que nadie te humille y tú mismo para que nadie te olvide" 
                Paulo coelho</p>
              <p id="score-display">Score: {score}</p>
              <p id="max">Max Score: {localStorage.getItem("maxscore") || "0"}</p>
              <div id="gameover" style={{ display: isCollision ? "block" : "none" }}>
                <p id="game">Perdiste!</p>
                <button onClick={handleRestart}>Restart</button>
              </div>
            </>
          ) : (
            <button onClick={handleStart}>Start</button>
          )}
        </>
      ) : (
        <p></p>
      )}
    </div>
  );
};

export default App;
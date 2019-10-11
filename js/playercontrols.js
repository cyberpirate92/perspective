const TEXTURE_GRASS = './assets/grasslight-big.jpg';
const TEXTURE_WOOD = './assets/hardwood2_diffuse.jpg';
const TEXTURE_PATTERN = './assets/disturb.jpg';

const KEY_UP = 38;
const KEY_LEFT = 37;
const KEY_DOWN = 40;
const KEY_RIGHT = 39;

let cameraProperties = {
    aspectRatio: window.innerWidth / window.innerHeight,
    near: 0.1,
    far: 1000,
};

let grassTexture = new THREE.TextureLoader().load(TEXTURE_GRASS);
let woodTexture = new THREE.TextureLoader().load(TEXTURE_WOOD);
let patternTexture = new THREE.TextureLoader().load(TEXTURE_PATTERN);

setTextureOptions(grassTexture, 15);
setTextureOptions(woodTexture, 3);

let groundGeometry = new THREE.PlaneGeometry(30, 30, 1);
let groundMaterial = new THREE.MeshBasicMaterial({
    map: grassTexture,
});
let terrain = new THREE.Mesh(groundGeometry, groundMaterial);

let cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
let cubeMaterial = new THREE.MeshPhongMaterial({
    map: woodTexture,
});
let cube = new THREE.Mesh(cubeGeometry, cubeMaterial);

let cubeGeometry2 = new THREE.BoxGeometry(1, 1, 1);
let cubeMaterial2 = new THREE.MeshLambertMaterial({
    map: woodTexture,
});
let cube2 = new THREE.Mesh(cubeGeometry2, cubeMaterial2);

let sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
let sphereMaterial = new THREE.MeshBasicMaterial({
    map: TEXTURE_PATTERN,
});
let sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);

let scene = new THREE.Scene();
let ambientLight = new THREE.AmbientLight(0x404040);
let hemisphericLight = new THREE.HemisphereLight(0xffffbb, 0x080820, 1);
let directionalLight = new THREE.DirectionalLight(0xffffff, 1);
var directionalLightHelper = new THREE.DirectionalLightHelper( directionalLight, 5 );

let renderer = new THREE.WebGLRenderer({ antialias: true });
let camera = new THREE.PerspectiveCamera(75, cameraProperties.aspectRatio, cameraProperties.near, cameraProperties.far);

var axesHelper = new THREE.AxesHelper(5);

window.addEventListener('load', () => {
    initializeScene();
    document.body.appendChild(renderer.domElement);
    animate();
});

window.addEventListener('keydown', (event) => {
    let didMove = false;
    if (event.keyCode === KEY_LEFT) {
        sphere.position.x -= 0.5;
        sphere.rotation.x += 0.2;
        didMove = true;
    } else if (event.keyCode === KEY_RIGHT) {
        sphere.position.x += 0.5;
        sphere.rotation.x += 0.2;
        didMove = true;
    } else if (event.keyCode === KEY_UP) {
        sphere.position.y += 0.5;
        sphere.rotation.y += 0.2;
        didMove = true;
    } else if (event.keyCode === KEY_DOWN) {
        sphere.position.y -= 0.5;
        sphere.rotation.y -= 0.2;
        didMove = true;
    }
    if (didMove) {
        camera.lookAt(sphere.x, sphere.y, sphere.z);
    }
});

let animate = function () {
    window.requestAnimationFrame(animate);
    renderer.render(scene, camera);
};

function initializeScene() {
    terrain.position.set(0, 0, 0);

    cube.position.set(3, 0, 0.5);
    cube2.position.set(0, 3, 0.5);
    sphere.position.set(3, 3, 1);

    camera.position.set(0, 0, 10);
    camera.lookAt(0, 0, 0);

    var controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableKeys = false;
    controls.minDistance = 4;
    controls.maxDistance = 30;

    // add lighting
    scene.add(terrain);
    scene.add(cube);
    scene.add(cube2);
    scene.add(camera);
    scene.add(sphere);
    scene.add(axesHelper);

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
}

function setTextureOptions(textureObj, repeatCount) {
    textureObj.wrapS = THREE.RepeatWrapping;
    textureObj.wrapT = THREE.RepeatWrapping;
    textureObj.repeat.set(repeatCount, repeatCount);
}
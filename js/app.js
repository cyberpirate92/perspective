const AXIS_LENGTH = 5;
const VIEW_SCALE_FACTOR = 2.25;
const STAR_ROTATION_FACTOR = 0.01;
const PLANET_ROTATION_FACTOR = 0.02;
const PLANET1_ROTATION_FACTOR = 0.005;
const MOON_ROTATION_FACTOR = 0.015;

const COLOR_RED = 0xff0000;
const COLOR_GREEN = 0x00ff00;
const COLOR_BLUE = 0x0000ff;
const COLOR_YELLOW = 0xffff00;
const COLOR_GRAY = 0xf5f3ce;
const COLOR_GRAY_ALT = 0x93B8BE;

const TEXTURE_SUN = './assets/planets/sunmap.jpg';
const TEXTURE_MERCURY = './assets/planets/mercurymap.jpg';
const TEXTURE_EARTH = './assets/planets/earth_clouds_2048.jpg';
const TEXTURE_MOON = './assets/planets/moon_1024.jpg';

let position = {
    planet: {
        x: 6,
        y: 0,
        z: 0,
        theta: 0,
        traceRadius: 4
    },
    moon: {
        x: 6, 
        y: 0,
        z: 0,
        theta: 0,
        traceRadius: 1,
    },
    planet1: {
        x: 3,
        y: 0,
        z: 0,
        theta: 0,
        traceRadius: 2,
    }
};

let cameraProperties = {
    aspectRatio: window.innerWidth / window.innerHeight,
    near: 0.1,
    far: 1000,
};

let rendererProperties = {
    size: {
        width: window.innerWidth / VIEW_SCALE_FACTOR,
        height: window.innerHeight / VIEW_SCALE_FACTOR,
    }
};

let earthTexture = new THREE.TextureLoader().load(TEXTURE_EARTH);
let moonTexture = new THREE.TextureLoader().load(TEXTURE_MOON);
let sunTexture = new THREE.TextureLoader().load(TEXTURE_SUN);
let mercuryTexture = new THREE.TextureLoader().load(TEXTURE_MERCURY);

let scene = new THREE.Scene();
let xAxisGeometry = new THREE.Geometry();
let yAxisGeometry = new THREE.Geometry();
let zAxisGeometry = new THREE.Geometry();
let ambientLight = new THREE.AmbientLight(0xfffffff)
let starSphereGeometry = new THREE.SphereGeometry(1, 32, 32);
let planetSphereGeometry = new THREE.SphereGeometry(0.5, 32, 32);
let planet1SphereGeometry = new THREE.SphereGeometry(0.35, 32, 32);
let moonSphereGeometry = new THREE.SphereGeometry(0.25, 32, 32);
let starSphereEdges = new THREE.EdgesGeometry(starSphereGeometry);
let planetSphereEdges = new THREE.EdgesGeometry(planetSphereGeometry);
let planet1SphereEdges = new THREE.EdgesGeometry(planet1SphereGeometry);
let moonSphereEdges = new THREE.EdgesGeometry(moonSphereGeometry);
let planetOrbitGeometry = new THREE.CircleGeometry(position.planet.traceRadius, 32, 32);
let planet1OrbitGeometry = new THREE.CircleGeometry(position.planet1.traceRadius, 32, 32);
let planetOrbitEdges = new THREE.EdgesGeometry(planetOrbitGeometry);
let planet1OrbitEdges = new THREE.EdgesGeometry(planet1OrbitGeometry);
let moonOrbitGeometry = new THREE.CircleGeometry(position.moon.traceRadius, 32, 32);
let moonOrbitEdges = new THREE.EdgesGeometry(moonOrbitGeometry);
let starLight = new THREE.PointLight(0xffff00, 1, 0, 2);

let materialRed = new THREE.MeshLambertMaterial({ color: COLOR_RED });
let materialBlue = new THREE.MeshLambertMaterial({ color: COLOR_BLUE });
let materialSkyBlue = new THREE.MeshLambertMaterial({ color: 0x7ec0ee });
let materialGreen = new THREE.MeshLambertMaterial({ color: COLOR_GREEN });
let materialYellow = new THREE.MeshLambertMaterial({ color: COLOR_YELLOW });
let materialGray = new THREE.MeshLambertMaterial({ color: COLOR_GRAY});

let materialStar = new THREE.MeshBasicMaterial({ map: sunTexture });
let materialEarth = new THREE.MeshBasicMaterial({ map: earthTexture });
let materialMoon = new THREE.MeshBasicMaterial({ map: moonTexture });
let materialMercury = new THREE.MeshBasicMaterial({ map: mercuryTexture });

let materialXAxis = new THREE.LineBasicMaterial({ color: COLOR_RED });
let materialZAxis = new THREE.LineBasicMaterial({ color: COLOR_BLUE });
let materialYAxis = new THREE.LineBasicMaterial({ color: COLOR_GREEN });

let starSphere = new THREE.Mesh(starSphereGeometry, materialStar);
let xAxisReferenceLine = new THREE.Line(xAxisGeometry, materialXAxis);
let yAxisReferenceLine = new THREE.Line(yAxisGeometry, materialYAxis);
let zAxisReferenceLine = new THREE.Line(zAxisGeometry, materialZAxis);
let planetSphere = new THREE.Mesh(planetSphereGeometry, materialEarth);
let planet1Sphere = new THREE.Mesh(planet1SphereGeometry, materialMercury);
let moonSphere = new THREE.Mesh(moonSphereGeometry, materialMoon);
let planetOrbitTraceLine = new THREE.LineSegments(planetOrbitEdges, new THREE.LineBasicMaterial({ color: 0xffffff }));
let planet1OrbitTraceLine = new THREE.LineSegments(planet1OrbitEdges, new THREE.LineBasicMaterial({ color: 0xffffff }));
let moonOrbitTraceLine = new THREE.LineSegments(moonOrbitEdges, new THREE.LineBasicMaterial({ color: 0xffffff }));
let starSphereEdgeLines = new THREE.LineSegments(starSphereEdges, new THREE.LineBasicMaterial({ color: 0xa3a3a3 }));
let planetSphereEdgeLines = new THREE.LineSegments(planetSphereEdges, new THREE.LineBasicMaterial({ color: 0xa3a3a3 }));
let planet1SphereEdgeLines = new THREE.LineSegments(planet1SphereEdges, new THREE.LineBasicMaterial({ color: 0x535353 }));
let moonSphereEdgeLines = new THREE.LineSegments(moonSphereEdges, new THREE.LineBasicMaterial({ color: 0xa3a3a3}));

let camera1 = new THREE.PerspectiveCamera(75, cameraProperties.aspectRatio, cameraProperties.near, cameraProperties.far);
let camera2 = new THREE.PerspectiveCamera(75, cameraProperties.aspectRatio, cameraProperties.near, cameraProperties.far);
let camera3 = new THREE.PerspectiveCamera(75, cameraProperties.aspectRatio, cameraProperties.near, cameraProperties.far);
let camera4 = new THREE.PerspectiveCamera(75, cameraProperties.aspectRatio, cameraProperties.near, cameraProperties.far);

let renderer1 = new THREE.WebGLRenderer({ antialias: true });
let renderer2 = new THREE.WebGLRenderer({ antialias: true });
let renderer3 = new THREE.WebGLRenderer({ antialias: true });
let renderer4 = new THREE.WebGLRenderer({ antialias: true });

let view1;
let view2;
let view3;
let view4;

let showOrbitTraces = true;
let showReferenceAxes = true;


window.addEventListener('load', () => {
    view1 = document.querySelector("#view1");
    view2 = document.querySelector("#view2");
    view3 = document.querySelector("#view3");
    view4 = document.querySelector("#view4");

    initializeScene();

    view1.appendChild(renderer1.domElement);
    view2.appendChild(renderer2.domElement);
    view3.appendChild(renderer3.domElement);
    view4.appendChild(renderer4.domElement);

    onSelectedCameraChange();
    animate();
});

let animate = function () {
    requestAnimationFrame(animate);

    starSphere.rotation.x += STAR_ROTATION_FACTOR;
    starSphereEdgeLines.rotation.x += STAR_ROTATION_FACTOR;

    planetSphere.rotation.x -= PLANET_ROTATION_FACTOR;
    planetSphereEdgeLines.rotation.x -= PLANET_ROTATION_FACTOR;

    planet1Sphere.rotation.x -= PLANET1_ROTATION_FACTOR;
    planet1SphereEdgeLines.rotation.x -= PLANET1_ROTATION_FACTOR;

    moonSphere.rotation.x -= MOON_ROTATION_FACTOR;
    moonSphereEdgeLines.rotation.x -= MOON_ROTATION_FACTOR;

    position.planet.theta += 1;
    position.planet.x = getX(0, position.planet.theta, position.planet.traceRadius);
    position.planet.z = getY(0, position.planet.theta, position.planet.traceRadius);

    position.planet1.theta += 1;
    position.planet1.x = getX(0, position.planet1.theta, position.planet1.traceRadius);
    position.planet1.y = getY(0, position.planet1.theta, position.planet1.traceRadius);

    moonOrbitTraceLine.position.set(position.planet.x, position.planet.y, position.planet.z);

    position.moon.theta += 1;
    position.moon.x = -1 * getX(0, position.moon.theta, position.moon.traceRadius);
    position.moon.y = -1 * getY(0, position.moon.theta, position.moon.traceRadius);

    planetSphere.position.set(position.planet.x, position.planet.y, position.planet.z);
    planetSphereEdgeLines.position.set(position.planet.x, position.planet.y, position.planet.z);

    planet1Sphere.position.set(position.planet1.x, position.planet1.y, position.planet1.z);
    planet1SphereEdgeLines.position.set(position.planet1.x, position.planet1.y, position.planet1.z);

    moonSphere.position.set(position.planet.x + position.moon.x, position.planet.y + position.moon.y, position.planet.z + position.moon.z);
    moonSphereEdgeLines.position.set(position.planet.x + position.moon.x, position.planet.y + position.moon.y, position.planet.z + position.moon.z);

    planet1OrbitTraceLine.visible = planetOrbitTraceLine.visible = moonOrbitTraceLine.visible = !!showOrbitTraces;
    xAxisReferenceLine.visible = yAxisReferenceLine.visible = zAxisReferenceLine.visible = !!showReferenceAxes;

    renderer1.render(scene, camera1);
    renderer2.render(scene, camera2);
    renderer3.render(scene, camera3);
    renderer4.render(scene, camera4);
};

function initializeRenderer(rendererObj) {
    rendererObj.setSize(rendererProperties.size.width, rendererProperties.size.height);
    rendererObj.setPixelRatio(window.devicePixelRatio);
}

function initializeScene() {
    initializeRenderer(renderer1);
    initializeRenderer(renderer2);
    initializeRenderer(renderer3);
    initializeRenderer(renderer4);

    starSphereEdgeLines.visible = false;
    planet1SphereEdgeLines.visible = false;
    planetSphereEdgeLines.visible = false;
    moonSphereEdgeLines.visible = false;

    xAxisGeometry.vertices.push(new THREE.Vector3(-1 * AXIS_LENGTH, 0, 0));
    xAxisGeometry.vertices.push(new THREE.Vector3(AXIS_LENGTH, 0, 0));

    yAxisGeometry.vertices.push(new THREE.Vector3(0, -1 * AXIS_LENGTH, 0));
    yAxisGeometry.vertices.push(new THREE.Vector3(0, AXIS_LENGTH, 0));

    zAxisGeometry.vertices.push(new THREE.Vector3(0, 0, -1 * AXIS_LENGTH));
    zAxisGeometry.vertices.push(new THREE.Vector3(0, 0, AXIS_LENGTH));
    
    camera1.position.set(-7, -1, -7)
    camera1.rotation.set(0, 180, 90);

    camera2.position.set(0, 2, 8);
    camera2.rotation.set(0, 45, 0);

    var controls = new THREE.OrbitControls(camera2, renderer2.domElement);
    controls.maxPolarAngle = Math.PI * 0.5;
    controls.minDistance = 7;
    controls.maxDistance = 17;

    camera3.position.set(-7, 0, -7);
    camera3.rotation.set(0, 180, 0);

    camera4.position.set(0, 0, 6);
    camera4.rotation.set(0, 0, 0);

    starSphere.position.set(0, 0, 0);
    starSphereEdgeLines.position.set(0, 0, 0);

    planetSphere.position.set(0, 0, -5);
    planetSphereEdgeLines.position.set(0, 0, -5);

    planetOrbitTraceLine.rotation.set(toRadians(90), 0, 0);

    starLight.position.set(0, 0, 0);

    scene.add(ambientLight);
    scene.add(starSphere);
    scene.add(planetSphere);
    scene.add(moonSphere);
    scene.add(planet1Sphere);
    scene.add(starSphereEdgeLines);
    scene.add(planetSphereEdgeLines);
    scene.add(planet1SphereEdgeLines);
    scene.add(moonSphereEdgeLines);
    scene.add(xAxisReferenceLine);
    scene.add(yAxisReferenceLine);
    scene.add(zAxisReferenceLine);
    scene.add(planetOrbitTraceLine);
    scene.add(planet1OrbitTraceLine);
    scene.add(moonOrbitTraceLine);
    scene.add(starLight);
}

function onSelectedCameraChange() {
    let selectedCameraRef = getCameraRef(getSelectedCamera());
    if (selectedCameraRef) {
        setValue('posx', selectedCameraRef.position.x);
        setValue('posy', selectedCameraRef.position.y);
        setValue('posz', selectedCameraRef.position.z);

        setValue('rotx', selectedCameraRef.rotation.x);
        setValue('roty', selectedCameraRef.rotation.y);
        setValue('rotz', selectedCameraRef.rotation.z);
    }
}

/**
 * @param {HTMLInputElement} checkboxInput 
 */
function onOrbitSettingChange(checkboxInput) {
    if (checkboxInput) {
        showOrbitTraces = !!checkboxInput.checked;
    }
}

/**
 * @param {HTMLInputElement} checkboxInput 
 */
function onAxesSettingChange(checkboxInput) {
    if (checkboxInput) {
        let value = !!checkboxInput.checked
        let legend = document.querySelector("#axisLegend");
        showReferenceAxes = value;
        if (legend) {
            if (!value) {
                legend.classList.add('d-none');
            } else {
                legend.classList.remove('d-none');
            }
        }
    }
}

function onUpdate() {
    let selectedCamera = getSelectedCamera();
    if (selectedCamera) {
        let newPosition = toVector(readPosition());
        let newRotation = toEuler(readRotation());
        let camera = getCameraRef(selectedCamera);

        if (camera) {
            camera.position.x = newPosition.x;
            camera.position.y = newPosition.y;
            camera.position.z = newPosition.z;

            camera.rotation.x = newRotation.x;
            camera.rotation.y = newRotation.y;
            camera.rotation.z = newRotation.z;
        } else {
            console.error('camera not found');
        }
    } else {
        console.error('Selected camera not found');
    }
}

function getSelectedCamera() {
    /** @type {HTMLSelectElement} */
    let cameraDropdown = document.querySelector("#selectedCamera");
    return (cameraDropdown && cameraDropdown.value) || '';
}

function readPosition() {
    return {
        x: getValue('posx'),
        y: getValue('posy'),
        z: getValue('posz'),
    };
}

function readRotation() {
    return {
        x: getValue('rotx'),
        y: getValue('roty'),
        z: getValue('rotz'),
    };
}

function getValue(id) {
    /** @type {HTMLInputElement} */
    let element = document.querySelector(`#${id}`);
    let value = 0;
    if (element && element.value) {
        try {
            value = parseFloat(element.value);
        } catch (error) {
            console.error(error);
        }
    }
    return value;
}

function setValue(id, value) {
    /** @type {HTMLInputElement} */
    let element = document.querySelector(`#${id}`);
    element.value = value;
}

function toVector(value) {
    let _value = isObject(value) ? value : {};
    return new THREE.Vector3(_value.x || 0, _value.y || 0, _value.z || 0);
}

function toEuler(value) {
    let _value = isObject(value) ? value : {};
    return new THREE.Euler(_value.x || 0, _value.y || 0, _value.z || 0);
}

function isObject(x) {
    return x && typeof x === 'object';
}

function getCameraRef(selectedCamera) {
    selectedCamera = selectedCamera || '';
    switch (selectedCamera) {
        case 'camera1':
            return camera1;
        case 'camera2':
            return camera2;
        case 'camera3':
            return camera3;
        case 'camera4':
            return camera4;
    }
    return null;
}

function getX(x, theta, radius) {
    return x + Math.cos((Math.PI / 180) * theta) * radius;
}

function getY(y, theta, radius) {
    return y + Math.sin((Math.PI / 180) * theta) * radius;
}

function toRadians(degrees) {
    return degrees * (Math.PI/180.0);
}

function toDegrees(radians) {
    return radians * (180.0/Math.PI);
}
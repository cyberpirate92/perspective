const AXIS_LENGTH = 5;
const VIEW_SCALE_FACTOR = 2.25;
const STAR_ROTATION_FACTOR = 0.01;
const PLANET_ROTATION_FACTOR = 0.02;

const COLOR_RED = 0xff0000;
const COLOR_GREEN = 0x00ff00;
const COLOR_BLUE = 0x0000ff;
const COLOR_YELLOW = 0xffff00;

let position = {
    planet: {
        x: 6,
        y: 0,
        z: 0,
        theta: 0,
        traceRadius: 2
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
}

let scene = new THREE.Scene();
let xAxisGeometry = new THREE.Geometry();
let yAxisGeometry = new THREE.Geometry();
let zAxisGeometry = new THREE.Geometry();
let ambientLight = new THREE.AmbientLight(0xfffffff)
let starSphereGeometry = new THREE.SphereGeometry(1, 32, 32);
let planetSphereGeometry = new THREE.SphereGeometry(0.5, 32, 32);
let starSphereEdges = new THREE.EdgesGeometry(starSphereGeometry);
let planetSphereEdges = new THREE.EdgesGeometry(planetSphereGeometry);
let planetOrbitGeometry = new THREE.CircleGeometry(position.planet.traceRadius, 32, 32);
var planetOrbitEdges = new THREE.EdgesGeometry(planetOrbitGeometry);

let materialRed = new THREE.MeshLambertMaterial({ color: COLOR_RED });
let materialBlue = new THREE.MeshLambertMaterial({ color: COLOR_BLUE });
let materialSkyBlue = new THREE.MeshLambertMaterial({ color: 0x7ec0ee });
let materialGreen = new THREE.MeshLambertMaterial({ color: COLOR_GREEN });
let materialYellow = new THREE.MeshLambertMaterial({ color: COLOR_YELLOW });

let materialXAxis = new THREE.LineBasicMaterial({ color: COLOR_RED });
let materialZAxis = new THREE.LineBasicMaterial({ color: COLOR_BLUE });
let materialYAxis = new THREE.LineBasicMaterial({ color: COLOR_GREEN });

let starSphere = new THREE.Mesh(starSphereGeometry, materialYellow);
let xAxisReferenceLine = new THREE.Line(xAxisGeometry, materialXAxis);
let yAxisReferenceLine = new THREE.Line(yAxisGeometry, materialYAxis);
let zAxisReferenceLine = new THREE.Line(zAxisGeometry, materialZAxis);
let planetSphere = new THREE.Mesh(planetSphereGeometry, materialSkyBlue);
var planetOrbitTraceLine = new THREE.LineSegments(planetOrbitEdges, new THREE.LineBasicMaterial({ color: 0xffffff }));
let starSphereEdgeLines = new THREE.LineSegments(starSphereEdges, new THREE.LineBasicMaterial({ color: 0xa3a3a3 }));
let planetSphereEdgeLines = new THREE.LineSegments(planetSphereEdges, new THREE.LineBasicMaterial({ color: 0xa3a3a3 }));

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

    position.planet.theta += 1;
    position.planet.x = getX(0, position.planet.theta, position.planet.traceRadius);
    position.planet.y = getY(0, position.planet.theta, position.planet.traceRadius);

    planetSphere.position.set(position.planet.x, position.planet.y, position.planet.z);
    planetSphereEdgeLines.position.set(position.planet.x, position.planet.y, position.planet.z);

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

    xAxisGeometry.vertices.push(new THREE.Vector3(-1 * AXIS_LENGTH, 0, 0));
    xAxisGeometry.vertices.push(new THREE.Vector3(AXIS_LENGTH, 0, 0));

    yAxisGeometry.vertices.push(new THREE.Vector3(0, -1 * AXIS_LENGTH, 0));
    yAxisGeometry.vertices.push(new THREE.Vector3(0, AXIS_LENGTH, 0));

    zAxisGeometry.vertices.push(new THREE.Vector3(0, 0, -1 * AXIS_LENGTH));
    zAxisGeometry.vertices.push(new THREE.Vector3(0, 0, AXIS_LENGTH));

    camera1.position.set(0, 0, 4);
    camera1.rotation.set(0, 0, 0);

    camera2.position.set(0, 2, 6);
    camera2.rotation.set(0, 0, 0);

    var controls = new THREE.OrbitControls(camera2, renderer2.domElement);
    controls.maxPolarAngle = Math.PI * 0.5;
    controls.minDistance = 5;
    controls.maxDistance = 15;

    camera3.position.set(-5, 0, -5);
    camera3.rotation.set(0, 180, 0);

    camera4.position.set(-5, -1, -5)
    camera4.rotation.set(0, 180, 90);

    starSphere.position.set(0, 0, 0);
    starSphereEdgeLines.position.set(0, 0, 0);

    planetSphere.position.set(0, 0, -3);
    planetSphereEdgeLines.position.set(0, 0, -3);

    scene.add(ambientLight);
    scene.add(starSphere);
    scene.add(planetSphere);
    scene.add(starSphereEdgeLines);
    scene.add(planetSphereEdgeLines);
    scene.add(xAxisReferenceLine);
    scene.add(yAxisReferenceLine);
    scene.add(zAxisReferenceLine);
    scene.add(planetOrbitTraceLine);
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
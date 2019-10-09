const AXIS_LENGTH = 5;
const VIEW_SCALE_FACTOR = 1;
const STAR_ROTATION_FACTOR = 0.01;
const PLANET_ROTATION_FACTOR = 0.02;
const MOON_ROTATION_FACTOR = 0.015;

const COLOR_RED = 0xff0000;
const COLOR_GREEN = 0x00ff00;
const COLOR_BLUE = 0x0000ff;
const COLOR_YELLOW = 0xffff00;
const COLOR_GRAY = 0xd3d3d3;

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
let moonSphereGeometry = new THREE.SphereGeometry(0.25, 32, 32);
let starSphereEdges = new THREE.EdgesGeometry(starSphereGeometry);
let planetSphereEdges = new THREE.EdgesGeometry(planetSphereGeometry);
let moonSphereEdges = new THREE.EdgesGeometry(moonSphereGeometry);
let planetOrbitGeometry = new THREE.CircleGeometry(position.planet.traceRadius, 32, 32);
let planetOrbitEdges = new THREE.EdgesGeometry(planetOrbitGeometry);
let moonOrbitGeometry = new THREE.CircleGeometry(position.moon.traceRadius, 32, 32);
let moonOrbitEdges = new THREE.EdgesGeometry(moonOrbitGeometry);

let materialRed = new THREE.MeshLambertMaterial({ color: COLOR_RED });
let materialBlue = new THREE.MeshLambertMaterial({ color: COLOR_BLUE });
let materialSkyBlue = new THREE.MeshLambertMaterial({ color: 0x7ec0ee });
let materialGreen = new THREE.MeshLambertMaterial({ color: COLOR_GREEN });
let materialYellow = new THREE.MeshLambertMaterial({ color: COLOR_YELLOW });
let materialGray = new THREE.MeshLambertMaterial({ color: COLOR_GRAY});

let materialXAxis = new THREE.LineBasicMaterial({ color: COLOR_RED });
let materialZAxis = new THREE.LineBasicMaterial({ color: COLOR_BLUE });
let materialYAxis = new THREE.LineBasicMaterial({ color: COLOR_GREEN });

let starSphere = new THREE.Mesh(starSphereGeometry, materialYellow);
let xAxisReferenceLine = new THREE.Line(xAxisGeometry, materialXAxis);
let yAxisReferenceLine = new THREE.Line(yAxisGeometry, materialYAxis);
let zAxisReferenceLine = new THREE.Line(zAxisGeometry, materialZAxis);
let planetSphere = new THREE.Mesh(planetSphereGeometry, materialSkyBlue);
let moonSphere = new THREE.Mesh(moonSphereGeometry, materialGray);
let planetOrbitTraceLine = new THREE.LineSegments(planetOrbitEdges, new THREE.LineBasicMaterial({ color: 0xffffff }));
let moonOrbitTraceLine = new THREE.LineSegments(moonOrbitEdges, new THREE.LineBasicMaterial({ color: 0xffffff }));
let starSphereEdgeLines = new THREE.LineSegments(starSphereEdges, new THREE.LineBasicMaterial({ color: 0xa3a3a3 }));
let planetSphereEdgeLines = new THREE.LineSegments(planetSphereEdges, new THREE.LineBasicMaterial({ color: 0xa3a3a3 }));
let moonSphereEdgeLines = new THREE.LineSegments(moonSphereEdges, new THREE.LineBasicMaterial({ color: 0xa3a3a3}));

let camera = new THREE.PerspectiveCamera(75, cameraProperties.aspectRatio, cameraProperties.near, cameraProperties.far);

let renderer = new THREE.WebGLRenderer({ antialias: true });

window.addEventListener('load', () => {
    initializeScene();
    document.body.appendChild(renderer.domElement);    
    animate();
});

let animate = function () {
    requestAnimationFrame(animate);

    starSphere.rotation.y += STAR_ROTATION_FACTOR;
    starSphereEdgeLines.rotation.y += STAR_ROTATION_FACTOR;

    planetSphere.rotation.y -= PLANET_ROTATION_FACTOR;
    planetSphereEdgeLines.rotation.y -= PLANET_ROTATION_FACTOR;

    moonSphere.rotation.x -= MOON_ROTATION_FACTOR;
    moonSphereEdgeLines.rotation.x -= MOON_ROTATION_FACTOR;

    position.planet.theta += 1;
    position.planet.x = getX(0, position.planet.theta, position.planet.traceRadius);
    position.planet.z = getY(0, position.planet.theta, position.planet.traceRadius);

    moonOrbitTraceLine.position.set(position.planet.x, position.planet.y, position.planet.z);

    position.moon.theta += 1;
    position.moon.x = getX(0, position.moon.theta, position.moon.traceRadius);
    position.moon.y = getY(0, position.moon.theta, position.moon.traceRadius);

    planetSphere.position.set(position.planet.x, position.planet.y, position.planet.z);
    planetSphereEdgeLines.position.set(position.planet.x, position.planet.y, position.planet.z);

    moonSphere.position.set(position.planet.x + position.moon.x, position.planet.y + position.moon.y, position.moon.z + position.planet.z);
    moonSphereEdgeLines.position.set(position.planet.x + position.moon.x, position.planet.y + position.moon.y, position.moon.z + position.planet.z);

    renderer.render(scene, camera);
};

function initializeRenderer(rendererObj) {
    rendererObj.setSize(rendererProperties.size.width, rendererProperties.size.height);
    rendererObj.setPixelRatio(window.devicePixelRatio);
}

function initializeScene() {
    initializeRenderer(renderer);

    xAxisGeometry.vertices.push(new THREE.Vector3(-1 * AXIS_LENGTH, 0, 0));
    xAxisGeometry.vertices.push(new THREE.Vector3(AXIS_LENGTH, 0, 0));

    yAxisGeometry.vertices.push(new THREE.Vector3(0, -1 * AXIS_LENGTH, 0));
    yAxisGeometry.vertices.push(new THREE.Vector3(0, AXIS_LENGTH, 0));

    zAxisGeometry.vertices.push(new THREE.Vector3(0, 0, -1 * AXIS_LENGTH));
    zAxisGeometry.vertices.push(new THREE.Vector3(0, 0, AXIS_LENGTH));

    camera.position.set(0, 0, 14);

    var controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.maxPolarAngle = Math.PI * 0.5;
    controls.minDistance = 5;
    controls.maxDistance = 15;

    starSphere.position.set(0, 0, 0);
    starSphereEdgeLines.position.set(0, 0, 0);

    planetSphere.position.set(0, 0, -3);
    planetSphereEdgeLines.position.set(0, 0, -3);
    
    planetOrbitTraceLine.rotation.set(toRadians(90), 0, 0);

    scene.add(ambientLight);
    scene.add(starSphere);
    scene.add(planetSphere);
    scene.add(moonSphere);
    scene.add(starSphereEdgeLines);
    scene.add(planetSphereEdgeLines);
    scene.add(moonSphereEdgeLines);
    scene.add(xAxisReferenceLine);
    scene.add(yAxisReferenceLine);
    scene.add(zAxisReferenceLine);
    scene.add(planetOrbitTraceLine);
    scene.add(moonOrbitTraceLine);
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
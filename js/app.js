const SCALE_FACTOR = 2.25;
const CAMERA_VELOCITY = 0.02;

let scene = new THREE.Scene();

let xAxisGeometry = new THREE.Geometry();
let yAxisGeometry = new THREE.Geometry();
let zAxisGeometry = new THREE.Geometry();
let boxGeometry = new THREE.BoxGeometry(1, 1, 1);
let starSphereGeometry = new THREE.SphereGeometry();
let planetSphereGeometry = new THREE.SphereGeometry(0.5);
let starSphereEdges = new THREE.EdgesGeometry(starSphereGeometry);
let planetSphereEdges = new THREE.EdgesGeometry(planetSphereGeometry);

let materialRed = new THREE.MeshBasicMaterial({ color: 0xff0000 });
let materialBlue = new THREE.MeshBasicMaterial({ color: 0x0000ff });
let materialGreen = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
let materialYellow = new THREE.MeshBasicMaterial({ color: 0xffff00 });
let materialSkyBlue = new THREE.MeshBasicMaterial({ color: 0x7ec0ee });
let materialXAxis = new THREE.LineBasicMaterial({ color: 0xff0000 });
let materialYAxis = new THREE.LineBasicMaterial({ color: 0x00ff00 });
let materialZAxis = new THREE.LineBasicMaterial({ color: 0x0000ff });

let starSphere = new THREE.Mesh(starSphereGeometry, materialYellow);
let planetSphere = new THREE.Mesh(planetSphereGeometry, materialSkyBlue);
let starSphereEdgeLines = new THREE.LineSegments(starSphereEdges, new THREE.LineBasicMaterial({ color: 0x000000 }));
let planetSphereEdgeLines = new THREE.LineSegments(planetSphereEdges, new THREE.LineBasicMaterial({ color: 0x000000 }));
let xAxisReferenceLine = new THREE.Line(xAxisGeometry, materialXAxis);
let yAxisReferenceLine = new THREE.Line(yAxisGeometry, materialYAxis);
let zAxisReferenceLine = new THREE.Line(zAxisGeometry, materialZAxis);

let camera1 = new THREE.PerspectiveCamera(75, (window.innerWidth / window.innerHeight) * 1, 0.1, 1000);
let camera2 = new THREE.PerspectiveCamera(75, (window.innerWidth / window.innerHeight) * 1, 0.1, 1000);
let camera3 = new THREE.PerspectiveCamera(75, (window.innerWidth / window.innerHeight) * 1, 0.1, 1000);
let camera4 = new THREE.PerspectiveCamera(75, (window.innerWidth / window.innerHeight) * 1, 0.1, 1000);

let renderer1 = new THREE.WebGLRenderer();
let renderer2 = new THREE.WebGLRenderer();
let renderer3 = new THREE.WebGLRenderer();
let renderer4 = new THREE.WebGLRenderer();

let view1;
let view2;
let view3;
let view4;
let cameraVelocity;

xAxisGeometry.vertices.push(new THREE.Vector3(-5, 0, 0));
xAxisGeometry.vertices.push(new THREE.Vector3(5, 0, 0));

yAxisGeometry.vertices.push(new THREE.Vector3(0, -5, 0));
yAxisGeometry.vertices.push(new THREE.Vector3(0, 5, 0));

zAxisGeometry.vertices.push(new THREE.Vector3(0, 0, -5));
zAxisGeometry.vertices.push(new THREE.Vector3(0, 0, 5));

window.addEventListener('load', () => {
    view1 = document.querySelector("#view1");
    view2 = document.querySelector("#view2");
    view3 = document.querySelector("#view3");
    view4 = document.querySelector("#view4");

    renderer1.setSize(window.innerWidth / SCALE_FACTOR, window.innerHeight / SCALE_FACTOR);
    renderer2.setSize(window.innerWidth / SCALE_FACTOR, window.innerHeight / SCALE_FACTOR);
    renderer3.setSize(window.innerWidth / SCALE_FACTOR, window.innerHeight / SCALE_FACTOR);
    renderer4.setSize(window.innerWidth / SCALE_FACTOR, window.innerHeight / SCALE_FACTOR);

    view1.appendChild(renderer1.domElement);
    view2.appendChild(renderer2.domElement);
    view3.appendChild(renderer3.domElement);
    view4.appendChild(renderer4.domElement);

    scene.add(starSphere);
    scene.add(planetSphere);
    scene.add(starSphereEdgeLines);
    scene.add(planetSphereEdgeLines);
    scene.add(xAxisReferenceLine);
    scene.add(yAxisReferenceLine);
    scene.add(zAxisReferenceLine);

    setPosition(camera1, 0, 0, 5);
    setRotation(camera1);

    setPosition(camera2, 0, 2, 6);
    setRotation(camera2);

    setPosition(camera3, -10, 0, -5);
    setRotation(camera3, 0, 180, 0);

    setPosition(camera4, -5, -2, 5);
    setRotation(camera4);

    setPosition(starSphere, 0, 0, 0);
    setPosition(starSphereEdgeLines, 0, 0, 0);
    setPosition(planetSphere, 0, 0, -3);
    setPosition(planetSphereEdgeLines, 0, 0, -3);

    animate();
});

let animate = function () {
    requestAnimationFrame(animate);

    starSphere.rotation.x += 0.01;
    starSphereEdgeLines.rotation.x += 0.01;
    planetSphere.rotation.x -= 0.03;
    planetSphereEdgeLines.rotation.x -= 0.03;

    if (camera2.position.z < 0) {
        cameraVelocity = Math.abs(CAMERA_VELOCITY);
    } else if (camera2.position.z > 5) {
        cameraVelocity = CAMERA_VELOCITY * -1;
    }
    camera2.position.z += cameraVelocity;

    renderer1.render(scene, camera1);
    renderer2.render(scene, camera2);
    renderer3.render(scene, camera3);
    renderer4.render(scene, camera4);
};

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

function setPosition(obj3d, x, y, z) {
    if (obj3d && obj3d.position) {
        obj3d.position.x = x || 0;
        obj3d.position.y = y || 0;
        obj3d.position.z = z || 0;
    }
}

function setRotation(obj3d, x, y, z) {
    if (obj3d && obj3d.rotation) {
        obj3d.rotation.x = x || 0;
        obj3d.rotation.y = y || 0;
        obj3d.rotation.z = z || 0;
    }
}
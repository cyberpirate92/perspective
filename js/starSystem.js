const SPHERE_WIDTH_SEGMENTS = 32;
const SPHERE_HEIGHT_SEGMENTS = 32;
const CIRCLE_SEGMENTS = 120;
const ROTATIONAL_FACTOR = 0.01;
const ORBITAL_RADIUS_FACTOR = 2;
const ORBITAL_VELOCITY_FACTOR = 0.05;

let cameraProperties = {
    aspectRatio: window.innerWidth / window.innerHeight,
    near: 1,
    far: 1000,
};

let rendererProperties = {
    size: {
        width: window.innerWidth,
        height: window.innerHeight,
    }
};

/**
 * @typedef {Object} PlanetaryBody
 * @property {string} name name of this body
 * @property {number} radius radius of the planet
 * @property {number} angularVelocity rotational speed
 * @property {string} surfaceTexture path of texture file
 * @property {CelestialBody[]} descendants other celestial bodies orbiting this
 * @property {string} parentId unique parent identifier
 * @property {string} selfId unique self identifier
 * @property {RevolutionProperties} revolution revolution properties of this body
 * @property {Object} position position of the body in space
 * @property {ThreeJsObjectReferences} references references to related threeJs objects
 */

/**
 * @typedef {Object} RevolutionProperties
 * @property {boolean} doesRevolve flag to determine if a body revolves around another planet/star
 * @property {number} orbitalVelocity
 * @property {number} orbitRadius 
 * @property {number} currentAngle used internally for calculating position on orbit
 * @property {CelestialBody} around reference to the planet/star which this body revolves around
 */

/**
 * Object representing an arbitary point in space
 * @typedef {Object} Position
 * @property {number} x
 * @property {number} y
 * @property {number} z
 */

 /**
  * Internal object used for storing ThreeJs objects for updates
  * @typedef {Object} ThreeJsObjectReferences
  * @property {Object} sphere THREE.Mesh Object representing the planet
  * @property {Object} orbitTrace THREE.LineSegments Object representing the orbit trace
  * @property {Object} sphereOutline THREE.LineSegments Object representing the planet's outline
  */

/** Class representing a body in space */
class CelestialBody {
    /**
     * @param {PlanetaryBody} obj 
     */
    constructor(obj) {
        obj = isObject(obj) ? obj : {};
        this.name = obj.name || 'Unnamed',
        this.radius = obj.radius || 0;
        this.angularVelocity = obj.angularVelocity || 0;
        this.surfaceTexture = obj.surfaceTexture || null;
        if (isArray(obj.descendants)) {
            obj.descendants.forEach(descendant => this.addDescendant(descendant));
        } else {
            this.descendants = [];
        }
        this.parentId = obj.parentId || null;
        this.selfId = generateUUID();
        this.position = {
            x: 0,
            y: 0,
            z: 0,
        };
        if (isObject(obj.position)) {
            this.setPosition(obj.position.x, obj.position.y, obj.position.z);
        }
        this.revolution = isObject(obj.revolution) ? obj.revolution : getDefaultRevolutionProperties();
        if (isObject(obj.references)) {
            this.references = obj.references;
        }
        this.skipRender = !!obj.skipRender;
    }

    addDescendant(celestialBody) {
        if (isObject(celestialBody) && celestialBody instanceof CelestialBody) {
            celestialBody.parentId = this.selfId;
            this.descendants.push(celestialBody);
        }
    }

    /**
     * Set the (x, y, z) coordinates of this object
     * @param {number} x 
     * @param {number} y 
     * @param {number} z 
     */
    setPosition(x, y, z) {
        try {
            this.position.x = parseFloat(x) || this.position.x;
            this.position.y = parseFloat(y) || this.position.y;
            this.position.z = parseFloat(z) || this.position.y;
        } catch (error) {
            console.error(error);
        }
    }
}

class SceneProperties {
    constructor() {
        this.showOrbits = true;
        this.showMesh = true;
    }

    hideOrbits() {
        this.showOrbits = false;
    }

    showOrbits() {
        this.showOrbits = true;
    }

    hideMesh() {
        this.showMesh = false;
    }

    showMesh() {
        this.showMesh = true;
    }
}

/**
 * Class representing a Star
 * @extends CelestialBody
 */
class Star extends CelestialBody {
    constructor(obj) {
        super(obj);
        this.selfId = `star-${this.selfId}`;
    }

    /**
     * Add a planet orbiting this star
     * @param {Planet} planet 
     */
    addPlanet(planet) {
        if (isObject(planet) && planet instanceof Planet) {
            super.addDescendant(planet);
        }
    }

    addDescendant(celestialBody) {
        this.addPlanet(celestialBody);
    }
}

/**
 * Class representing a Planet
 * @extends CelestialBody
 */
class Planet extends CelestialBody {
    constructor(obj) {
        super(obj);
        this.selfId = `planet-${this.selfId}`;
    }

    /**
     * Add a moon orbiting this planet
     * @param {Moon} moon 
     */
    addMoon(moon) {
        if (isObject(moon) && moon instanceof Moon) {
            super.addDescendant(moon);
        }
    }

    addDescendant(celestialBody) {
        this.addMoon(moon);
    }
}

/**
 * Class representing a planet's moon
 * @extends CelestialBody
 */
class Moon extends CelestialBody {
    constructor(obj) {
        super(obj);
        this.selfId = `moon-${this.selfId}`;
    }

    addDescendant(celestialBody) {
        console.warn(`Cannot add descendant to ${this.selfId}. Moons cannot have planetary descendants`);
    }
}

let scene = new THREE.Scene();
let ambientLight = new THREE.AmbientLight();
var axesHelper = new THREE.AxesHelper(250);

let renderer = new THREE.WebGLRenderer();
let camera = new THREE.PerspectiveCamera();

let sceneSettings = {
    showOutlines: false,
    showOrbits: false,
};

// special object required to hold other planets & stars
let centerOfUniverse = new CelestialBody({
    name: 'root',
    parentId: '0',
    skipRender: true,
});

let sun = new Star({
    name: 'Sun',
    radius: 100,
    angularVelocity: 1.996,
    surfaceTexture: getTextureFilePath('sun'),
    revolution: {
        doesRevolve: false
    },
    position: {
        x: 0,
        y: 0,
        z: 0,
    }
});

let mercury = new Planet({
    name: 'Mercury',
    radius: 0.383,
    angularVelocity: 0.003025,
    surfaceTexture: getTextureFilePath('mercury'),
    revolution: {
        doesRevolve: true,
        orbitalVelocity: 1.59,
        orbitRadius: 0.387,
        around: sun,
    },
});

let venus = new Planet({
    name: 'Venus',
    radius: 0.949,
    angularVelocity: -0.00181,
    surfaceTexture: getTextureFilePath('venus'),
    revolution: {
        doesRevolve: true,
        orbitalVelocity: 1.18,
        orbitRadius: 0.723,
        around: sun,
    },
});

let earth = new Planet({
    name: 'Earth',
    radius: 1,
    angularVelocity: 0.4444444,
    surfaceTexture: getTextureFilePath('earth'),
    revolution: {
        doesRevolve: true,
        orbitalVelocity: 1,
        orbitRadius: 1,
        around: sun,
    },
});

let earthMoon = new Moon({
    name: 'Moon (Earth)',
    radius: 0.2724,
    angularVelocity: 0, // will come to this later as moon is tidally locked to earth, which is hard to simulate without correct values
    surfaceTexture: getTextureFilePath('moon'),
    revolution: {
        doesRevolve: true,
        orbitalVelocity: 0.0343,
        orbitRadius: 0.00257,
        around: earth,
    }
});

let mars = new Planet({
    name: 'Mars',
    radius: 0.532,
    angularVelocity: 0.24117,
    surfaceTexture: getTextureFilePath('mars'),
    revolution: {
        doesRevolve: true,
        orbitalVelocity: 0.808,
        orbitRadius: 1.52,
        around: sun,
    },
});

let jupiter = new Planet({
    name: 'Jupiter',
    radius: 11.21,
    angularVelocity: 11.944444,
    surfaceTexture: getTextureFilePath('jupiter'),
    revolution: {
        doesRevolve: true,
        orbitalVelocity: 0.439,
        orbitRadius: 5.2,
        around: sun,
    },
});

let saturn = new Planet({
    name: 'Saturn',
    radius: 9.45,
    angularVelocity: 9.87,
    surfaceTexture: getTextureFilePath('saturn'),
    revolution: {
        doesRevolve: true,
        orbitalVelocity: 0.325,
        orbitRadius: 9.5,
        around: sun,
    },
});

let uranus = new Planet({
    name: 'Uranus',
    radius: 4.01,
    angularVelocity: 2.59,
    surfaceTexture: getTextureFilePath('uranus'),
    revolution: {
        doesRevolve: true,
        orbitalVelocity: 0.228,
        orbitRadius: 19.20,
        around: sun,
    },
});

let neptune = new Planet({
    name: 'Neptune',
    radius: 3.88,
    angularVelocity: 2.68,
    surfaceTexture: getTextureFilePath('neptune'),
    revolution: {
        doesRevolve: true,
        orbitalVelocity: 0.182,
        orbitRadius: 30.05,
        around: sun,
    },
});



function initializeScene() {
    earth.descendants.push(earthMoon);
    sun.descendants.push(mercury, venus, earth, mars, jupiter, saturn, uranus, neptune);
    centerOfUniverse.descendants.push(sun);

    scene.add(ambientLight);
    scene.add(axesHelper);
    
    initialize3d(centerOfUniverse);
    
    renderer.setSize(rendererProperties.size.width, rendererProperties.size.height);
    renderer.setPixelRatio(window.devicePixelRatio);
    
    var controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.minDistance = 20;
    controls.maxDistance = 1000;

    camera.position.set(0, 0, 400);
}

/**
 * Create the required ThreeJs objects 
 * to represent the provided celestial body
 * and it's descendants
 * 
 * @param {CelestialBody} planet 
 */
function initialize3d(planet) {
    if (isObject(planet) && planet instanceof CelestialBody) {    
        if (planet.skipRender !== true) {
            
            let texture = new THREE.TextureLoader().load(planet.surfaceTexture);
            let sphereGeometry = new THREE.SphereGeometry(planet.radius, SPHERE_WIDTH_SEGMENTS, SPHERE_HEIGHT_SEGMENTS);
            let sphereSurface = new THREE.MeshLambertMaterial({ 
                map: texture,
            });
            let sphere = new THREE.Mesh(sphereGeometry, sphereSurface);
            
            let sphereOutlineGeometry = new THREE.EdgesGeometry(sphereGeometry);
            let sphereOutline = new THREE.LineSegments(sphereOutlineGeometry, new THREE.LineBasicMaterial({ color: 0xffffff }));
            let orbitTraceLine;
           
            if (planet.revolution.doesRevolve) {
                let parentRadiusOffset = planet.revolution.around.radius;  // offset parent planet's radius to prevent overlap
                let orbitTraceGeometry = new THREE.CircleGeometry((parentRadiusOffset + planet.revolution.orbitRadius) * ORBITAL_RADIUS_FACTOR, CIRCLE_SEGMENTS)
                let orbitTrace = new THREE.EdgesGeometry(orbitTraceGeometry);
                orbitTraceLine = new THREE.LineSegments(orbitTrace, new THREE.LineBasicMaterial({ color: 0xffffff }));
                
                let parentPosition = planet.revolution.around.position;
                orbitTraceLine.position.set(parentPosition.x + parentRadiusOffset, parentPosition.y + parentRadiusOffset, parentPosition.z);
            }
            
            planet.references = {
                sphere: sphere,
                orbitTrace: orbitTraceLine,
                sphereOutline: sphereOutline,
            };

            scene.add(sphere);
            if (orbitTraceLine) {
                scene.add(orbitTraceLine);
            }
            scene.add(sphereOutline);
        }
        planet.descendants.forEach(descendant => initialize3d(descendant));
    } else {
        console.warn('Cannot initialize - Invalid object');
    }
}

let animate = function () {
    window.requestAnimationFrame(animate);
    animatePlanet(centerOfUniverse);
    renderer.render(scene, camera);
};

/**
 * Calculate the rotation & revolution of planet 
 * and it's descendants
 * @param {CelestialBody} planet 
 */
function animatePlanet(planet) {
    if (isObject(planet) && planet instanceof CelestialBody) {
        if (planet.skipRender !== true) {
            if (planet.angularVelocity !== 0) {
                let rotationalVelocity = planet.angularVelocity * ROTATIONAL_FACTOR;
                planet.references.sphere.rotation.x += rotationalVelocity;
                planet.references.sphereOutline.rotation.x += rotationalVelocity;
            }
            if (planet.revolution.doesRevolve && planet.revolution.orbitalVelocity !== 0) {
                if (!planet.revolution.currentAngle) {
                    planet.revolution.currentAngle = 0;
                }
                planet.revolution.currentAngle += ( planet.revolution.orbitalVelocity * ORBITAL_VELOCITY_FACTOR );
                planet.position.x = getX(0, planet.revolution.currentAngle, (planet.revolution.orbitRadius + planet.revolution.around.radius) * ORBITAL_RADIUS_FACTOR);
                planet.position.y = getY(0, planet.revolution.currentAngle, (planet.revolution.orbitRadius + planet.revolution.around.radius) * ORBITAL_RADIUS_FACTOR);
               
                let parentPosition = planet.revolution.around.position;
                let selfPosition = planet.position;
                let offset = 0; // planet.revolution.around.radius + planet.radius; // offset planet radius to avoid overlap

                let positionX = selfPosition.x + parentPosition.x;
                let positionY = selfPosition.y + parentPosition.y;
                let positionZ = selfPosition.z + parentPosition.z;

                planet.references.sphere.position.set(positionX, positionY, positionZ);
                planet.references.sphereOutline.position.set(positionX, positionY, positionZ);
                
                // only update orbit trace if parent also revolves (ex: Moon)
                if (planet.revolution.around.revolution.doesRevolve) {
                    planet.references.orbitTrace.position.set(parentPosition.x + offset, parentPosition.y, parentPosition.z);
                }
            }
            if (planet.references.orbitTrace) {
                planet.references.orbitTrace.visible = !!sceneSettings.showOrbits;
            }
            if (planet.references.sphereOutline) {
                planet.references.sphereOutline.visible = !!sceneSettings.showOutlines;
            }
            // if (planet.name === 'Sun') {
            //     planet.references.sphere.visible = false;
            // }
        }
        planet.descendants.forEach(descendant => animatePlanet(descendant));
    }
}

window.addEventListener('load', () => {
    initializeScene();
    document.body.appendChild(renderer.domElement);
    animate();
});

function isObject(value) {
    return value && typeof value === 'object';
}

function isArray(value) {
    return isObject(value) && value instanceof Array;
}

/**
 * Generate a UUID. 
 * 
 * @returns {string} The generated UUID string
 */
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function getX(x, angle, radius) {
    return x + Math.cos((Math.PI / 180) * angle) * radius;
}

function getY(y, angle, radius) {
    return y + Math.sin((Math.PI / 180) * angle) * radius;
}

function toRadians(degrees) {
    return degrees * (Math.PI / 180.0);
}

function toDegrees(radians) {
    return radians * (180.0 / Math.PI);
}

/**
 * @returns {RevolutionProperties}
 */
function getDefaultRevolutionProperties() {
    return {
        currentAngle: 0,
        doesRevolve: false,
        orbitRadius: 0,
        orbitalVelocity: 0,
    }
}

function getTextureFilePath(planet) {
    let filePath = `./assets/planets/${planet}map.jpg`;
    console.log(filePath);
    return filePath;
}
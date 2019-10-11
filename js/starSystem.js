"use strict"

/**
 * @typedef {Object} PlanetaryBody
 * @property {number} radius radius of the planet
 * @property {number} angularVelocity rotational speed
 * @property {string} surfaceTexture path of texture file
 * @property {CelestialBody[]} descendants other celestial bodies orbiting this
 * @property {string} parentId unique parent identifier
 * @property {string} selfId unique self identifier
 * @property {RevolutionProperties} revolution revolution properties of this body
 */

/**
 * @typedef {Object} RevolutionProperties
 * @property {boolean} doesRevolve
 * @property {number} orbitalVelocity
 */

/** Class representing a body in space */
class CelestialBody {
    /**
     * @param {PlanetaryBody} obj 
     */
    constructor(obj) {
        obj = isObject(obj) ? obj  : {};
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
    }

    addDescendant(celestialBody) {
        if (isObject(celestialBody) && celestialBody instanceof CelestialBody) {
            celestialBody.parentId = this.selfId;
            this.descendants.push(celestialBody);
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

let renderer = new THREE.WebGLRenderer();
let camera = new THREE.PerspectiveCamera();

let centerOfUniverse = new CelestialBody();

function initializeScene() {
    
}

let animate = new function() {
    window.requestAnimationFrame(animate);
};

window.addEventListener('load', () => {

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
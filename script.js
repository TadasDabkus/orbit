import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";


/* =========================================================
   ORBIT — AERIS PRODUCT CONFIGURATOR
========================================================= */

import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";


const container = document.getElementById("productCanvas");


/* =========================================================
   RENDERER
========================================================= */

const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: false
});

renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, 2)
);

renderer.setSize(
    window.innerWidth,
    window.innerHeight
);

container.appendChild(renderer.domElement);

console.log("ORBIT RENDERER READY");


/* =========================================================
   SCENE
========================================================= */

const scene = new THREE.Scene();

scene.background = new THREE.Color(0x080909);


/* =========================================================
   CAMERA
========================================================= */

const camera = new THREE.PerspectiveCamera(
    42,
    window.innerWidth / window.innerHeight,
    0.1,
    100
);

camera.position.set(0, 1.8, 6.5);


/* =========================================================
   CONTROLS
========================================================= */

const controls = new OrbitControls(camera, renderer.domElement);

controls.enableDamping = true;
controls.dampingFactor = 0.06;

controls.minDistance = 3.8;
controls.maxDistance = 9;

controls.minPolarAngle = 0.65;
controls.maxPolarAngle = 2.35;

controls.target.set(0, 0.4, 0);

controls.update();


/* =========================================================
   LIGHTING
========================================================= */

const ambientLight = new THREE.AmbientLight(
    0xffffff,
    1.4
);

scene.add(ambientLight);


const keyLight = new THREE.DirectionalLight(
    0xffffff,
    4
);

keyLight.position.set(4, 6, 5);

scene.add(keyLight);


const fillLight = new THREE.DirectionalLight(
    0x9bbcff,
    2
);

fillLight.position.set(-5, 2, 3);

scene.add(fillLight);


const rimLight = new THREE.DirectionalLight(
    0xc8ff00,
    3
);

rimLight.position.set(0, 4, -6);

scene.add(rimLight);


/* =========================================================
   AERIS PRODUCT
========================================================= */

const product = new THREE.Group();

product.position.y = 0.15;

scene.add(product);


/* =========================================================
   MATERIALS
========================================================= */

const materials = {

    matte: new THREE.MeshPhysicalMaterial({
        color: 0x151719,
        roughness: 0.48,
        metalness: 0.05
    }),

    metal: new THREE.MeshPhysicalMaterial({
        color: 0x25282b,
        roughness: 0.2,
        metalness: 0.9
    }),

    glass: new THREE.MeshPhysicalMaterial({
        color: 0x252a2e,
        roughness: 0.08,
        metalness: 0.1,
        transmission: 0.35,
        thickness: 0.6
    }),

    pad: new THREE.MeshPhysicalMaterial({
        color: 0x080909,
        roughness: 0.8,
        metalness: 0
    }),

    accent: new THREE.MeshPhysicalMaterial({
        color: 0xc8ff00,
        roughness: 0.25,
        metalness: 0.45
    })

};


/* =========================================================
   GEOMETRY HELPERS
========================================================= */

function createMesh(
    geometry,
    material,
    position = [0, 0, 0],
    rotation = [0, 0, 0]
) {

    const mesh = new THREE.Mesh(
        geometry,
        material
    );

    mesh.position.set(...position);
    mesh.rotation.set(...rotation);

    product.add(mesh);

    return mesh;
}


/* =========================================================
   HEADBAND
========================================================= */

const headband = createMesh(

    new THREE.TorusGeometry(
        1.72,
        0.105,
        32,
        96,
        Math.PI
    ),

    materials.matte,

    [0, 0.8, 0],

    [Math.PI / 2, 0, 0]

);


/* =========================================================
   INNER HEADBAND
========================================================= */

const innerBand = createMesh(

    new THREE.TorusGeometry(
        1.52,
        0.055,
        24,
        96,
        Math.PI
    ),

    materials.pad,

    [0, 0.79, 0],

    [Math.PI / 2, 0, 0]

);


/* =========================================================
   EAR CUPS
========================================================= */

const cupGeometry = new THREE.CylinderGeometry(
    0.58,
    0.58,
    0.32,
    48
);

const leftCup = createMesh(
    cupGeometry,
    materials.matte,
    [-1.45, 0.05, 0],
    [0, 0, Math.PI / 2]
);

const rightCup = createMesh(
    cupGeometry.clone(),
    materials.matte,
    [1.45, 0.05, 0],
    [0, 0, Math.PI / 2]
);


/* =========================================================
   EAR CUP OUTER RINGS
========================================================= */

const ringGeometry = new THREE.TorusGeometry(
    0.52,
    0.045,
    24,
    64
);

createMesh(
    ringGeometry,
    materials.accent,
    [-1.61, 0.05, 0],
    [0, Math.PI / 2, 0]
);

createMesh(
    ringGeometry.clone(),
    materials.accent,
    [1.61, 0.05, 0],
    [0, Math.PI / 2, 0]
);


/* =========================================================
   EAR PADS
========================================================= */

const padGeometry = new THREE.CylinderGeometry(
    0.44,
    0.44,
    0.18,
    48
);

createMesh(
    padGeometry,
    materials.pad,
    [-1.63, 0.05, 0],
    [0, Math.PI / 2, 0]
);

createMesh(
    padGeometry.clone(),
    materials.pad,
    [1.63, 0.05, 0],
    [0, Math.PI / 2, 0]
);


/* =========================================================
   CENTER BRIDGE
========================================================= */

const bridgeGeometry = new THREE.BoxGeometry(
    1.55,
    0.16,
    0.16
);

createMesh(
    bridgeGeometry,
    materials.matte,
    [0, 0.75, 0]
);


/* =========================================================
   BRIDGE ACCENT
========================================================= */

const bridgeAccent = createMesh(
    new THREE.BoxGeometry(
        0.8,
        0.035,
        0.035
    ),
    materials.accent,
    [0, 0.84, 0.09]
);


/* =========================================================
   SIDE CONNECTORS
========================================================= */

const connectorGeometry = new THREE.CylinderGeometry(
    0.09,
    0.09,
    0.45,
    24
);

createMesh(
    connectorGeometry,
    materials.metal,
    [-1.18, 0.42, 0]
);

createMesh(
    connectorGeometry.clone(),
    materials.metal,
    [1.18, 0.42, 0]
);


/* =========================================================
   PRODUCT DETAILS
========================================================= */

const detailMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x6c7375,
    roughness: 0.25,
    metalness: 0.7
});


/* small side details */

createMesh(
    new THREE.BoxGeometry(
        0.06,
        0.24,
        0.12
    ),
    detailMaterial,
    [-1.82, 0.05, 0]
);

createMesh(
    new THREE.BoxGeometry(
        0.06,
        0.24,
        0.12
    ),
    detailMaterial,
    [1.82, 0.05, 0]
);


/* =========================================================
   CONFIGURATION
========================================================= */

const config = {

    material: "matte",
    color: "black",
    finish: "dark",
    lighting: "studio"

};


/* =========================================================
   COLOR DATA
========================================================= */

const colorData = {

    black: 0x151719,
    white: 0xe7e9e6,
    orange: 0xff6b22,
    lime: 0xc8ff00

};


/* =========================================================
   PRICE DATA
========================================================= */

const materialPrices = {

    matte: 0,
    metal: 35,
    glass: 70

};

const colorPrices = {

    black: 0,
    white: 0,
    orange: 15,
    lime: 20

};


/* =========================================================
   PRODUCT MATERIAL OBJECTS
========================================================= */

const mainParts = [];

product.traverse(object => {

    if (
        object.isMesh &&
        object.material !== materials.pad &&
        object.material !== materials.accent &&
        object.material !== detailMaterial
    ) {

        mainParts.push(object);

    }

});


/* =========================================================
   UPDATE MATERIAL
========================================================= */

function updateMaterial() {

    let selectedMaterial;

    if (config.material === "matte") {

        selectedMaterial = materials.matte.clone();

    }

    if (config.material === "metal") {

        selectedMaterial = materials.metal.clone();

    }

    if (config.material === "glass") {

        selectedMaterial = materials.glass.clone();

    }

    selectedMaterial.color.set(
        colorData[config.color]
    );

    mainParts.forEach(mesh => {

        mesh.material = selectedMaterial.clone();

    });

}


/* =========================================================
   UPDATE COLOR
========================================================= */

function updateColor() {

    mainParts.forEach(mesh => {

        mesh.material.color.set(
            colorData[config.color]
        );

    });

}


/* =========================================================
   UPDATE FINISH
========================================================= */

function updateFinish() {

    if (config.finish === "dark") {

        scene.background = new THREE.Color(
            0x080909
        );

    }

    if (config.finish === "light") {

        scene.background = new THREE.Color(
            0xe9ebe8
        );

    }

}


/* =========================================================
   UPDATE LIGHTING
========================================================= */

function updateLighting() {

    if (config.lighting === "studio") {

        ambientLight.intensity = 1.4;
        keyLight.intensity = 4;
        fillLight.intensity = 2;
        rimLight.intensity = 3;

        rimLight.color.set(0xc8ff00);

    }


    if (config.lighting === "night") {

        ambientLight.intensity = 0.45;
        keyLight.intensity = 1.5;
        fillLight.intensity = 0.8;
        rimLight.intensity = 4;

        rimLight.color.set(0x4d7cff);

    }


    if (config.lighting === "neon") {

        ambientLight.intensity = 0.3;
        keyLight.intensity = 1;
        fillLight.intensity = 2.5;
        rimLight.intensity = 5;

        rimLight.color.set(0xc8ff00);

    }

}


/* =========================================================
   UPDATE UI
========================================================= */

function updateUI() {

    const materialNames = {

        matte: "Matte",
        metal: "Metal",
        glass: "Glass"

    };

    const finishNames = {

        dark: "Dark",
        light: "Light"

    };

    const lightingNames = {

        studio: "Studio",
        night: "Night",
        neon: "Neon"

    };


    document.getElementById(
        "materialValue"
    ).textContent =
        materialNames[config.material];


    document.getElementById(
        "finishValue"
    ).textContent =
        finishNames[config.finish];


    document.getElementById(
        "lightingValue"
    ).textContent =
        lightingNames[config.lighting];


    const price =
        299 +
        materialPrices[config.material] +
        colorPrices[config.color];


    document.getElementById(
        "productPrice"
    ).textContent =
        `€${price}`;


    document.getElementById(
        "configurationName"
    ).textContent =
        `AERIS / ${config.color.toUpperCase()}`;

}


/* =========================================================
   MATERIAL BUTTONS
========================================================= */

document
    .querySelectorAll(".material-option")
    .forEach(button => {

        button.addEventListener("click", () => {

            document
                .querySelectorAll(".material-option")
                .forEach(item =>
                    item.classList.remove("active")
                );

            button.classList.add("active");

            config.material =
                button.dataset.material;

            updateMaterial();
            updateUI();

        });

    });


/* =========================================================
   COLOR BUTTONS
========================================================= */

document
    .querySelectorAll(".color-button")
    .forEach(button => {

        button.addEventListener("click", () => {

            document
                .querySelectorAll(".color-button")
                .forEach(item =>
                    item.classList.remove("active")
                );

            button.classList.add("active");

            config.color =
                button.dataset.color;

            updateColor();
            updateUI();

        });

    });


/* =========================================================
   FINISH BUTTONS
========================================================= */

document
    .querySelectorAll(".finish-option")
    .forEach(button => {

        button.addEventListener("click", () => {

            document
                .querySelectorAll(".finish-option")
                .forEach(item =>
                    item.classList.remove("active")
                );

            button.classList.add("active");

            config.finish =
                button.dataset.finish;

            updateFinish();

        });

    });


/* =========================================================
   LIGHTING BUTTONS
========================================================= */

document
    .querySelectorAll(".lighting-option")
    .forEach(button => {

        button.addEventListener("click", () => {

            document
                .querySelectorAll(".lighting-option")
                .forEach(item =>
                    item.classList.remove("active")
                );

            button.classList.add("active");

            config.lighting =
                button.dataset.lighting;

            updateLighting();

        });

    });


/* =========================================================
   CAMERA PRESETS
========================================================= */

const cameraPositions = {

    front: {
        position: new THREE.Vector3(
            0,
            1.7,
            6.5
        ),

        target: new THREE.Vector3(
            0,
            0.3,
            0
        )
    },

    side: {
        position: new THREE.Vector3(
            6,
            1.5,
            0
        ),

        target: new THREE.Vector3(
            0,
            0.3,
            0
        )
    },

    detail: {
        position: new THREE.Vector3(
            3.2,
            1.2,
            3.2
        ),

        target: new THREE.Vector3(
            0.8,
            0.3,
            0
        )
    },

    top: {
        position: new THREE.Vector3(
            0,
            6.2,
            0.1
        ),

        target: new THREE.Vector3(
            0,
            0,
            0
        )
    }

};


document
    .querySelectorAll(".camera-button")
    .forEach(button => {

        button.addEventListener("click", () => {

            const preset =
                cameraPositions[
                    button.dataset.camera
                ];

            camera.position.copy(
                preset.position
            );

            controls.target.copy(
                preset.target
            );

        });

    });


/* =========================================================
   CONFIGURATION BUTTON
========================================================= */

document
    .getElementById("addConfiguration")
    .addEventListener("click", () => {

        const message =
            document.getElementById(
                "configurationMessage"
            );

        message.textContent =
            "CONFIGURATION SAVED";

        message.classList.add("visible");

        setTimeout(() => {

            message.classList.remove(
                "visible"
            );

        }, 2200);

    });


/* =========================================================
   RESIZE
========================================================= */

window.addEventListener(
    "resize",
    () => {

        camera.aspect =
            window.innerWidth /
            window.innerHeight;

        camera.updateProjectionMatrix();

        renderer.setSize(
            window.innerWidth,
            window.innerHeight
        );

    }
);


/* =========================================================
   INITIAL STATE
========================================================= */

updateMaterial();
updateFinish();
updateLighting();
updateUI();


/* =========================================================
   LOADING
========================================================= */

const loadingProgress =
    document.getElementById(
        "loadingProgress"
    );

let progress = 0;

const loadingInterval =
    setInterval(() => {

        progress += 4;

        if (progress >= 100) {

            progress = 100;

            clearInterval(
                loadingInterval
            );

            setTimeout(() => {

                const loader =
                    document.querySelector(
                        ".loading-screen"
                    );

                if (loader) {

                    loader.classList.add(
                        "loaded"
                    );

                }

            }, 350);

        }

        if (loadingProgress) {

            loadingProgress.textContent =
                `${progress}%`;

        }

    }, 35);


/* =========================================================
   ANIMATION
========================================================= */

const clock = new THREE.Clock();

function animate() {

    const elapsed =
        clock.getElapsedTime();

    controls.update();

    /*
       Very subtle product rotation.
       OrbitControls still remains fully interactive.
    */

    product.rotation.y =
        Math.sin(elapsed * 0.18) * 0.035;

    renderer.render(
        scene,
        camera
    );

    requestAnimationFrame(
        animate
    );

}

animate();

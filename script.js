import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";


/* =========================================================
   ORBIT — INTERACTIVE PRODUCT CONFIGURATOR
   ========================================================= */


/* =========================================================
   DOM
   ========================================================= */

const canvasContainer =
    document.getElementById("productCanvas");

const loadingScreen =
    document.querySelector(".loading-screen");

const loadingProgress =
    document.getElementById("loadingProgress");

const cameraButtons =
    document.querySelectorAll(".camera-button");

const materialButtons =
    document.querySelectorAll(".material-option");

const colorButtons =
    document.querySelectorAll(".color-button");

const finishButtons =
    document.querySelectorAll(".finish-option");

const lightingButtons =
    document.querySelectorAll(".lighting-option");

const configurationName =
    document.getElementById("configurationName");

const materialValue =
    document.getElementById("materialValue");

const finishValue =
    document.getElementById("finishValue");

const lightingValue =
    document.getElementById("lightingValue");

const productPrice =
    document.getElementById("productPrice");

const addConfiguration =
    document.getElementById("addConfiguration");

const configurationMessage =
    document.getElementById("configurationMessage");


/* =========================================================
   CONFIGURATION STATE
   ========================================================= */

const config = {

    material: "matte",

    color: "black",

    finish: "dark",

    lighting: "studio"

};


/* =========================================================
   PRODUCT PRICING
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
   THREE.JS
   ========================================================= */

const scene =
    new THREE.Scene();

scene.background =
    new THREE.Color(0x090a0a);


/* =========================================================
   CAMERA
   ========================================================= */

const camera =
    new THREE.PerspectiveCamera(
        45,
        canvasContainer.clientWidth /
        canvasContainer.clientHeight,
        0.1,
        100
    );

camera.position.set(
    0,
    1.4,
    5.2
);


/* =========================================================
   RENDERER
   ========================================================= */

const renderer =
    new THREE.WebGPURenderer({
        antialias: true,
        alpha: false
    });

renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, 2)
);

renderer.setSize(
    canvasContainer.clientWidth,
    canvasContainer.clientHeight
);

renderer.shadowMap.enabled = true;

canvasContainer.appendChild(
    renderer.domElement
);

await renderer.init();


/* =========================================================
   CONTROLS
   ========================================================= */

const controls =
    new OrbitControls(
        camera,
        renderer.domElement
    );

controls.enableDamping = true;

controls.dampingFactor = 0.06;

controls.minDistance = 3.5;

controls.maxDistance = 8;

controls.target.set(
    0,
    0.8,
    0
);


/* =========================================================
   LIGHTING
   ========================================================= */

const ambientLight =
    new THREE.AmbientLight(
        0xffffff,
        1.8
    );

scene.add(ambientLight);


const keyLight =
    new THREE.DirectionalLight(
        0xffffff,
        4
    );

keyLight.position.set(
    3,
    5,
    4
);

keyLight.castShadow = true;

scene.add(keyLight);


const fillLight =
    new THREE.DirectionalLight(
        0xaab8ff,
        1.5
    );

fillLight.position.set(
    -4,
    2,
    2
);

scene.add(fillLight);


const rimLight =
    new THREE.DirectionalLight(
        0xc8ff00,
        1.5
    );

rimLight.position.set(
    0,
    3,
    -5
);

scene.add(rimLight);


/* =========================================================
   PRODUCT GROUP
   ========================================================= */

const product =
    new THREE.Group();

scene.add(product);


/* =========================================================
   MATERIAL HELPERS
   ========================================================= */

function createProductMaterial() {

    let roughness = 0.82;

    let metalness = 0.05;

    let transmission = 0;

    let opacity = 1;

    let transparent = false;


    if (config.material === "metal") {

        roughness = 0.25;

        metalness = 0.95;

    }


    if (config.material === "glass") {

        roughness = 0.08;

        metalness = 0.05;

        transmission = 0.75;

        opacity = 0.7;

        transparent = true;

    }


    return new THREE.MeshPhysicalMaterial({

        color:
            getProductColor(),

        roughness,

        metalness,

        transmission,

        opacity,

        transparent,

        clearcoat: 0.6,

        clearcoatRoughness: 0.2

    });

}


/* =========================================================
   COLORS
   ========================================================= */

function getProductColor() {

    const colors = {

        black: 0x171919,

        white: 0xe6e8e5,

        orange: 0xf06d2f,

        lime: 0xc8ff00

    };

    return colors[config.color];

}


/* =========================================================
   CREATE AERIS
   ========================================================= */

function createAeris() {

    product.clear();


    const material =
        createProductMaterial();


    /* =========================
       HEADBAND
    ========================= */

    const headbandGeometry =
        new THREE.TorusGeometry(
            1.25,
            0.11,
            32,
            96,
            Math.PI
        );

    const headband =
        new THREE.Mesh(
            headbandGeometry,
            material
        );

    headband.rotation.z =
        Math.PI;

    headband.position.y =
        1.15;

    headband.scale.set(
        1,
        0.72,
        1
    );

    headband.castShadow = true;

    product.add(headband);


    /* =========================
       LEFT EAR CUP
    ========================= */

    const cupGeometry =
        new THREE.CylinderGeometry(
            0.58,
            0.58,
            0.32,
            48
        );

    const leftCup =
        new THREE.Mesh(
            cupGeometry,
            material
        );

    leftCup.rotation.z =
        Math.PI / 2;

    leftCup.position.set(
        -1.18,
        0.25,
        0
    );

    leftCup.castShadow = true;

    product.add(leftCup);


    /* =========================
       RIGHT EAR CUP
    ========================= */

    const rightCup =
        new THREE.Mesh(
            cupGeometry,
            material
        );

    rightCup.rotation.z =
        Math.PI / 2;

    rightCup.position.set(
        1.18,
        0.25,
        0
    );

    rightCup.castShadow = true;

    product.add(rightCup);


    /* =========================
       LEFT INNER PAD
    ========================= */

    const padMaterial =
        new THREE.MeshPhysicalMaterial({

            color: 0x090a0a,

            roughness: 0.95,

            metalness: 0

        });


    const padGeometry =
        new THREE.CylinderGeometry(
            0.43,
            0.43,
            0.12,
            48
        );


    const leftPad =
        new THREE.Mesh(
            padGeometry,
            padMaterial
        );

    leftPad.rotation.z =
        Math.PI / 2;

    leftPad.position.set(
        -1.36,
        0.25,
        0
    );

    product.add(leftPad);


    /* =========================
       RIGHT INNER PAD
    ========================= */

    const rightPad =
        new THREE.Mesh(
            padGeometry,
            padMaterial
        );

    rightPad.rotation.z =
        Math.PI / 2;

    rightPad.position.set(
        1.36,
        0.25,
        0
    );

    product.add(rightPad);


    /* =========================
       CENTER BRIDGE
    ========================= */

    const bridgeGeometry =
        new THREE.BoxGeometry(
            1.9,
            0.15,
            0.22
        );

    const bridge =
        new THREE.Mesh(
            bridgeGeometry,
            material
        );

    bridge.position.y =
        0.95;

    bridge.castShadow = true;

    product.add(bridge);


    /* =========================
       SIDE CONNECTORS
    ========================= */

    const connectorGeometry =
        new THREE.BoxGeometry(
            0.16,
            0.55,
            0.2
        );


    const leftConnector =
        new THREE.Mesh(
            connectorGeometry,
            material
        );

    leftConnector.position.set(
        -1.05,
        0.75,
        0
    );

    product.add(leftConnector);


    const rightConnector =
        new THREE.Mesh(
            connectorGeometry,
            material
        );

    rightConnector.position.set(
        1.05,
        0.75,
        0
    );

    product.add(rightConnector);


    /* =========================
       ACCENT RINGS
    ========================= */

    const accentMaterial =
        new THREE.MeshStandardMaterial({

            color:
                config.color === "lime"
                    ? 0x090a0a
                    : 0xc8ff00,

            metalness: 0.7,

            roughness: 0.25

        });


    const accentGeometry =
        new THREE.TorusGeometry(
            0.49,
            0.025,
            16,
            64
        );


    const leftAccent =
        new THREE.Mesh(
            accentGeometry,
            accentMaterial
        );

    leftAccent.rotation.y =
        Math.PI / 2;

    leftAccent.position.set(
        -1.37,
        0.25,
        0
    );

    product.add(leftAccent);


    const rightAccent =
        new THREE.Mesh(
            accentGeometry,
            accentMaterial
        );

    rightAccent.rotation.y =
        Math.PI / 2;

    rightAccent.position.set(
        1.37,
        0.25,
        0
    );

    product.add(rightAccent);


    /* =========================
       PRODUCT SCALE
    ========================= */

    product.scale.set(
        1,
        1,
        1
    );


    product.rotation.y =
        -0.15;

}


/* =========================================================
   LIGHTING MODES
   ========================================================= */

function updateLighting() {

    if (config.lighting === "studio") {

        keyLight.intensity = 4;

        fillLight.intensity = 1.5;

        rimLight.intensity = 1.5;

        scene.background.set(
            0x090a0a
        );

    }


    if (config.lighting === "night") {

        keyLight.intensity = 1.5;

        fillLight.intensity = 0.6;

        rimLight.intensity = 3;

        scene.background.set(
            0x05070b
        );

    }


    if (config.lighting === "neon") {

        keyLight.intensity = 1.2;

        fillLight.intensity = 3;

        rimLight.intensity = 4;

        scene.background.set(
            0x090b09
        );

    }

}


/* =========================================================
   FINISH
   ========================================================= */

function updateFinish() {

    if (config.finish === "dark") {

        scene.background.set(
            config.lighting === "night"
                ? 0x05070b
                : 0x090a0a
        );

    }


    if (config.finish === "light") {

        scene.background.set(
            0xdfe3df
        );

    }

}


/* =========================================================
   UPDATE PRODUCT
   ========================================================= */

function updateProduct() {

    createAeris();

    updateLighting();

    updateFinish();

    updateUI();

}


/* =========================================================
   UPDATE UI
   ========================================================= */

function updateUI() {

    const materialNames = {

        matte: "MATTE",

        metal: "METAL",

        glass: "GLASS"

    };


    const colorNames = {

        black: "BLACK",

        white: "WHITE",

        orange: "ORANGE",

        lime: "LIME"

    };


    const finishNames = {

        dark: "DARK",

        light: "LIGHT"

    };


    const lightingNames = {

        studio: "STUDIO",

        night: "NIGHT",

        neon: "NEON"

    };


    const price =
        349 +
        materialPrices[config.material] +
        colorPrices[config.color];


    configurationName.textContent =
        `AERIS / ${colorNames[config.color]}`;


    materialValue.textContent =
        materialNames[config.material];


    finishValue.textContent =
        finishNames[config.finish];


    lightingValue.textContent =
        lightingNames[config.lighting];


    productPrice.textContent =
        `€${price}`;


    updateActiveButtons();

}


/* =========================================================
   ACTIVE BUTTONS
   ========================================================= */

function updateActiveButtons() {

    materialButtons.forEach(button => {

        button.classList.toggle(
            "active",
            button.dataset.material ===
            config.material
        );

    });


    colorButtons.forEach(button => {

        button.classList.toggle(
            "active",
            button.dataset.color ===
            config.color
        );

    });


    finishButtons.forEach(button => {

        button.classList.toggle(
            "active",
            button.dataset.finish ===
            config.finish
        );

    });


    lightingButtons.forEach(button => {

        button.classList.toggle(
            "active",
            button.dataset.lighting ===
            config.lighting
        );

    });

}


/* =========================================================
   MATERIAL BUTTONS
   ========================================================= */

materialButtons.forEach(button => {

    button.addEventListener(
        "click",
        () => {

            config.material =
                button.dataset.material;

            updateProduct();

        }
    );

});


/* =========================================================
   COLOR BUTTONS
   ========================================================= */

colorButtons.forEach(button => {

    button.addEventListener(
        "click",
        () => {

            config.color =
                button.dataset.color;

            updateProduct();

        }
    );

});


/* =========================================================
   FINISH BUTTONS
   ========================================================= */

finishButtons.forEach(button => {

    button.addEventListener(
        "click",
        () => {

            config.finish =
                button.dataset.finish;

            updateProduct();

        }
    );

});


/* =========================================================
   LIGHTING BUTTONS
   ========================================================= */

lightingButtons.forEach(button => {

    button.addEventListener(
        "click",
        () => {

            config.lighting =
                button.dataset.lighting;

            updateProduct();

        }
    );

});


/* =========================================================
   CAMERA POSITIONS
   ========================================================= */

const cameraPositions = {

    front: {

        position:
            new THREE.Vector3(
                0,
                1.2,
                5.2
            ),

        target:
            new THREE.Vector3(
                0,
                0.65,
                0
            )

    },


    side: {

        position:
            new THREE.Vector3(
                4.8,
                1.1,
                0
            ),

        target:
            new THREE.Vector3(
                0,
                0.65,
                0
            )

    },


    detail: {

        position:
            new THREE.Vector3(
                2.8,
                1.5,
                2.4
            ),

        target:
            new THREE.Vector3(
                0.55,
                0.45,
                0
            )

    },


    top: {

        position:
            new THREE.Vector3(
                0,
                5.3,
                0.2
            ),

        target:
            new THREE.Vector3(
                0,
                0,
                0
            )

    }

};


/* =========================================================
   CAMERA ANIMATION
   ========================================================= */

let cameraAnimation = null;


function animateCamera(
    targetPosition,
    targetLookAt
) {

    cameraAnimation = {

        startPosition:
            camera.position.clone(),

        endPosition:
            targetPosition.clone(),

        startTarget:
            controls.target.clone(),

        endTarget:
            targetLookAt.clone(),

        startTime:
            performance.now(),

        duration:
            800

    };

}


/* =========================================================
   CAMERA BUTTONS
   ========================================================= */

cameraButtons.forEach(button => {

    button.addEventListener(
        "click",
        () => {

            const cameraName =
                button.dataset.camera;

            const preset =
                cameraPositions[cameraName];


            cameraButtons.forEach(item => {

                item.classList.remove(
                    "active"
                );

            });


            button.classList.add(
                "active"
            );


            animateCamera(
                preset.position,
                preset.target
            );

        }
    );

});


/* =========================================================
   CONFIGURATION BUTTON
   ========================================================= */

addConfiguration.addEventListener(
    "click",
    () => {

        configurationMessage.classList.add(
            "visible"
        );


        setTimeout(() => {

            configurationMessage.classList.remove(
                "visible"
            );

        }, 2200);

    }
);


/* =========================================================
   CAMERA ANIMATION UPDATE
   ========================================================= */

function updateCameraAnimation() {

    if (!cameraAnimation) {
        return;
    }


    const elapsed =
        performance.now() -
        cameraAnimation.startTime;


    let progress =
        elapsed /
        cameraAnimation.duration;


    if (progress >= 1) {

        progress = 1;

        camera.position.copy(
            cameraAnimation.endPosition
        );

        controls.target.copy(
            cameraAnimation.endTarget
        );

        cameraAnimation = null;

        return;

    }


    /* Cubic ease out */

    const eased =
        1 -
        Math.pow(
            1 - progress,
            3
        );


    camera.position.lerpVectors(
        cameraAnimation.startPosition,
        cameraAnimation.endPosition,
        eased
    );


    controls.target.lerpVectors(
        cameraAnimation.startTarget,
        cameraAnimation.endTarget,
        eased
    );

}


/* =========================================================
   RESIZE
   ========================================================= */

function resize() {

    const width =
        canvasContainer.clientWidth;

    const height =
        canvasContainer.clientHeight;


    camera.aspect =
        width / height;

    camera.updateProjectionMatrix();


    renderer.setSize(
        width,
        height
    );

}


window.addEventListener(
    "resize",
    resize
);


/* =========================================================
   INITIALIZE
   ========================================================= */

function initialize() {

    updateProduct();

    loadingProgress.style.width =
        "100%";


    setTimeout(() => {

        loadingScreen.classList.add(
            "hidden"
        );

    }, 700);

}


/* =========================================================
   RENDER LOOP
   ========================================================= */

function animate() {

    requestAnimationFrame(
        animate
    );


    updateCameraAnimation();


    controls.update();


    /* Very subtle product idle motion */

    if (!cameraAnimation) {

        product.rotation.y +=
            0.0008;

    }


    renderer.render(
        scene,
        camera
    );

}


/* =========================================================
   START
   ========================================================= */

initialize();

animate();

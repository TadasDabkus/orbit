import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

/* =========================================================
   ORBIT — AERIS PRODUCT CONFIGURATOR
========================================================= */


/* =========================================================
   DOM
========================================================= */

const canvas = document.getElementById("productCanvas");

const loadingScreen =
    document.querySelector(".loading-screen");

const loadingProgress =
    document.getElementById("loadingProgress");

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

const configurationMessage =
    document.getElementById("configurationMessage");


/* =========================================================
   RENDERER
========================================================= */

const renderer =
    new THREE.WebGPURenderer({
        canvas: canvas,
        antialias: true,
        alpha: false
    });

await renderer.init();

renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, 2)
);

renderer.setSize(
    window.innerWidth,
    window.innerHeight
);

renderer.setClearColor(
    0x090a0a,
    1
);


/* =========================================================
   SCENE
========================================================= */

const scene = new THREE.Scene();

scene.background =
    new THREE.Color(0x090a0a);


/* =========================================================
   CAMERA
========================================================= */

const camera =
    new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        0.01,
        100
    );

camera.position.set(
    0,
    1.8,
    5.5
);


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

controls.enablePan = false;

controls.minDistance = 2.5;
controls.maxDistance = 9;

controls.target.set(
    0,
    1,
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
    4,
    6,
    5
);

scene.add(keyLight);


const fillLight =
    new THREE.DirectionalLight(
        0xffffff,
        2
    );

fillLight.position.set(
    -4,
    3,
    2
);

scene.add(fillLight);


const rimLight =
    new THREE.DirectionalLight(
        0xb8c7ff,
        2.5
    );

rimLight.position.set(
    0,
    4,
    -5
);

scene.add(rimLight);


/* =========================================================
   AERIS MODEL
========================================================= */

let aerisModel = null;

const modelGroup =
    new THREE.Group();

scene.add(modelGroup);


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
   PRICING
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
   COLORS
========================================================= */

const colors = {

    black: 0x151719,

    white: 0xe8e9e5,

    orange: 0xff6a00,

    lime: 0xc8ff00

};


/* =========================================================
   ORIGINAL MATERIALS
========================================================= */

const originalMaterials = new Map();


/* =========================================================
   LOAD GLB
========================================================= */

const loader =
    new GLTFLoader();


loader.load(

    "./AERIS_v01.glb",

    (gltf) => {

        aerisModel =
            gltf.scene;

        modelGroup.add(
            aerisModel
        );


        /* ---------------------------------------------
           STORE ORIGINAL MATERIALS
        --------------------------------------------- */

        aerisModel.traverse(
            (object) => {

                if (!object.isMesh) {
                    return;
                }

                object.castShadow = true;
                object.receiveShadow = true;


                if (Array.isArray(object.material)) {

                    object.material =
                        object.material.map(
                            (material) => {

                                const clone =
                                    material.clone();

                                originalMaterials.set(
                                    object.uuid,
                                    clone
                                );

                                return clone;

                            }
                        );

                }

                else if (object.material) {

                    const clone =
                        object.material.clone();

                    object.material =
                        clone;

                    originalMaterials.set(
                        object.uuid,
                        clone
                    );

                }

            }
        );


        /* ---------------------------------------------
           CENTER MODEL
        --------------------------------------------- */

        const box =
            new THREE.Box3()
                .setFromObject(
                    aerisModel
                );

        const center =
            box.getCenter(
                new THREE.Vector3()
            );

        aerisModel.position.sub(
            center
        );


        /* ---------------------------------------------
           SCALE MODEL
        --------------------------------------------- */

        const size =
            box.getSize(
                new THREE.Vector3()
            );

        const maxDimension =
            Math.max(
                size.x,
                size.y,
                size.z
            );

        const desiredSize = 3.4;

        const scale =
            desiredSize /
            maxDimension;

        aerisModel.scale.setScalar(
            scale
        );


        /* ---------------------------------------------
           UPDATE CAMERA
        --------------------------------------------- */

        controls.target.set(
            0,
            0,
            0
        );

        camera.position.set(
            0,
            1.8,
            5.5
        );


        /* ---------------------------------------------
           APPLY INITIAL CONFIG
        --------------------------------------------- */

        updateMaterial();

        updateColor();

        updateFinish();

        updateLighting();

        updateUI();


        /* ---------------------------------------------
           HIDE LOADING SCREEN
        --------------------------------------------- */

        if (loadingProgress) {

            loadingProgress.textContent =
                "100%";

        }


        setTimeout(() => {

            if (loadingScreen) {

                loadingScreen.classList.add(
                    "loaded"
                );

            }

        }, 300);


        console.log(
            "AERIS READY"
        );

    },


    (progress) => {

        if (
            progress.total
        ) {

            const percent =
                Math.round(
                    (
                        progress.loaded /
                        progress.total
                    ) * 100
                );

            if (loadingProgress) {

                loadingProgress.textContent =
                    `${percent}%`;

            }

        }

    },


    (error) => {

        console.error(
            "AERIS GLB LOAD ERROR:",
            error
        );

        if (loadingProgress) {

            loadingProgress.textContent =
                "ERROR";

        }

    }

);


/* =========================================================
   MATERIAL
========================================================= */

function updateMaterial() {

    if (!aerisModel) {
        return;
    }


    aerisModel.traverse(
        (object) => {

            if (!object.isMesh) {
                return;
            }


            const materials =
                Array.isArray(object.material)
                    ? object.material
                    : [object.material];


            materials.forEach(
                (material) => {

                    if (!material) {
                        return;
                    }


                    if (
                        material.isMeshStandardMaterial ||
                        material.isMeshPhysicalMaterial
                    ) {

                        if (
                            config.material === "matte"
                        ) {

                            material.metalness = 0.05;

                            material.roughness = 0.72;

                            if (
                                "transmission"
                                in material
                            ) {

                                material.transmission = 0;

                            }

                        }


                        if (
                            config.material === "metal"
                        ) {

                            material.metalness = 0.9;

                            material.roughness = 0.25;

                            if (
                                "transmission"
                                in material
                            ) {

                                material.transmission = 0;

                            }

                        }


                        if (
                            config.material === "glass"
                        ) {

                            material.metalness = 0.05;

                            material.roughness = 0.12;

                            if (
                                "transmission"
                                in material
                            ) {

                                material.transmission = 0.55;

                                material.thickness = 0.3;

                            }

                        }

                    }

                }
            );

        }
    );

}


/* =========================================================
   COLOR
========================================================= */

function updateColor() {

    if (!aerisModel) {
        return;
    }


    const selectedColor =
        new THREE.Color(
            colors[config.color]
        );


    aerisModel.traverse(
        (object) => {

            if (!object.isMesh) {
                return;
            }


            const name =
                object.name.toUpperCase();


            /*
             * MAIN BODY PARTS
             */

            const isMainBody =
                name.includes("SHELL") ||
                name.includes("HEADCUSHINCASE") ||
                name.includes("SHELLHOLDER") ||
                name.includes("OUTER");


            /*
             * HEADBAND
             */

            const isHeadband =
                name.includes("HEADCOUSHIN") &&
                !name.includes("CASE");


            /*
             * APPLY COLOR
             */

            if (
                isMainBody ||
                isHeadband
            ) {

                const materials =
                    Array.isArray(object.material)
                        ? object.material
                        : [object.material];


                materials.forEach(
                    (material) => {

                        if (
                            material &&
                            material.color
                        ) {

                            material.color.copy(
                                selectedColor
                            );

                        }

                    }
                );

            }

        }
    );

}


/* =========================================================
   FINISH
========================================================= */

function updateFinish() {

    if (
        config.finish === "dark"
    ) {

        scene.background =
            new THREE.Color(
                0x090a0a
            );

    }

    else {

        scene.background =
            new THREE.Color(
                0xe8e8e4
            );

    }

}


/* =========================================================
   LIGHTING
========================================================= */

function updateLighting() {

    if (
        config.lighting === "studio"
    ) {

        ambientLight.intensity =
            1.8;

        keyLight.intensity =
            4;

        fillLight.intensity =
            2;

        rimLight.intensity =
            2.5;

        keyLight.color.set(
            0xffffff
        );

        fillLight.color.set(
            0xffffff
        );

        rimLight.color.set(
            0xb8c7ff
        );

    }


    if (
        config.lighting === "night"
    ) {

        ambientLight.intensity =
            0.55;

        keyLight.intensity =
            1.5;

        fillLight.intensity =
            0.5;

        rimLight.intensity =
            4;

        keyLight.color.set(
            0x8fa8ff
        );

        fillLight.color.set(
            0x596dff
        );

        rimLight.color.set(
            0x9fb5ff
        );

    }


    if (
        config.lighting === "neon"
    ) {

        ambientLight.intensity =
            0.45;

        keyLight.intensity =
            1.5;

        fillLight.intensity =
            2;

        rimLight.intensity =
            5;

        keyLight.color.set(
            0xc8ff00
        );

        fillLight.color.set(
            0xff5c00
        );

        rimLight.color.set(
            0x00d9ff
        );

    }

}


/* =========================================================
   UI UPDATE
========================================================= */

function updateUI() {

    if (materialValue) {

        materialValue.textContent =
            config.material.toUpperCase();

    }


    if (finishValue) {

        finishValue.textContent =
            config.finish.toUpperCase();

    }


    if (lightingValue) {

        lightingValue.textContent =
            config.lighting.toUpperCase();

    }


    if (configurationName) {

        configurationName.textContent =
            "AERIS";

    }


    const price =
        299 +
        materialPrices[config.material] +
        colorPrices[config.color];


    if (productPrice) {

        productPrice.textContent =
            `€${price}`;

    }

}


/* =========================================================
   MATERIAL BUTTONS
========================================================= */

document
    .querySelectorAll(
        ".material-option"
    )
    .forEach(
        (button) => {

            button.addEventListener(
                "click",
                () => {

                    config.material =
                        button.dataset.material;

                    document
                        .querySelectorAll(
                            ".material-option"
                        )
                        .forEach(
                            (item) => {

                                item.classList.remove(
                                    "active"
                                );

                            }
                        );

                    button.classList.add(
                        "active"
                    );

                    updateMaterial();

                    updateUI();

                }
            );

        }
    );


/* =========================================================
   COLOR BUTTONS
========================================================= */

document
    .querySelectorAll(
        ".color-button"
    )
    .forEach(
        (button) => {

            button.addEventListener(
                "click",
                () => {

                    config.color =
                        button.dataset.color;

                    document
                        .querySelectorAll(
                            ".color-button"
                        )
                        .forEach(
                            (item) => {

                                item.classList.remove(
                                    "active"
                                );

                            }
                        );

                    button.classList.add(
                        "active"
                    );

                    updateColor();

                    updateUI();

                }
            );

        }
    );


/* =========================================================
   FINISH BUTTONS
========================================================= */

document
    .querySelectorAll(
        ".finish-option"
    )
    .forEach(
        (button) => {

            button.addEventListener(
                "click",
                () => {

                    config.finish =
                        button.dataset.finish;

                    document
                        .querySelectorAll(
                            ".finish-option"
                        )
                        .forEach(
                            (item) => {

                                item.classList.remove(
                                    "active"
                                );

                            }
                        );

                    button.classList.add(
                        "active"
                    );

                    updateFinish();

                    updateUI();

                }
            );

        }
    );


/* =========================================================
   LIGHTING BUTTONS
========================================================= */

document
    .querySelectorAll(
        ".lighting-option"
    )
    .forEach(
        (button) => {

            button.addEventListener(
                "click",
                () => {

                    config.lighting =
                        button.dataset.lighting;

                    document
                        .querySelectorAll(
                            ".lighting-option"
                        )
                        .forEach(
                            (item) => {

                                item.classList.remove(
                                    "active"
                                );

                            }
                        );

                    button.classList.add(
                        "active"
                    );

                    updateLighting();

                    updateUI();

                }
            );

        }
    );


/* =========================================================
   CAMERA PRESETS
========================================================= */

const cameraPositions = {

    front: {

        position:
            new THREE.Vector3(
                0,
                1.4,
                5.5
            ),

        target:
            new THREE.Vector3(
                0,
                0,
                0
            )

    },


    side: {

        position:
            new THREE.Vector3(
                5.2,
                1.4,
                0
            ),

        target:
            new THREE.Vector3(
                0,
                0,
                0
            )

    },


    detail: {

        position:
            new THREE.Vector3(
                3.4,
                1.8,
                3.4
            ),

        target:
            new THREE.Vector3(
                0,
                0.2,
                0
            )

    },


    top: {

        position:
            new THREE.Vector3(
                0,
                5.5,
                0.01
            ),

        target:
            new THREE.Vector3(
                0,
                0,
                0
            )

    }

};


let cameraAnimation = null;


function animateCamera(
    preset
) {

    const data =
        cameraPositions[preset];

    if (!data) {
        return;
    }


    cameraAnimation = {

        startPosition:
            camera.position.clone(),

        endPosition:
            data.position.clone(),

        startTarget:
            controls.target.clone(),

        endTarget:
            data.target.clone(),

        progress: 0

    };

}


/* =========================================================
   CAMERA BUTTONS
========================================================= */

document
    .querySelectorAll(
        ".camera-button"
    )
    .forEach(
        (button) => {

            button.addEventListener(
                "click",
                () => {

                    const cameraName =
                        button.dataset.camera;

                    animateCamera(
                        cameraName
                    );


                    document
                        .querySelectorAll(
                            ".camera-button"
                        )
                        .forEach(
                            (item) => {

                                item.classList.remove(
                                    "active"
                                );

                            }
                        );

                    button.classList.add(
                        "active"
                    );

                }
            );

        }
    );


/* =========================================================
   ADD CONFIGURATION
========================================================= */

const addConfiguration =
    document.getElementById(
        "addConfiguration"
    );


if (addConfiguration) {

    addConfiguration.addEventListener(
        "click",
        () => {

            if (
                configurationMessage
            ) {

                configurationMessage.textContent =
                    "CONFIGURATION SAVED";

                configurationMessage.classList.add(
                    "visible"
                );


                setTimeout(
                    () => {

                        configurationMessage.classList.remove(
                            "visible"
                        );

                    },
                    2200
                );

            }

        }
    );

}


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

        renderer.setPixelRatio(
            Math.min(
                window.devicePixelRatio,
                2
            )
        );

    }
);


/* =========================================================
   CAMERA ANIMATION
========================================================= */

function updateCameraAnimation() {

    if (!cameraAnimation) {
        return;
    }


    cameraAnimation.progress +=
        0.035;


    const t =
        Math.min(
            cameraAnimation.progress,
            1
        );


    const eased =
        1 -
        Math.pow(
            1 - t,
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


    if (t >= 1) {

        cameraAnimation =
            null;

    }

}


/* =========================================================
   IDLE MODEL ROTATION
========================================================= */

let idleRotation = true;


canvas.addEventListener(
    "pointerdown",
    () => {

        idleRotation = false;

    }
);


canvas.addEventListener(
    "pointerup",
    () => {

        setTimeout(
            () => {

                idleRotation = true;

            },
            1200
        );

    }
);


/* =========================================================
   RENDER LOOP
========================================================= */

function animate() {

    requestAnimationFrame(
        animate
    );


    updateCameraAnimation();


    if (
        aerisModel &&
        idleRotation &&
        !cameraAnimation
    ) {

        aerisModel.rotation.y +=
            0.0015;

    }


    controls.update();


    renderer.render(
        scene,
        camera
    );

}


animate();


/* =========================================================
   INITIAL UI
========================================================= */

updateUI();

console.log(
    "ORBIT / AERIS SYSTEM INITIALIZED"
);

```js
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";


/* =========================================================
   ORBIT — AERIS PRODUCT CONFIGURATOR
========================================================= */

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

renderer.outputColorSpace = THREE.SRGBColorSpace;

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
    0.01,
    100
);

camera.position.set(0, 1.8, 6.5);


/* =========================================================
   CONTROLS
========================================================= */

const controls = new OrbitControls(
    camera,
    renderer.domElement
);

controls.enableDamping = true;
controls.dampingFactor = 0.06;

controls.minDistance = 2.5;
controls.maxDistance = 12;

controls.minPolarAngle = 0.35;
controls.maxPolarAngle = 2.75;

controls.target.set(0, 0, 0);

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

keyLight.position.set(
    4,
    6,
    5
);

scene.add(keyLight);


const fillLight = new THREE.DirectionalLight(
    0x9bbcff,
    2
);

fillLight.position.set(
    -5,
    2,
    3
);

scene.add(fillLight);


const rimLight = new THREE.DirectionalLight(
    0xc8ff00,
    3
);

rimLight.position.set(
    0,
    4,
    -6
);

scene.add(rimLight);


/* =========================================================
   AERIS PRODUCT
========================================================= */

const product = new THREE.Group();

scene.add(product);


/* =========================================================
   MATERIAL SETTINGS
========================================================= */

const materialSettings = {

    matte: {
        roughness: 0.48,
        metalness: 0.05,
        transmission: 0
    },

    metal: {
        roughness: 0.20,
        metalness: 0.90,
        transmission: 0
    },

    glass: {
        roughness: 0.08,
        metalness: 0.10,
        transmission: 0.35,
        thickness: 0.6
    }

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
   CONFIGURATION
========================================================= */

const config = {

    material: "matte",
    color: "black",
    finish: "dark",
    lighting: "studio"

};


/* =========================================================
   GLB LOADER
========================================================= */

const gltfLoader = new GLTFLoader();


/* =========================================================
   MODEL DATA
========================================================= */

let aerisModel = null;

const originalMaterials = new Map();

const configurableMeshes = [];

const fixedMeshes = [];


/* =========================================================
   OBJECT CLASSIFICATION
========================================================= */

/*
   These parts should behave like the main product shell.
*/

function isConfigurablePart(object) {

    if (!object.isMesh) {
        return false;
    }

    const name = object.name.toLowerCase();

    const configurableKeywords = [

        "headcoushin",
        "headcushin",

        "headcoushincase",
        "headcushincase",

        "outershell",
        "innershell",

        "shellholder",
        "shellholderpanels",

        "innerpart",
        "innerparts",

        "usbaux_case",
        "usbaux",

        "volumeslider",

        "cushion_l",
        "cushion_r",

        "cushion_l",
        "cushion_r"

    ];

    return configurableKeywords.some(
        keyword => name.includes(keyword)
    );

}


/* =========================================================
   FIXED PARTS
========================================================= */

function isFixedPart(object) {

    if (!object.isMesh) {
        return false;
    }

    const name = object.name.toLowerCase();

    const fixedKeywords = [

        "wire",
        "screw",
        "hinge",

        "usb",
        "aux",

        "innercoushin",
        "innercushin",

        "logo"

    ];

    return fixedKeywords.some(
        keyword => name.includes(keyword)
    );

}


/* =========================================================
   LOAD AERIS
========================================================= */

gltfLoader.load(

    "./AERIS_v01.glb",

    (gltf) => {

        aerisModel = gltf.scene;

        console.log(
            "AERIS GLB LOADED"
        );

        console.log(
            "AERIS OBJECTS:"
        );

        aerisModel.traverse(object => {

            if (object.name) {

                console.log(
                    object.name
                );

            }

        });


        /* ---------------------------------------------
           STORE ORIGINAL MATERIALS
        --------------------------------------------- */

        aerisModel.traverse(object => {

            if (
                object.isMesh &&
                object.material
            ) {

                if (Array.isArray(object.material)) {

                    originalMaterials.set(
                        object.uuid,
                        object.material.map(
                            material =>
                                material.clone()
                        )
                    );

                } else {

                    originalMaterials.set(
                        object.uuid,
                        object.material.clone()
                    );

                }

            }

        });


        /* ---------------------------------------------
           CLASSIFY OBJECTS
        --------------------------------------------- */

        aerisModel.traverse(object => {

            if (!object.isMesh) {
                return;
            }


            if (
                isConfigurablePart(object)
            ) {

                configurableMeshes.push(
                    object
                );

            } else {

                fixedMeshes.push(
                    object
                );

            }

        });


        /* ---------------------------------------------
           ADD MODEL
        --------------------------------------------- */

        product.add(
            aerisModel
        );


        /* ---------------------------------------------
           CENTER + SCALE MODEL
        --------------------------------------------- */

        fitModelToScene();


        /* ---------------------------------------------
           INITIAL CONFIGURATION
        --------------------------------------------- */

        updateMaterial();
        updateColor();
        updateFinish();
        updateLighting();
        updateUI();


        /* ---------------------------------------------
           HIDE LOADING SCREEN
        --------------------------------------------- */

        const loader =
            document.querySelector(
                ".loading-screen"
            );

        if (loader) {

            loader.classList.add(
                "loaded"
            );

        }


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

            const loadingProgress =
                document.getElementById(
                    "loadingProgress"
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

    }

);


/* =========================================================
   FIT MODEL TO SCENE
========================================================= */

function fitModelToScene() {

    if (!aerisModel) {
        return;
    }


    const box =
        new THREE.Box3()
            .setFromObject(
                aerisModel
            );


    const size =
        box.getSize(
            new THREE.Vector3()
        );


    const center =
        box.getCenter(
            new THREE.Vector3()
        );


    /* ---------------------------------------------
       CENTER MODEL
    --------------------------------------------- */

    aerisModel.position.x -=
        center.x;

    aerisModel.position.y -=
        center.y;

    aerisModel.position.z -=
        center.z;


    /* ---------------------------------------------
       SCALE MODEL
    --------------------------------------------- */

    const maxDimension =
        Math.max(
            size.x,
            size.y,
            size.z
        );


    const targetSize = 3.6;


    const scale =
        targetSize /
        maxDimension;


    aerisModel.scale.setScalar(
        scale
    );


    /* ---------------------------------------------
       SMALL VERTICAL OFFSET
    --------------------------------------------- */

    aerisModel.position.y =
        0;


    /* ---------------------------------------------
       CAMERA
    --------------------------------------------- */

    camera.position.set(
        0,
        1.5,
        6
    );


    controls.target.set(
        0,
        0,
        0
    );

    controls.update();

}


/* =========================================================
   MATERIAL CREATOR
========================================================= */

function createConfiguredMaterial(
    originalMaterial
) {

    const material =
        originalMaterial.clone();


    const settings =
        materialSettings[
            config.material
        ];


    material.roughness =
        settings.roughness;


    material.metalness =
        settings.metalness;


    if (
        "transmission"
        in material
    ) {

        material.transmission =
            settings.transmission;

    }


    if (
        "thickness"
        in material
    ) {

        material.thickness =
            settings.thickness;

    }


    material.color.set(
        colorData[
            config.color
        ]
    );


    return material;

}


/* =========================================================
   UPDATE MATERIAL
========================================================= */

function updateMaterial() {

    configurableMeshes.forEach(
        mesh => {

            const original =
                originalMaterials.get(
                    mesh.uuid
                );


            if (!original) {
                return;
            }


            if (Array.isArray(original)) {

                mesh.material =
                    original.map(
                        material =>
                            createConfiguredMaterial(
                                material
                            )
                    );

            } else {

                mesh.material =
                    createConfiguredMaterial(
                        original
                    );

            }

        }
    );

}


/* =========================================================
   UPDATE COLOR
========================================================= */

function updateColor() {

    configurableMeshes.forEach(
        mesh => {

            if (
                Array.isArray(
                    mesh.material
                )
            ) {

                mesh.material.forEach(
                    material => {

                        material.color.set(
                            colorData[
                                config.color
                            ]
                        );

                    }
                );

            } else if (
                mesh.material
            ) {

                mesh.material.color.set(
                    colorData[
                        config.color
                    ]
                );

            }

        }
    );

}


/* =========================================================
   UPDATE FINISH
========================================================= */

function updateFinish() {

    if (
        config.finish === "dark"
    ) {

        scene.background =
            new THREE.Color(
                0x080909
            );

    }


    if (
        config.finish === "light"
    ) {

        scene.background =
            new THREE.Color(
                0xe9ebe8
            );

    }

}


/* =========================================================
   UPDATE LIGHTING
========================================================= */

function updateLighting() {

    if (
        config.lighting === "studio"
    ) {

        ambientLight.intensity =
            1.4;

        keyLight.intensity =
            4;

        fillLight.intensity =
            2;

        rimLight.intensity =
            3;

        rimLight.color.set(
            0xc8ff00
        );

    }


    if (
        config.lighting === "night"
    ) {

        ambientLight.intensity =
            0.45;

        keyLight.intensity =
            1.5;

        fillLight.intensity =
            0.8;

        rimLight.intensity =
            4;

        rimLight.color.set(
            0x4d7cff
        );

    }


    if (
        config.lighting === "neon"
    ) {

        ambientLight.intensity =
            0.3;

        keyLight.intensity =
            1;

        fillLight.intensity =
            2.5;

        rimLight.intensity =
            5;

        rimLight.color.set(
            0xc8ff00
        );

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


    const materialValue =
        document.getElementById(
            "materialValue"
        );

    if (materialValue) {

        materialValue.textContent =
            materialNames[
                config.material
            ];

    }


    const finishValue =
        document.getElementById(
            "finishValue"
        );

    if (finishValue) {

        finishValue.textContent =
            finishNames[
                config.finish
            ];

    }


    const lightingValue =
        document.getElementById(
            "lightingValue"
        );

    if (lightingValue) {

        lightingValue.textContent =
            lightingNames[
                config.lighting
            ];

    }


    const price =
        299 +
        materialPrices[
            config.material
        ] +
        colorPrices[
            config.color
        ];


    const productPrice =
        document.getElementById(
            "productPrice"
        );

    if (productPrice) {

        productPrice.textContent =
            `€${price}`;

    }


    const configurationName =
        document.getElementById(
            "configurationName"
        );

    if (configurationName) {

        configurationName.textContent =
            `AERIS / ${config.color.toUpperCase()}`;

    }

}


/* =========================================================
   MATERIAL BUTTONS
========================================================= */

document
    .querySelectorAll(
        ".material-option"
    )
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                document
                    .querySelectorAll(
                        ".material-option"
                    )
                    .forEach(item =>
                        item.classList.remove(
                            "active"
                        )
                    );


                button.classList.add(
                    "active"
                );


                config.material =
                    button.dataset.material;


                updateMaterial();
                updateUI();

            }
        );

    });


/* =========================================================
   COLOR BUTTONS
========================================================= */

document
    .querySelectorAll(
        ".color-button"
    )
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                document
                    .querySelectorAll(
                        ".color-button"
                    )
                    .forEach(item =>
                        item.classList.remove(
                            "active"
                        )
                    );


                button.classList.add(
                    "active"
                );


                config.color =
                    button.dataset.color;


                updateColor();
                updateUI();

            }
        );

    });


/* =========================================================
   FINISH BUTTONS
========================================================= */

document
    .querySelectorAll(
        ".finish-option"
    )
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                document
                    .querySelectorAll(
                        ".finish-option"
                    )
                    .forEach(item =>
                        item.classList.remove(
                            "active"
                        )
                    );


                button.classList.add(
                    "active"
                );


                config.finish =
                    button.dataset.finish;


                updateFinish();

            }
        );

    });


/* =========================================================
   LIGHTING BUTTONS
========================================================= */

document
    .querySelectorAll(
        ".lighting-option"
    )
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                document
                    .querySelectorAll(
                        ".lighting-option"
                    )
                    .forEach(item =>
                        item.classList.remove(
                            "active"
                        )
                    );


                button.classList.add(
                    "active"
                );


                config.lighting =
                    button.dataset.lighting;


                updateLighting();

            }
        );

    });


/* =========================================================
   CAMERA PRESETS
========================================================= */

const cameraPositions = {

    front: {

        position:
            new THREE.Vector3(
                0,
                1.5,
                6
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
                6,
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
                1.5,
                3.4
            ),

        target:
            new THREE.Vector3(
                0.6,
                0.1,
                0
            )

    },


    top: {

        position:
            new THREE.Vector3(
                0,
                6,
                0.1
            ),

        target:
            new THREE.Vector3(
                0,
                0,
                0
            )

    }

};


document
    .querySelectorAll(
        ".camera-button"
    )
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const preset =
                    cameraPositions[
                        button.dataset.camera
                    ];


                if (!preset) {
                    return;
                }


                camera.position.copy(
                    preset.position
                );


                controls.target.copy(
                    preset.target
                );


                controls.update();

            }
        );

    });


/* =========================================================
   CONFIGURATION BUTTON
========================================================= */

const addConfiguration =
    document.getElementById(
        "addConfiguration"
    );


if (addConfiguration) {

    addConfiguration.addEventListener(
        "click",
        () => {

            const message =
                document.getElementById(
                    "configurationMessage"
                );


            if (!message) {
                return;
            }


            message.textContent =
                "CONFIGURATION SAVED";


            message.classList.add(
                "visible"
            );


            setTimeout(
                () => {

                    message.classList.remove(
                        "visible"
                    );

                },
                2200
            );

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

    }
);


/* =========================================================
   ANIMATION
========================================================= */

const clock =
    new THREE.Clock();


function animate() {

    controls.update();


    renderer.render(
        scene,
        camera
    );


    requestAnimationFrame(
        animate
    );

}


animate();
```

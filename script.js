import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";


/* =========================================================
   ORBIT — AERIS PRODUCT CONFIGURATOR
========================================================= */


const container =
    document.getElementById("productCanvas");


if (!container) {

    throw new Error(
        "ORBIT ERROR: #productCanvas was not found."
    );

}


/* =========================================================
   RENDERER
========================================================= */


const renderer =
    new THREE.WebGLRenderer({

        antialias: true,
        alpha: false

    });


renderer.setPixelRatio(
    Math.min(
        window.devicePixelRatio,
        2
    )
);


renderer.setSize(
    window.innerWidth,
    window.innerHeight
);


renderer.outputColorSpace =
    THREE.SRGBColorSpace;


renderer.shadowMap.enabled = true;


renderer.shadowMap.type =
    THREE.PCFSoftShadowMap;


container.appendChild(
    renderer.domElement
);


console.log(
    "ORBIT RENDERER READY"
);


/* =========================================================
   SCENE
========================================================= */


const scene =
    new THREE.Scene();


/*
   Background is ALWAYS dark.
   FINISH does NOT change the background.
*/

scene.background =
    new THREE.Color(
        0x080909
    );


/* =========================================================
   CAMERA
========================================================= */


const camera =
    new THREE.PerspectiveCamera(

        42,

        window.innerWidth /
        window.innerHeight,

        0.01,

        100

    );


camera.position.set(
    0,
    1.5,
    6
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


controls.dampingFactor =
    0.06;


controls.minDistance =
    2.8;


controls.maxDistance =
    10;


controls.minPolarAngle =
    0.35;


controls.maxPolarAngle =
    2.75;


controls.target.set(
    0,
    0,
    0
);


controls.update();


/* =========================================================
   LIGHTING
========================================================= */


const ambientLight =
    new THREE.AmbientLight(
        0xffffff,
        1.5
    );


scene.add(
    ambientLight
);


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


keyLight.castShadow = true;


scene.add(
    keyLight
);


const fillLight =
    new THREE.DirectionalLight(
        0x9bbcff,
        2
    );


fillLight.position.set(
    -5,
    2,
    3
);


scene.add(
    fillLight
);


const rimLight =
    new THREE.DirectionalLight(
        0xc8ff00,
        3
    );


rimLight.position.set(
    0,
    4,
    -6
);


scene.add(
    rimLight
);


/* =========================================================
   AERIS PRODUCT
========================================================= */


const product =
    new THREE.Group();


scene.add(
    product
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
   MAIN MATERIAL SETTINGS
========================================================= */


const materialSettings = {

    matte: {

        roughness: 0.48,

        metalness: 0.05,

        transmission: 0,

        opacity: 1

    },


    metal: {

        roughness: 0.20,

        metalness: 0.90,

        transmission: 0,

        opacity: 1

    },


    glass: {

        roughness: 0.06,

        metalness: 0.00,

        transmission: 0.92,

        thickness: 0.25,

        ior: 1.45,

        opacity: 0.55

    }

};


/* =========================================================
   COLOR SETTINGS
========================================================= */


const colorData = {

    black: 0x151719,

    white: 0xe7e9e6,

    orange: 0xff6b22,

    lime: 0xc8ff00

};


/* =========================================================
   FINISH SETTINGS
========================================================= */


const finishSettings = {

    dark: {

        colorMultiplier: 0.78,

        roughnessMultiplier: 1.12

    },


    light: {

        colorMultiplier: 1.08,

        roughnessMultiplier: 0.88

    }

};


/* =========================================================
   PRICES
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
   GLTF
========================================================= */


const gltfLoader =
    new GLTFLoader();


let aerisModel = null;


/* =========================================================
   ORIGINAL MATERIAL STORAGE
========================================================= */


const originalMaterials =
    new Map();


/* =========================================================
   MESH GROUPS
========================================================= */


/*
   Main configurable parts
*/

const configurableMeshes = [];


/*
   Original parts:
   Screws
   Hinges
   Wires
*/

const originalMeshes = [];


/*
   Generic dark parts
*/

const darkMeshes = [];


/*
   Special material parts
*/

const headCushionMeshes = [];

const innerShellMeshes = [];

const cushionMeshes = [];

const innerCushionMeshes = [];


/* =========================================================
   CONFIGURABLE PARTS
=========================================================


   ONLY THESE PARTS CHANGE:

   - AERIS_OuterShell_L
   - AERIS_OuterShell_R
   - AERIS_HeadCoushinOuterShellConnectorToShellHolder
   - AERIS_HeadCushinCase

========================================================= */


function isConfigurablePart(
    object
) {

    if (!object.isMesh) {

        return false;

    }


    const name =
        object.name.toLowerCase();


    const configurableNames = [

        "aeris_outershell_l",

        "aeris_outershell_r",

        "aeris_headcoushinoutershellconnectortoshellholder",

        "aeris_headcushincase"

    ];


    return configurableNames.includes(
        name
    );

}


/* =========================================================
   SPECIAL MATERIAL PART DETECTION
========================================================= */


function getSpecialMaterialType(
    object
) {

    if (!object.isMesh) {

        return null;

    }


    const name =
        object.name.toLowerCase();


    /*
       HEAD CUSHION
    */

    if (
        name.includes(
            "aeris_headcoushin"
        )
    ) {

        return "headCushin";

    }


    /*
       INNER SHELL
    */

    if (

        name.includes(
            "aeris_innershell_l"
        )

        ||

        name.includes(
            "aeris_innershell_r"
        )

    ) {

        return "innerShell";

    }


    /*
       OUTER CUSHIONS
    */

    if (

        name.includes(
            "aeris_cushion_l"
        )

        ||

        name.includes(
            "aeris_cushion_r"
        )

    ) {

        return "cushion";

    }


    /*
       INNER CUSHIONS
    */

    if (

        name.includes(
            "aeris_innercushions"
        )

        ||

        name.includes(
            "innercushions"
        )

        ||

        name.includes(
            "innercushin"
        )

    ) {

        return "innerCushions";

    }


    return null;

}


/* =========================================================
   ORIGINAL PARTS
=========================================================


   THESE KEEP THEIR ORIGINAL MATERIAL / TEXTURE:

   - Screws
   - Hinges
   - Wires

========================================================= */


function isOriginalPart(
    object
) {

    if (!object.isMesh) {

        return false;

    }


    const name =
        object.name.toLowerCase();


    const keywords = [

        "wire",

        "screw",

        "hinge"

    ];


    return keywords.some(
        keyword =>
            name.includes(
                keyword
            )
    );

}


/* =========================================================
   STORE ORIGINAL MATERIAL
========================================================= */


function storeOriginalMaterial(
    object
) {

    if (
        !object.isMesh ||
        !object.material
    ) {

        return;

    }


    if (
        Array.isArray(
            object.material
        )
    ) {

        originalMaterials.set(

            object.uuid,

            object.material.map(
                material =>
                    material.clone()
            )

        );

    }

    else {

        originalMaterials.set(

            object.uuid,

            object.material.clone()

        );

    }

}


/* =========================================================
   REMOVE SURFACE TEXTURE MAPS
=========================================================


   The GLB contains surface maps that create
   the visible striped / carbon-fiber-like pattern.

   For the non-configurable body parts we want
   a clean material surface instead.

   IMPORTANT:

   Screws, hinges and wires do NOT use this function,
   so their original Blender textures remain untouched.

========================================================= */


function removeSurfaceTextureMaps(
    material
) {

    material.map = null;

    material.normalMap = null;

    material.roughnessMap = null;

    material.metalnessMap = null;

    material.bumpMap = null;

    material.displacementMap = null;

    material.aoMap = null;

    material.emissiveMap = null;

    return material;

}


/* =========================================================
   CREATE DARK MATERIAL
=========================================================


   Everything that is not configurable
   becomes a slightly lighter dark gray.

   Original texture maps that caused the
   striped appearance are removed.

========================================================= */


function createDarkMaterial(
    originalMaterial
) {

    const material =
        originalMaterial.clone();


    /*
       Remove the original surface maps from
       generic dark parts so they do not inherit
       the striped pattern.
    */

    removeSurfaceTextureMaps(
        material
    );


    if (
        material.color
    ) {

        material.color.set(
            0x292c2f
        );

    }


    if (
        "roughness" in material
    ) {

        material.roughness =
            Math.max(
                material.roughness,
                0.42
            );

    }


    if (
        "metalness" in material
    ) {

        material.metalness =
            Math.min(
                material.metalness,
                0.18
            );

    }


    return material;

}


/* =========================================================
   APPLY DARK MATERIAL
========================================================= */


function applyDarkMaterial(
    object
) {

    const original =
        originalMaterials.get(
            object.uuid
        );


    if (!original) {

        return;

    }


    if (
        Array.isArray(original)
    ) {

        object.material =
            original.map(
                material =>
                    createDarkMaterial(
                        material
                    )
            );

    }

    else {

        object.material =
            createDarkMaterial(
                original
            );

    }

}


/* =========================================================
   INNER CUSHION COLOR
========================================================= */


function getInnerCushionColor() {

    const color =
        new THREE.Color(
            colorData[
                config.color
            ]
        );


    const hsl = {};


    color.getHSL(
        hsl
    );


    /*
       Make Inner Cushions
       slightly lighter than
       the selected shell.
    */

    hsl.l =
        Math.min(
            hsl.l + 0.16,
            0.92
        );


    /*
       Slightly reduce saturation
       for a softer fabric appearance.
    */

    hsl.s =
        Math.max(
            hsl.s - 0.04,
            0
        );


    color.setHSL(
        hsl.h,
        hsl.s,
        hsl.l
    );


    return color;

}


/* =========================================================
   CREATE SPECIAL MATERIAL
========================================================= */


function createSpecialMaterial(
    originalMaterial,
    type
) {

    /*
       Special material parts should have
       a clean material surface instead of
       inheriting the GLB's striped maps.

       Their appearance is controlled below
       through color, roughness and clearcoat.
    */

    const material =
        originalMaterial.clone();


    removeSurfaceTextureMaps(
        material
    );


    /* =====================================================
       HEAD CUSHION
    ===================================================== */


    if (
        type === "headCushin"
    ) {

        /*
           Soft padded leather.

           More roughness than plastic.
           Very low metalness.
           Small clearcoat for subtle leather sheen.
        */

        if (
            material.color
        ) {

            material.color.set(
                0x3a3d40
            );

        }


        if (
            "roughness" in material
        ) {

            material.roughness =
                0.58;

        }


        if (
            "metalness" in material
        ) {

            material.metalness =
                0.0;

        }


        if (
            "clearcoat" in material
        ) {

            material.clearcoat =
                0.18;

        }


        if (
            "clearcoatRoughness" in material
        ) {

            material.clearcoatRoughness =
                0.32;

        }

    }


    /* =====================================================
       INNER SHELL
    ===================================================== */


    else if (
        type === "innerShell"
    ) {

        /*
           Satin plastic.

           Slightly smoother than leather,
           but clearly not metallic.
        */

        if (
            material.color
        ) {

            material.color.set(
                0x34383c
            );

        }


        if (
            "roughness" in material
        ) {

            material.roughness =
                0.34;

        }


        if (
            "metalness" in material
        ) {

            material.metalness =
                0.02;

        }


        if (
            "clearcoat" in material
        ) {

            material.clearcoat =
                0.12;

        }


        if (
            "clearcoatRoughness" in material
        ) {

            material.clearcoatRoughness =
                0.28;

        }

    }


    /* =====================================================
       OUTER CUSHIONS
    ===================================================== */


    else if (
        type === "cushion"
    ) {

        /*
           Soft leather / synthetic leather.

           More matte than plastic,
           but with a subtle surface sheen.
        */

        if (
            material.color
        ) {

            material.color.set(
                0x45484b
            );

        }


        if (
            "roughness" in material
        ) {

            material.roughness =
                0.62;

        }


        if (
            "metalness" in material
        ) {

            material.metalness =
                0.0;

        }


        if (
            "clearcoat" in material
        ) {

            material.clearcoat =
                0.10;

        }


        if (
            "clearcoatRoughness" in material
        ) {

            material.clearcoatRoughness =
                0.38;

        }

    }


    /* =====================================================
       INNER CUSHIONS
    ===================================================== */


    else if (
        type === "innerCushions"
    ) {

        /*
           Soft textile / mesh.

           Very high roughness.
           No metalness.
           No clearcoat.
        */

        if (
            material.color
        ) {

            material.color.copy(
                getInnerCushionColor()
            );

        }


        if (
            "roughness" in material
        ) {

            material.roughness =
                0.88;

        }


        if (
            "metalness" in material
        ) {

            material.metalness =
                0.0;

        }


        if (
            "clearcoat" in material
        ) {

            material.clearcoat =
                0.0;

        }

    }


    return material;

}


/* =========================================================
   APPLY SPECIAL MATERIAL
========================================================= */


function applySpecialMaterial(
    object,
    type
) {

    const original =
        originalMaterials.get(
            object.uuid
        );


    if (!original) {

        return;

    }


    if (
        Array.isArray(
            original
        )
    ) {

        object.material =
            original.map(
                material =>
                    createSpecialMaterial(
                        material,
                        type
                    )
            );

    }

    else {

        object.material =
            createSpecialMaterial(
                original,
                type
            );

    }

}


/* =========================================================
   APPLY ALL SPECIAL MATERIALS
========================================================= */


function applyAllSpecialMaterials() {

    /*
       Head cushion
    */

    headCushionMeshes.forEach(
        mesh => {

            applySpecialMaterial(
                mesh,
                "headCushin"
            );

        }
    );


    /*
       Inner shell
    */

    innerShellMeshes.forEach(
        mesh => {

            applySpecialMaterial(
                mesh,
                "innerShell"
            );

        }
    );


    /*
       Outer cushions
    */

    cushionMeshes.forEach(
        mesh => {

            applySpecialMaterial(
                mesh,
                "cushion"
            );

        }
    );


    /*
       Inner cushions
    */

    innerCushionMeshes.forEach(
        mesh => {

            applySpecialMaterial(
                mesh,
                "innerCushions"
            );

        }
    );

}


/* =========================================================
   UPDATE INNER CUSHIONS
=========================================================


   Inner Cushions still react to the
   selected main color, but remain
   visually softer and lighter.

========================================================= */


function updateInnerCushions() {

    const cushionColor =
        getInnerCushionColor();


    innerCushionMeshes.forEach(
        mesh => {

            const original =
                originalMaterials.get(
                    mesh.uuid
                );


            if (!original) {

                return;

            }


            const applyMaterial =
                material => {

                    const cloned =
                        material.clone();


                    /*
                       Remove the original GLB
                       surface maps so the inner
                       cushions do not inherit
                       the striped pattern.
                    */

                    removeSurfaceTextureMaps(
                        cloned
                    );


                    /*
                       Keep selected color
                       relationship.
                    */

                    if (
                        cloned.color
                    ) {

                        cloned.color.copy(
                            cushionColor
                        );

                    }


                    /*
                       Fabric / mesh surface
                    */

                    if (
                        "roughness" in cloned
                    ) {

                        cloned.roughness =
                            0.88;

                    }


                    if (
                        "metalness" in cloned
                    ) {

                        cloned.metalness =
                            0.0;

                    }


                    if (
                        "clearcoat" in cloned
                    ) {

                        cloned.clearcoat =
                            0.0;

                    }


                    return cloned;

                };


            if (
                Array.isArray(
                    original
                )
            ) {

                mesh.material =
                    original.map(
                        applyMaterial
                    );

            }

            else {

                mesh.material =
                    applyMaterial(
                        original
                    );

            }

        }
    );

}


/* =========================================================
   APPLY FINISH TO MATERIAL
=========================================================


   Finish changes the selected
   Outer Shell appearance only.

   It NEVER changes the scene background.

========================================================= */


function applyFinishToMaterial(
    material
) {

    const finish =
        finishSettings[
            config.finish
        ];


    if (!finish) {

        return;

    }


    if (
        material.color
    ) {

        const color =
            material.color.clone();


        const hsl = {};


        color.getHSL(
            hsl
        );


        if (
            config.finish === "dark"
        ) {

            hsl.l =
                Math.max(
                    hsl.l *
                    finish.colorMultiplier,

                    0.05
                );

        }

        else {

            hsl.l =
                Math.min(
                    hsl.l *
                    finish.colorMultiplier,

                    0.98
                );

        }


        color.setHSL(
            hsl.h,
            hsl.s,
            hsl.l
        );


        material.color.copy(
            color
        );

    }


    if (
        "roughness" in material
    ) {

        material.roughness =
            THREE.MathUtils.clamp(

                material.roughness *
                finish.roughnessMultiplier,

                0.04,
                1

            );

    }

}


/* =========================================================
   CREATE CONFIGURED MATERIAL
=========================================================


   ONLY configurable Outer Shell parts
   receive this material.

========================================================= */


function createConfiguredMaterial(
    originalMaterial
) {

    const settings =
        materialSettings[
            config.material
        ];


    /* =====================================================
       GLASS
    ===================================================== */


    if (
        config.material === "glass"
    ) {

        const material =
            new THREE.MeshPhysicalMaterial({

                color:
                    colorData[
                        config.color
                    ],

                map:
                    originalMaterial.map ||
                    null,

                normalMap:
                    originalMaterial.normalMap ||
                    null,

                roughnessMap:
                    originalMaterial.roughnessMap ||
                    null,

                metalnessMap:
                    originalMaterial.metalnessMap ||
                    null,

                aoMap:
                    originalMaterial.aoMap ||
                    null,

                emissiveMap:
                    originalMaterial.emissiveMap ||
                    null,

                displacementMap:
                    originalMaterial.displacementMap ||
                    null,

                roughness:
                    settings.roughness,

                metalness:
                    settings.metalness,

                transmission:
                    settings.transmission,

                thickness:
                    settings.thickness,

                ior:
                    settings.ior,

                opacity:
                    settings.opacity,

                transparent:
                    true,

                depthWrite:
                    false

            });


        /*
           Preserve normal scale
        */

        if (
            originalMaterial.normalScale
        ) {

            material.normalScale.copy(
                originalMaterial.normalScale
            );

        }


        /*
           Preserve emissive settings
        */

        if (
            originalMaterial.emissive
        ) {

            material.emissive.copy(
                originalMaterial.emissive
            );

        }


        /*
           Finish affects
           glass appearance.
        */

        applyFinishToMaterial(
            material
        );


        return material;

    }


    /* =====================================================
       MATTE / METAL
    ===================================================== */


    const material =
        originalMaterial.clone();


    if (
        settings
    ) {

        if (
            "roughness" in material
        ) {

            material.roughness =
                settings.roughness;

        }


        if (
            "metalness" in material
        ) {

            material.metalness =
                settings.metalness;

        }


        if (
            "transmission" in material
        ) {

            material.transmission =
                settings.transmission;

        }


        if (
            "thickness" in material
        ) {

            material.thickness =
                settings.thickness;

        }


        if (
            "opacity" in material
        ) {

            material.opacity =
                settings.opacity;

        }

    }


    /*
       Selected color
    */

    if (
        material.color
    ) {

        material.color.set(
            colorData[
                config.color
            ]
        );

    }


    /*
       Dark / Light finish
    */

    applyFinishToMaterial(
        material
    );


    return material;

}


/* =========================================================
   UPDATE MATERIAL
=========================================================


   ONLY:

   - OuterShell L
   - OuterShell R
   - Connector
   - HeadCushinCase

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


            if (
                Array.isArray(
                    original
                )
            ) {

                mesh.material =
                    original.map(
                        material =>
                            createConfiguredMaterial(
                                material
                            )
                    );

            }

            else {

                mesh.material =
                    createConfiguredMaterial(
                        original
                    );

            }

        }
    );


    /*
       Inner Cushions keep
       their own material character.
    */

    updateInnerCushions();

}


/* =========================================================
   UPDATE COLOR
========================================================= */


function updateColor() {

    /*
       Rebuild configurable materials
       so material + color + finish
       stay synchronized.
    */

    updateMaterial();


    /*
       Inner Cushions remain
       slightly lighter.
    */

    updateInnerCushions();

}


/* =========================================================
   UPDATE FINISH
========================================================= */


function updateFinish() {

    /*
       Rebuild configurable materials.

       Background stays dark.
    */

    updateMaterial();


    /*
       Inner Cushions stay
       independent.
    */

    updateInnerCushions();

}


/* =========================================================
   UPDATE LIGHTING
========================================================= */


function updateLighting() {

    if (
        config.lighting === "studio"
    ) {

        ambientLight.intensity =
            1.5;


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


    if (
        materialValue
    ) {

        materialValue.textContent =
            materialNames[
                config.material
            ];

    }


    const finishValue =
        document.getElementById(
            "finishValue"
        );


    if (
        finishValue
    ) {

        finishValue.textContent =
            finishNames[
                config.finish
            ];

    }


    const lightingValue =
        document.getElementById(
            "lightingValue"
        );


    if (
        lightingValue
    ) {

        lightingValue.textContent =
            lightingNames[
                config.lighting
            ];

    }


    /* =====================================================
       PRICE
    ===================================================== */


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


    if (
        productPrice
    ) {

        productPrice.textContent =
            `€${price}`;

    }


    /* =====================================================
       CONFIGURATION NAME
    ===================================================== */


    const configurationName =
        document.getElementById(
            "configurationName"
        );


    if (
        configurationName
    ) {

        configurationName.textContent =
            `AERIS / ${config.color.toUpperCase()}`;

    }

}


/* =========================================================
   LOAD AERIS GLB
========================================================= */


gltfLoader.load(

    "./AERIS_v01.glb",


    /* =====================================================
       SUCCESS
    ===================================================== */

    (gltf) => {

        console.log(
            "AERIS GLB LOADED"
        );


        aerisModel =
            gltf.scene;


        /* =================================================
           CLASSIFY MODEL PARTS
        ================================================= */


        aerisModel.traverse(
            object => {

                if (
                    !object.isMesh
                ) {

                    return;

                }


                /*
                   Store original Blender material
                   before changing anything.
                */

                storeOriginalMaterial(
                    object
                );


                /*
                   Shadows
                */

                object.castShadow =
                    true;


                object.receiveShadow =
                    true;


                /* =================================================
                   CONFIGURABLE
                ================================================= */


                if (
                    isConfigurablePart(
                        object
                    )
                ) {

                    configurableMeshes.push(
                        object
                    );


                    console.log(
                        "CONFIGURABLE:",
                        object.name
                    );


                    return;

                }


                /* =================================================
                   SPECIAL MATERIAL PARTS
                ================================================= */


                const specialType =
                    getSpecialMaterialType(
                        object
                    );


                if (
                    specialType
                ) {

                    if (
                        specialType ===
                        "headCushin"
                    ) {

                        headCushionMeshes.push(
                            object
                        );

                    }


                    if (
                        specialType ===
                        "innerShell"
                    ) {

                        innerShellMeshes.push(
                            object
                        );

                    }


                    if (
                        specialType ===
                        "cushion"
                    ) {

                        cushionMeshes.push(
                            object
                        );

                    }


                    if (
                        specialType ===
                        "innerCushions"
                    ) {

                        innerCushionMeshes.push(
                            object
                        );

                    }


                    console.log(
                        "SPECIAL MATERIAL:",
                        specialType,
                        object.name
                    );


                    return;

                }


                /* =================================================
                   ORIGINAL PARTS

                   Screws
                   Hinges
                   Wires
                ================================================= */


                if (
                    isOriginalPart(
                        object
                    )
                ) {

                    originalMeshes.push(
                        object
                    );


                    console.log(
                        "ORIGINAL:",
                        object.name
                    );


                    return;

                }


                /* =================================================
                   EVERYTHING ELSE
                ================================================= */


                darkMeshes.push(
                    object
                );


                console.log(
                    "DARK:",
                    object.name
                );

            }
        );


        /* =================================================
           DEBUG COUNTS
        ================================================= */


        console.log(
            "Configurable meshes:",
            configurableMeshes.length
        );


        console.log(
            "Original meshes:",
            originalMeshes.length
        );


        console.log(
            "Dark meshes:",
            darkMeshes.length
        );


        console.log(
            "Head cushion meshes:",
            headCushionMeshes.length
        );


        console.log(
            "Inner shell meshes:",
            innerShellMeshes.length
        );


        console.log(
            "Cushion meshes:",
            cushionMeshes.length
        );


        console.log(
            "Inner cushion meshes:",
            innerCushionMeshes.length
        );


        /* =================================================
           ADD MODEL
        ================================================= */


        product.add(
            aerisModel
        );


        /* =================================================
           DARK MATERIAL
        ================================================= */


        darkMeshes.forEach(
            object => {

                applyDarkMaterial(
                    object
                );

            }
        );


        /* =================================================
           SPECIAL MATERIALS
        ================================================= */


        applyAllSpecialMaterials();


        /* =================================================
           FIT MODEL
        ================================================= */


        fitModelToScene();


        /* =================================================
           INITIAL CONFIGURATION
        ================================================= */


        updateMaterial();

        updateColor();

        updateInnerCushions();

        updateFinish();

        updateLighting();

        updateUI();


        /* =================================================
           HIDE LOADING SCREEN
        ================================================= */


        const loader =
            document.querySelector(
                ".loading-screen"
            );


        if (
            loader
        ) {

            loader.style.opacity =
                "0";


            loader.style.pointerEvents =
                "none";


            setTimeout(
                () => {

                    loader.style.display =
                        "none";

                },

                500

            );

        }


        console.log(
            "AERIS READY"
        );

    },


    /* =====================================================
       LOADING PROGRESS
    ===================================================== */

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


            if (
                loadingProgress
            ) {

                loadingProgress.textContent =
                    `${percent}%`;

            }

        }

    },


    /* =====================================================
       GLB ERROR
    ===================================================== */

    (error) => {

        console.error(
            "AERIS GLB LOAD ERROR:",
            error
        );


        const loadingProgress =
            document.getElementById(
                "loadingProgress"
            );


        if (
            loadingProgress
        ) {

            loadingProgress.textContent =
                "ERROR";

        }

    }

);


/* =========================================================
   FIT MODEL TO SCENE
========================================================= */


function fitModelToScene() {

    if (
        !aerisModel
    ) {

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


    /* =====================================================
       CENTER MODEL
    ===================================================== */


    aerisModel.position.x -=
        center.x;


    aerisModel.position.y -=
        center.y;


    aerisModel.position.z -=
        center.z;


    /* =====================================================
       SCALE MODEL
    ===================================================== */


    const maxDimension =
        Math.max(
            size.x,
            size.y,
            size.z
        );


    const targetSize =
        3.6;


    if (
        maxDimension > 0
    ) {

        const scale =
            targetSize /
            maxDimension;


        aerisModel.scale.setScalar(
            scale
        );

    }


    /* =====================================================
       MODEL POSITION
    ===================================================== */


    aerisModel.position.y =
        0;


    /* =====================================================
       CAMERA
    ===================================================== */


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
   MATERIAL BUTTONS
========================================================= */


document
    .querySelectorAll(
        ".material-option"
    )
    .forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    document
                        .querySelectorAll(
                            ".material-option"
                        )
                        .forEach(
                            item =>
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
        button => {

            button.addEventListener(
                "click",
                () => {

                    document
                        .querySelectorAll(
                            ".color-button"
                        )
                        .forEach(
                            item =>
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
        button => {

            button.addEventListener(
                "click",
                () => {

                    document
                        .querySelectorAll(
                            ".finish-option"
                        )
                        .forEach(
                            item =>
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
        button => {

            button.addEventListener(
                "click",
                () => {

                    document
                        .querySelectorAll(
                            ".lighting-option"
                        )
                        .forEach(
                            item =>
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
    .forEach(
        button => {

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

        }
    );


/* =========================================================
   CONFIGURATION BUTTON
========================================================= */


const addConfiguration =
    document.getElementById(
        "addConfiguration"
    );


if (
    addConfiguration
) {

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

import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const container = document.getElementById("productCanvas");

if (!container) {
    throw new Error("ORBIT ERROR: #productCanvas was not found.");
}

const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: false
});

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
container.appendChild(renderer.domElement);

console.log("ORBIT RENDERER READY");

const scene = new THREE.Scene();

scene.background = new THREE.Color(0x080909);

const camera = new THREE.PerspectiveCamera(
    42,
    window.innerWidth / window.innerHeight,
    0.01,
    100
);

camera.position.set(0, 1.5, 6);

const controls = new OrbitControls(
    camera,
    renderer.domElement
);

controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.minDistance = 2.8;
controls.maxDistance = 10;
controls.minPolarAngle = 0.35;
controls.maxPolarAngle = 2.75;
controls.target.set(0, 0, 0);
controls.update();

const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
scene.add(ambientLight);

const keyLight = new THREE.DirectionalLight(0xffffff, 4);
keyLight.position.set(4, 6, 5);
keyLight.castShadow = true;
scene.add(keyLight);

const fillLight = new THREE.DirectionalLight(0x9bbcff, 2);
fillLight.position.set(-5, 2, 3);
scene.add(fillLight);

const rimLight = new THREE.DirectionalLight(0xc8ff00, 3);
rimLight.position.set(0, 4, -6);
scene.add(rimLight);

const product = new THREE.Group();
scene.add(product);

const config = {
    material: "matte",
    color: "black",
    finish: "dark",
    lighting: "studio"
};

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

const colorData = {
    black: 0x151719,
    white: 0xe7e9e6,
    orange: 0xff6b22,
    lime: 0xc8ff00
};

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

const gltfLoader = new GLTFLoader();

let aerisModel = null;

const originalMaterials = new Map();

const configurableMeshes = [];
const originalMeshes = [];
const darkMeshes = [];

const headCushionMeshes = [];
const innerShellMeshes = [];
const cushionMeshes = [];
const innerCushionMeshes = [];

function isConfigurablePart(object) {
    if (!object.isMesh) {
        return false;
    }

    const name = object.name.toLowerCase();

    const configurableNames = [
        "aeris_outershell_l",
        "aeris_outershell_r",
        "aeris_headcoushinoutershellconnectortoshellholder",
        "aeris_headcushincase"
    ];

    return configurableNames.includes(name);
}

function getSpecialMaterialType(object) {
    if (!object.isMesh) {
        return null;
    }

    const name = object.name.toLowerCase();

    if (name.includes("aeris_headcoushin")) {
        return "headCushin";
    }

    if (
        name.includes("aeris_innershell_l") ||
        name.includes("aeris_innershell_r")
    ) {
        return "innerShell";
    }

    if (
        name.includes("aeris_cushion_l") ||
        name.includes("aeris_cushion_r")
    ) {
        return "cushion";
    }

    if (
        name.includes("aeris_innercushions") ||
        name.includes("innercushions") ||
        name.includes("innercushin")
    ) {
        return "innerCushions";
    }

    return null;
}

function isOriginalPart(object) {
    if (!object.isMesh) {
        return false;
    }

    const name = object.name.toLowerCase();

    const keywords = [
        "wire",
        "screw",
        "hinge"
    ];

    return keywords.some(
        keyword => name.includes(keyword)
    );
}

function storeOriginalMaterial(object) {
    if (
        !object.isMesh ||
        !object.material
    ) {
        return;
    }

    if (Array.isArray(object.material)) {
        originalMaterials.set(
            object.uuid,
            object.material.map(
                material => material.clone()
            )
        );
    } else {
        originalMaterials.set(
            object.uuid,
            object.material.clone()
        );
    }
}

function removeSurfaceTextureMaps(material) {
    if (!material) {
        return material;
    }

    /*
       REMOVE THE SURFACE MAPS THAT CREATE
       THE STRIPED / CARBON-FIBER LOOK.
    */

    material.map = null;
    material.normalMap = null;
    material.roughnessMap = null;
    material.metalnessMap = null;
    material.bumpMap = null;
    material.displacementMap = null;
    material.aoMap = null;
    material.emissiveMap = null;

    material.normalScale?.set(1, 1);

    material.needsUpdate = true;

    return material;
}

function createDarkMaterial(originalMaterial) {

    const material = new THREE.MeshStandardMaterial({
        color: 0x292c2f,
        roughness: 0.48,
        metalness: 0.08,

        map: null,
        normalMap: null,
        roughnessMap: null,
        metalnessMap: null,
        bumpMap: null,
        displacementMap: null,
        aoMap: null,
        emissiveMap: null,

        transparent: false,
        opacity: 1
    });

    return material;
}

function applyDarkMaterial(object) {

    const original =
        originalMaterials.get(object.uuid);

    if (!original) {
        return;
    }

    if (Array.isArray(original)) {

        object.material =
            original.map(
                material =>
                    createDarkMaterial(material)
            );

    } else {

        object.material =
            createDarkMaterial(original);
    }
}

function getInnerCushionColor() {

    const color = new THREE.Color(
        colorData[config.color]
    );

    const hsl = {};

    color.getHSL(hsl);

    hsl.l = Math.min(
        hsl.l + 0.16,
        0.92
    );

    hsl.s = Math.max(
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

function createSpecialMaterial(
    originalMaterial,
    type
) {

    let material;

    if (type === "headCushin") {

        material = new THREE.MeshStandardMaterial({
            color: 0x3a3d40,
            roughness: 0.58,
            metalness: 0.0
        });

    } else if (type === "innerShell") {

        material = new THREE.MeshStandardMaterial({
            color: 0x34383c,
            roughness: 0.34,
            metalness: 0.02
        });

    } else if (type === "cushion") {

        material = new THREE.MeshStandardMaterial({
            color: 0x45484b,
            roughness: 0.62,
            metalness: 0.0
        });

    } else if (type === "innerCushions") {

        material = new THREE.MeshStandardMaterial({
            color: getInnerCushionColor(),
            roughness: 0.88,
            metalness: 0.0
        });

    } else {

        material = new THREE.MeshStandardMaterial({
            color: 0x34383c,
            roughness: 0.5,
            metalness: 0.0
        });
    }

    return material;
}

function applySpecialMaterial(
    object,
    type
) {

    const original =
        originalMaterials.get(object.uuid);

    if (!original) {
        return;
    }

    if (Array.isArray(original)) {

        object.material =
            original.map(
                material =>
                    createSpecialMaterial(
                        material,
                        type
                    )
            );

    } else {

        object.material =
            createSpecialMaterial(
                original,
                type
            );
    }
}

function applyAllSpecialMaterials() {

    headCushionMeshes.forEach(
        mesh => {

            applySpecialMaterial(
                mesh,
                "headCushin"
            );
        }
    );

    innerShellMeshes.forEach(
        mesh => {

            applySpecialMaterial(
                mesh,
                "innerShell"
            );
        }
    );

    cushionMeshes.forEach(
        mesh => {

            applySpecialMaterial(
                mesh,
                "cushion"
            );
        }
    );

    innerCushionMeshes.forEach(
        mesh => {

            applySpecialMaterial(
                mesh,
                "innerCushions"
            );
        }
    );
}

function updateInnerCushions() {

    const cushionColor =
        getInnerCushionColor();

    innerCushionMeshes.forEach(
        mesh => {

            const material =
                new THREE.MeshStandardMaterial({

                    color: cushionColor,
                    roughness: 0.88,
                    metalness: 0.0,

                    map: null,
                    normalMap: null,
                    roughnessMap: null,
                    metalnessMap: null,
                    bumpMap: null,
                    displacementMap: null,
                    aoMap: null,
                    emissiveMap: null,

                    transparent: false,
                    opacity: 1
                });

            mesh.material = material;
        }
    );
}

function applyFinishToMaterial(material) {

    const finish =
        finishSettings[
            config.finish
        ];

    if (!finish) {
        return;
    }

    if (material.color) {

        const color =
            material.color.clone();

        const hsl = {};

        color.getHSL(hsl);

        if (
            config.finish === "dark"
        ) {

            hsl.l =
                Math.max(
                    hsl.l *
                    finish.colorMultiplier,
                    0.05
                );

        } else {

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

        material.color.copy(color);
    }

    if ("roughness" in material) {

        material.roughness =
            THREE.MathUtils.clamp(
                material.roughness *
                finish.roughnessMultiplier,
                0.04,
                1
            );
    }
}

function createConfiguredMaterial(
    originalMaterial
) {

    const settings =
        materialSettings[
            config.material
        ];

    /*
       GLASS
    */

    if (
        config.material === "glass"
    ) {

        const material =
            new THREE.MeshPhysicalMaterial({

                color:
                    colorData[
                        config.color
                    ],

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

        if (
            originalMaterial.normalScale
        ) {

            material.normalScale.copy(
                originalMaterial.normalScale
            );
        }

        if (
            originalMaterial.emissive
        ) {

            material.emissive.copy(
                originalMaterial.emissive
            );
        }

        applyFinishToMaterial(
            material
        );

        material.needsUpdate = true;

        return material;
    }

    /*
       MATTE / METAL
    */

    const material =
        originalMaterial.clone();

    /*
       REMOVE ORIGINAL GLB SURFACE MAPS
       BEFORE APPLYING MATTE / METAL.
    */

    removeSurfaceTextureMaps(
        material
    );

    if (settings) {

        if ("roughness" in material) {
            material.roughness =
                settings.roughness;
        }

        if ("metalness" in material) {
            material.metalness =
                settings.metalness;
        }

        if ("transmission" in material) {
            material.transmission =
                settings.transmission;
        }

        if ("thickness" in material) {
            material.thickness =
                settings.thickness;
        }

        if ("opacity" in material) {
            material.opacity =
                settings.opacity;
        }
    }

    if (material.color) {

        material.color.set(
            colorData[
                config.color
            ]
        );
    }

    applyFinishToMaterial(
        material
    );

    material.needsUpdate = true;

    return material;
}

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

    updateInnerCushions();
}

function updateColor() {

    updateMaterial();
    updateInnerCushions();
}

function updateFinish() {

    updateMaterial();
    updateInnerCushions();
}

function updateLighting() {

    if (
        config.lighting === "studio"
    ) {

        ambientLight.intensity = 1.5;
        keyLight.intensity = 4;
        fillLight.intensity = 2;
        rimLight.intensity = 3;

        rimLight.color.set(
            0xc8ff00
        );
    }

    if (
        config.lighting === "night"
    ) {

        ambientLight.intensity = 0.45;
        keyLight.intensity = 1.5;
        fillLight.intensity = 0.8;
        rimLight.intensity = 4;

        rimLight.color.set(
            0x4d7cff
        );
    }

    if (
        config.lighting === "neon"
    ) {

        ambientLight.intensity = 0.3;
        keyLight.intensity = 1;
        fillLight.intensity = 2.5;
        rimLight.intensity = 5;

        rimLight.color.set(
            0xc8ff00
        );
    }
}

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

/*
    STATIC ORIGINAL PARTS

    These are:
    - AERIS_Hinges
    - AERIS_Wire_L
    - AERIS_Wire_R
    - AERIS_Screws

    We preserve their original base color,
    roughness and metalness, but create a
    completely new clean material without
    Blender texture maps.
*/

function applyOriginalStaticMaterial(object) {

    const original =
        originalMaterials.get(object.uuid);

    if (!original) {
        return;
    }

    function createCleanOriginalMaterial(
        originalMaterial
    ) {

        const material =
            new THREE.MeshStandardMaterial({

                color:
                    originalMaterial.color
                        ? originalMaterial.color.clone()
                        : new THREE.Color(
                            0x34383c
                        ),

                roughness:
                    "roughness" in originalMaterial
                        ? originalMaterial.roughness
                        : 0.5,

                metalness:
                    "metalness" in originalMaterial
                        ? originalMaterial.metalness
                        : 0.0,

                map: null,
                normalMap: null,
                roughnessMap: null,
                metalnessMap: null,
                bumpMap: null,
                displacementMap: null,
                aoMap: null,
                emissiveMap: null,

                transparent: false,
                opacity: 1
            });

        return material;
    }

    if (Array.isArray(original)) {

        object.material =
            original.map(
                material =>
                    createCleanOriginalMaterial(
                        material
                    )
            );

    } else {

        object.material =
            createCleanOriginalMaterial(
                original
            );
    }
}

gltfLoader.load(

    "./AERIS_v01.glb",

    gltf => {

        console.log(
            "AERIS GLB LOADED"
        );

        aerisModel =
            gltf.scene;

        aerisModel.traverse(
            object => {

                if (!object.isMesh) {
                    return;
                }

                storeOriginalMaterial(
                    object
                );

                /*
                   Recalculate geometry normals.

                   This removes dependency on imported
                   tangent data and gives the geometry
                   fresh vertex normals.
                */

                if (object.geometry) {

                    object.geometry.computeVertexNormals();

                    if (
                        object.geometry.attributes.normal
                    ) {

                        object.geometry.attributes.normal.needsUpdate =
                            true;
                    }

                    if (
                        object.geometry.hasAttribute(
                            "tangent"
                        )
                    ) {

                        object.geometry.deleteAttribute(
                            "tangent"
                        );
                    }
                }

                object.castShadow = true;
                object.receiveShadow = true;

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

                const specialType =
                    getSpecialMaterialType(
                        object
                    );

                if (specialType) {

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

                darkMeshes.push(
                    object
                );

                console.log(
                    "DARK:",
                    object.name
                );
            }
        );

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

        product.add(
            aerisModel
        );

        /*
           Apply clean material to generic
           static dark parts.
        */

        darkMeshes.forEach(
            object => {

                applyDarkMaterial(
                    object
                );
            }
        );

        /*
           Apply clean material to special
           static parts.
        */

        applyAllSpecialMaterials();

        /*
           Apply clean material to original
           small parts such as hinges,
           wires and screws.
        */

        originalMeshes.forEach(
            object => {

                applyOriginalStaticMaterial(
                    object
                );
            }
        );

        fitModelToScene();

        updateMaterial();
        updateColor();
        updateInnerCushions();
        updateFinish();
        updateLighting();
        updateUI();

        const loader =
            document.querySelector(
                ".loading-screen"
            );

        if (loader) {

            loader.style.opacity = "0";
            loader.style.pointerEvents = "none";

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

    progress => {

        if (progress.total) {

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

    error => {

        console.error(
            "AERIS GLB LOAD ERROR:",
            error
        );

        const loadingProgress =
            document.getElementById(
                "loadingProgress"
            );

        if (loadingProgress) {

            loadingProgress.textContent =
                "ERROR";
        }
    }
);

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

    aerisModel.position.x -=
        center.x;

    aerisModel.position.y -=
        center.y;

    aerisModel.position.z -=
        center.z;

    const maxDimension =
        Math.max(
            size.x,
            size.y,
            size.z
        );

    const targetSize = 3.6;

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

    aerisModel.position.y = 0;

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

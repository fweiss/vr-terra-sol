import App from './app'

// const app: App = new App()

import * as BABYLON from "babylonjs";

// Initialize the scene
const canvas = document.getElementById("renderCanvas") as unknown as HTMLCanvasElement
const engine = new BABYLON.Engine(canvas, true);
const scene = new BABYLON.Scene(engine);

// Create and position a camera
const zenith = 50
const spaceCamera = new BABYLON.ArcRotateCamera("camera", Math.PI / 2, Math.PI / 2, zenith, BABYLON.Vector3.Zero(), scene);

const earthCamera = new BABYLON.ArcRotateCamera("earthCamera", Math.PI / 2, Math.PI / 2, zenith, BABYLON.Vector3.Zero(), scene);

const activeCamera = earthCamera
scene.activeCamera = activeCamera
activeCamera.attachControl(canvas, true);

const sunLight = new BABYLON.PointLight("sunLight", new BABYLON.Vector3(0, 0, 0), scene);

const solarRadiance = new BABYLON.StandardMaterial("solarRadiance", scene);
solarRadiance.emissiveColor = new BABYLON.Color3(1.0, 1.0, 0.0)
// solarRadiance.alpha = 0.5

// Create a sphere and apply the material
const sun = BABYLON.MeshBuilder.CreateSphere("sun", { diameter: 2 }, scene);
sun.material = solarRadiance;
sun.position = new BABYLON.Vector3(0, 0, 0);

// Create a pale blue material
const paleBlueMaterial = new BABYLON.StandardMaterial("paleBlueMaterial", scene);
paleBlueMaterial.diffuseColor = new BABYLON.Color3(0.68, 0.85, 0.9); // Pale blue color
paleBlueMaterial.specularColor = BABYLON.Color3.Black()

// Create a sphere and apply the material
const earth = BABYLON.MeshBuilder.CreateSphere("earth", { diameter: 2 }, scene);
earth.material = paleBlueMaterial;
earth.position = new BABYLON.Vector3(5, 0, 0);

let phi = Math.PI / 2
const phiDelta = Math.PI * 2 / (60 * 20)
const earthSpherical = new BABYLON.Spherical(5, phi, 0)

const offset = new BABYLON.Vector3(2, 2, 2)

// Render loop
engine.runRenderLoop(() => {
    earth.position = earthSpherical.toVector3()
    earthCamera.setTarget(earth.position)
    earthCamera.position = earth.position.add(offset)

    phi += phiDelta
    earthSpherical.phi = phi

    scene.render();
});


// Resize the engine on window resize
window.addEventListener("resize", () => {
    engine.resize();
});

scene.debugLayer.show()

import App from './app'

// const app: App = new App()

import * as BABYLON from "babylonjs";

// Initialize the scene
const canvas = document.getElementById("renderCanvas") as unknown as HTMLCanvasElement
const engine = new BABYLON.Engine(canvas, true);
const scene = new BABYLON.Scene(engine);

// Create and position a camera
const zenith = 50
const camera = new BABYLON.ArcRotateCamera("camera", Math.PI / 2, Math.PI / 2, zenith, BABYLON.Vector3.Zero(), scene);
camera.attachControl(canvas, true);

// Add a hemispheric light
const light = new BABYLON.DirectionalLight("light", new BABYLON.Vector3(1, 0, 0), scene);

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

// Create a sphere and apply the material
const earth = BABYLON.MeshBuilder.CreateSphere("earth", { diameter: 2 }, scene);
earth.material = paleBlueMaterial;
earth.position = new BABYLON.Vector3(5, 0, 0);

// Render loop
engine.runRenderLoop(() => {
    scene.render();
});

// Resize the engine on window resize
window.addEventListener("resize", () => {
    engine.resize();
});

scene.debugLayer.show()

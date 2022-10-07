import * as BABYLON from 'babylonjs'
import settings from './settings'
import Controls from './gui-controls';
import Camera from './camera'
import Bodies from './bodies'

const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement
const engine = new BABYLON.Engine(canvas, true)
var scene: BABYLON.Scene = new BABYLON.Scene(engine)
engine.runRenderLoop(function () {
    scene.render()
});
window.addEventListener("resize", function () {
    engine.resize()
});

createLights()
const camera = new Camera(scene)
const bodies = new Bodies(scene)

const controls = new Controls()
controls.target.addEventListener('camera', (event: CustomEvent) => {
    const cameraName = event.detail
    camera.switchCamera(cameraName, scene)
})
controls.target.addEventListener('tod', (event: CustomEvent) => {
    console.log(event.detail)
    bodies.setEarth(event.detail)
})

if (settings.debug.inspector) {
    scene.debugLayer.show()
}
const axes = new BABYLON.AxesViewer(scene, 2000)

function createLights() {
    // use two oposing hemisphere lights to provide full ambient
    const intensity = .5
    let light = new BABYLON.HemisphericLight("hemilight_north", new BABYLON.Vector3(0, 100000, 0), scene)
    light.diffuse = new BABYLON.Color3(intensity, intensity, intensity)
    light.specular = new BABYLON.Color3(0, 0, 0);

    let light2 = new BABYLON.HemisphericLight("hemilight_south", new BABYLON.Vector3(0, -100000, 0), scene)
    light2.diffuse = new BABYLON.Color3(intensity, intensity, intensity)
    light2.specular = new BABYLON.Color3(0, 0, 0);
}

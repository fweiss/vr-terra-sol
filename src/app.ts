import * as BABYLON from 'babylonjs'
import settings from './settings'
import Controls from './gui-controls';
import Camera from './camera'
import Bodies from './bodies'

const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement
const engine = new BABYLON.Engine(canvas, true)
const scene: BABYLON.Scene = new BABYLON.Scene(engine)
engine.runRenderLoop(function () {
    scene.render()
});
window.addEventListener("resize", function () {
    engine.resize()
});

// put it all in a scalable mesh, trying to cope with crappy rendering of the sun at great distance
const universe = new BABYLON.AbstractMesh('universe')
const scaling = 0.001
universe.scaling = new BABYLON.Vector3(scaling, scaling, scaling)

createLights(universe)
const camera = new Camera(scene, universe)
const bodies = new Bodies(scene, universe)

const controls: Controls = new Controls()
controls.target.addEventListener('camera', (event: CustomEvent) => {
    const cameraName = event.detail
    camera.switchCamera(cameraName, scene, universe)
})
controls.target.addEventListener('tod', (event: CustomEvent) => {
    console.log(event.detail)
    bodies.setEarth(event.detail)
})
bodies.setEarth(0)

debugmodes()

function createLights(universe: BABYLON.AbstractMesh) {
    // use two oposing hemisphere lights to provide full ambient
    const intensity = .5
    let light = new BABYLON.HemisphericLight("hemilight_north", new BABYLON.Vector3(0, 100000, 0), scene)
    light.diffuse = new BABYLON.Color3(intensity, intensity, intensity)
    light.specular = new BABYLON.Color3(0, 0, 0);

    let light2 = new BABYLON.HemisphericLight("hemilight_south", new BABYLON.Vector3(0, -100000, 0), scene)
    light2.diffuse = new BABYLON.Color3(intensity, intensity, intensity)
    light2.specular = new BABYLON.Color3(0, 0, 0);
}

function debugmodes() {
    if (settings.debug.inspector) {
        scene.debugLayer.show()
    }
    if (settings.debug.axesViewer) {
        new BABYLON.AxesViewer(scene, 2000)
    }    
}
camera.onCameraChangeObservable.add((cameraName: string) => {
    const latitude = camera.orbitSpherical.theta / Math.PI * 180 - 90
    let longitude = camera.orbitSpherical.phi / Math.PI * 180
    if (longitude < 0 ) {
        longitude += 180
    } else {
        longitude -= 180
    }

    const latElem: HTMLInputElement = document.getElementById('lat') as HTMLInputElement
    latElem.value = latitude.toFixed(4).toString()
    const lonElem: HTMLInputElement = document.getElementById('lon') as HTMLInputElement
    lonElem.value = longitude.toFixed(4).toString()
})

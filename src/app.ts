import * as BABYLON from 'babylonjs'
// import { Camera, CreateScreenshotWithResizeAsync } from 'babylonjs';
import { PositionGizmo } from 'babylonjs/Gizmos/index';
import Controls from './gui-controls';
import Camera from './camera'

const settings = {
    earth: {
        diameter: 12756
    },
    starfield: {
        diameter: 12000000
    },
    debug: {
        inspector: false
    }
}

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
populateScene()

const controls = new Controls()
controls.target.addEventListener('camera', (event) => {
    const cameraName = event.detail
    camera.switchCamera(cameraName, scene)
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

function populateScene() {
    let earth = BABYLON.MeshBuilder.CreateSphere("earth", { diameter: settings.earth.diameter, sideOrientation: BABYLON.Mesh.FRONTSIDE}, scene)
    // earth.up = new BABYLON.Vector3(0, 1, 0)

    let material = new BABYLON.StandardMaterial('earth_no_clouds', scene)
    // material.diffuseColor = BABYLON.Color3.FromHexString('#cf9e51')

    let res = [ '8k', '16k' ]
    const url = 'assets/' + res[0] + '/2_no_clouds_' + res[0] + '.jpg'
    const noMipmapOrOptions = false
    const invertY = true
    material.diffuseTexture = new BABYLON.Texture(url, scene, noMipmapOrOptions, invertY)
    // since invertY above doesn't seem to work
    earth.rotate(new BABYLON.Vector3(0, 0, 1), Math.PI)
    // since texture should center at long 0
    earth.rotate(new BABYLON.Vector3(0, 1, 0), Math.PI / 2)
    earth.material = material

    const starfield = createStarfield()

    const sunlight = new BABYLON.DirectionalLight('sunlight', new BABYLON.Vector3(1, 0, 0), scene)
    sunlight.excludedMeshes =  [ starfield ]
    sunlight.intensity = 1
    sunlight.specular = new BABYLON.Color3()
}

function createStarfield() {
    let starfield = BABYLON.MeshBuilder.CreateSphere("starfield-sphere", { diameter: 1000000, sideOrientation: BABYLON.Mesh.BACKSIDE }, scene)
    starfield.rotate(new BABYLON.Vector3(1, 0, 0), Math.PI)
    let material = new BABYLON.StandardMaterial('stars', scene)
    material.diffuseTexture = new BABYLON.Texture('assets/starfield.jpg', scene)
    starfield.material = material
    return starfield
}

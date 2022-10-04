import * as BABYLON from 'babylonjs'
import { CreateScreenshotWithResizeAsync } from 'babylonjs';
import { PositionGizmo } from 'babylonjs/Gizmos/index';

const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement
const engine = new BABYLON.Engine(canvas, true)
var scene = new BABYLON.Scene(engine)
engine.runRenderLoop(function () {
    scene.render()
});
window.addEventListener("resize", function () {
    engine.resize()
});

createLights()
createCamera()
populateScene()

scene.debugLayer.show()

function createLights() {
    let light = new BABYLON.HemisphericLight("HemiLight", new BABYLON.Vector3(0, 0, -100), scene)
    light.diffuse = new BABYLON.Color3(1, 1, 1)
    light.specular = new BABYLON.Color3(0, 0, 0);
}

function createCamera() {
    const position = new BABYLON.Vector3(0, 0, -100)
    // const camera = new BABYLON.UniversalCamera("camera", position, scene)
    // const camera = new BABYLON.FreeCamera('camera', position)
    const camera = new BABYLON.ArcRotateCamera('camera', 0, 0, 21, new BABYLON.Vector3(), scene)
    camera.checkCollisions = true
    camera.attachControl(true)
}

function populateScene() {
    let earth = BABYLON.MeshBuilder.CreateSphere("sphere", { diameter: 20, sideOrientation: 0}, scene)
    // earth.up = new BABYLON.Vector3(0, 1, 0)
    let material = new BABYLON.StandardMaterial('earthcolor', scene)
    // material.diffuseColor = BABYLON.Color3.FromHexString('#cf9e51')

    let res = [ '8k', '16k' ]
    material.diffuseTexture = new BABYLON.Texture('assets/' + res[0] + '/2_no_clouds_' + res[0] + '.jpg', scene)
    earth.rotate(new BABYLON.Vector3(1, 0, 0), Math.PI)
    earth.material = material

    createStarfield()
}

function createStarfield() {
    let starfield = BABYLON.MeshBuilder.CreateSphere("starfield-sphere", { diameter: 10000, sideOrientation: BABYLON.Mesh.BACKSIDE }, scene)
    starfield.rotate(new BABYLON.Vector3(1, 0, 0), Math.PI)
    let material = new BABYLON.StandardMaterial('stars', scene)
    material.diffuseTexture = new BABYLON.Texture('assets/starfield.jpg', scene)
    starfield.material = material
}

import * as BABYLON from 'babylonjs'
import { Model } from './model2'

export default class Cameras {
    public spaceCamera: BABYLON.ArcRotateCamera
    public earthCamera: BABYLON.ArcRotateCamera
    public surfaceCamera: BABYLON.ArcRotateCamera

    constructor(scene: BABYLON.Scene, model: Model) {
        const upVectorZ = new BABYLON.Vector3(0, 0, 1)
        const zenith = 10
        this.spaceCamera = new BABYLON.ArcRotateCamera("camera", Math.PI / 2, 0, zenith, BABYLON.Vector3.Zero(), scene);      
        this.spaceCamera.upVector = upVectorZ
        this.spaceCamera.lowerBetaLimit = null
        this.spaceCamera.upperBetaLimit = null
        // this.spaceCamera.lowerAlphaLimit = 0
        // this.spaceCamera.upperAlphaLimit = 0

        this.earthCamera = new BABYLON.ArcRotateCamera("earthCamera", Math.PI / 2, 0, zenith, BABYLON.Vector3.Zero(), scene);
        this.earthCamera.maxZ = 100 //model.universeRadius
        this.earthCamera.minZ = 0.01

        const surfaceCameraHeight = 1.01 // half diameter plus a little
        this.surfaceCamera = new BABYLON.ArcRotateCamera("surface Camera", Math.PI / 2, 0, surfaceCameraHeight, BABYLON.Vector3.Zero(), scene);
        this.surfaceCamera.minZ = 0.001
        this.surfaceCamera.maxZ = 10000
    }

    setActiveCamera(camera: BABYLON.Camera, scene: BABYLON.Scene, canvas: HTMLCanvasElement) {
        scene.activeCamera = camera
        camera.attachControl(canvas, true);
    }
}

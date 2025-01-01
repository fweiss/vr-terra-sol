import * as BABYLON from 'babylonjs'

export default class Cameras {
    public spaceCamera: BABYLON.ArcRotateCamera
    public earthCamera: BABYLON.ArcRotateCamera

    constructor(scene: BABYLON.Scene) {
        const upVectorZ = new BABYLON.Vector3(0, 0, 1)
        const zenith = 10
        this.spaceCamera = new BABYLON.ArcRotateCamera("camera", Math.PI / 2, 0, zenith, BABYLON.Vector3.Zero(), scene);      
        this.spaceCamera.upVector = upVectorZ
        this.spaceCamera.lowerBetaLimit = null
        this.spaceCamera.upperBetaLimit = null
        // this.spaceCamera.lowerAlphaLimit = 0
        // this.spaceCamera.upperAlphaLimit = 0

        this.earthCamera = new BABYLON.ArcRotateCamera("earthCamera", Math.PI / 2, 0, zenith, BABYLON.Vector3.Zero(), scene);

    }

    setActiveCamera(camera: BABYLON.Camera, scene: BABYLON.Scene, canvas: HTMLCanvasElement) {
        scene.activeCamera = camera
        camera.attachControl(canvas, true);
    }

}

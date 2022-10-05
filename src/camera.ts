import settings from './settings'

export default class Camera {
    orbitCamera: BABYLON.TargetCamera
    nearSpaceCamera: BABYLON.TargetCamera
    activeCamera: BABYLON.TargetCamera

    constructor(scene: BABYLON.Scene) {
        const orbitHeight = ((settings.earth.diameter / 2) + 18000)
        const position = new BABYLON.Vector3(0, 0, orbitHeight)
        // const camera = new BABYLON.UniversalCamera("near_space", position, scene)

        this.nearSpaceCamera = new BABYLON.FreeCamera('near_space', position, scene)
        this.nearSpaceCamera.target = new BABYLON.Vector3(0,0,0)
        this.nearSpaceCamera.maxZ = 1000010

        // not sure why, but a 90 degree alphs and beta puts view on "normal" xyz
        this.orbitCamera = new BABYLON.ArcRotateCamera('orbit', Math.PI / 2, Math.PI / 2, (settings.earth.diameter / 2) + 8000, new BABYLON.Vector3(), scene)

        // camera.checkCollisions = true
        this.orbitCamera.maxZ = 1000010

        this.switchCamera('orbit', scene)
    }
    switchCamera(cameraName: string, scene: BABYLON.Scene) {
        // const camera = this.nearSpaceCamera
        const camera = scene.getNodeByName(cameraName) as BABYLON.TargetCamera

        scene.activeCamera = camera
        camera.attachControl(true)
        const noPreventDefault = true
        // camera.attachControl(noPreventDefault)
    }
}
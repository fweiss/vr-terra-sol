import * as BABYLON from 'babylonjs'
import { Vector2 } from 'babylonjs'

import settings from './settings'

export default class Camera {
    orbitCamera: BABYLON.TargetCamera
    nearSpaceCamera: BABYLON.TargetCamera
    activeCamera: BABYLON.TargetCamera
    surfaceCamera:  BABYLON.TargetCamera

    constructor(scene: BABYLON.Scene, universe: BABYLON.AbstractMesh) {
        const orbitHeight = ((settings.earth.diameter / 2) + 18000)
        const position = new BABYLON.Vector3(0, 0, orbitHeight)
        // const camera = new BABYLON.UniversalCamera("near_space", position, scene)

        this.nearSpaceCamera = new BABYLON.FreeCamera('near_space', position, scene)
        this.nearSpaceCamera.target = new BABYLON.Vector3(0,0,0)
        this.nearSpaceCamera.maxZ = 1000010

        this.createOrbitCamera(scene)
        this.createSurfaceCamera(scene)

        this.switchCamera('orbit', scene, universe)
    }
    switchCamera(cameraName: string, scene: BABYLON.Scene, universe: BABYLON.AbstractMesh) {
        // const camera = this.nearSpaceCamera
        const camera = scene.getNodeByName(cameraName) as BABYLON.TargetCamera

        // we want to rotate so that y points to zenith
        if (cameraName == 'surface') {
            const rotationQuaternion = BABYLON.Quaternion.RotationAxis(new BABYLON.Vector3(0, 0, 1), Math.PI / 2)
            universe.rotationQuaternion =rotationQuaternion
        }

        scene.activeCamera = camera
        camera.attachControl(true)
        const noPreventDefault = true
        // camera.attachControl(noPreventDefault)
    }
    private createOrbitCamera(scene) {
        const elevation = 8000 + 2500
        const radius = (settings.earth.diameter / 2) + elevation
        // not sure why, but a 90 degree alphs and beta puts view on "normal" xyz
        this.orbitCamera = new BABYLON.ArcRotateCamera('orbit', Math.PI / 2, Math.PI / 2, radius, new BABYLON.Vector3(), scene)

        // camera.checkCollisions = true
        this.orbitCamera.maxZ = 1000010
    }
    private createSurfaceCamera(scene: BABYLON.Scene) {
        const elevation = 8000 + 2500
        const radius = (settings.earth.diameter / 2) + elevation
        const theta = Math.PI / 2
        const phi = Math.PI / 2
        const spherical = new BABYLON.Spherical(radius, theta, phi)
        const position = spherical.toVector3()
        // this.surfaceCamera = new BABYLON.FreeCamera('surface', position, scene)
        // this.surfaceCamera.target = new BABYLON.Vector3(0,0,0)
        // this.surfaceCamera.maxZ = 1000010

        const orbitHeight = ((settings.earth.diameter / 2) + 180)
        const position2 = new BABYLON.Vector3(0, 0, orbitHeight)
        const camera = new BABYLON.UniversalCamera('surface', position2, scene)
        camera.target = new BABYLON.Vector3(0, 0, orbitHeight + 120000)
        // camera.upVector = new BABYLON.Vector3(0, 0, orbitHeight + 120000)
        camera.maxZ = 1000010
        this.surfaceCamera = camera
    }
}
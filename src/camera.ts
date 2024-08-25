import * as BABYLON from 'babylonjs'
import { Vector2 } from 'babylonjs'

import settings from './settings'

export default class Camera {
    orbitSpherical: BABYLON.Spherical // aka hover

    orbitCamera: BABYLON.ArcRotateCamera
    nearSpaceCamera: BABYLON.TargetCamera
    activeCamera: BABYLON.TargetCamera
    surfaceCamera:  BABYLON.TargetCamera
    onCameraChangeObservable = new BABYLON.Observable<BABYLON.Spherical>()

    constructor(scene: BABYLON.Scene, universe: BABYLON.AbstractMesh) {
        // this.orbitSpherical = new BABYLON.Spherical(1, 0, 0)
        this.orbitSpherical = this.initialOrbitSpherical()

        const orbitHeight = ((settings.earth.diameter / 2) + 18000)
        const position = new BABYLON.Vector3(0, 0, orbitHeight)

        this.nearSpaceCamera = new BABYLON.FreeCamera('near_space', position, scene)
        this.nearSpaceCamera.target = new BABYLON.Vector3(0,0,0)
        this.nearSpaceCamera.maxZ = 1000010

        this.createOrbitCamera(scene)
        this.createSurfaceCamera(scene)

        this.switchCamera('orbit', scene, universe)
    }
    private initialOrbitSpherical() {
        // 37°46′39″N 122°24′59″W
        const lat = 37 + 46/60 + 39/3600
        const lng = -122 - 24/60 - 59/3600
        const theta = Math.PI * (90 - lat) / 180
        const phi = Math.PI * lng / 180
        return new BABYLON.Spherical(1, theta, phi)
    }
    switchCamera(cameraName: string, scene: BABYLON.Scene, universe: BABYLON.AbstractMesh) {
        console.log('hover: ', this.orbitSpherical.toString())
        const camera = scene.getNodeByName(cameraName) as BABYLON.TargetCamera

        // we want to rotate so that y points to zenith
        // if (cameraName == 'xsurface') {
        //     const rotationQuaternion = BABYLON.Quaternion.RotationAxis(new BABYLON.Vector3(0, 0, 1), Math.PI / 2)
        //     universe.rotationQuaternion =rotationQuaternion
        // }
        if (cameraName != 'orbit' || true) {
            // conserve radius and keep camera over current latlon as earth spins
            let cameraSpherical = BABYLON.Spherical.FromVector3(camera.position)
            console.log('cameraSpherical: ' + cameraSpherical.toString())
            cameraSpherical.theta = this.orbitSpherical.theta
            cameraSpherical.phi = this.orbitSpherical.phi
            camera.position = cameraSpherical.toVector3()
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
        // this.orbitCamera.noRotationConstraint = true
        this.orbitCamera.onViewMatrixChangedObservable.add(() => {
            // console.log(this.orbitCamera.position.toString())
            // actually update latlon relative to earth
            this.updateCameraPosition(this.orbitCamera, scene)
        })
    }
    // keep camera over current latlon as earth spins
    trackOrbitCamera(earth: BABYLON.Mesh) {
        let spherical: BABYLON.Spherical = BABYLON.Spherical.FromVector3(this.orbitCamera.position)
        spherical.phi = -earth.rotation.y
        this.orbitCamera.setPosition(spherical.toVector3())
    }
    private updateCameraPosition(camera: BABYLON.TargetCamera, scene: BABYLON.Scene) {
        const earth = scene.getNodeByName('earth') as BABYLON.Mesh
        const ev: BABYLON.Vector3 = new BABYLON.Vector3().copyFrom(earth.position)
        ev.subtractInPlace(camera.position)
        // let spherical: BABYLON.Spherical = BABYLON.Spherical.FromVector3(ev)
        // BABYLON.Spherical.FromVector3ToRef(ev, this.orbitSpherical)
        this.onCameraChangeObservable.notifyObservers(this.orbitSpherical)
    }
    private createSurfaceCamera(scene: BABYLON.Scene) {
        const orbitHeight = ((settings.earth.diameter / 2) + 180)

        const camera = new BABYLON.FlyCamera('surface', BABYLON.Vector3.Zero(), scene)
        // rollCorrect is a hack to keep camera from rolling
        camera.rollCorrect = 100000

        // const lat = 37
        // const lng = -122
        // const theta = Math.PI * (90 - lat) / 180
        // const phi = Math.PI * lng / 180
        const theta = this.orbitSpherical.theta
        const phi = this.orbitSpherical.phi

        camera.target = new BABYLON.Vector3(-(orbitHeight + 120000), 0, 0)
        // camera.rotation = new BABYLON.Vector3(0, -Math.PI / 2, -Math.PI / 2) // phi, theta?
        camera.rotation = new BABYLON.Vector3(0, -phi, -theta) // phi, theta?

        const spherical = new BABYLON.Spherical(orbitHeight, theta, phi)
        camera.position = spherical.toVector3()

        this.onCameraChangeObservable.add((hover: BABYLON.Spherical) => {
            const theta = hover.theta
            const phi = hover.phi
            const spherical = new BABYLON.Spherical(orbitHeight, theta, phi)
            camera.position = spherical.toVector3()
            camera.rotation = new BABYLON.Vector3(0, -phi, -theta)
        })

        let p = new BABYLON.Vector3(0, 0, 0)
        camera.onViewMatrixChangedObservable.add(() => {
            if (p.equals(camera.position)) { return }
            p.copyFrom(camera.position)
            console.log('surface camera position: ' + camera.position.toString())
            // console.log(camera.rotation.toString())
            // console.log(camera.target.toString())
        })

        camera.maxZ = 1000010
        this.surfaceCamera = camera
    }
}
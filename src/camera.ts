/*
 * orbit mode
 * ArcRotateCamera
 * it looks toward the center of the earth
 * pan and roll have the apparent effect
 * of changing the location of the camera above the earth
 * and simultaneously, the hover latlon
 * the tod rotates the universe around the earth axis
 * 
 * surface mode
 * Fly Camera
 * like a camera at a point above the surface
 * and pan a tilt like that
 * the hover latlon is fixed, like the orbit mode
 * put possibly holding control key allows changing elevation
 * 
*/
import * as BABYLON from 'babylonjs'
import Model from './model'

import settings from './settings'

export default class Cameras {
    hover: BABYLON.Spherical // aka hover

    orbitCamera: BABYLON.ArcRotateCamera
    nearSpaceCamera: BABYLON.TargetCamera
    surfaceCamera:  BABYLON.TargetCamera
    activeCamera: BABYLON.TargetCamera

    onCameraChangeObservable = new BABYLON.Observable<BABYLON.Spherical>()
    onHoverChangeObservable = new BABYLON.Observable<BABYLON.Spherical>()

    constructor(scene: BABYLON.Scene, universe: BABYLON.AbstractMesh) {
        // this.orbitSpherical = new BABYLON.Spherical(1, 0, 0)
        this.hover = this.initialOrbitSpherical()

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
        const lat = settings.zenith.latitude
        const lng = settings.zenith.longitude
        const theta = Math.PI * (90 - lat) / 180
        const phi = Math.PI * lng / 180
        return new BABYLON.Spherical(1, theta, phi)
    }
    switchCamera(cameraName: string, scene: BABYLON.Scene, universe: BABYLON.AbstractMesh) {
        console.log('hover: ', this.hover.toString())
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
            cameraSpherical.theta = this.hover.theta
            cameraSpherical.phi = this.hover.phi
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

            // this.model.setZenith(latitude, longitude)
        })
    }
    // keep camera over current latlon as earth spins
    trackOrbitCamera(earth: BABYLON.Mesh, model: Model) {
        let spherical: BABYLON.Spherical = BABYLON.Spherical.FromVector3(this.orbitCamera.position)
        // unexplained kludge to keep earth from rotating
        const adjust = (90 + model.zenith.longitude) / 360 * Math.PI * 2
        // spherical.phi = -earth.rotation.y -((32)/360) * Math.PI * 2
        spherical.phi = - earth.rotation.y + adjust
        this.orbitCamera.setPosition(spherical.toVector3())
    }
    private updateCameraPosition(camera: BABYLON.TargetCamera, scene: BABYLON.Scene) {
        const earth = scene.getNodeByName('earth') as BABYLON.Mesh
        const ev: BABYLON.Vector3 = new BABYLON.Vector3().copyFrom(earth.position)
        ev.subtractInPlace(camera.position)
        let spherical: BABYLON.Spherical = BABYLON.Spherical.FromVector3(ev)
        BABYLON.Spherical.FromVector3ToRef(ev, this.hover)
        this.onCameraChangeObservable.notifyObservers(this.hover) // maybe not necessary
        this.onHoverChangeObservable.notifyObservers(this.hover)
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
        const theta = this.hover.theta
        const phi = this.hover.phi

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
import * as BABYLON from 'babylonjs'
import { float } from 'babylonjs/types'

import AppBase from './app-base'
import Cameras from './cameras'
import Controls from './controls'
import Model from './model2'
import Bodies2 from './bodies2'
import EarthGroup from './earth-group'

export default class App extends AppBase {
    private cameras: Cameras
    private controls: Controls

    private model: Model
    private bodies: Bodies2
    private earthGroup: EarthGroup

    private zenithBeacon: BABYLON.LinesMesh
    private axisBeacon: BABYLON.LinesMesh
    private horizonBeacon: BABYLON.LinesMesh

    constructor() {
        // implicitly calls createModel, createCameras, createLights, createObjects
        super()

        this.scene.onBeforeRenderObservable.add(() => {
            this.model.tick()

            const millisPerTick = 1000
            const heightOfEarthCamera = 5

            // earth orbit in xy plane
            const rotationMatrix = BABYLON.Matrix.RotationY(Math.PI / 2);
            let phi = this.model.solarDateRadians
            // NB theta cannot be zero or 180
            // earth meander a tiny bit when phi and theta are switched
            // phi positive = ccw
            let spherical = new BABYLON.Spherical(heightOfEarthCamera, Math.PI/2, phi / millisPerTick)
            const earthGroupPositionVector3 = BABYLON.Vector3.TransformCoordinates(spherical.toVector3(), rotationMatrix)

            // adust earth, note that earth rotates ccw
            this.earthGroup.earthGroup.position = earthGroupPositionVector3
            this.earthGroup.earthGlobe.rotation.y = -this.model.siderealTimeRadians

            // adust earth camera
            const upVector = new BABYLON.Vector3(0, 1, 0); // Default up vector in local space
            const worldMatrix = this.earthGroup.earthGlobe.getWorldMatrix();
            const worldUpVector = BABYLON.Vector3.TransformNormal(upVector, worldMatrix);
            // this.cameras.earthCamera.upVector = worldUpVector


            const absoluteEarthGlobePosition = this.earthGroup.earthGlobe.getAbsolutePosition()
            const zenithSpherical = new BABYLON.Spherical(heightOfEarthCamera, Math.PI / 2, this.model.siderealTimeRadians)
            const earthCameraOffset = this.earthGroup.getAbsoluteEarthZenithVector(this.model)

            this.updateLineEndpoint(this.zenithBeacon, absoluteEarthGlobePosition, absoluteEarthGlobePosition.add(earthCameraOffset))

            this.cameras.earthCamera.setTarget(absoluteEarthGlobePosition)
            this.cameras.earthCamera.position = absoluteEarthGlobePosition.add(earthCameraOffset)
            this.cameras.earthCamera.upVector = worldUpVector

            const ss = new BABYLON.Spherical(10, 0, 0)
            // for some reason, an extreme y value is needed
            const vv = new BABYLON.Vector3(0, 1000, 0)
            const mm = this.earthGroup.earthGlobe.getWorldMatrix()
            const be = BABYLON.Vector3.TransformCoordinates(vv, mm);

            const surfaceCameraHeight = 1.01 // half diameter plus a little
            const positionOffset = earthCameraOffset.normalize().scale(surfaceCameraHeight)
            let normalVector = BABYLON.Vector3.Cross(earthCameraOffset, be);
            const surfaceCameraPosition = earthGroupPositionVector3.add(positionOffset)

            const pk = this.earthGroup.earthGlobe.position
            this.cameras.trackSurfaceamera(earthGroupPositionVector3, positionOffset, normalVector, earthCameraOffset)


            this.updateLineEndpoint(this.axisBeacon, absoluteEarthGlobePosition, absoluteEarthGlobePosition.add(be))
            this.updateLineEndpoint(this.horizonBeacon, surfaceCameraPosition, normalVector)
        })

        this.controls = new Controls()
        this.controls.onCameraSelect = (camera: string) => {
            console.log('camera selected:', camera)
            const cameras = {
                earth: this.cameras.earthCamera,
                space: this.cameras.spaceCamera,
                surface: this.cameras.surfaceCamera,
            }
            const selectedCamera = cameras[camera] || this.cameras.earthCamera
            this.cameras.setActiveCamera(selectedCamera, this.scene, this.canvas)
            this.showBecaon(camera != 'surface')
        }
        this.model.onYearDateChange = (date: Date) => {
            this.controls.updateYearDate(date)
        }

    // this.scene.debugLayer.show()
    
    // new BABYLON.AxesViewer(this.scene, 2000)

    }
    createModel() { // override base class
        this.model = new Model()
    }
    // override base class skeletons
    createCameras() {
        this.cameras = new Cameras(this.scene)
        this.cameras.setActiveCamera(this.cameras.earthCamera, this.scene, this.canvas)
    }

    createLights() {
        const sunLight = new BABYLON.PointLight("sunLight", new BABYLON.Vector3(0, 0, 0), this.scene);
        sunLight.intensity = 1.0

        const intensity = 0.4
        const northHemispherLight = new BABYLON.HemisphericLight("north hemisphere light", new BABYLON.Vector3(0, 1, 0), this.scene);
        northHemispherLight.intensity = intensity
        const southHemispherLight = new BABYLON.HemisphericLight("south hemisphere light", new BABYLON.Vector3(0, -1, 0), this.scene);
        southHemispherLight.intensity = intensity
    }
    createObjects() {
        this.bodies = new Bodies2(this.scene)
        this.earthGroup = new EarthGroup(this.scene, this.model)

        this.zenithBeacon = BABYLON.MeshBuilder.CreateLines("zenith beacon", { points: [BABYLON.Vector3.Zero(), new BABYLON.Vector3(0, 0, 10)], updatable: true }, this.scene)
        this.axisBeacon = BABYLON.MeshBuilder.CreateLines("horizon beacon", { points: [BABYLON.Vector3.Zero(), new BABYLON.Vector3(0, 0, 10)], updatable: true }, this.scene)
        this.horizonBeacon = BABYLON.MeshBuilder.CreateLines("horizon beacon", { points: [BABYLON.Vector3.Zero(), new BABYLON.Vector3(0, 0, 10)], updatable: true }, this.scene)
        var redMaterial = new BABYLON.StandardMaterial("redMaterial", this.scene);
        redMaterial.emissiveColor = new BABYLON.Color3(1, 0, 0); // Red color
        this.axisBeacon.material = redMaterial;
    }
    // display a line from start to end
    private updateLineEndpoint(lineMesh: BABYLON.LinesMesh, newStart, newEnd) {
        const updatedPoints = [newStart, newEnd];
        const positions = [];
        updatedPoints.forEach(p => {
            positions.push(p.x, p.y, p.z);
        });
        lineMesh.geometry.updateVerticesData(BABYLON.VertexBuffer.PositionKind, positions);
    }
    // probably don't need this
    private showBecaon(onoff: boolean) {
        this.zenithBeacon.isVisible = onoff
    }
}

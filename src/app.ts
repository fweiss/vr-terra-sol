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
            const positionVector = BABYLON.Vector3.TransformCoordinates(spherical.toVector3(), rotationMatrix)

            // adust earth, note that earth rotates ccw
            this.earthGroup.earthGroup.position = positionVector
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

            // adust surface camera
            // target is perpendicular to zenith rotated around z-axis
            // this.cameras.surfaceCamera.setTarget(absoluteEarthGlobePosition)
            this.cameras.surfaceCamera.position = absoluteEarthGlobePosition.add(earthCameraOffset)
            // this.cameras.surfaceCamera.upVector = worldUpVector
            this.cameras.surfaceCamera.radius = 1.1
            // const axis = new BABYLON.Vector3(0, 0, 1)
            let zaxis = BABYLON.Vector3.TransformNormal(
                new BABYLON.Vector3(0, 1, 0), // Z-axis in local space
                this.earthGroup.earthGlobe.getWorldMatrix()
            );
            zaxis.normalize(); // Optional, normalize to unit vector
            
            const surfaceRotationMatrix = BABYLON.Matrix.RotationAxis(zaxis, Math.PI / 2);
            const rotatedVector = BABYLON.Vector3.TransformCoordinates(earthCameraOffset, surfaceRotationMatrix);
            // this.cameras.surfaceCamera.setTarget(rotatedVector)

            const ss = new BABYLON.Spherical(10, 0, 0)
            // const vv = ss.toVector3()
            // for some reason, an extreme y value is needed
            const vv = new BABYLON.Vector3(0, 1000, 0)
            const mm = this.earthGroup.earthGlobe.getWorldMatrix()
            const be = BABYLON.Vector3.TransformCoordinates(vv, mm);

            this.updateLineEndpoint(this.horizonBeacon, absoluteEarthGlobePosition, absoluteEarthGlobePosition.add(be))
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

    this.scene.debugLayer.show()
    
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
        this.horizonBeacon = BABYLON.MeshBuilder.CreateLines("horizon beacon", { points: [BABYLON.Vector3.Zero(), new BABYLON.Vector3(0, 0, 10)], updatable: true }, this.scene)
        var redMaterial = new BABYLON.StandardMaterial("redMaterial", this.scene);
        redMaterial.emissiveColor = new BABYLON.Color3(1, 0, 0); // Red color
        this.horizonBeacon.material = redMaterial;
            }
    private updateLineEndpoint(lineMesh: BABYLON.LinesMesh, newStart, newEnd) {
        // Define the new points
        const updatedPoints = [newStart, newEnd];
    
        // Update the vertices
        const positions = [];
        updatedPoints.forEach(p => {
            positions.push(p.x, p.y, p.z);
        });
    
        // Access the geometry of the LineMesh and update its data
        lineMesh.geometry.updateVerticesData(BABYLON.VertexBuffer.PositionKind, positions);
    }
    // probably don't need this
    private showBecaon(onoff: boolean) {
        this.zenithBeacon.isVisible = onoff
    }
}

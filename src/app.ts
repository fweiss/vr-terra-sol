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

    private line: BABYLON.LinesMesh

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

            this.updateLineEndpoint(this.line, absoluteEarthGlobePosition, absoluteEarthGlobePosition.add(earthCameraOffset))

            this.cameras.earthCamera.setTarget(absoluteEarthGlobePosition)
            this.cameras.earthCamera.position = absoluteEarthGlobePosition.add(earthCameraOffset)
            this.cameras.earthCamera.upVector = worldUpVector
        })

        this.controls = new Controls()
        this.controls.onCameraSelect = (camera: string) => {
            console.log('camera selected:', camera)
            if (camera === 'earth') {
                this.cameras.setActiveCamera(this.cameras.earthCamera, this.scene, this.canvas)
            } else if (camera === 'space') {
                this.cameras.setActiveCamera(this.cameras.spaceCamera, this.scene, this.canvas)
            }
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
        this.line = BABYLON.MeshBuilder.CreateLines("line", { points: [BABYLON.Vector3.Zero(), new BABYLON.Vector3(0, 0, 10)], updatable: true }, this.scene)
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
}

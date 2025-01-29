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

    beaconsOn: boolean = true

    constructor() {
        // implicitly calls createModel, createCameras, createLights, createObjects
        super()

        this.showBecaon(this.beaconsOn)

        this.scene.onBeforeRenderObservable.add(() => {
            this.model.tick()

            const earthGroupPositionVector3 = this.earthGroup.getPosition(this.model)
            this.updateObjectPositions(earthGroupPositionVector3)
            this.updateCameras(earthGroupPositionVector3)
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
        this.cameras = new Cameras(this.scene, this.model)
        this.cameras.setActiveCamera(this.cameras.earthCamera, this.scene, this.canvas)
    }

    createLights() {
        const sunLight = new BABYLON.PointLight("sunLight", new BABYLON.Vector3(0, 0, 0), this.scene);
        sunLight.intensity = 1.0

        const intensity = 0.2
        const northHemispherLight = new BABYLON.HemisphericLight("north hemisphere light", new BABYLON.Vector3(0, 1, 0), this.scene);
        northHemispherLight.intensity = intensity
        const southHemispherLight = new BABYLON.HemisphericLight("south hemisphere light", new BABYLON.Vector3(0, -1, 0), this.scene);
        southHemispherLight.intensity = intensity
    }
    createObjects() {
        this.bodies = new Bodies2(this.scene)
        this.earthGroup = new EarthGroup(this.scene, this.model)
        this.createStarfield()

        this.zenithBeacon = this.createBeacon("zenith beacon", BABYLON.Color3.White())
        this.axisBeacon = this.createBeacon("axis beacon", BABYLON.Color3.Red())
        this.horizonBeacon = this.createBeacon("horizon beacon", BABYLON.Color3.Green())
    }
    createStarfield() {
        const diameter = 100 //this.model.universeRadius
        let starfield = BABYLON.MeshBuilder.CreateSphere("starfield", { diameter: diameter, sideOrientation: BABYLON.Mesh.BACKSIDE }, this.scene)
        starfield.rotate(new BABYLON.Vector3(1, 0, 0), Math.PI)
        // starfield.position = new BABYLON.Vector3(5, 5, 5)
        let material = new BABYLON.StandardMaterial('stars', this.scene)
        material.emissiveTexture = new BABYLON.Texture('assets/starfield.jpg', this.scene)
        material.diffuseColor = new BABYLON.Color3(0, 0, 0)
        material.specularColor = new BABYLON.Color3(0, 0, 0)
        starfield.material = material
        return starfield
    }
    createBeacon(name: string, color: BABYLON.Color3): BABYLON.LinesMesh {
        const mesh = BABYLON.MeshBuilder.CreateLines(name, { points: [BABYLON.Vector3.Zero(), new BABYLON.Vector3(0, 0, 10)], updatable: true }, this.scene)
        const material = new BABYLON.StandardMaterial("beacon material", this.scene)
        material.emissiveColor = color
        mesh.material = material;
        return mesh
    }
    // display a line from start to end
    private updateLineEndpoint(lineMesh: BABYLON.LinesMesh, newStart, newEnd) {
        const updatedPoints = [newStart, newEnd];
        const positions = [];
        updatedPoints.forEach(p => {
            positions.push(p.x, p.y, p.z);
        });
        lineMesh.geometry.updateVerticesData(BABYLON.VertexBuffer.PositionKind, positions);
        this.showBecaon(this.beaconsOn)
    }
    // probably don't need this
    private showBecaon(onoff: boolean) {
        this.zenithBeacon.isVisible = onoff
        this.axisBeacon.isVisible = onoff
        this.horizonBeacon.isVisible = onoff
    }
    updateObjectPositions(earthGroupPositionVector4: BABYLON.Vector3) {
        // adust earth, note that earth rotates ccw
        this.earthGroup.earthGroup.position = earthGroupPositionVector4
        this.earthGroup.earthGlobe.rotation.y = -this.model.siderealTimeRadians
    }
    updateCameras(earthGroupPositionVector4: BABYLON.Vector3) {
        const heightOfEarthCamera = this.model.earthCameraHeight //5

        // adust earth camera
        const upVector = new BABYLON.Vector3(0, 1, 0); // Default up vector in local space
        const worldMatrix = this.earthGroup.earthGlobe.getWorldMatrix();
        const worldUpVector = BABYLON.Vector3.TransformNormal(upVector, worldMatrix);


        const absoluteEarthGlobePosition = earthGroupPositionVector4 //this.earthGroup.earthGlobe.getAbsolutePosition()
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
        const surfaceCameraPosition = earthGroupPositionVector4.add(positionOffset)

        const pk = this.earthGroup.earthGlobe.position
        this.cameras.trackSurfaceamera(earthGroupPositionVector4, positionOffset, normalVector, earthCameraOffset)


        this.updateLineEndpoint(this.axisBeacon, absoluteEarthGlobePosition, absoluteEarthGlobePosition.add(be))
        this.updateLineEndpoint(this.horizonBeacon, surfaceCameraPosition, normalVector)
    }
}

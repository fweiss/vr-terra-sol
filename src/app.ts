import * as BABYLON from 'babylonjs'

import AppBase from './app-base'
import Cameras from './cameras'
import Controls from './controls'
import Model from './model2'
import Bodies2 from './bodies2'
import EarthGroup from './earth-group'
import ViewModel from './view-model'

export default class App extends AppBase {
    private cameras: Cameras
    private controls: Controls
    private viewModel: ViewModel

    private model: Model
    private earthGroup: EarthGroup

    private zenithBeacon: BABYLON.LinesMesh
    private axisBeacon: BABYLON.LinesMesh
    private horizonBeacon: BABYLON.LinesMesh

    private sunTrail: BABYLON.Mesh

    beaconsOn: boolean = true

    constructor() {
        // implicitly calls createModel, createCameras, createLights, createObjects
        super()

        this.viewModel = new ViewModel(this.model)

        this.showBecaon(this.beaconsOn)

        this.scene.onBeforeRenderObservable.add(() => {
            this.model.tick()
            // synchronize the view model with the model
            this.viewModel.update()
            
            this.updateObjectPositions()
            
            this.updateBeacons()
            this.updateSurfaceCamera()
            this.updateEarthCamera()
            this.updateSpaceCamera()
        })
        this.cameras.earthCamera.onViewMatrixChangedObservable.add((camera: BABYLON.ArcRotateCamera) => {
            // console.log('earth camera view matrix changed ', camera.position.toString())
        })

        this.controls = new Controls()
        this.controls.onCameraSelect = (camera: string) => {
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

        const intensity = 0.4
        const northHemispherLight = new BABYLON.HemisphericLight("north hemisphere light", new BABYLON.Vector3(0, 1, 0), this.scene);
        northHemispherLight.intensity = intensity
        const southHemispherLight = new BABYLON.HemisphericLight("south hemisphere light", new BABYLON.Vector3(0, -1, 0), this.scene);
        southHemispherLight.intensity = intensity
    }
    createObjects() {
        new Bodies2(this.scene)
        this.earthGroup = new EarthGroup(this.scene, this.model)
        this.createStarfield()

        this.zenithBeacon = this.createBeacon("zenith beacon", BABYLON.Color3.White())
        this.axisBeacon = this.createBeacon("axis beacon", BABYLON.Color3.Red())
        this.horizonBeacon = this.createBeacon("horizon beacon", BABYLON.Color3.Green())

        this.createSunTrail()
    }
    // At diameter < 1000 there are artifacts due to the earth's northVector
    // being off-center. The starfield is centered on the sun position
    // not the earth position. Maybe try making it a child of the earthGroup.
    createStarfield() {
        const diameter = 1000 //this.model.universeRadius
        let starfield = BABYLON.MeshBuilder.CreateSphere("starfield", { diameter: diameter, sideOrientation: BABYLON.Mesh.BACKSIDE }, this.scene)
        // starfield.rotate(new BABYLON.Vector3(1, 0, 0), Math.PI)
        starfield.rotate(new BABYLON.Vector3(1, 0, 0), this.model.axisTiltRadians)
        // starfield.position = new BABYLON.Vector3(5, 5, 5)
        let material = new BABYLON.StandardMaterial('stars', this.scene)
        material.emissiveTexture = new BABYLON.Texture('assets/starfield.jpg', this.scene)
        material.diffuseColor = new BABYLON.Color3(0, 0, 0)
        material.specularColor = new BABYLON.Color3(0, 0, 0)
        starfield.material = material
        material.wireframe = true
        return starfield
    }
    private createSunTrail() {
        const options = {
            // the sun oddly is between *1 and *2
            diameter: 10, //this.model.earthOrbitRadius * 2,
            thickness: 0.01,
            tessellation: 64,
            sideOrientation: BABYLON.Mesh.DOUBLESIDE
        }
        this.sunTrail = BABYLON.MeshBuilder.CreateTorus("suntrail", options, this.scene)
        this.sunTrail.parent = this.earthGroup.earthGroup
        // this.sunTrail.rotation.x = -this.model.axisTiltRadians // compensate for earthGroup tilt

        const material = new BABYLON.StandardMaterial("suntrail material", this.scene)
        material.emissiveColor = new BABYLON.Color3(1, 1, 0)
        this.sunTrail.material = material
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
    updateObjectPositions() {
        this.earthGroup.earthGroup.position = this.viewModel.earthGroupPosition
        this.earthGroup.earthGlobe.rotation.y = this.viewModel.earthGlobeRotation
    }
    updateSurfaceCamera() {
        const offset: BABYLON.Vector3 = this.viewModel.zenith.normalize().scale(1.01)
        this.cameras.surfaceCamera.position = this.viewModel.earthGroupPosition.add(offset)
        this.cameras.surfaceCamera.upVector = this.viewModel.zenith
        this.cameras.surfaceCamera.target = this.viewModel.eastVector.scale(1000) // large for stbility
    }
    // used to check alignment of northVector and the pole of the starfield
    updateSurfaceCamera2() {
        const offset: BABYLON.Vector3 = this.viewModel.earthAxis.normalize().scale(1.01)
        this.cameras.surfaceCamera.position = this.viewModel.earthGroupPosition.add(offset)
        this.cameras.surfaceCamera.target = this.viewModel.earthAxis.scale(1000) // large for stbility
        // this.cameras.surfaceCamera.upVector = this.viewModel.eastVector
        this.cameras.surfaceCamera.upVector = new BABYLON.Vector3(0, 100, 0)
        const zz = BABYLON.Vector3.Cross(this.viewModel.eastVector, this.viewModel.earthAxis)
        // this.cameras.surfaceCamera.upVector = zz
    }
    updateEarthCamera() {
        const scaledZenith = this.viewModel.zenith.normalize().scale(this.model.earthCameraHeight)
        this.cameras.earthCamera.position = this.viewModel.earthGroupPosition.add(scaledZenith)
        this.cameras.earthCamera.setTarget(this.viewModel.earthGroupPosition)
        this.cameras.earthCamera.upVector = this.viewModel.northVector
    }
    updateSpaceCamera() {
        // space camera is fixed
    }
    updateBeacons() {
        const earthGposition = this.viewModel.earthGroupPosition
        const axisScaled = this.viewModel.earthAxis.normalize().scale(1000)
        this.updateLineEndpoint(this.axisBeacon, earthGposition, earthGposition.add(axisScaled))

        const zenithScaled = this.viewModel.zenith.normalize().scale(10)
        this.updateLineEndpoint(this.zenithBeacon, earthGposition, earthGposition.add(zenithScaled))

        const eastScaled = this.viewModel.eastVector.normalize().scale(10)
        const point  = this.viewModel.zenith.normalize().scale(this.model.earthRadius+0.01)
        this.updateLineEndpoint(this.horizonBeacon, earthGposition.add(point), earthGposition.add(eastScaled))

    }
}

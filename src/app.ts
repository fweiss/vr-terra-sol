import * as BABYLON from 'babylonjs'

import AppBase from './app-base'
import Cameras from './cameras'
import Controls from './controls'
import { Model, surfaceModel } from './model2'
import Bodies2 from './bodies2'
import EarthGroup from './earth-group'
import ViewModel from './view-model'
import Support from './support'
import ModelSwitch from './model-switch'

export default class App extends AppBase {
    private model: Model
    private viewModel: ViewModel

    private earthGroup: EarthGroup
    private cameras: Cameras
    private controls: Controls
    private bodies: Bodies2

    private modelSwitch: ModelSwitch

    private sunTrail: BABYLON.Mesh

    beaconsOn: boolean = true

    constructor() {
        // implicitly calls createModel, createCameras, createLights, createObjects
        super()
        this.modelSwitch = new ModelSwitch()

        // todo maybe create objects first, since cameras depend on them
        // this.showBecoan(this.beaconsOn)

        this.scene.onBeforeRenderObservable.add(() => {
            // synchronize the view model with the model
            // this.model.tick()
            this.viewModel.model.tick()
            this.viewModel.update()

            console.log(this.model == this.viewModel.model)
            
            this.updateObjectPositions()
            
            this.updateBeacons()
            this.updateEarthCamera()
            this.updateSpaceCamera()
            this.updateSunTrail()

            this.controls.updateFrameRate(this.engine.performanceMonitor.averageFPS)
        })
        this.cameras.earthCamera.onViewMatrixChangedObservable.add((camera: BABYLON.ArcRotateCamera) => {
            // console.log('earth camera view matrix changed ', camera.position.toString())
        })
        this.modelSwitch.modelSwitchObservable.add((model: Model) => {
            console.log('model switch observable', model)
            this.viewModel.eclipticSpherical.radius = model.earthOrbitRadius
            const scale = model.sunRadius
            this.bodies.sun.scaling.set(scale, scale, scale)
        })

        this.createControls()
        this.createDebug
    }
    // override base class skeletons

    createModel() { // override base class
        this.model = new Model()
        this.viewModel = new ViewModel(this.model)
    }
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
        this.bodies = new Bodies2(this.scene, this.viewModel.model)
        this.earthGroup = new EarthGroup(this.scene, this.model)
        this.earthGroup.positionHorizonNode(this.viewModel.zenithVectorZZ, this.model)

        // place the surface camera as child of earthglobe
        // and position it relatively
        const surfaceCamera = this.cameras.surfaceCamera
        surfaceCamera.parent = this.earthGroup.horizonNode
        surfaceCamera.position = new BABYLON.Vector3(0, 0.001, -0.01)
        surfaceCamera.upVector = new BABYLON.Vector3(0, 1, 0)
        surfaceCamera.target = new BABYLON.Vector3(0, -.05, 1)

        Support.createBeacons()
        this.createSunTrail()
    }
    // At diameter < 1000 there are artifacts due to the earth's northVector
    // being off-center. The starfield is centered on the sun position
    // not the earth position. Maybe try making it a child of the earthGroup.
    createStarfield() {
        const diameter = this.model.universeRadius
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
        this.sunTrail = Support.createTorus("suntrail", this.viewModel.sunTrailRadius, BABYLON.Color3.Yellow(), .2)
        this.sunTrail.parent = this.earthGroup.rotateNode
    }
    updateObjectPositions() {
        this.earthGroup.orbitPosition = this.viewModel.earthGroupPosition
        this.earthGroup.earthRotation = this.viewModel.earthGlobeRotation
    }
    updateEarthCamera() {
        this.cameras.earthCamera.target = this.viewModel.earthGroupPosition
        this.cameras.earthCamera.upVector = this.viewModel.northVector

        // set position last to avoid jerky motion
        const zenithScaled = this.viewModel.zenith.normalize().scale(this.model.earthCameraHeight)
        this.cameras.earthCamera.position = this.viewModel.earthGroupPosition.add(zenithScaled)
    }
    updateSpaceCamera() {
        // space camera is fixed
    }
    updateBeacons() {
        Support.updateBeacons(this.viewModel, this.model)
        // const earthGroupPosition = this.viewModel.earthGroupPosition
        // const axisScaled = this.viewModel.earthAxis.normalize().scale(1000)
        // Support.updateLineEndpoint(this.axisBeacon, earthGroupPosition, earthGroupPosition.add(axisScaled))

        // const zenithScaled = this.viewModel.zenith.normalize().scale(10)
        // Support.updateLineEndpoint(this.zenithBeacon, earthGroupPosition, earthGroupPosition.add(zenithScaled))

        // const eastScaled = this.viewModel.eastVector.normalize().scale(10)
        // const point  = this.viewModel.zenith.normalize().scale(this.model.earthRadius+0.01)
        // Support.updateLineEndpoint(this.horizonBeacon, earthGroupPosition.add(point), earthGroupPosition.add(point).add(eastScaled))

    }
    updateSunTrail() {
        const st = Math.cos(this.model.solarDateRadians)
        // earthRadius is 1, so why is the scale * 2?
        const sunTrailOffset = this.viewModel.earthAxis.normalize().scale(st * 2) 
        this.sunTrail.position = sunTrailOffset
    }
    createControls() {
        this.controls = new Controls()
        this.controls.onCameraSelect = (camera: string) => {
            const cameras = {
                earth: this.cameras.earthCamera,
                space: this.cameras.spaceCamera,
                surface: this.cameras.surfaceCamera,
            }
            const selectedCamera = cameras[camera] || this.cameras.earthCamera
            this.cameras.setActiveCamera(selectedCamera, this.scene, this.canvas)
            // this.showBecoan(camera != 'surface')
            this.modelSwitch.switch(camera)
    }
        this.model.onYearDateChange = (date: Date) => {
            this.controls.updateYearDate(date)
        }
    }
    createDebug() {
        // this.scene.debugLayer.show()  
        // new BABYLON.AxesViewer(this.scene, 2000)
    }
}

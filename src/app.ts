import * as BABYLON from 'babylonjs'

import AppBase from './app-base'
import Cameras from './cameras'
import Controls from './controls'
import Model from './model2'
import Bodies2 from './bodies2'
import EarthGroup from './earth-group'
import ViewModel from './view-model'

export default class App extends AppBase {
    private model: Model
    private viewModel: ViewModel

    private earthGroup: EarthGroup
    private cameras: Cameras
    private controls: Controls


    private zenithBeacon: BABYLON.LinesMesh
    private axisBeacon: BABYLON.LinesMesh
    private horizonBeacon: BABYLON.LinesMesh

    private sunTrail: BABYLON.Mesh

    beaconsOn: boolean = true

    constructor() {
        // implicitly calls createModel, createCameras, createLights, createObjects
        super()

        // todo maybe create objects first, since cameras depend on them
        // this.cameras.surfaceCamera.parent = this.earthGroup.rotateNode
        this.showBecoan(this.beaconsOn)

        this.scene.onBeforeRenderObservable.add(() => {
            // synchronize the view model with the model
            this.model.tick()
            this.viewModel.update()
            
            this.updateObjectPositions()
            
            this.updateBeacons()
            // this.updateSurfaceCamera()
            this.updateEarthCamera()
            this.updateSpaceCamera()
            this.updateSunTrail()

            this.controls.updateFrameRate(this.engine.performanceMonitor.averageFPS)
        })
        this.cameras.earthCamera.onViewMatrixChangedObservable.add((camera: BABYLON.ArcRotateCamera) => {
            // console.log('earth camera view matrix changed ', camera.position.toString())
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
        new Bodies2(this.scene)
        this.earthGroup = new EarthGroup(this.scene, this.model)

        const horizonNode = this.earthGroup.horizonNode
        const zenithVector = this.viewModel.zenithVectorZZ
        const normalVector = new BABYLON.Vector3(0, 1, 0)
        const rotationAxis = BABYLON.Vector3.Cross(zenithVector, normalVector)
        const rotationAngle = Math.acos(BABYLON.Vector3.Dot(normalVector, zenithVector))
        let quaternion = BABYLON.Quaternion.RotationAxis(rotationAxis, -rotationAngle)
        horizonNode.rotationQuaternion = quaternion
        horizonNode.position = zenithVector.scale(this.model.earthRadius)

        // place the surface camera as child of earthglobe
        // and position it relatively
        if (false) {
        const spherical: BABYLON.Spherical = new BABYLON.Spherical(1.01, Math.PI/2-this.model.latitudeRadians, -this.model.longitudeRadians)
        // this.cameras.surfaceCamera.parent = this.earthGroup.earthGlobe
        this.cameras.surfaceCamera.parent = this.earthGroup.rotateNode

        const w = this.viewModel.westVector.scale(-0.04)
        this.cameras.surfaceCamera.position = this.viewModel.zenithVector.normalize().scale(1.005).add(w)
        // this.cameras.surfaceCamera.position = spherical.toVector3()
        
        this.cameras.surfaceCamera.upVector = this.viewModel.zenithVector
        // this.cameras.surfaceCamera.upVector = spherical.toVector3() //this.viewModel.zenith
        
        const e = this.viewModel.eastVector.scale(1000)
        this.cameras.surfaceCamera.target = this.viewModel.zenithVector.normalize().scale(1.01).add(e)
        // this.cameras.surfaceCamera.target = this.viewModel.eastVector.scale(1000) // large for stbility
        // this.cameras.surfaceCamera.target = new BABYLON.Vector3(1000, 0, 0)
        } else {
            const surfaceCamera = this.cameras.surfaceCamera
            surfaceCamera.parent = this.earthGroup.horizonNode
            surfaceCamera.position = new BABYLON.Vector3(-.05, .1, 0)
            surfaceCamera.upVector = new BABYLON.Vector3(0, 1, 0)
            surfaceCamera.target = new BABYLON.Vector3(1, 0, -.5)
        }
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
            diameter: this.viewModel.sunTrailRadius * 2,
            thickness: 0.1,
            tessellation: 64,
            sideOrientation: BABYLON.Mesh.DOUBLESIDE
        }
        this.sunTrail = BABYLON.MeshBuilder.CreateTorus("sun trail", options, this.scene)
        this.sunTrail.parent = this.earthGroup.rotateNode

        const material = new BABYLON.StandardMaterial("sun trail material", this.scene)
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
        this.showBecoan(this.beaconsOn)
    }
    // probably don't need this
    private showBecoan(onoff: boolean) {
        this.zenithBeacon.isVisible = onoff
        this.axisBeacon.isVisible = onoff
        this.horizonBeacon.isVisible = onoff
    }
    updateObjectPositions() {
        this.earthGroup.orbitPosition = this.viewModel.earthGroupPosition
        this.earthGroup.earthRotation = this.viewModel.earthGlobeRotation
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
    // backup camera to get wider field of view
    updateSurfaceCamera3() {
        const zenithOffset: BABYLON.Vector3 = this.viewModel.zenith.normalize().scale(1.01)
        const eastOffset: BABYLON.Vector3 = this.viewModel.eastVector.normalize().scale(-1.5)
        this.cameras.surfaceCamera.position = this.viewModel.earthGroupPosition.add(zenithOffset).add(eastOffset)
        this.cameras.surfaceCamera.upVector = this.viewModel.zenith
        this.cameras.surfaceCamera.target = this.viewModel.eastVector.scale(1000) // large for stbility
    }
    // gaze at the zenith
    updateSurfaceCamera4() {
        const zenithOffset: BABYLON.Vector3 = this.viewModel.zenith.normalize().scale(1.01)
        this.cameras.surfaceCamera.position = this.viewModel.earthGroupPosition.add(zenithOffset)
        this.cameras.surfaceCamera.upVector = this.viewModel.northVector
        this.cameras.surfaceCamera.target = this.viewModel.zenith.scale(1000) // large for stbility
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
        const earthGroupPosition = this.viewModel.earthGroupPosition
        const axisScaled = this.viewModel.earthAxis.normalize().scale(1000)
        this.updateLineEndpoint(this.axisBeacon, earthGroupPosition, earthGroupPosition.add(axisScaled))

        const zenithScaled = this.viewModel.zenith.normalize().scale(10)
        this.updateLineEndpoint(this.zenithBeacon, earthGroupPosition, earthGroupPosition.add(zenithScaled))

        const eastScaled = this.viewModel.eastVector.normalize().scale(10)
        const point  = this.viewModel.zenith.normalize().scale(this.model.earthRadius+0.01)
        this.updateLineEndpoint(this.horizonBeacon, earthGroupPosition.add(point), earthGroupPosition.add(point).add(eastScaled))

    }
    updateSunTrail() {
        // const st = Math.sin(this.model.axisTiltRadians) * Math.cos(this.model.solarDateRadians)
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
            this.showBecoan(camera != 'surface')
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

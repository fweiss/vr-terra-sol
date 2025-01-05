import * as BABYLON from 'babylonjs'
import { float } from 'babylonjs/types'

import AppBase from './app-base'
import Cameras from './cameras'
import Controls from './controls'
import Model from './model2'
import Bodies2 from './bodies2'

export default class App extends AppBase {
    private cameras: Cameras
    private controls: Controls

    private earthCamera: BABYLON.TargetCamera
    private spaceCamera: BABYLON.TargetCamera
    private earth: BABYLON.AbstractMesh
    private sun: BABYLON.Mesh
    private model: Model
    private bodies: Bodies2

    constructor() {
        // implicitly calls createCameras, createLights, createObjects
        super()

        this.model = new Model()

        this.scene.onBeforeRenderObservable.add(() => {
            this.model.tick()

            const millisPerTick = 1000
            const heightOfEarthCamera = 5

            // earth orbit in xy plane
            const rotationMatrix = BABYLON.Matrix.RotationX(Math.PI / 2);
            let phi = this.model.solarDateRadians
            let spherical = new BABYLON.Spherical(heightOfEarthCamera, -phi / millisPerTick, 0)
            const positionVector = BABYLON.Vector3.TransformCoordinates(spherical.toVector3(), rotationMatrix)

            // adust earth, note that earth rotates ccw
            this.earth.position = positionVector
            this.earth.rotation.y = -this.model.siderealTimeRadians
            
            // ajust earth camera
            const zenithSpherical = new BABYLON.Spherical(heightOfEarthCamera, Math.PI / 2, -this.earth.rotation.y)
            const earthCameraOffset = zenithSpherical.toVector3()
            this.cameras.earthCamera.setTarget(this.earth.position)
            this.cameras.earthCamera.position = this.earth.position.add(earthCameraOffset)
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
        this.earth = this.bodies.earth
    }
}

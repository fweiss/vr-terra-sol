import * as BABYLON from 'babylonjs'
import { float } from 'babylonjs/types'

import AppBase from './app-base'
import Cameras from './cameras'
import Controls from './controls'

export default class App extends AppBase {
    private cameras: Cameras
    private controls: Controls

    private earthCamera: BABYLON.TargetCamera
    private spaceCamera: BABYLON.TargetCamera
    private earth: BABYLON.Mesh
    private phi: float
    private sun: BABYLON.Mesh

    constructor() {
        // implicitly calls createCameras, createLights, createObjects
        super()

        this.createEarth(this.scene)
        let phi = Math.PI / 2

        this.createSun(this.scene)

        this.scene.onBeforeRenderObservable.add(() => {
            const phiDelta = Math.PI * 2 / (60 * 20)
            const heightOfEarthCamera = 5
            const earthSpherical = new BABYLON.Spherical(heightOfEarthCamera, phi, 0)

            // earth orbit in xy plane
            const rotationMatrix = BABYLON.Matrix.RotationX(Math.PI / 2);
            const positionVector = BABYLON.Vector3.TransformCoordinates(earthSpherical.toVector3(), rotationMatrix)

            const earthCameraOffset = new BABYLON.Vector3(2, 2, 2)

            // this.earth.position = earthSpherical.toVector3()
            this.earth.position = positionVector
            this.cameras.earthCamera.setTarget(this.earth.position)
            this.cameras.earthCamera.position = this.earth.position.add(earthCameraOffset)
        
            phi -= phiDelta // counter clockwise
            earthSpherical.phi = phi    
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

    // override base class skeleton
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

    private createEarth(scene: BABYLON.Scene) {
        let material = new BABYLON.StandardMaterial('earth_no_clouds', scene)
        let res = '8k'
        const url = 'assets/' + res + '/2_no_clouds_' + res + '.jpg'
        const noMipmapOrOptions = false
        const invertY = false // since default is oddly, true
        const texture: BABYLON.Texture = new BABYLON.Texture(url, scene, noMipmapOrOptions, invertY)
        texture.uScale = -1.0 // since texture wraps backwards
        const alignSphericalTexture = 0.25
        texture.uOffset = alignSphericalTexture
        material.diffuseTexture = texture
        material.specularColor = BABYLON.Color3.Black()

        // Create a sphere and apply the material
        this.earth = BABYLON.MeshBuilder.CreateSphere("earth", { diameter: 2 }, scene);
        this.earth.material = material;
        this.earth.position = new BABYLON.Vector3(5, 0, 0);

        let phi = Math.PI / 2
        const phiDelta = Math.PI * 2 / (60 * 20)
        const earthSpherical = new BABYLON.Spherical(5, phi, 0)
    }

    private createSun(scene: BABYLON.Scene) {
        // const solarRadiance = new BABYLON.StandardMaterial("solarRadiance", scene);
        // solarRadiance.emissiveColor = new BABYLON.Color3(1.0, 1.0, 0.0)

        const sunMaterial = new BABYLON.StandardMaterial("sunMaterial", scene)
        const sunTexture = new BABYLON.Texture("assets/2k/sun.jpg", scene)
        sunMaterial.emissiveTexture = sunTexture
        sunMaterial.specularColor = BABYLON.Color3.Black()

        this.sun = BABYLON.MeshBuilder.CreateSphere("sun", { diameter: 2 }, scene);
        this.sun.material = sunMaterial;
        this.sun.position = new BABYLON.Vector3(0, 0, 0);
    }
}

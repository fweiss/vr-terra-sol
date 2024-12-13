import * as BABYLON from 'babylonjs'
import { float } from 'babylonjs/types'

import AppBase from './app-base'

export default class App extends AppBase {
    private earthCamera: BABYLON.TargetCamera
    private spaceCamera: BABYLON.TargetCamera
    private earth: BABYLON.Mesh
    private phi: float
    private sun: BABYLON.Mesh

    constructor() {
        super()

        this.createCameras(this.scene)
        this.createSunlight(this.scene)
        this.createEarth(this.scene)
        let phi = Math.PI / 2

        this.createSun(this.scene)

        this.scene.onBeforeRenderObservable.add(() => {
            const phiDelta = Math.PI * 2 / (60 * 20)
            const heightOfEarthCamera = 5
            const earthSpherical = new BABYLON.Spherical(heightOfEarthCamera, phi, 0)
            const earthCameraOffset = new BABYLON.Vector3(2, 2, 2)

            this.earth.position = earthSpherical.toVector3()
            this.earthCamera.setTarget(this.earth.position)
            this.earthCamera.position = this.earth.position.add(earthCameraOffset)
        
            phi += phiDelta
            earthSpherical.phi = phi    
        })
    }

    // overrie
    createCameras(scene: BABYLON.Scene) {
        const zenith = 50
        this.spaceCamera = new BABYLON.ArcRotateCamera("camera", Math.PI / 2, Math.PI / 2, zenith, BABYLON.Vector3.Zero(), scene);
        
        this.earthCamera = new BABYLON.ArcRotateCamera("earthCamera", Math.PI / 2, Math.PI / 2, zenith, BABYLON.Vector3.Zero(), scene);
        
        const activeCamera = this.earthCamera
        scene.activeCamera = activeCamera
        activeCamera.attachControl(this.canvas, true);
    }

    private createSunlight(scene: BABYLON.Scene) {      
        const sunLight = new BABYLON.PointLight("sunLight", new BABYLON.Vector3(0, 0, 0), scene);
    }

    private createEarth(scene: BABYLON.Scene) {
        const paleBlueMaterial = new BABYLON.StandardMaterial("paleBlueMaterial", scene);
        paleBlueMaterial.diffuseColor = new BABYLON.Color3(0.68, 0.85, 0.9); // Pale blue color
        paleBlueMaterial.specularColor = BABYLON.Color3.Black()

        // Create a sphere and apply the material
        this.earth = BABYLON.MeshBuilder.CreateSphere("earth", { diameter: 2 }, scene);
        this.earth.material = paleBlueMaterial;
        this.earth.position = new BABYLON.Vector3(5, 0, 0);

        let phi = Math.PI / 2
        const phiDelta = Math.PI * 2 / (60 * 20)
        const earthSpherical = new BABYLON.Spherical(5, phi, 0)
    }

    private createSun(scene: BABYLON.Scene) {
        const solarRadiance = new BABYLON.StandardMaterial("solarRadiance", scene);
        solarRadiance.emissiveColor = new BABYLON.Color3(1.0, 1.0, 0.0)

        // Create a sphere and apply the material
        this.sun = BABYLON.MeshBuilder.CreateSphere("sun", { diameter: 2 }, scene);
        this.sun.material = solarRadiance;
        this.sun.position = new BABYLON.Vector3(0, 0, 0);
    }
}

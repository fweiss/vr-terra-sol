import * as BABYLON from 'babylonjs'
import { Model } from './model2'

export default class Bodies2 {
    scene: BABYLON.Scene
    earth: BABYLON.AbstractMesh
    sun: BABYLON.Mesh

    constructor(scene: BABYLON.Scene, model: Model) {
        this.scene = scene

        this.createSun(scene, model)
    }

    private createSun(scene: BABYLON.Scene, model: Model) {
        const sunMaterial = new BABYLON.StandardMaterial("sunMaterial", scene)
        const sunTexture = new BABYLON.Texture("assets/2k/sun.jpg", scene)
        sunMaterial.emissiveTexture = sunTexture
        sunMaterial.specularColor = BABYLON.Color3.Black()

        const scale = model.sunRadius
        this.sun = BABYLON.MeshBuilder.CreateSphere("sun", { diameter: 1 }, scene);
        this.sun.scaling = new BABYLON.Vector3(scale, scale, scale)
        this.sun.material = sunMaterial;
        this.sun.position = new BABYLON.Vector3(0, 0, 0);
    }
}
import * as BABYLON from 'babylonjs'

export default class Bodies2 {
    scene: BABYLON.Scene
    earth: BABYLON.AbstractMesh
    sun: BABYLON.Mesh

    constructor(scene: BABYLON.Scene) {
        this.scene = scene

        this.createSun(scene)
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
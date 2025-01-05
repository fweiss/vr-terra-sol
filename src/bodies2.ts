import * as BABYLON from 'babylonjs'

export default class Bodies2 {
    scene: BABYLON.Scene
    earth: BABYLON.Mesh
    sun: BABYLON.Mesh

    constructor(scene: BABYLON.Scene) {
        this.scene = scene

        this.createSun(scene)
        this.createEarth(scene)
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
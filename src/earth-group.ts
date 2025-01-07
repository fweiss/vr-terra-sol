import * as BABYLON from 'babylonjs'

export default class EarthGroup {
    private scene: BABYLON.Scene
    earthGroup: BABYLON.TransformNode
    earthGlobe: BABYLON.Mesh

    constructor(scene: BABYLON.Scene) {
        this.scene = scene
        this.earthGroup = new BABYLON.TransformNode('earthGroup', scene)
        this.createEarthGlobe()
        this.earthGlobe.parent = this.earthGroup

        this.earthGroup.position = new BABYLON.Vector3(-5, 0, 0)
    }
    private createEarthGlobe() {
        let material = new BABYLON.StandardMaterial('earth_no_clouds', this.scene)
        let res = '8k'
        const url = 'assets/' + res + '/2_no_clouds_' + res + '.jpg'
        const noMipmapOrOptions = false
        const invertY = false // since default is oddly, true
        const texture: BABYLON.Texture = new BABYLON.Texture(url, this.scene, noMipmapOrOptions, invertY)
        texture.uScale = -1.0 // since texture wraps backwards
        const alignSphericalTexture = 0.25
        texture.uOffset = alignSphericalTexture
        material.diffuseTexture = texture
        material.specularColor = BABYLON.Color3.Black()

        // Create a sphere and apply the material
        this.earthGlobe = BABYLON.MeshBuilder.CreateSphere("earth globe", { diameter: 2 }, this.scene);
        this.earthGlobe.material = material;
    }
}

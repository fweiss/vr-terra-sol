import * as BABYLON from 'babylonjs'
import Model from './model2'

export default class EarthGroup {
    private scene: BABYLON.Scene
    earthGroup: BABYLON.TransformNode
    earthGlobe: BABYLON.Mesh
    private model: Model
    earthZenithHeight: number = 5

    constructor(scene: BABYLON.Scene, model: Model) {   
        this.scene = scene
        this.earthGroup = new BABYLON.TransformNode('earthGroup', scene)
        this.createEarthGlobe()
        this.earthGlobe.parent = this.earthGroup
        this.earthGroup.rotation.x = model.axisTiltRadians

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
        const alignSphericalTexture = 0.5
        texture.uOffset = alignSphericalTexture
        material.diffuseTexture = texture
        material.specularColor = BABYLON.Color3.Black()
        // material.wireframe = true

        // Create a sphere and apply the material
        this.earthGlobe = BABYLON.MeshBuilder.CreateSphere("earth globe", { diameter: 2 }, this.scene);
        this.earthGlobe.material = material;
    }
    getAbsoluteEarthZenithVector(model: Model): BABYLON.Vector3 {
        const theta = Math.PI / 2 - model.latitudeRadians
        const phi = model.siderealTimeRadians + model.longitudeRadians
        const zenithSpherical = new BABYLON.Spherical(model.earthCameraHeight, theta, phi)
        const zenithOffset = zenithSpherical.toVector3()
        const worldMatrix = this.earthGroup.getWorldMatrix();
        return BABYLON.Vector3.TransformNormal(zenithOffset, worldMatrix);
    }

}

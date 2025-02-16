import * as BABYLON from 'babylonjs'
import Model from './model2'

/**
 * EarthGroup is a group of objects that represent the Earth.
 * The container is a TransformNode that can be moved and rotated,
 * but is not renderef.
 * The EarthGlobe is a Sphere Mesh that has a texture of the Earth.
 * 
 * The earthGroup is rotated to the correct tilt of the Earth
 * and is animated to orbit the sun, tracling the solar date.
 * 
 * The earthGlobe is rotated on its axis, tracking the sidereal time.
 */
export default class EarthGroup {
    private scene: BABYLON.Scene
    earthGroup: BABYLON.TransformNode
    earthTilt: BABYLON.TransformNode
    earthGlobe: BABYLON.Mesh
    equatorTrace: BABYLON.Mesh
    private model: Model
    earthZenithHeight: number = 5

    constructor(scene: BABYLON.Scene, model: Model) {   
        this.scene = scene

        this.earthGroup = new BABYLON.TransformNode('earthGroup', scene)
        this.earthTilt = new BABYLON.TransformNode('earth tilt', scene)
        this.earthTilt.parent = this.earthGroup
        this.earthTilt.rotation.x = model.axisTiltRadians

        this.createEarthGlobe()
        this.earthGlobe.parent = this.earthTilt

        this.earthGroup.position = new BABYLON.Vector3(-5, 0, 0)

        this.createEquatorTrace(model)
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
        this.earthGlobe = BABYLON.MeshBuilder.CreateSphere("earth globe", { diameter: 2 });
        this.earthGlobe.material = material;
    }
    createEquatorTrace(model: Model) {
        this.equatorTrace = BABYLON.MeshBuilder.CreateTorus("equator trace", {
            diameter: model.earthRadius * 2 + .001,
            thickness: 0.01,
            tessellation: 64,
            sideOrientation: BABYLON.Mesh.DOUBLESIDE
        })
        this.equatorTrace.parent = this.earthTilt
        const material = new BABYLON.StandardMaterial("equator trace material")
        material.emissiveColor = new BABYLON.Color3(1, 1, 0)
        this.equatorTrace.material = material
    }
}

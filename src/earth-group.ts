import * as BABYLON from 'babylonjs'
import Model from './model2'

/**
 * EarthGroup is a group of objects that represent the Earth.
 * The container is a TransformNode that can be moved and rotated,
 * but is not rendered.
 * The EarthGlobe is a Sphere Mesh that has a texture of the Earth.
 * 
 * The earthGroup is rotated to the correct tilt of the Earth
 * and is animated to orbit the sun, tracling the solar date.
 * 
 * The earthGlobe is rotated on its axis, tracking the sidereal time.
 */
export default class EarthGroup {
    private scene: BABYLON.Scene
    private earthGroup: BABYLON.TransformNode
    private earthTilt: BABYLON.TransformNode
    earthGlobe: BABYLON.Mesh
    equatorTrace: BABYLON.Mesh
    private model: Model
    earthZenithHeight: number = 5

    orbitNode: BABYLON.TransformNode
    tiltNode: BABYLON.TransformNode
    rotateNode: BABYLON.TransformNode
    horizonNode: BABYLON.TransformNode

    constructor(scene: BABYLON.Scene, model: Model) {   
        this.scene = scene

        this.earthGroup = new BABYLON.TransformNode('earthGroup', scene)
        this.earthTilt = new BABYLON.TransformNode('earth tilt', scene)
        this.earthTilt.parent = this.earthGroup
        this.earthTilt.rotation.x = model.axisTiltRadians

        // create the nested transform nodes
        this.orbitNode = new BABYLON.TransformNode('orbit node', scene)
        this.tiltNode = new BABYLON.TransformNode('tilt node', scene)
        this.rotateNode = new BABYLON.TransformNode('rotate node', scene)

        this.tiltNode.parent = this.orbitNode
        this.rotateNode.parent = this.tiltNode
        
        this.tiltNode.rotation.x = model.axisTiltRadians
        this.rotateNode.rotation.y = model.longitudeRadians
        
        this.createEarthGlobe(model)
        this.earthGlobe.parent = this.rotateNode
        // this.earthGlobe.parent = this.earthTilt
        // this.earthGlobe.rotation.y = model.longitudeRadians

        this.earthGroup.position = new BABYLON.Vector3(-5, 0, 0)

        this.createEquatorTrace(model)
    }
    private createEarthGlobe(model: Model) {
        let material = new BABYLON.StandardMaterial('earth_no_clouds', this.scene)
        let res = '8k'
        const url = 'assets/' + res + '/2_no_clouds_' + res + '.jpg'
        const noMipmapOrOptions = false
        const invertY = false // since default is oddly, true
        const texture: BABYLON.Texture = new BABYLON.Texture(url, this.scene, noMipmapOrOptions, invertY)
        texture.uScale = -1.0 // since texture wraps backwards
        // TODO - where does this fudge factor come from?
        const alignSphericalTexture = 0.4798
        texture.uOffset = alignSphericalTexture
        material.diffuseTexture = texture
        material.specularColor = BABYLON.Color3.Black()
        // material.wireframe = true

        // Create a sphere and apply the material
        const diameter = 2 * model.earthRadius
        this.earthGlobe = BABYLON.MeshBuilder.CreateSphere("earth globe", { diameter: diameter });
        this.earthGlobe.material = material;
    }
    createEquatorTrace(model: Model) {
        this.equatorTrace = BABYLON.MeshBuilder.CreateTorus("equator trace", {
            diameter: model.earthRadius * 2 + .001,
            thickness: 0.01,
            tessellation: 64,
            sideOrientation: BABYLON.Mesh.DOUBLESIDE
        })
        // this.equatorTrace.parent = this.earthTilt
        const material = new BABYLON.StandardMaterial("equator trace material")
        this.equatorTrace.parent = this.tiltNode
        material.emissiveColor = new BABYLON.Color3(1, 1, 0)
        this.equatorTrace.material = material
    }
    set orbitPosition(position: BABYLON.Vector3) {
        this.orbitNode.position = position
        // this.earthGroup.position = position
    }
    set earthRotation(rotation: number) {
        // this.rotateNode.rotation.y = rotation
        this.earthGlobe.rotation.y = rotation
    }
}

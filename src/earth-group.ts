import * as BABYLON from 'babylonjs'
import { Model } from './model2'
import { createTorus } from './support'

/**
 * A set of nested TransformNodes to manage the orbit, tilt, and rotation of the earth.
 * - orbitNode: root node for the position of the earth in its orbit around the sun
 * - tiltNode: node for the tilt of the earth
 * - rotateNode: node for the rotation of the earth on its axis
 * - horizonNode: node for the horizon at the POI (latlng)
 * 
 * The rotateNode contains the earth globe and the equator trace.
 * 
 */
export default class EarthGroup {
    private earthGlobe: BABYLON.Mesh
    private equatorTrace: BABYLON.Mesh

    orbitNode: BABYLON.TransformNode
    tiltNode: BABYLON.TransformNode
    rotateNode: BABYLON.TransformNode
    horizonNode: BABYLON.TransformNode

    constructor(scene: BABYLON.Scene, model: Model) {   

        // create the nested transform nodes
        this.orbitNode = new BABYLON.TransformNode('orbit node', scene)
        this.tiltNode = new BABYLON.TransformNode('tilt node', scene)
        this.rotateNode = new BABYLON.TransformNode('rotate node')
        this.horizonNode = new BABYLON.TransformNode('horizon node', scene)

        this.tiltNode.parent = this.orbitNode
        this.rotateNode.parent = this.tiltNode
        this.horizonNode.parent = this.rotateNode
        
        this.tiltNode.rotation.x = model.axisTiltRadians
        // this.rotateNode.rotation.y = model.longitudeRadians
        
        this.createEarthGlobe(model, scene)
        this.earthGlobe.parent = this.rotateNode

        this.createEquatorTrace(model)
        this.createHorizonTrace(model)
        this.createBeacon("zenith", BABYLON.Color3.Red())
    }
    private createEarthGlobe(model: Model, scene: BABYLON.Scene) {
        let material = new BABYLON.StandardMaterial('earth_no_clouds')
        let res = '16k'
        const url = 'assets/' + res + '/2_no_clouds_' + res + '.jpg'
        const noMipmapOrOptions = false
        const invertY = false // since default is oddly, true
        const texture: BABYLON.Texture = new BABYLON.Texture(url, scene, noMipmapOrOptions, invertY)
        texture.uScale = -1.0 // since texture wraps backwards
        // since image has prime meridian in the center
        const alignSphericalTexture = 0.5
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
        const material = new BABYLON.StandardMaterial("equator trace material")
        this.equatorTrace.parent = this.tiltNode
        material.emissiveColor = new BABYLON.Color3(1, 1, 0)
        this.equatorTrace.material = material
    }
    set orbitPosition(position: BABYLON.Vector3) {
        this.orbitNode.position = position
    }
    set earthRotation(rotation: number) {
        this.rotateNode.rotation.y = rotation
    }
    createHorizonTrace(model: Model) {
        let torus: BABYLON.Mesh = createTorus("horizion trace", 2, BABYLON.Color3.Blue())
        torus.parent = this.horizonNode
    }
    createBeacon(name: string, color: BABYLON.Color3): BABYLON.LinesMesh {
        const points = [BABYLON.Vector3.Zero(), new BABYLON.Vector3(-2, 0, 0)] // xz plane
        const mesh = BABYLON.MeshBuilder.CreateLines(name, { points: points, updatable: true})
        const material = new BABYLON.StandardMaterial("beacon material")
        material.emissiveColor = color
        mesh.material = material;
        mesh.parent = this.horizonNode
        return mesh
    }
   positionHorizonNode(zenithVector: BABYLON.Vector3, model: Model) {
            const horizonNode = this.horizonNode
            const normalVector = new BABYLON.Vector3(0, 1, 0)
            const adjustQuaternion = BABYLON.Quaternion.RotationAxis(normalVector, -model.longitudeRadians)
            const rotationAxis = BABYLON.Vector3.Cross(zenithVector, normalVector)
            const rotationAngle = Math.acos(BABYLON.Vector3.Dot(normalVector, zenithVector))
            let quaternion = BABYLON.Quaternion.RotationAxis(rotationAxis, -rotationAngle)
            horizonNode.rotationQuaternion = quaternion.multiply(adjustQuaternion)
            horizonNode.position = zenithVector.scale(model.earthRadius)
   }
}

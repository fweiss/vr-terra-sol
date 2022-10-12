import * as BABYLON from 'babylonjs'
import { Vector2, Vector3 } from 'babylonjs'
import settings from './settings'

export default class Bodies {
    earth: BABYLON.Mesh

    constructor(scene: BABYLON.Scene) {
        let earth = BABYLON.MeshBuilder.CreateSphere("earth", { diameter: settings.earth.diameter, sideOrientation: BABYLON.Mesh.FRONTSIDE}, scene)
        this.earth = earth

        let material = new BABYLON.StandardMaterial('earth_no_clouds', scene)
    
        let res = [ '8k', '16k' ]
        const url = 'assets/' + res[0] + '/2_no_clouds_' + res[0] + '.jpg'
        const noMipmapOrOptions = false
        const invertY = false // since default is oddly, true
        const texture: BABYLON.Texture = new BABYLON.Texture(url, scene, noMipmapOrOptions, invertY)
        texture.uScale = -1.0 // since texture wraps backwards
        material.diffuseTexture = texture

        earth.material = material
    
        const starfield = createStarfield(scene)

        const sunDiameter = 695700
        const sunDistance = 149_600_000
        const x = 127_560
        const sun = BABYLON.CreateSphere('sun', { diameter: x, sideOrientation: BABYLON.Mesh.FRONTSIDE }, scene)
        sun.position = new BABYLON.Vector3(-x * 4, 0, 0)
        const myMaterial = new BABYLON.StandardMaterial("myMaterial", scene)
        myMaterial.emissiveColor = BABYLON.Color3.FromHexString('#f9d71c')
        sun.material = myMaterial
    
        // todo move to lights
        const sunlight = new BABYLON.DirectionalLight('sunlight', new BABYLON.Vector3(1, 0, 0), scene)
        sunlight.excludedMeshes =  [ starfield ]
        sunlight.intensity = 1
        sunlight.specular = new BABYLON.Color3()
    }
    setEarth(tod) {
        // because texture.uOffset doens't work
        const textureAdjust = Math.PI / 2
        const beta = (tod / 24) * Math.PI * 2 + textureAdjust
        this.earth.rotation = new BABYLON.Vector3(0, beta, 0)
    }
}

function createStarfield(scene) {
    const diameter = 1000000
    let starfield = BABYLON.MeshBuilder.CreateSphere("starfield-sphere", { diameter: 1000000, sideOrientation: BABYLON.Mesh.BACKSIDE }, scene)
    starfield.rotate(new BABYLON.Vector3(1, 0, 0), Math.PI)
    let material = new BABYLON.StandardMaterial('stars', scene)
    material.diffuseTexture = new BABYLON.Texture('assets/starfield.jpg', scene)
    starfield.material = material
    return starfield
}


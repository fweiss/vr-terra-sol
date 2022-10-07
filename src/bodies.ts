import * as BABYLON from 'babylonjs'
import { Vector2, Vector3 } from 'babylonjs'
import settings from './settings'

export default class Bodies {
    earth: BABYLON.Mesh

    constructor(scene: BABYLON.Scene) {
        let earth = BABYLON.MeshBuilder.CreateSphere("earth", { diameter: settings.earth.diameter, sideOrientation: BABYLON.Mesh.FRONTSIDE}, scene)
        // earth.up = new BABYLON.Vector3(0, 1, 0)
        this.earth = earth

        let material = new BABYLON.StandardMaterial('earth_no_clouds', scene)
        // material.diffuseColor = BABYLON.Color3.FromHexString('#cf9e51')
    
        let res = [ '8k', '16k' ]
        const url = 'assets/' + res[0] + '/2_no_clouds_' + res[0] + '.jpg'
        const noMipmapOrOptions = false
        const invertY = false // since default is oddly, true
        material.diffuseTexture = new BABYLON.Texture(url, scene, noMipmapOrOptions, invertY)
        material.diffuseTexture.uScale = -1.0 // since texture wraps backwards
        // material.diffuseTexture.vOffset = 1

        // since invertY above doesn't seem to work
        // earth.rotate(new BABYLON.Vector3(0, 0, 1), Math.PI)

        // since texture should center at long 0
        // earth.rotate(new BABYLON.Vector3(0, 1, 0), Math.PI / 2)
        earth.material = material
    
        const starfield = createStarfield(scene)
    
        const sunlight = new BABYLON.DirectionalLight('sunlight', new BABYLON.Vector3(1, 0, 0), scene)
        sunlight.excludedMeshes =  [ starfield ]
        sunlight.intensity = 1
        sunlight.specular = new BABYLON.Color3()
    }
    setEarth(tod) {
        const beta = (tod / 24) * Math.PI * 2
        this.earth.rotation = new BABYLON.Vector3(0, beta, 0)
    }
}

function createStarfield(scene) {
    let starfield = BABYLON.MeshBuilder.CreateSphere("starfield-sphere", { diameter: 1000000, sideOrientation: BABYLON.Mesh.BACKSIDE }, scene)
    starfield.rotate(new BABYLON.Vector3(1, 0, 0), Math.PI)
    let material = new BABYLON.StandardMaterial('stars', scene)
    material.diffuseTexture = new BABYLON.Texture('assets/starfield.jpg', scene)
    starfield.material = material
    return starfield
}


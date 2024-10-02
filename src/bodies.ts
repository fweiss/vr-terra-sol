import * as BABYLON from 'babylonjs'
import settings from './settings'

export default class Bodies {
    earth: BABYLON.Mesh
    starfield: BABYLON.Mesh

    constructor(scene: BABYLON.Scene, universe: BABYLON.AbstractMesh) {
        this.starfield = createStarfield(scene, universe)
        this.createSun(scene, universe)
        this.createSunTrail(scene, universe)
        this.createEarth(scene, universe)
     }
    setEarth(beta) {

        // because texture.uOffset doens't work
        const textureAdjust = Math.PI / 2
        // const beta = (tod / 24) * Math.PI * 2 + textureAdjust
        this.earth.rotation = new BABYLON.Vector3(0, beta + textureAdjust, 0)
    }
    private createEarth(scene: BABYLON.Scene, universe: BABYLON.AbstractMesh) {
        let earth = BABYLON.MeshBuilder.CreateSphere("earth", { diameter: settings.earth.diameter, sideOrientation: BABYLON.Mesh.FRONTSIDE}, scene)
        universe.addChild(earth)
        this.earth = earth

        let material = new BABYLON.StandardMaterial('earth_no_clouds', scene)
    
        let res = settings.earth.textureResolution
        const url = 'assets/' + res + '/2_no_clouds_' + res + '.jpg'
        const noMipmapOrOptions = false
        const invertY = false // since default is oddly, true
        const texture: BABYLON.Texture = new BABYLON.Texture(url, scene, noMipmapOrOptions, invertY)
        texture.uScale = -1.0 // since texture wraps backwards
        material.diffuseTexture = texture

        // since texture is centered at spherical phi = -90 degrees or one quarter turn
        const alignSphericalTexture = 0.25
        texture.uOffset = alignSphericalTexture

        earth.material = material
    }
    private createSun(scene: BABYLON.Scene, universe: BABYLON.AbstractMesh) {
        // dimensions in km
        // scaled down to make it visible, even though 1/2 degree of arc should scale
        // make the dimesions not-to-scale to emphasize the sun in the view
        const sunDiameter = 695_700 / 250
        const sunDistance = settings.sun.distance
        const sun = BABYLON.CreateSphere('sun', { diameter: sunDiameter, sideOrientation: BABYLON.Mesh.FRONTSIDE }, scene)
        sun.position = new BABYLON.Vector3(-sunDistance, 0, 0)
        const myMaterial = new BABYLON.StandardMaterial("myMaterial", scene)
        myMaterial.emissiveColor = BABYLON.Color3.FromHexString('#f9d71c')
        // myMaterial.emissiveColor = BABYLON.Color3.FromHexString('#ff2020') // make it stand out
        sun.material = myMaterial
        universe.addChild(sun)

    }
    private createSunTrail(scene: BABYLON.Scene, universe: BABYLON.AbstractMesh) {
        const options = {
            // the sun oddly is between *1 and *2
            diameter: settings.sun.distance * 2,
            thickness: 100,
            tessellation: 64,
            sideOrientation: BABYLON.Mesh.DOUBLESIDE
        }
        const torus = BABYLON.MeshBuilder.CreateTorus("suntrail", options, scene)
        universe.addChild(torus)
    }
}


function createStarfield(scene, universe: BABYLON.AbstractMesh) {
    const diameter = 1000000
    let starfield = BABYLON.MeshBuilder.CreateSphere("starfield", { diameter: 1000000, sideOrientation: BABYLON.Mesh.BACKSIDE }, scene)
    starfield.rotate(new BABYLON.Vector3(1, 0, 0), Math.PI)
    let material = new BABYLON.StandardMaterial('stars', scene)
    material.diffuseTexture = new BABYLON.Texture('assets/starfield.jpg', scene)
    starfield.material = material
    universe.addChild(starfield)
    return starfield
}


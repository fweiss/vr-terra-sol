import * as BABYLON from 'babylonjs'
import settings from './settings'

export default class Lights {
    scene: BABYLON.Scene
    
    constructor(scene: BABYLON.Scene) {
        this.scene = scene
        this.createAmbientLights()
        this.createSunLight()
    }
    createAmbientLights() {
        // use two oposing hemisphere lights to provide full ambient
        const intensity = .5
        let light = new BABYLON.HemisphericLight("hemilight_north", new BABYLON.Vector3(0, 100000, 0), this.scene)
        light.diffuse = new BABYLON.Color3(intensity, intensity, intensity)
        light.specular = new BABYLON.Color3(0, 0, 0);
    
        let light2 = new BABYLON.HemisphericLight("hemilight_south", new BABYLON.Vector3(0, -100000, 0), this.scene)
        light2.diffuse = new BABYLON.Color3(intensity, intensity, intensity)
        light2.specular = new BABYLON.Color3(0, 0, 0);
    }
    createSunLight() {
        const sunlight = new BABYLON.DirectionalLight('sunlight', new BABYLON.Vector3(1, 0, 0), this.scene)
        // sunlight.excludedMeshes =  [ starfield ]
        sunlight.intensity = 5
        sunlight.specular = new BABYLON.Color3()       
    }
}
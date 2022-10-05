import { Vector2 } from "babylonjs"

const settings = {
    earth: {
        diameter: 12756
    },
    starfield: {
        diameter: 12000000
    }
}

export default class Camera {
    constructor(scene) {
        const orbitHeight = ((settings.earth.diameter / 2) + 18000)
        const position = new BABYLON.Vector3(0, 0, orbitHeight)
        // const camera = new BABYLON.UniversalCamera("near_space", position, scene)

        // const camera = new BABYLON.FreeCamera('near_space', position, scene)
        // camera.target = new BABYLON.Vector3(0,0,0)

        // not sure why, but a 90 degree alphs and beta puts view on "normal" xyz
        const camera = new BABYLON.ArcRotateCamera('orbit', Math.PI / 2, Math.PI / 2, (settings.earth.diameter / 2) + 8000, new BABYLON.Vector3(), scene)

        // camera.checkCollisions = true
        camera.maxZ = 1000010
        camera.attachControl(true)      
    }
}
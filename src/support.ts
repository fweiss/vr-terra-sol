import * as BABYLON from 'babylonjs'

export function createTorus(name: string, radius: number, color: BABYLON.Color3, thickness: number = 0.01): BABYLON.Mesh {
    let torus = BABYLON.MeshBuilder.CreateTorus(name, {
        diameter: radius * 2 + .001,
        thickness: thickness,
        tessellation: 64,
        sideOrientation: BABYLON.Mesh.DOUBLESIDE
    })
    const material = new BABYLON.StandardMaterial(name + " material")
    material.emissiveColor = color
    // material.specularColor = BABYLON.Color3.Black()
    material.disableLighting = true
    torus.material = material
    return torus
}

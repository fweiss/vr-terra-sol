import * as BABYLON from 'babylonjs'
import { Model } from './model2'
import ViewModel from './view-model'

export default class Support {
    static zenithBeacon: BABYLON.LinesMesh
    static axisBeacon: BABYLON.LinesMesh
    static horizonBeacon: BABYLON.LinesMesh
    static northBeacon: BABYLON.LinesMesh

    static createTorus(name: string, radius: number, color: BABYLON.Color3, thickness: number = 0.01): BABYLON.Mesh {
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
    static createBeacon(name: string, color: BABYLON.Color3): BABYLON.LinesMesh {
        const mesh = BABYLON.MeshBuilder.CreateLines(name, { points: [BABYLON.Vector3.Zero(), new BABYLON.Vector3(0, 0, 10)], updatable: true })
        const material = new BABYLON.StandardMaterial("beacon material")
        material.emissiveColor = color
        mesh.material = material;
        return mesh
    }
    // display a line from start to end
    static updateLineEndpoint(lineMesh: BABYLON.LinesMesh, newStart, newEnd) {
        const updatedPoints = [newStart, newEnd];
        const positions = [];
        updatedPoints.forEach(p => {
            positions.push(p.x, p.y, p.z);
        });
        lineMesh.geometry.updateVerticesData(BABYLON.VertexBuffer.PositionKind, positions);
        // this.showBecoan(this.beaconsOn)
    }
    // probably don't need this
    static showBeacons(onoff: boolean) {
        this.zenithBeacon.isVisible = onoff
        this.axisBeacon.isVisible = onoff
        this.horizonBeacon.isVisible = onoff
        this.northBeacon.isVisible = onoff
    }
    static updateBeacons(viewModel: ViewModel, model: Model) {
        const earthGroupPosition = viewModel.earthGroupPosition
        const axisScaled = viewModel.earthAxis.normalize().scale(1000)
        Support.updateLineEndpoint(this.axisBeacon, earthGroupPosition, earthGroupPosition.add(axisScaled))

        const zenithScaled = viewModel.zenith.normalize().scale(10)
        Support.updateLineEndpoint(this.zenithBeacon, earthGroupPosition, earthGroupPosition.add(zenithScaled))

        const eastScaled = viewModel.eastVector.normalize().scale(10)
        const point  = viewModel.zenith.normalize().scale(model.earthRadius+0.01)
        Support.updateLineEndpoint(this.horizonBeacon, earthGroupPosition.add(point), earthGroupPosition.add(point).add(eastScaled))

        const northScaled = viewModel.northVector.normalize().scale(10)
    }
    static createBeacons() {
        Support.zenithBeacon = Support.createBeacon("zenith beacon", BABYLON.Color3.White())
        Support.axisBeacon = Support.createBeacon("axis beacon", BABYLON.Color3.Red())
        Support.horizonBeacon = Support.createBeacon("horizon beacon", BABYLON.Color3.Green())
        Support.northBeacon = Support.createBeacon("north beacon", BABYLON.Color3.Blue())
    }
}

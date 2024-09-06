import * as BABYLON from 'babylonjs'
import settings from './settings'
import Controls from './gui-controls';
import Cameras from './camera'
import Bodies from './bodies'
import Lights from './lights';

export default class App {
    // should be const or private, but BABYLONJS makes it global anyway
    scene: BABYLON.Scene
    
    constructor() {
        this.createRenderLoop()
        
        // put it all in a scalable mesh, trying to cope with crappy rendering of the sun at great distance
        const universe = new BABYLON.AbstractMesh('universe')
        const scaling = 0.001
        universe.scaling = new BABYLON.Vector3(scaling, scaling, scaling)
        
        const lights = new Lights(this.scene)
        const cameras = new Cameras(this.scene, universe)
        const bodies = new Bodies(this.scene, universe)
        const controls: Controls = new Controls()
        this.registerPanelEvents(controls, cameras, bodies, universe)

        bodies.setEarth(0)
        
        this.debugmodes()
                
        this.registerCameraEvents(cameras)
    }
    createRenderLoop() {
        const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement
        const engine = new BABYLON.Engine(canvas, true)

        const scene: BABYLON.Scene = new BABYLON.Scene(engine)
        engine.runRenderLoop(function () {
            scene.render()
        });
        window.addEventListener("resize", function () {
            engine.resize()
        });
        this.scene = scene
    }
    debugmodes() {
        if (settings.debug.inspector) {
            this.scene.debugLayer.show()
        }
        if (settings.debug.axesViewer) {
            new BABYLON.AxesViewer(this.scene, 2000)
        }    
    }
    registerPanelEvents(controls: Controls, camera: Cameras, bodies: Bodies, universe: BABYLON.AbstractMesh) {
        controls.target.addEventListener('camera', (event: CustomEvent) => {
            const cameraName = event.detail
            camera.switchCamera(cameraName, this.scene, universe)
        })
        controls.target.addEventListener('tod', (event: CustomEvent) => {
            bodies.setEarth(event.detail)
            camera.trackOrbitCamera(bodies.earth)
        })
    }
    registerCameraEvents(camera: Cameras) {
        camera.onCameraChangeObservable.add((hover: BABYLON.Spherical) => {
            // const latitude = camera.orbitSpherical.theta / Math.PI * 180 - 90
            // let longitude = camera.orbitSpherical.phi / Math.PI * 180
            const latitude = hover.theta / Math.PI * 180 - 90
            let longitude = hover.phi / Math.PI * 180
            if (longitude < 0 ) {
                longitude += 180
            } else {
                longitude -= 180
            }
            const altitude = hover.radius
        
            const latElem: HTMLInputElement = document.getElementById('lat') as HTMLInputElement
            latElem.value = latitude.toFixed(4).toString()
            const lonElem: HTMLInputElement = document.getElementById('lon') as HTMLInputElement
            lonElem.value = longitude.toFixed(4).toString()
            const altElem: HTMLInputElement = document.getElementById('alt') as HTMLInputElement
            altElem.value = altitude.toFixed(0).toString()
        })

    }
}

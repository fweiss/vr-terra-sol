import * as BABYLON from 'babylonjs'

// base class for BabylonJS applications
// is a template pattern for creating an empty scene
// and sequencing the creation of the basic scene elements
export default class AppBase {
    public canvas: HTMLCanvasElement
    public engine: BABYLON.Engine
    public scene: BABYLON.Scene

    constructor() {
        // sequence for creating the scene
        this.canvas = document.getElementById("renderCanvas") as unknown as HTMLCanvasElement
        this.engine = new BABYLON.Engine(this.canvas, true)
        this.scene = new BABYLON.Scene(this.engine)

        this.engine.runRenderLoop(() => {
            this.scene.render();
        });   
        window.addEventListener("resize", () => {
            this.engine.resize();
        });      

        // sequence for creeating the scene elements
        this.createModel()
        this.createCameras()
        this.createLights()
        this.createObjects()
    }

    // stub methods to be overridden in derived class
    createModel() {}
    // create dummy camera needed for empty scene
    createCameras() {
        const defaultCamera: BABYLON.Camera = new BABYLON.Camera("default camera", new BABYLON.Vector3(0, 0, 0), this.scene);
        defaultCamera.attachControl(this.canvas, true);
    }
    createLights() {}
    createObjects() {}
}

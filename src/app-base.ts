import * as BABYLON from 'babylonjs'

export default class AppBase {
    public canvas: HTMLCanvasElement
    public scene: BABYLON.Scene
    public engine: BABYLON.Engine

    constructor() {
        this.canvas = document.getElementById("renderCanvas") as unknown as HTMLCanvasElement
        this.engine = new BABYLON.Engine(this.canvas, true)
        this.scene = new BABYLON.Scene(this.engine)

        this.createCameras(this.scene)

        this.engine.runRenderLoop(() => {
            this.scene.render();
        });
    
        window.addEventListener("resize", () => {
            this.engine.resize();
        });      
    }

    // create dummy camera: override this method in a subclass
    createCameras(scene: BABYLON.Scene) {
        const defaultCamera: BABYLON.Camera = new BABYLON.Camera("default camera", new BABYLON.Vector3(0, 0, 0), scene);
        defaultCamera.attachControl(this.canvas, true);
    }
}

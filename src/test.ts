import * as BABYLON from 'babylonjs'

const createScene = function () {
    const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement
    const engine = new BABYLON.Engine(canvas, true)
    const scene: BABYLON.Scene = new BABYLON.Scene(engine)
    engine.runRenderLoop(function () {
        scene.render()
    });
    window.addEventListener("resize", function () {
        engine.resize()
    });
        
    const camera = new BABYLON.ArcRotateCamera("Camera", Math.PI / 2, Math.PI / 2, 2, BABYLON.Vector3.Zero(), scene);
    camera.attachControl(canvas, true);
    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(1, 1, 0), scene);

    const sphere = BABYLON.MeshBuilder.CreateSphere("sphere", {});

    return scene;

};
createScene();

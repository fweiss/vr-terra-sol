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
        
    const camera = new BABYLON.ArcRotateCamera("Camera", Math.PI / 2, Math.PI / 2, 2, new BABYLON.Vector3(0, 0, 0), scene);
    camera.attachControl(true);

    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(1, 0, 0), scene);
    light.specular = new BABYLON.Color3()
    light.lightmapMode = BABYLON.Light.LIGHTMAP_DEFAULT
    light.falloffType = BABYLON.Light.FALLOFF_DEFAULT     

    const sphere = BABYLON.MeshBuilder.CreateSphere("sphere", { diameter: 1 });

};
createScene();

import * as BABYLON from 'babylonjs'
import { Model } from './model2'

export default class ModelSwitch {
    private currentModel: Model | null = null;
    private defaultModel: Model = new Model();
    modelSwitchObservable: BABYLON.Observable<Model>

    constructor() {
        this.modelSwitchObservable = new BABYLON.Observable<Model>();
    }

    switch(modelName: string) {
        let model = this.models[modelName] || this.models['earth'];
        this.currentModel = model;
        this.modelSwitchObservable.notifyObservers(this.currentModel);
    }

    private models: { [key: string]: Model } = {
        'earth': new Model(),
        'surface': new Model({
            earthOrbitRadius: 20,
            sunRadius: 1, 
        }),
        'space': new Model({}),
    }
}

import * as BABYLON from 'babylonjs'

export default class Model {
    meridianTime: Date = new Date()
    onMeridianTimeObservable = new BABYLON.Observable<Date>()

    setMeridianTime(tod: Date) {
        this.meridianTime = tod
        this.onMeridianTimeObservable.notifyObservers(tod)
    }
}
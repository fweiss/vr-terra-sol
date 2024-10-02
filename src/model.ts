import * as BABYLON from 'babylonjs'

export default class Model {
    meridianTime: Date = new Date()
    zenith = {
        latitude: 0,
        longitude: 0,
    }

    onMeridianTimeObservable = new BABYLON.Observable<Date>()
    onZenithObservable = new BABYLON.Observable<{latitude: number, longitude: number}>()

    setMeridianTime(tod: Date) {
        this.meridianTime = tod
        this.onMeridianTimeObservable.notifyObservers(tod)
    }
    setZenith(lat: number, lng: number) {
        this.zenith.latitude = lat
        this.zenith.longitude = lng
        this.onZenithObservable.notifyObservers(this.zenith)
    }
}
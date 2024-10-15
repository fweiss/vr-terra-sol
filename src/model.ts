import * as BABYLON from 'babylonjs'

export default class Model {
    meridianTime: Date = new Date()
    zenith: BABYLON.Spherical

    onMeridianTimeObservable = new BABYLON.Observable<Date>()
    onZenithObservable = new BABYLON.Observable<BABYLON.Spherical>()

    constructor() {
        this.zenith = new BABYLON.Spherical(0, 0, 0)
    }
    setMeridianTime(tod: Date) {
        this.meridianTime = tod
        this.onMeridianTimeObservable.notifyObservers(tod)
    }
    // theta: 0 .. PI -> positive y axis .. negtive y axis
    // phi: PI .. -PI -> 0..180, -180..0
    setZenith(latitude: number, longitude: number, elevation: number) {
        this.zenith.radius = elevation
        this.zenith.theta = (90 - latitude) / 180 * Math.PI
        this.zenith.phi = (longitude > 0 ? longitude : 360 + longitude) / 180 * Math.PI
        this.onZenithObservable.notifyObservers(this.zenith)
    }
    setZenithCoordinates(latitude: number, longitude: number) {
        this.setZenith(latitude, longitude, this.zenith.radius)
    }
}
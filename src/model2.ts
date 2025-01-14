import * as BABYLON from 'babylonjs'

class Zenith {
    latitude: number = 37 + 46/60 + 39/3600
    longitude: number =  -122 - 24/60 - 59/3600
}
export default class model {
    // earth rotation angle where zero is when
    // the GMT meridian and the March equinox coincide
    siderealTime: Date = new Date()
    // solar time where zero is when the sun is at the meridian
    solarDate: Date = new Date()

    millisPerDay: number = 24 * 60 * 60 * 1000

    axialTilt: number = 23.5
    earthCameraHeight: number = 5

    siderealTimeDelta: number = 1000000
    solarDateDelta: number = 150 * this.millisPerDay

    zenith: Zenith = new Zenith()

    onYearDateChange: (date: Date) => void = () => {}

    tick() {
        this.siderealTime = new Date(this.siderealTime.getTime() + this.siderealTimeDelta)
        this.solarDate = new Date(this.solarDate.getTime() + this.solarDateDelta)
        this.onYearDateChange(this.solarDate)
    }
    get siderealTimeRadians() {
        return this.siderealTime.getTime() * Math.PI / 1000 / 60 / 60 / 24
    }
    get solarDateRadians() {
        return this.solarDate.getTime() / this.millisPerDay / 180 * Math.PI
    }
    get axisTiltRadians() {
        return this.axialTilt * Math.PI / 180
    }
    get latitudeRadians() {
        return this.zenith.latitude * Math.PI / 180
    }
    get longitudeRadians() {
        return this.zenith.longitude * Math.PI / 180
    }
}
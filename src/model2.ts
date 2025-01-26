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
    millisPeryear = 365 * this.millisPerDay

    axialTilt: number = 23.5
    earthCameraHeight: number = 5

    universeRadius: number = 1000000

    siderealTimeDelta: number = 1000000
    solarDateDelta: number = 1 * this.millisPerDay // 1 day per frame at 60 fps

    zenith: Zenith = new Zenith()

    onYearDateChange: (date: Date) => void = () => {}

    tick() {
        this.siderealTime = new Date(this.siderealTime.getTime() + this.siderealTimeDelta)
        this.solarDate = new Date(this.solarDate.getTime() + this.solarDateDelta)
        this.onYearDateChange(this.solarDate)
    }
    get siderealTimeRadians() {
        return this.siderealTime.getTime() * Math.PI / this.millisPerDay
    }
    // getTime in ms, there are 365 * miilisPerDay in a year, which is 2 * PI radians, 
    get solarDateRadians() {
        const fractionOfYear = (this.solarDate.getTime() % this.millisPeryear) / this.millisPeryear
        return fractionOfYear * 2 * Math.PI
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
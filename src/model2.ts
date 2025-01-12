import * as BABYLON from 'babylonjs'

export default class model {
    // earth rotation angle where zero is when
    // the GMT meridian and the March equinox coincide
    siderealTime: Date = new Date()
    // solar time where zero is when the sun is at the meridian
    solarDate: Date = new Date()

    millisPerDay: number = 24 * 60 * 60 * 1000

    axialTilt: number = 23.5
    private earthCameraHeight: number = 10

    siderealTimeDelta: number = 1000000
    solarDateDelta: number = 150 * this.millisPerDay

    tick() {
        this.siderealTime = new Date(this.siderealTime.getTime() + this.siderealTimeDelta)
        this.solarDate = new Date(this.solarDate.getTime() + this.solarDateDelta)
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
    get earthCameraSpherical(): BABYLON.Spherical {
        // return new BABYLON.Spherical(this.earthCameraHeight, -this.siderealTimeRadians, Math.PI / 2 - this.axialTilt)
        return new BABYLON.Spherical(this.earthCameraHeight, -this.siderealTimeRadians, Math.PI / 2)
    }
}
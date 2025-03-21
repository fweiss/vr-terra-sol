/**
 * This is a model of the universe. It is a simple model that is used to calculate the position of the sun in the sky.
 * It is intentionally not to scale to emphasize the relative motions of the earth and the sun.
 * It is agnostic WRT the rendering engine, it is up to the renderer to interpret the model and render it.
 * 
 * There are two time variables, siderealTime and solarDate.
 * - siderealTime is the time in the sidereal day, where zero is when the GMT meridian and the March equinox coincide.
 * - solarDate tracks to earth's position in its orbit around the sun, where zero is the March equinox.
 * 
 * There are helper functions to convert these times to radians.
 * 
 * Animation is done by calling the tick method, which advances the model by a small amount.
 * 
 * There is a callback onYearDateChange that is called when the solarDate changes.
 */
class Zenith {
    latitude: number = 37 + 46/60 + 39/3600
    longitude: number =  -122 - 24/60 - 59/3600
}
export default class model {
    siderealTime: Date = new Date()
    solarDate: Date = new Date()

    millisPerDay: number = 24 * 60 * 60 * 1000
    millisPerYear = 365 * this.millisPerDay

    axialTilt: number = 23.43602
    earthCameraHeight: number = 5
    earthOrbitRadius: number = 5
    earthRadius: number = 1

    universeRadius: number = 1000000 // still used?

    // siderealTimeDelta: number = 1000000
    // siderealTimeDelta: number = this.millisPerDay * 0.001157
    siderealTimeDelta: number = 1 * this.millisPerDay / 10 // 1 second per frame at 60 fps

    solarDateDelta: number = 1 * this.millisPerDay // 1 day per frame at 60 fps

    zenith: Zenith = new Zenith()

    onYearDateChange: (date: Date) => void = () => {}

    tick() {
        const vernalEquinox = new Date("2020-03-20T03:50:00Z") // copilot
        // const vernalEquinox = new Date("2020-03-20T06:00:00Z") // empirical

        this.siderealTime = new Date(this.siderealTime.getTime() + this.siderealTimeDelta)
        this.solarDate = new Date(this.solarDate.getTime() + this.solarDateDelta)
        // this.solarDate = vernalEquinox

        this.onYearDateChange(this.solarDate)
    }
    get siderealTimeRadians() {
        return this.siderealTime.getTime() * Math.PI / this.millisPerDay
    }
    // getTime in ms, there are 365 * miilisPerDay in a year, which is 2 * PI radians, 
    get solarDateRadians() {
        const fractionOfYear = (this.solarDate.getTime() % this.millisPerYear) / this.millisPerYear
        return fractionOfYear * 2 * Math.PI
    }
    get axisTiltRadians() {
        return this.axialTilt * Math.PI / 180
    }
    get latitudeRadians() {
        return this.zenith.latitude * Math.PI / 180
    }
    get longitudeRadians() {
        return -this.zenith.longitude * Math.PI / 180
    }
}
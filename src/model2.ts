export default class model {
    // earth rotation angle where zero is when
    // the GMT meridian and the March equinox coincide
    siderealTime: Date = new Date()
    // solar time where zero is when the sun is at the meridian
    solarTime: Date = new Date()
    axialTilt: number = 23.5

    tick() {
        // update the sidereal time
        this.siderealTime = new Date(this.siderealTime.getTime() + 100000)
        // update the solar time
        this.solarTime = new Date(this.solarTime.getTime() + 1000)
    }
    get siderealTimeRadians() {
        return this.siderealTime.getTime() * Math.PI / 1000 / 60 / 60 / 24
    }
}
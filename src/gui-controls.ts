import Model from './model'

export default class Controls {
    model = {
        camera: '',
        height: 100,
    }
    latitudeElem = document.getElementById('lat') as HTMLInputElement
    longitudeElem = document.getElementById('lon') as HTMLInputElement

    target: EventTarget = new EventTarget()

    constructor() {
        let self = this
        const target = this.target
        document.body.onload = (e) => {
            if (document.querySelector('input[name="camera"]')) {
              document.querySelectorAll('input[name="camera"]').forEach((elem) => {
                elem.addEventListener("change", function(event) {
                  // since Property 'value' does not exist on type 'EventTarget'
                  const result = (event.target as HTMLInputElement).value
                  self.model.camera = result
                  target.dispatchEvent(new CustomEvent('camera', { detail: self.model.camera }))
                });
              });
            }

            // document.getElementById('tod').addEventListener<'input'>('input', (event) => {
            //     const result = (event.target as HTMLInputElement).value
            //     const tod = 24 * parseFloat(result) / 100
            //     //   target.dispatchEvent(new CustomEvent('tod', { detail: self.model.tod }))
            //     const hours = Math.floor(tod)
            //     const minutes = Math.floor((tod - hours) * 60)
            //     model.setMeridianTime(new Date(0, 0, 0, hours, minutes))
            // })
        }
    }
    todEvent(model: Model) {
        document.getElementById('tod').addEventListener<'input'>('input', (event) => {
            const result = (event.target as HTMLInputElement).value
            const tod = 24 * parseFloat(result) / 100
            const hours = Math.floor(tod)
            const minutes = Math.floor((tod - hours) * 60)
            model.setMeridianTime(new Date(0, 0, 0, hours, minutes))
        })
    }
    setMeridianTime(tod: Date) {
        const merdianTimeElem: HTMLInputElement = document.getElementById('tod_value') as HTMLInputElement
        // merdianTimeElem.value = (tod * 100 / 24).toFixed(2)
        merdianTimeElem.value = tod.getHours() + ":" + tod.getMinutes()
    }
    setZenith(latitude: number, longitude: number) {
        this.latitudeElem.value = latitude.toFixed(4).toString()
        this.longitudeElem.value = longitude.toFixed(4).toString()
    }
}
export default class Controls {
    model = {
        camera: '',
        height: 100,
        tod: 0,
    }
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

            document.getElementById('tod').addEventListener<'input'>('input', (event) => {
              const result = (event.target as HTMLInputElement).value
              this.model.tod = 24 * parseFloat(result) / 100
              target.dispatchEvent(new CustomEvent('tod', { detail: self.model.tod }))
          })
        }
    }
}
export default class Controls {
    model = {
        camera: '',
        height: 100
    }
    target: EventTarget = new EventTarget()

    constructor() {
        let self = this
        const target = this.target
        document.body.onload = (e) => {
            if (document.querySelector('input[name="camera"]')) {
                document.querySelectorAll('input[name="camera"]').forEach((elem) => {
                  elem.addEventListener("change", function(event) {
                    self.model.camera = event.target.value
                    target.dispatchEvent(new CustomEvent('camera', { detail: self.model.camera }))
                  });
                });
              }
        }
    }
}
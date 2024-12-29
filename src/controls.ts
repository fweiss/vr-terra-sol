export default class Controls {
    onCameraSelect: (camera: string) => void = () => {};

    constructor() {
        const self = this
        document.querySelectorAll('input[name="camera"]').forEach((elem) => {
            elem.addEventListener("change", function(event) {
                // since Property 'value' does not exist on type 'EventTarget'
                const result = (event.target as HTMLInputElement).value
                 self.onCameraSelect(result)
            });
        });
    }
}

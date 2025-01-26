export default class Controls {
    onCameraSelect: (camera: string) => void = () => {};
    yearDateValue: HTMLInputElement;
    yearSight: HTMLInputElement;

    constructor() {
        const self = this
        document.querySelectorAll('input[name="camera"]').forEach((elem) => {
            elem.addEventListener("change", function(event) {
                // since Property 'value' does not exist on type 'EventTarget'
                const result = (event.target as HTMLInputElement).value
                self.onCameraSelect(result)
            });
        });
        this.yearDateValue = document.getElementById("year_date_value") as HTMLInputElement;
    }
    updateYearDate(date: Date) {
        const formattedDate = date.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })
        this.yearDateValue.value = formattedDate

        const month = date.getFullYear()
        // this.yearDateValue.value = String(month)

    }
}

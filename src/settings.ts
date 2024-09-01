export default {
    earth: {
        diameter: 12756,
    },
    sun: {
        // following need to be scaled for best appearance
        rawDiameterMeters: 696.34 * 1_000_000,
        diameter: 695_700 / 250,
        rawDistanceMeters: 149_600 * 1_000_000_000,
        distance: 149_600_000 / 1000, // km / 1000
        emissiveColor: '#f9d71c',
    },
    starfield: {
        diameter: 12000000,
    },
    debug: {
        inspector: false,
        axesViewer: false,
    }
}

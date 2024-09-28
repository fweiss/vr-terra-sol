// length dimensions are in kilometers
export default {
    zenith: {
        latitude: 37 + 46/60 + 39/3600,
        longitude: -122 - 24/60 - 59/3600,
    },
    earth: {
        diameter: 12756,
        textureResolution: '8k', // e.g. assets/16k
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

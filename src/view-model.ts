import * as BABYLON from 'babylonjs'
import { Model, surfaceModel } from './model2'

// given the sidereal time and solar date, update the positions of the objects
// need to calculate:
// - earthGroup position - the position of the earth in its orbit
// - earthGlobe rotation - the rotation of the earth on its axis
// - zenith vector - the vector pointing to the zenith
// - axis vector - the vector pointing to the north pole
// - horizon vector - the vector pointing to the horizon

// helpful constructors
// orbitSpherical - aligned with earth's orbital axis, having phi corresponding to the solar date
// equatorSpherical - aligned with earth's equator, having the latitude and longitude of the zenith
// horizonSpherical - aligned with zenith vector at earth's surface

export default class ViewModel {
    model: Model
    eclipticSpherical: BABYLON.Spherical
    private equatorSpherical: BABYLON.Spherical
    private horizonSpherical: BABYLON.Spherical

    private earthTiltQuaternion: BABYLON.Quaternion

    constructor(model: Model) {
        this.model = model

        this.eclipticSpherical = new BABYLON.Spherical(this.model.earthOrbitRadius, Math.PI/2, 0)
        this.equatorSpherical = new BABYLON.Spherical(1, Math.PI / 2 - model.latitudeRadians, -model.longitudeRadians)
        this.horizonSpherical = new BABYLON.Spherical(1, 0, 0)

        this.earthTiltQuaternion = BABYLON.Quaternion.RotationAxis(BABYLON.Vector3.Right(), this.model.axisTiltRadians)
    }
    update() {
        this.eclipticSpherical.phi = this.model.solarDateRadians
        this.equatorSpherical.phi = this.model.siderealTimeRadians + this.model.longitudeRadians
    }
    get earthGroupPosition(): BABYLON.Vector3 {
        const rotationMatrix = BABYLON.Matrix.RotationY(Math.PI / 2);
        // this.eclipticSpherical.phi = this.model.solarDateRadians
        return BABYLON.Vector3.TransformCoordinates(this.eclipticSpherical.toVector3(), rotationMatrix)
    }
    get earthGlobeRotation(): number {
        // earth rotates ccw
        return -this.model.siderealTimeRadians
    }
    get zenithVector(): BABYLON.Vector3 {
        return this.equatorSpherical.toVector3()
    }
    // special one needed for hoizonNode
    get zenithVectorZZ(): BABYLON.Vector3 {
        const t = this.equatorSpherical.clone()
        t.phi = -t.phi
        return t.toVector3()
    }
    get zenith(): BABYLON.Vector3 {
        return this.equatorSpherical.toVector3().applyRotationQuaternion(this.earthTiltQuaternion)        
    }
    get eastVector(): BABYLON.Vector3 {
        return BABYLON.Vector3.Cross(this.zenith, this.earthAxis)
    }
    get westVector(): BABYLON.Vector3 {
        return BABYLON.Vector3.Cross(this.earthAxis, this.zenith)
    }
    get northVector(): BABYLON.Vector3 {
        return BABYLON.Vector3.Cross(this.eastVector, this.zenith)
    }
    get earthAxis(): BABYLON.Vector3 {
        return BABYLON.Vector3.Up().applyRotationQuaternion(this.earthTiltQuaternion)
    }
    get sunTrailRadius(): number {
        return 50
    }
}
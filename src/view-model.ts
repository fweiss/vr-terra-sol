import * as BABYLON from 'babylonjs'
import Model from './model2'
import EarthGroup from './earth-group'

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
    private model: Model
    private eclipticSpherical: BABYLON.Spherical
    private equatorSpherical: BABYLON.Spherical
    private horizonSpherical: BABYLON.Spherical

    constructor(model: Model, private earthGroup: EarthGroup) {
        this.model = model
        this.earthGroup = earthGroup

        this.eclipticSpherical = new BABYLON.Spherical(this.model.earthOrbitRadius, Math.PI/2, 0)
        this.equatorSpherical = new BABYLON.Spherical(1, Math.PI / 2 - model.latitudeRadians, 0)
        this.horizonSpherical = new BABYLON.Spherical(1, 0, 0)
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
    get xzenith(): BABYLON.Vector3 {
        this.equatorSpherical.theta = Math.PI / 2 - this.model.latitudeRadians
        this.equatorSpherical.phi = this.model.siderealTimeRadians + this.model.longitudeRadians
        const zenithVector = this.equatorSpherical.toVector3()
        const worldMatrix = this.earthGroup.earthGroup.getWorldMatrix();
        return this.earthGroupPosition.add(BABYLON.Vector3.TransformNormal(zenithVector, worldMatrix))
    }
    get zenith(): BABYLON.Vector3 {
        let tiltRotation = BABYLON.Quaternion.RotationAxis(BABYLON.Vector3.Right(), this.model.axisTiltRadians)
        return this.equatorSpherical.toVector3().applyRotationQuaternion(tiltRotation)        
    }
    get eastVector(): BABYLON.Vector3 {
        return BABYLON.Vector3.Cross(this.zenith, this.earthAxis)
    }
    get northVector(): BABYLON.Vector3 {
        return BABYLON.Vector3.Cross(this.eastVector, this.zenith)
    }
    get earthAxis(): BABYLON.Vector3 {
        let quaternion = BABYLON.Quaternion.RotationAxis(BABYLON.Vector3.Right(), this.model.axisTiltRadians)
        let axis = BABYLON.Vector3.Up().applyRotationQuaternion(quaternion)
        return axis
    }
}
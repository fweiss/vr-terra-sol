## gui-controls
### orbitCamera.onViewMatrixChangedObservable
- notify: either
- - (intrinsic, user action)
- -  orbitCamera.setPosition

> the set position when changing the meridian time
> the earth needs to be rotated, but the camera should
> rotate to maintain same zenith

- observe: via cameras.attachModel
- - model.setZenithCoordinates
- - model.setMeridianTime

again:
- [camera]onViewMatrixChangedObservable
- model.setZenith(noNotify)
- - model.setMeridianTime(noNotify)

### time of day (tod)
- change meridian time, but not zenith
- [gui]input#tod event listener
- model.setMeridianTime
- [app]onMeridianTimeObservable
- controls.setMeridianTime
- merdianTimeElem.value 
- [gui]onMeridianTimeObservable
- controls.timeOfDayElem.value = String(fraction * 100) (redundant in gui path)

- model.onMeridianTimeObservable.notifyObservers
- - 

## MVC
### TerraSolModel
- zenith position above the earth
- meridian time - aspect of the sun with the zenith

### SpaceView
- The 3D view of the earth, sun, stars.
- also contains the orbit camera
- emits event when the orbit camera is reoriented
- extension would be other cameras

### PanelView
- shows the camera selection, zenith, meridian time
- emits event when the camera selextrion is changed
- emits event when the meridian time is changed

## TerraSolController
- update PanelView(zenith, meridian time) when orbit camera is reoriented
- update SpaceView when meridian time is changed
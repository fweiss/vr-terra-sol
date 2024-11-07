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
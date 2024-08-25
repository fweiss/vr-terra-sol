# Domain Model
Show earth and sun spatial relationships
from several perspectives.

## Perspectives
### Orbit
- looking at the earth
- from a high orbit
- free to move around earth

### Surface
- from a fixed point above eearth surface
- free to pan/tilt

## Time
### Time of day
Rotate earth to show sun creating daylight

### Time of year
Vary the earth inclination with respect to sun.

## Universe
Contains:
- earth
- sun
- starfield

## Cameras
- orbit around earth
- surface from a particular spot above earth surface
- 

## Interactions
### Hover
- the point above the earth defining the POV
- a spherical
- equal to a latlng

### Orbit camera
- does not change the universe
- does not change target of the camera
- only changes position of the camera
- updates the hover lat long

### Surface camera
- synced with the current hover
- does not change the hover
- pan around the horizon
- tilt to see what's below
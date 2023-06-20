# Coordinates
Notes on the coordinate models use by BabylonJS

## Vector3
This is a fundamental 3-D cartesian coordinate, consisting of 3 floating point numbers, x, y, z.
- can represent a point in space relative to an origin
- can represent a vector (direction and magnitude), using cartesian coordinates
- can be normalized to a unit vector, |V| = 1
- is sometimes used as a 3-tuple, with specific interpretations

> In JavaScript a "floating point number" is designated as type "Number" and
> internally implemented as a double-precision, 64-bit floating point number.
> For most cases, this is equivalent to a pure mathematical "real" number,
> However, it is subject to inherent limitations of scale and precision.

## Rotation
This is the rotation of a Mesh relative to its parent Mesh or Scene.
It is represented as a Vector3, but as follows
- x: rotation around the x-azis
- y: rotation around the y-axis
- z: rotation around the z-axis

The local x, y, z axis are used and the rotation is given in radians.

> This can easily be mapped to pitch, yaw, and roll.

## Spherical
This provides a way of manipulating a point using spherical coordinates.
- radius: the distance from the (relative) origin
- theta: angle from the positive y-axis, range zero to pi
- phi: angle from the positive x-axis, counter-clockwise around the y-axis, range -pi to +pi

This can easily be mapped to latitude and longitude.

> Note the difference between the rotation and spherical models.
> Rotation models the orientation of a 3-D object, while a spherical models a 3-D point.

## Alpha-beta
These are properties of rotate cameras, such as ArcRotateCamera.

- alpha = phi (longitude, right-left)
- beta = theta (latitude, up-down)

> What is the similarity/difference from a Spherical?
import { Plane, Line3, Vector3 } from "three";
import { ConvexGeometry } from "three/examples/jsm/geometries/ConvexGeometry";
import { float } from "./random.util.js";

// From https://medium.com/@joshmarinacci/procedural-geometry-low-poly-clouds-b86a0e66bcad
export function chopBottom(geometry, bottom) {
    geometry.vertices.forEach(v => (v.y = Math.max(v.y, bottom)));
    return geometry;
}

// randomly displace the x,y,z coords by the `per` value
export const jitter = (geometry, displacement) => {
    geometry.vertices.forEach(v => {
        v.x += float(-displacement, displacement);
        v.y += float(-displacement, displacement);
        v.z += float(-displacement, displacement);
    });
    return geometry;
};

export function slice(geometry, normal, offset = 1) {
    let plane = new Plane(normal, offset);
    let intersects = Array.from(getIntersectionPoints(geometry, plane));
    let sliced = geometry.vertices.filter(
        vertex => plane.distanceToPoint(vertex) > 0
    );
    let points = [...sliced, ...intersects];
    // use convex hull geometry to reconstruct the mesh
    return new ConvexGeometry(points);
}

function getIntersectionPoints(geometry, plane) {
    let pointsOfIntersection = new Set();
    let a = new Vector3(),
        b = new Vector3(),
        c = new Vector3();

    geometry.faces.forEach(face => {
        a.copy(geometry.vertices[face.a]);
        b.copy(geometry.vertices[face.b]);
        c.copy(geometry.vertices[face.c]);
        let lines = [new Line3(a, b), new Line3(b, c), new Line3(c, a)];
        lines.forEach(line => {
            let point = new Vector3();
            if (plane.intersectsLine(line)) {
                point = plane.intersectLine(line, point);
                pointsOfIntersection.add(point.clone());
            }
        });
    });

    return pointsOfIntersection;
}

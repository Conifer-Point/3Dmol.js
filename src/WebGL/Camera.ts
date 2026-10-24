import type { Quaternion } from "./math";
import { Object3D } from "./core";
import { Matrix4, Vector3 } from "./math";
/*
 * Simplified Perspective Camera
 */

/* @constructor */
export class Camera extends Object3D {
  projectionMatrix = new Matrix4();
  projectionMatrixInverse = new Matrix4();
  matrixWorldInverse = new Matrix4();
  right: number;
  left: number;
  top: number;
  bottom: number;
  ortho: boolean;
  fov: number;
  aspect: number;
  near: number;
  far: number;
  z: number;
  // Shift of the projected image in normalized device coordinates (the canvas spans -1..1).
  // It moves the picture without moving the scene, so rotation still pivots about the view
  // center; only where that center is drawn changes.
  viewOffsetX = 0;
  viewOffsetY = 0;
  constructor(fov = 50, aspect = 1, near = 0.1, far = 2000, ortho = false) {
    super();

    this.fov = fov;
    this.aspect = aspect;
    this.near = near;
    this.far = far;

    var center = this.position.z;
    this.right = center * Math.tan((Math.PI / 180) * fov);
    this.left = -this.right;
    this.top = this.right / this.aspect;
    this.bottom = -this.top;

    this.ortho = !!ortho;

    this.updateProjectionMatrix();
  }

  lookAt(vector: Vector3) {
    //Why is the parameter order switched (compared to Object3D)?
    this.matrix.lookAt(this.position, vector, this.up);

    if (this.rotationAutoUpdate) {
      if (this.useQuaternion === false && this.rotation instanceof Vector3) {
        this.rotation.setEulerFromRotationMatrix(this.matrix, this.eulerOrder);
      } else {
        console.error("Unimplemented math operation.");
      }
    }
  }

  updateProjectionMatrix() {
    if (this.ortho) {
      this.projectionMatrix.makeOrthographic(
        this.left,
        this.right,
        this.top,
        this.bottom,
        this.near,
        this.far
      );
    } else {
      this.projectionMatrix.makePerspective(
        this.fov,
        this.aspect,
        this.near,
        this.far
      );
    }

    if (this.viewOffsetX || this.viewOffsetY) {
      // Translate in clip space: x' = x + viewOffsetX * w, so after the perspective divide every
      // point moves by viewOffsetX in NDC. Elements are column-major; row 3 holds w.
      const te = this.projectionMatrix.elements;
      for (let col = 0; col < 4; col++) {
        te[col * 4] += this.viewOffsetX * te[col * 4 + 3];
        te[col * 4 + 1] += this.viewOffsetY * te[col * 4 + 3];
      }
    }

    this.projectionMatrixInverse.getInverse(this.projectionMatrix);
  }
}

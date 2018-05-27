import { getEnv, types } from 'mobx-state-tree';
import * as THREE from 'three';
import { IColorsSnapShot, IColorsStore } from './Colors';

export const AirPlaneStore = types
  .model('AirPlane', {})
  .volatile((self) => {
    const mesh = new THREE.Object3D();

    const geomCockpit = new THREE.BoxGeometry(80, 50, 50, 1, 1, 1);
    geomCockpit.vertices[ 4 ].y -= 10;
    geomCockpit.vertices[ 4 ].z += 20;
    geomCockpit.vertices[ 5 ].y -= 10;
    geomCockpit.vertices[ 5 ].z -= 20;
    geomCockpit.vertices[ 6 ].y += 30;
    geomCockpit.vertices[ 6 ].z += 20;
    geomCockpit.vertices[ 7 ].y += 30;
    geomCockpit.vertices[ 7 ].z -= 20;
    const matCockpit = new THREE.MeshPhongMaterial({
      color: getEnv<{ $colors: IColorsStore }>(self).$colors.planeBody,
      flatShading: true
    });
    const cockpit = new THREE.Mesh(geomCockpit, matCockpit);
    cockpit.castShadow = true;
    cockpit.receiveShadow = true;
    mesh.add(cockpit);

    const geomEngine = new THREE.BoxGeometry(20, 50, 50, 1, 1, 1);
    const matEngine = new THREE.MeshPhongMaterial({
      color: getEnv<{ $colors: IColorsStore }>(self).$colors.planeEngine,
      flatShading: true
    });
    const engine = new THREE.Mesh(geomEngine, matEngine);
    engine.position.x = 40;
    engine.castShadow = true;
    engine.receiveShadow = true;
    mesh.add(engine);

    const geomTailPlane = new THREE.BoxGeometry(15, 20, 5, 1, 1, 1);
    const matTailPlane = new THREE.MeshPhongMaterial({
      color: getEnv<{ $colors: IColorsStore }>(self).$colors.planeBody,
      flatShading: true
    });
    const tailPlane = new THREE.Mesh(geomTailPlane, matTailPlane);
    tailPlane.position.set(-35, 25, 0);
    tailPlane.castShadow = true;
    tailPlane.receiveShadow = true;
    mesh.add(tailPlane);

    const geomSideWing = new THREE.BoxGeometry(40, 8, 150, 1, 1, 1);
    const matSideWing = new THREE.MeshPhongMaterial({
      color: getEnv<{ $colors: IColorsStore }>(self).$colors.planeBody,
      flatShading: true
    });
    const sideWing = new THREE.Mesh(geomSideWing, matSideWing);
    sideWing.castShadow = true;
    sideWing.receiveShadow = true;
    mesh.add(sideWing);

    const geomPropeller = new THREE.BoxGeometry(20, 10, 10, 1, 1, 1);
    const matPropeller = new THREE.MeshPhongMaterial({
      color: getEnv<{ $colors: IColorsStore }>(self).$colors.planePropeller,
      flatShading: true
    });
    const propeller = new THREE.Mesh(geomPropeller, matPropeller);
    propeller.castShadow = true;
    propeller.receiveShadow = true;

    const geomBlade = new THREE.BoxGeometry(1, 100, 20, 1, 1, 1);
    const matBlade = new THREE.MeshPhongMaterial({
      color: getEnv<{ $colors: IColorsStore }>(self).$colors.planeBlade,
      flatShading: true
    });
    const blade = new THREE.Mesh(geomBlade, matBlade);
    blade.position.set(8, 0, 0);
    blade.castShadow = true;
    blade.receiveShadow = true;
    propeller.add(blade);
    propeller.position.set(50, 0, 0);
    mesh.add(propeller);
    return {
      mesh,
      propeller,
      cockpit,
      engine,
      tailPlane,
      sideWing,
      blade
    };
  })
  .actions((self) => ({
    updateColors($colors: IColorsSnapShot) {
      if (!Array.isArray(self.cockpit.material)) {
        self.cockpit.material.setValues({
          color: $colors.planeBody
        } as any);
      }
      if (!Array.isArray(self.tailPlane.material)) {
        self.tailPlane.material.setValues({
          color: $colors.planeBody
        } as any);
      }
      if (!Array.isArray(self.sideWing.material)) {
        self.sideWing.material.setValues({
          color: $colors.planeBody
        } as any);
      }
      if (!Array.isArray(self.engine.material)) {
        self.engine.material.setValues({
          color: $colors.planeEngine
        } as any);
      }
      if (!Array.isArray(self.propeller.material)) {
        self.propeller.material.setValues({
          color: $colors.planePropeller
        } as any);
      }
      if (!Array.isArray(self.blade.material)) {
        self.blade.material.setValues({
          color: $colors.planeBlade
        } as any);
      }
    }
  }));

type AirPlaneType = typeof AirPlaneStore.Type;

export interface IAirPlaneStore extends AirPlaneType {
}

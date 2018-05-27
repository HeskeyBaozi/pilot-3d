import { getEnv, types } from 'mobx-state-tree';
import * as THREE from 'three';
import { IColorsStore } from './Colors';

export const SeaStore = types
  .model('Sea', {
    geometry: types.model('Geometry', {
      radiusTop: types.number,
      radiusBottom: types.number,
      height: types.number,
      radiusSegments: types.number,
      heightSegments: types.number
    }),
    waves: types.model('Waves', {
      baseAmp: types.number,
      deltaAmp: types.number,
      baseSpeed: types.number,
      deltaSpeed: types.number
    })
  })
  .volatile((self) => {
    const geom = new THREE.CylinderGeometry(
      self.geometry.radiusTop,
      self.geometry.radiusBottom,
      self.geometry.height,
      self.geometry.radiusSegments,
      self.geometry.heightSegments
    );
    geom.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
    geom.mergeVertices();
    const wavesConfig = geom.vertices.map((v) => ({
      x: v.x,
      y: v.y,
      z: v.z,
      angle: Math.random() * Math.PI * 2,
      amp: self.waves.baseAmp - self.waves.deltaAmp + 2 * Math.random() * self.waves.deltaAmp,
      speed: self.waves.baseSpeed - self.waves.deltaSpeed + 2 * Math.random() * self.waves.deltaSpeed
    }));

    const mat = new THREE.MeshPhongMaterial({
      color: getEnv<{ $colors: IColorsStore }>(self as any).$colors.sea,
      transparent: true,
      opacity: .8,
      flatShading: true
    });

    const mesh = new THREE.Mesh(geom, mat);
    mesh.receiveShadow = true;
    return {
      mesh, wavesConfig
    };
  })
  .actions((self) => ({
    moveWaves(seaRotationSpeed: number) {
      if (isGeom(self.mesh.geometry)) {
        self.mesh.geometry.vertices.forEach((v, i) => {
          const vProps = self.wavesConfig[ i ];
          v.x = vProps.x + Math.cos(vProps.angle) * vProps.amp;
          v.y = vProps.y + Math.sin(vProps.angle) * vProps.amp;
          vProps.angle += vProps.speed;
        });
        self.mesh.geometry.verticesNeedUpdate = true;
      }
      self.mesh.rotation.z += seaRotationSpeed;
    }
  }));

export function isGeom(geometry: any): geometry is THREE.Geometry {
  return Array.isArray(geometry.vertices);
}

type SeaStoreType = typeof SeaStore.Type;

export interface ISeaStore extends SeaStoreType {
}

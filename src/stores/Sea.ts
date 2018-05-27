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
    const mat = new THREE.MeshPhongMaterial({
      color: getEnv<{ $colors: IColorsStore }>(self as any).$colors.sea,
      transparent: true,
      opacity: .6,
      flatShading: true
    });

    const mesh = new THREE.Mesh(geom, mat);
    mesh.receiveShadow = true;
    return {
      mesh
    };
  });

type SeaStoreType = typeof SeaStore.Type;

export interface ISeaStore extends SeaStoreType {
}

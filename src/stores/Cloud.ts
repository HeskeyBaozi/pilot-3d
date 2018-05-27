import { getEnv, types } from 'mobx-state-tree';
import * as THREE from 'three';
import { IColorsStore } from './Colors';

export const CloudStore = types
  .model('Cloud', {
    geometry: types.model('Geometry', {
      size: types.number
    })
  })
  .volatile((self) => {
    const mesh = new THREE.Object3D();

    const geom = new THREE.BoxGeometry(
      self.geometry.size,
      self.geometry.size,
      self.geometry.size
    );

    const mat = new THREE.MeshPhongMaterial({
      color: getEnv<{ $colors: IColorsStore }>(self as any).$colors.cloud
    });

    const nBlocs = 3 + Math.floor(Math.random() * 3);
    for (let i = 0; i < nBlocs; i++) {
      const m = new THREE.Mesh(geom, mat);
      m.position.x = i * 15;
      m.position.y = Math.random() * 10;
      m.position.z = Math.random() * 10;
      m.rotation.z = Math.random() * Math.PI * 2;
      m.rotation.y = Math.random() * Math.PI * 2;

      const s = 0.1 + Math.random() * 0.9;
      m.scale.set(s, s, s);
      m.castShadow = true;
      m.receiveShadow = true;

      mesh.add(m);
    }
    return {
      mesh
    };
  });

type CloudStoreType = typeof CloudStore.Type;

export interface ICloudStore extends CloudStoreType {
}

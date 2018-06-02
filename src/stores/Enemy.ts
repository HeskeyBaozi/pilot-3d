import { getEnv, types } from 'mobx-state-tree';
import * as THREE from 'three';
import { IColorsStore } from './Colors';

export const EnemyStore = types
  .model('Enemy', {
    angle: 0,
    distance: 0,
    zOffset: 0
  })
  .volatile((self) => {
    const geom = new THREE.OctahedronGeometry(8, 1);
    const mat = new THREE.MeshPhongMaterial({
      color: getEnv<{ $colors: IColorsStore }>(self as any).$colors.enemy,
      shininess: 0,
      specular: '#ffffff',
      flatShading: true
    });

    const mesh = new THREE.Mesh(geom, mat);
    mesh.castShadow = true;
    return {
      mesh
    };
  })
  .actions((self) => ({
    setAngle(angle: number) {
      self.angle = angle;
    },
    setDistance(distance: number) {
      self.distance = distance;
    },
    setZOffset(zOffset: number) {
      self.zOffset = zOffset;
    }
  }));

export type EnemyStoreType = typeof EnemyStore.Type;

export const EnemiesHolder = types
  .model('EnemiesHolder', {})
  .volatile((self) => {
    const mesh = new THREE.Object3D();
    const enemiesInUse: EnemyStoreType[] = [];
    return {
      mesh, enemiesInUse
    };
  })
  .actions((self) => ({
    spawnEnemies(nEnemies: number, enemiesPool: EnemyStoreType[]) {
      for (let i = 0; i < nEnemies; i++) {
        const enemy: EnemyStoreType = enemiesPool.length
          ? enemiesPool.pop() as EnemyStoreType : EnemyStore.create({}, getEnv<{ $colors: IColorsStore }>(self));

        enemy.setAngle(-i * 0.1);
        enemy.setDistance(600 + Math.random() * 150 + 25);
        enemy.setZOffset(Math.random() * 4 - 2);
        enemy.mesh.position.y = -600 + Math.sin(enemy.angle) * enemy.distance;
        enemy.mesh.position.x = Math.cos(enemy.angle) * enemy.distance;

        self.mesh.add(enemy.mesh);
        self.enemiesInUse.push(enemy);
      }
    },
    takeOneAt(index: number) {
      return self.enemiesInUse.splice(index, 1)[ 0 ];
    }
  }));

export type EnemiesHolderType = typeof EnemiesHolder.Type;

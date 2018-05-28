import { types } from 'mobx-state-tree';

export const ColorsStore = types
  .model('Colors', {
    planeBody: types.string,
    planeEngine: types.string,
    planePropeller: types.string,
    planeBlade: types.string,
    pink: types.string,
    cloud: types.string,
    sea: types.string,
    backgroundTop: types.string,
    backgroundBottom: types.string,
    fog: types.string,
    enemy: types.string,
    coin: types.string
  })
  .views((self: { [key: string]: string }) => ({
    get list(): Array<{ name: string, value: string }> {
      return Object.keys(self).map((key) => {
        return {
          name: key,
          value: self[ key ]
        };
      });
    }
  }))
  .actions((self: { [key: string]: string }) => ({
    modifyColor(name: string, value: string) {
      self[ name ] = value;
    }
  }));

type ColorsStoreType = typeof ColorsStore.Type;

type ColorsSnapShotType = typeof ColorsStore.SnapshotType;

export interface IColorsStore extends ColorsStoreType {
}

export interface IColorsSnapShot extends ColorsSnapShotType {
}

import { types } from 'mobx-state-tree';

export const UIStore = types
  .model('UI', {
    isDebug: types.boolean
  })
  .actions((self) => ({
    toggleIsDebug() {
      self.isDebug = !self.isDebug;
    }
  }));

export type UIStoreType = typeof UIStore.Type;

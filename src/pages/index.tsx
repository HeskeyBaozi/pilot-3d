import { configure } from 'mobx';
import { observer, Provider } from 'mobx-react';
import React from 'react';
import Panel from '../components/Panel';
import PilotScene from '../components/Scene';
import UILayer from '../components/UILayer';
import { stores } from '../stores';

configure({
  enforceActions: true
});

@observer
export default class IndexPage extends React.Component<{}> {
  render() {
    return (
      <Provider { ...stores }>
        <div>
          <Panel/>
          <UILayer/>
          <PilotScene/>
        </div>
      </Provider>
    );
  }
}

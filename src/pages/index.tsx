import { configure } from 'mobx';
import { observer, Provider } from 'mobx-react';
import React from 'react';
import ReactResizeDetector from 'react-resize-detector';
import Panel from '../components/Panel';
import PilotScene from '../components/Scene';
import { stores } from '../stores';
import styles from './index.less';

configure({
  enforceActions: true
});

@observer
export default class IndexPage extends React.Component<{}> {

  containerRef = React.createRef<HTMLDivElement>();

  onResize = (width: number, height: number) => {
    console.log(width, height);
  }

  render() {
    return (
      <Provider { ...stores }>
        <div>
          <Panel/>
          <PilotScene/>
        </div>
      </Provider>
    );
  }
}

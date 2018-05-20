import { configure } from 'mobx';
import { observer } from 'mobx-react';
import React from 'react';
import ReactResizeDetector from 'react-resize-detector';
import Panel from '../components/Panel';
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
    return [ (
      <Panel key={ 'panel' }/>
    ), (
      <div key={ 'canvas-container' } className={ styles.container } ref={ this.containerRef }>
        Canvas Container
        <ReactResizeDetector
          key={ 'resize-detector' }
          handleWidth={ true }
          handleHeight={ true }
          onResize={ this.onResize }
          refreshMode={ 'throttle' }
          refreshRate={ 300 }
        />
      </div>
    ) ];
  }
}

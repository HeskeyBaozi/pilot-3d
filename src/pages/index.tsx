import { observer } from 'mobx-react';
import React from 'react';
import ReactResizeDetector from 'react-resize-detector';
import styles from './index.less';

@observer
export default class IndexPage extends React.Component<{}> {

  containerRef = React.createRef<HTMLDivElement>();

  onResize = (width: number, height: number) => {
    console.log(width, height);
  }

  render() {
    return [ (
      <div key={ 'panel' } className={ styles.panel }>
        Panel
      </div>
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

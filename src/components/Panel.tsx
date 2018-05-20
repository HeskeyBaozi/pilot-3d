import { Collapse, InputNumber } from 'antd';
import { action, computed, observable } from 'mobx';
import { observer } from 'mobx-react';
import React from 'react';
import styles from './Panel.less';

@observer
export default class Panel extends React.Component<{}> {

  @observable
  panelFixedStyle = {
    top: 20,
    left: 20
  };

  @computed
  get panelStyle() {
    return {
      ...this.panelFixedStyle,
      top: this.panelFixedStyle.top + 'px',
      left: this.panelFixedStyle.left + 'px'
    };
  }

  @action
  handlePanelTopChange = (top?: number | string) => {
    if (typeof top === 'number') {
      this.panelFixedStyle.top = top;
    }
  }

  @action
  handlePanelLeftChange = (left?: number | string) => {
    if (typeof left === 'number') {
      this.panelFixedStyle.left = left;
    }
  }

  render() {
    return (
      <div style={ this.panelStyle } key={ 'panel' } className={ styles.panel }>
        <Collapse>
          <Collapse.Panel key={ 'panel-position' } header={ 'Panel Position' }>
            <span style={ { marginRight: '1rem' } }>
              Top
              <InputNumber
                min={ 0 }
                max={ 1000 }
                size={ 'small' }
                step={ 20 }
                style={ { margin: '0 .3rem' } }
                value={ this.panelFixedStyle.top }
                onChange={ this.handlePanelTopChange }
              />px
            </span>
            <span>
              Left
              <InputNumber
                min={ 0 }
                size={ 'small' }
                max={ 1000 }
                step={ 20 }
                style={ { margin: '0 .3rem' } }
                value={ this.panelFixedStyle.left }
                onChange={ this.handlePanelLeftChange }
              />px
            </span>
          </Collapse.Panel>
        </Collapse>
      </div>
    );
  }
}

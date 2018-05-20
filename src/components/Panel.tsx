import { Collapse, InputNumber } from 'antd';
import { action, computed, observable } from 'mobx';
import { inject, observer } from 'mobx-react';
import React, { SyntheticEvent } from 'react';
import { IColorsStore } from '../stores/Colors';
import styles from './Panel.less';

interface IPanelProps {
  $colors?: IColorsStore;
}

@inject('$colors')
@observer
export default class Panel extends React.Component<IPanelProps> {

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

  handleChange = (e: SyntheticEvent<HTMLInputElement>) => {
    this.props.$colors!.modifyColor(e.currentTarget.name, e.currentTarget.value);
  }

  @computed
  get ColorsList() {
    return this.props.$colors!.list.map(({ name, value }) => {
      return (
        <div key={ name }>
          <input name={ name } type={ 'color' } value={ value } onChange={ this.handleChange }/>
          <span style={ { marginLeft: '.5rem' } }>{ name }</span>
        </div>
      );
    });
  }

  render() {
    return (
      <div style={ this.panelStyle } key={ 'panel' } className={ styles.panel }>
        <Collapse accordion={ true }>
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
          <Collapse.Panel key={ 'colors' } header={ 'Colors' }>
            { this.ColorsList }
          </Collapse.Panel>
        </Collapse>
      </div>
    );
  }
}

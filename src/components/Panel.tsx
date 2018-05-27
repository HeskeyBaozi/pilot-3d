import { Collapse, Input, InputNumber, Select } from 'antd';
import { action, computed, observable } from 'mobx';
import { inject, observer } from 'mobx-react';
import { applySnapshot } from 'mobx-state-tree';
import React, { SyntheticEvent } from 'react';
import { autumn, summer } from '../stores';
import { IColorsStore } from '../stores/Colors';
import { ISceneStore } from '../stores/Scene';
import styles from './Panel.less';

const Option = Select.Option;

interface IPanelProps {
  $colors?: IColorsStore;
  $scene?: ISceneStore;
}

@inject('$colors', '$scene')
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

  handleCameraPositionXChange = (val?: number | string) => {
    if (typeof val === 'number') {
      const { $scene } = this.props;
      $scene!.updateCameraPosition({
        x: val,
        y: $scene!.camera.position.y,
        z: $scene!.camera.position.z
      });
    }
  }

  handleCameraPositionYChange = (val?: number | string) => {
    if (typeof val === 'number') {
      const { $scene } = this.props;
      $scene!.updateCameraPosition({
        x: $scene!.camera.position.x,
        y: val,
        z: $scene!.camera.position.z
      });
    }
  }

  handleCameraPositionZChange = (val?: number | string) => {
    if (typeof val === 'number') {
      const { $scene } = this.props;
      $scene!.updateCameraPosition({
        x: $scene!.camera.position.x,
        y: $scene!.camera.position.y,
        z: val
      });
    }
  }

  handleChangeColorsConfig = (val: any, option: any) => {
    const { $colors } = this.props;
    switch (val) {
      case 'summer':
        applySnapshot($colors!, summer);
        break;
      case 'autumn':
        applySnapshot($colors!, autumn);
        break;
    }
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

  @computed
  get Scene() {
    const { $scene } = this.props;
    return (
      <div>
        <p>Camera</p>
        <div className={ styles.list }>
          <span>Position</span>
          <span>X</span>
          <InputNumber
            min={ -1000 }
            max={ 1000 }
            step={ 20 }
            value={ $scene!.camera.position.x }
            onChange={ this.handleCameraPositionXChange }
          />
          <span>Y</span>
          <InputNumber
            min={ -1000 }
            max={ 1000 }
            step={ 20 }
            value={ $scene!.camera.position.y }
            onChange={ this.handleCameraPositionYChange }
          />
          <span>Z</span>
          <InputNumber
            min={ -1000 }
            max={ 1000 }
            step={ 20 }
            value={ $scene!.camera.position.z }
            onChange={ this.handleCameraPositionZChange }
          />
        </div>
      </div>
    );
  }

  render() {
    const {} = this.props;
    return (
      <div style={ this.panelStyle } key={ 'panel' } className={ styles.panel }>
        <Collapse accordion={ true }>
          <Collapse.Panel key={ 'panel-position' } header={ 'Panel Position' }>
            <span style={ { marginRight: '1rem' } }>
              Top
              <InputNumber
                min={ 0 }
                max={ 1000 }
                step={ 20 }
                style={ { margin: '0 .3rem' } }
                value={ this.panelFixedStyle.top }
                onChange={ this.handlePanelTopChange }
              />
            </span>
            <span>
              Left
              <InputNumber
                min={ 0 }
                max={ 1000 }
                step={ 20 }
                style={ { margin: '0 .3rem' } }
                value={ this.panelFixedStyle.left }
                onChange={ this.handlePanelLeftChange }
              />
            </span>
          </Collapse.Panel>
          <Collapse.Panel key={ 'colors' } header={ 'Colors' }>
            <div className={ styles.colorsList }>
              { this.ColorsList }
            </div>
            <Select
              size={ 'small' }
              defaultValue='summer'
              style={ { marginTop: '1rem' } }
              onChange={ this.handleChangeColorsConfig }
            >
              <Option value='summer'>Summer</Option>
              <Option value='autumn'>Autumn</Option>
            </Select>
          </Collapse.Panel>
          <Collapse.Panel key={ 'scene' } header={ 'Scene' }>
            { this.Scene }
          </Collapse.Panel>
        </Collapse>
      </div>
    );
  }
}

import * as React from 'react';
import {Limits} from '../graph';
import {Constraint, Rectangle} from '../rectangle';
import {getRectangleBorderStyles} from '../utilities';
import {Orientation} from './home_page';

interface Properties {
  rectangleMatrix: Rectangle[][];
  orientation: Orientation;
  limits: Limits;
}

interface State {
  isWidthEnabled: boolean;
  isHeightEnabled: boolean;
  isBorderDisplayed: boolean;
  width: number;
  height: number;
}

/** The flex layout viewer component. */
export class FlexLayoutViewer extends React.Component<Properties, State> {
  constructor(props: Properties) {
    super(props);
    const {minimumWidth, minimumHeight, maximumWidth, maximumHeight} =
      this.props.limits;
    const width = minimumWidth === maximumWidth ? minimumWidth :
      minimumWidth * 1.2;
    const height = minimumHeight === maximumHeight ? minimumHeight :
      minimumHeight * 1.2;
    this.state = {
      isWidthEnabled: false,
      isHeightEnabled: false,
      isBorderDisplayed: true,
      width,
      height
    };
  }

  public render(): JSX.Element {
    const isRow = this.props.orientation === Orientation.ROW;
    const [flexContainerDirection, flexDirection, gap, dim] = (() => {
      const borderWidth = (this.state.isBorderDisplayed && '1px') || '0';
      if(isRow) {
        return ['column' as 'column', 'row' as 'row', `${borderWidth} 0`,
          {width: '100%'}];
      } else {
        return ['row' as 'row', 'column' as 'column', `0 ${borderWidth}`,
          {height: '100%'}];
      }
    })();
    const [widthLimit, heightLimit] = (() => {
      if(this.props.limits) {
        const {minimumWidth, minimumHeight, maximumWidth, maximumHeight} =
          this.props.limits;
        const width = `clamp(${minimumWidth}px, 100%, ${maximumWidth}px)`;
        const height = `clamp(${minimumHeight}px, 100%, ${maximumHeight}px)`;
        return [width, height];
      } else {
        return ['100%, 100%'];
      }
    })();
    const maxWidth = this.state.isWidthEnabled ? this.state.width : widthLimit;
    const maxHeight = this.state.isHeightEnabled ?
      this.state.height : heightLimit;
    return (
      <div style={FlexLayoutViewer.STYLE.wrapper}>
        <div style={{...FlexLayoutViewer.STYLE.container, maxWidth, maxHeight,
            flexDirection: flexContainerDirection, gap}}>
          {this.props.rectangleMatrix?.map((set, index) => {
            const isWidthFlexible = set.every(rect =>
              rect.horizontal === Constraint.FILL_SPACE);
            const isHeightFlexible = set.every(rect =>
              rect.vertical === Constraint.FILL_SPACE);
            const flex = (() => {
              if(isRow) {
                return (isHeightFlexible && '1 1 auto') || '0 0 auto';
              } else {
                return (isWidthFlexible && '1 1 auto') || '0 0 auto';
              }
            })();
            return (
              <div key={index}
                  style={{display: 'flex', flexDirection, flex, ...dim}}>
                {set.map(this.renderRectangle)}
              </div>);
          })}
        </div>
        <div style={FlexLayoutViewer.STYLE.inputContainer}>
          <div style={FlexLayoutViewer.STYLE.inputGroup}>
            <input type='checkbox' checked={this.state.isWidthEnabled}
              onChange={this.onChangeWidthCheckbox}/>
            <label htmlFor='width' style={FlexLayoutViewer.STYLE.label}>
              Max width
            </label>
            <input
              type='number'
              id='width'
              value={this.state.width}
              min={this.props.limits.minimumWidth} 
              max={this.props.limits.maximumWidth} 
              onChange={this.onChangeWidth}/>
          </div>
          <div style={FlexLayoutViewer.STYLE.inputGroup}>
            <input type='checkbox' checked={this.state.isHeightEnabled}
              onChange={this.onChangeHeightCheckbox}/>
            <label htmlFor='height' style={FlexLayoutViewer.STYLE.label}>
              Max height
            </label>
            <input
              type='number'
              id='height'
              value={this.state.height}
              min={this.props.limits.minimumHeight} 
              max={this.props.limits.maximumHeight} 
              onChange={this.onChangeHeight}/>
          </div>
          <div style={FlexLayoutViewer.STYLE.inputGroup}>
            <input type='checkbox' id='border'
              checked={this.state.isBorderDisplayed}
              onChange={this.onToggleBorder}/>
            <label htmlFor='border' style={FlexLayoutViewer.STYLE.label}>
              Toggle outline
            </label>
          </div>
        </div>
      </div>);
  }

  private renderRectangle = (rectangle: Rectangle, index: number) => {
    const isConstraintUniform = rectangle.horizontal ===
      rectangle.vertical;
    const backgroundColor = (isConstraintUniform &&
      FlexLayoutViewer.CONSTRAINT_COLORS[rectangle.horizontal]) ||
      '#F5F5F5';
    const extraStyle = getRectangleBorderStyles(rectangle);
    const isWidthFlexible =
      rectangle.horizontal === Constraint.FILL_SPACE;
    const isHeightFlexible =
      rectangle.vertical === Constraint.FILL_SPACE;
    const orientationStyle = (() => {
      if(this.props.orientation === Orientation.ROW) {
        return {
          flex: (isWidthFlexible && '1 1 auto') || '0 0 auto',
          height: (isHeightFlexible && 'auto') || rectangle.height,
          borderRightStyle: 'solid'
        };
      } else if(this.props.orientation === Orientation.COLUMN) {
        return {
          flex: (isHeightFlexible && '1 1 auto') || '0 0 auto',
          width: (isWidthFlexible && 'auto') || rectangle.width,
          borderBottomStyle: 'solid'
        };
      }
    })() as React.CSSProperties;
    return (
      <div
          key={index}
          style={{
            ...FlexLayoutViewer.STYLE.basicRectangle,
            backgroundColor,
            width: rectangle.width,
            height: rectangle.height,
            ...orientationStyle,
            ...(!this.state.isBorderDisplayed && {borderWidth: 0})
          }}>
        <div style={FlexLayoutViewer.STYLE.borderContainer}
            className={extraStyle}>
          {rectangle.name}
        </div>
      </div>);
  }

  private onChangeWidthCheckbox = (
      event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({isWidthEnabled: event.target.checked});
  }

  private onChangeWidth = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({width: event.target.valueAsNumber});
  }

  private onChangeHeightCheckbox = (
      event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({isHeightEnabled: event.target.checked});
  }

  private onChangeHeight = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({height: event.target.valueAsNumber});
  }

  private onToggleBorder = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({isBorderDisplayed: event.target.checked});
  }

  private static readonly CONSTRAINT_COLORS = {
    [Constraint.FIXED]: '#FFBB00',
    [Constraint.FILL_SPACE]: '#0066FF',
    [Constraint.FIT_CONTENT]: '#00BF2D',
  };
  private static readonly STYLE = {
    wrapper: {
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    } as React.CSSProperties,
    container: {
      height: 'calc(100% - 30px)',
      display: 'flex',
      alignContent: 'flex-start'
    } as React.CSSProperties,
    basicRectangle: {
      position: 'relative',
      top: 0,
      left: 0,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: '#FFFFFF'
    } as React.CSSProperties,
    borderContainer: {
      position: 'relative',
      width: '100%',
      height: '100%',
      display: 'grid',
      placeItems: 'center'
    } as React.CSSProperties,
    inputContainer: {
      display: 'flex',
      padding: 5,
      flexDirection: 'column',
      flexWrap: 'wrap',
      alignItems: 'flex-start',
      marginTop: 'auto'
    } as React.CSSProperties,
    inputGroup: {
      display: 'flex',
      alignItems: 'center'
    } as React.CSSProperties,
    label: {
      marginRight: 5,
      userSelect: 'none'
    } as React.CSSProperties
  };
}

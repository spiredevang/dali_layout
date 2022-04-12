import * as React from 'react';
import {Constraint, Rectangle} from '../rectangle';
import {getRectangleBorderStyles} from '../utilities';

interface Properties {
  rectangles: Rectangle[];
}

/** The layout viewer component. */
export class LayoutViewer extends React.Component<Properties> {
  public render(): JSX.Element {
    return (
      <div style={LayoutViewer.STYLE.container}>
        {this.props.rectangles.map(this.renderRectangle)}
      </div>);
  }

  private renderRectangle(rectangle: Rectangle, index: number) {
    const isConstraintUniform = rectangle.horizontal ===
      rectangle.vertical;
    const backgroundColor = (isConstraintUniform &&
      LayoutViewer.CONSTRAINT_COLORS[rectangle.horizontal]) || '#F5F5F5';
    const extraStyle = getRectangleBorderStyles(rectangle);
    const nonUniformStyle = isConstraintUniform && {} || {
      margin: 1,
      width: rectangle.width - 2,
      height: rectangle.height - 2
    };
    return (
      <div key={index}
          style={{
            ...LayoutViewer.STYLE.basicRectangle,
            backgroundColor,
            top: rectangle.top,
            left: rectangle.left,
            width: rectangle.width,
            height: rectangle.height,
            ...nonUniformStyle}}
          className={extraStyle}>
        {rectangle.name}
      </div>);
  }

  private static readonly CONSTRAINT_COLORS = {
    [Constraint.FIXED]: '#FFBB00',
    [Constraint.FILL_SPACE]: '#0066FF',
    [Constraint.FIT_CONTENT]: '#00BF2D',
  };
  private static readonly STYLE = {
    container: {
      position: 'relative',
      overflow: 'auto',
      border: '5px solid #000000',
      height: '100%'
    } as React.CSSProperties,
    basicRectangle: {
      position: 'absolute',
      border: '1px solid #ffffff',
      display: 'grid',
      placeItems: 'center'
    } as React.CSSProperties
  };
}

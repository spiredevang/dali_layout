import * as React from 'react';
import {Constraint, Rectangle} from '../rectangle';
import {getConstraint} from '../utilities';

interface Properties {

  /** The value of the field. */
  rectangles: Rectangle[];

  /** The callback to update the value. */
  onUpdate: (rectangles: Rectangle[]) => void;
}

type Direction = 'horizontalPolicy' | 'verticalPolicy';

/** A input field for a list of rectangles. */
export class RectanglesInput extends React.Component<Properties> {
  public render(): JSX.Element {
    return (
      <div style={RectanglesInput.STYLE.wrapper}>
        <div style={RectanglesInput.STYLE.container}>
          {this.props.rectangles.map(this.renderRectangleFields)}
        </div>
      </div>);
  }

  private renderRectangleFields = (rectangle: Rectangle, index: number) => {
    return (
      <div key={index} style={RectanglesInput.STYLE.rectangleFields}>
        <div style={RectanglesInput.STYLE.field}>
          <label htmlFor={`outcome${index}`}>Name</label>
          <input id={`outcome${index}`} value={rectangle.name}
            onChange={this.onChangeName(index)}/>
        </div>
        <div style={RectanglesInput.STYLE.field}>
          <label htmlFor={`width${index}`}>Width</label>
          <input type='number' id={`width${index}`} value={rectangle.width}
            onChange={this.onChangeWidth(index)}/>
        </div>
        <div style={RectanglesInput.STYLE.field}>
          <label htmlFor={`height${index}`}>Height</label>
          <input type='number' id={`height${index}`} value={rectangle.height}
            onChange={this.onChangeHeight(index)}/>
        </div>
        <div style={RectanglesInput.STYLE.field}>
          <label htmlFor={`left${index}`}>Left</label>
          <input type='number' id={`left${index}`} value={rectangle.left}
            onChange={this.onChangeLeft(index)}/>
        </div>
        <div style={RectanglesInput.STYLE.field}>
          <label htmlFor={`top${index}`}>Top</label>
          <input type='number' id={`id${index}`} value={rectangle.top}
            onChange={this.onChangeTop(index)}/>
        </div>
        <div style={RectanglesInput.STYLE.field}>
          <label htmlFor={`horizontalPolicy${index}`}>Horizontal policy</label>
          <select onChange={this.onChangeConstraint(index)('horizontalPolicy')}
              value={Constraint[rectangle.horizontalPolicy]}>
            <option key={0} value={Constraint[0]}>{Constraint[0]}</option>
            <option key={1} value={Constraint[1]}>{Constraint[1]}</option>
            <option key={2} value={Constraint[2]}>{Constraint[2]}</option>
          </select>
        </div>
        <div style={RectanglesInput.STYLE.field}>
          <label htmlFor={`verticalPolicy${index}`}>Vertical policy</label>
          <select onChange={this.onChangeConstraint(index)('verticalPolicy')}
              value={Constraint[rectangle.verticalPolicy]}>
            <option key={0} value={Constraint[0]}>{Constraint[0]}</option>
            <option key={1} value={Constraint[1]}>{Constraint[1]}</option>
            <option key={2} value={Constraint[2]}>{Constraint[2]}</option>
          </select>
        </div>
      </div>);
  };

  private onChangeName = (index: number) => (
      event: React.ChangeEvent<HTMLInputElement>) => {
    const newRectangles = this.props.rectangles.slice();
    newRectangles[index].name = event.target.value;
    this.props.onUpdate(newRectangles);
  }

  private onChangeWidth = (index: number) => (
      event: React.ChangeEvent<HTMLInputElement>) => {
    const newRectangles = this.props.rectangles.slice();
    newRectangles[index].width = event.target.valueAsNumber;
    this.props.onUpdate(newRectangles);
  }

  private onChangeHeight = (index: number) => (
      event: React.ChangeEvent<HTMLInputElement>) => {
    const newRectangles = this.props.rectangles.slice();
    newRectangles[index].height = event.target.valueAsNumber;
    this.props.onUpdate(newRectangles);
  }

  private onChangeLeft = (index: number) => (
      event: React.ChangeEvent<HTMLInputElement>) => {
    const newRectangles = this.props.rectangles.slice();
    newRectangles[index].left = event.target.valueAsNumber;
    this.props.onUpdate(newRectangles);
  }

  private onChangeTop = (index: number) => (
      event: React.ChangeEvent<HTMLInputElement>) => {
    const newRectangles = this.props.rectangles.slice();
    newRectangles[index].top = event.target.valueAsNumber;
    this.props.onUpdate(newRectangles);
  }

  private onChangeConstraint = (index: number) => (direction: Direction) =>
      (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newRectangles = this.props.rectangles.slice();
    const newConstraint = getConstraint(event.target.value);
    newRectangles[index][direction] = newConstraint ??
      newRectangles[index][direction];
    this.props.onUpdate(newRectangles);
  }

  private static readonly STYLE = {
    wrapper: {
      height: '100%',
      width: 260,
      overflowY: 'auto'
    } as React.CSSProperties,
    container: {
      fontSize: 15,
      display: 'flex',
      flexDirection: 'column'
    } as React.CSSProperties,
    rectangleFields: {
      display: 'flex',
      flexDirection: 'column',
      padding: '15px 0',
      borderTop: '2px solid #E8E8E8'
    } as React.CSSProperties,
    field: {
      display: 'grid',
      gridTemplateColumns: '120px 120px'
    } as React.CSSProperties
  };
}

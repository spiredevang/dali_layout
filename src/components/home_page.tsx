import * as React from 'react';
import {Constraint, Rectangle} from '../rectangle';

interface Properties {}

interface State {
  rectangles: Rectangle[];
}

/** The home page component. */
export class HomePage extends React.Component<Properties, State> {
  constructor(props: Properties) {
    super(props)
    this.state = {rectangles: []};
  }

  public render(): JSX.Element {
    console.log('render', this.state.rectangles);
    return (
      <div style={HomePage.STYLE.container}>
        <h1>Layout Application</h1>
        <input type='file' onChange={this.onChange}/>
      </div>);
  }

  private onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files as any
    const file = files[0];
    if(file.type === 'application/json') {
      const readFile = new FileReader();
      readFile.onload = this.onLoad;
      readFile.readAsText(file);
    }
  }

  private onLoad = (event: ProgressEvent<FileReader>) => {
    const contents = event.target?.result as string;
    const jsonContents = JSON.parse(contents);
    if(Array.isArray(jsonContents?.layout)) {
      const rectangles = jsonContents.layout.reduce(
        (rectangles: Rectangle[], object: any) => {
          const rectangle = this.getRectangle(object);
          if(rectangle) {
            rectangles.push(rectangle);
          }
          return rectangles;
        }, []);
      this.setState({rectangles});
    }
  }

  private getRectangle(object: any) {
    const horizontalPolicy = this.getConstraint(object?.horizontalPolicy);
    const verticalPolicy = this.getConstraint(object?.verticalPolicy);
    if(typeof object?.name === 'string' && typeof object?.width === 'number' &&
        typeof object?.height === 'number' && typeof object?.x === 'number' &&
        typeof object?.y === 'number' && horizontalPolicy !== null &&
        verticalPolicy !== null) {
      return {
        name: object.name,
        width: object.width,
        height: object.height,
        x: object.x,
        y: object.y,
        horizontalPolicy,
        verticalPolicy
      } as Rectangle;
    }
  }

  private getConstraint(text: string): Constraint | null {
    switch(text.toUpperCase()) {
      case 'FIXED':
        return Constraint.FIXED;
      case 'FILL_SPACE':
        return Constraint.FILL_SPACE;
      default:
        return null;
    }
  }

  private static readonly STYLE = {
    container: {
      width: 'clamp(767px, 100%, 1280px)',
      padding: '0 15px',
      display: 'flex',
      flexDirection: 'column'
    } as React.CSSProperties
  };
}

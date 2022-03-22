import * as React from 'react';
import {LayoutGraph} from '../graph';
import {Rectangle} from '../rectangle';
import {getConstraint} from '../utilities';
import {LayoutViewer} from './layout_viewer';
import {RectanglesInput} from './rectangle_input';

interface Properties {}

interface State {
  rectangles: Rectangle[];
}

/** The home page component. */
export class HomePage extends React.Component<Properties, State> {
  constructor(props: Properties) {
    super(props)
    this.state = {rectangles: []};
    this.layoutGraph = new LayoutGraph([]);
  }

  public render(): JSX.Element {
    return (
      <div style={HomePage.STYLE.container}>
        <h1>Layout Application</h1>
        <input type='file' onChange={this.onChange}/>
        <div style={HomePage.STYLE.viewerContainer}>
          <LayoutViewer rectangles={this.state.rectangles}/>
          <RectanglesInput rectangles={this.state.rectangles}
            onUpdate={this.onUpdateRectangles}/>
        </div>
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
      this.layoutGraph = new LayoutGraph(rectangles);
    }
  }

  private getRectangle(object: any) {
    const horizontalPolicy = getConstraint(object?.horizontalPolicy);
    const verticalPolicy = getConstraint(object?.verticalPolicy);
    if(typeof object?.name === 'string' && typeof object?.width === 'number' &&
        typeof object?.height === 'number' && typeof object?.left === 'number' &&
        typeof object?.top === 'number' && horizontalPolicy !== null &&
        verticalPolicy !== null) {
      return {
        name: object.name,
        width: object.width,
        height: object.height,
        left: object.left,
        top: object.top,
        horizontalPolicy,
        verticalPolicy
      } as Rectangle;
    }
  }

  private onUpdateRectangles = (rectangles: Rectangle[]) => {
    this.setState({rectangles});
  }

  private static readonly STYLE = {
    container: {
      width: 'clamp(767px, 100%, 1280px)',
      padding: '0 15px',
      display: 'flex',
      rowGap: 20,
      flexDirection: 'column'
    } as React.CSSProperties,
    viewerContainer: {
      display: 'grid',
      columnGap: 10,
      gridTemplateColumns: 'auto 260px',
      alignItems: 'baseline',
      height: 'calc(100vh - 150px)'
    } as React.CSSProperties
  };
  private layoutGraph: LayoutGraph;
}

import * as React from 'react';
import {LayoutGraph} from '../graph';
import {Rectangle} from '../rectangle';
import {getConstraint} from '../utilities';
import {LayoutPopup} from './layout_popup';
import {LayoutViewer} from './layout_viewer';
import {RectanglesInput} from './rectangle_input';

interface Properties {}

interface State {
  rectangles: Rectangle[];
  isPopupDisplayed: boolean;
}

/** The home page component. */
export class HomePage extends React.Component<Properties, State> {
  constructor(props: Properties) {
    super(props)
    this.state = {
      rectangles: [],
      isPopupDisplayed: false
    };
    this.layoutGraph = new LayoutGraph([]);
  }

  public render(): JSX.Element {
    const {layoutHandler, buttonText} = (() => {
      if(this.state.isPopupDisplayed) {
        return {layoutHandler: this.onCloseLayoutPopup, buttonText: 'Close'};
      } else {
        return {layoutHandler: this.onOpenLayoutPopup, buttonText: 'Open'};
      }
    })();
    return (
      <div style={HomePage.STYLE.container}>
        <h1>Layout Application</h1>
        <div style={HomePage.STYLE.toolbar}>
          <div style={{marginRight: 10}}>
            <select name='json' onChange={this.onSelectChange}>
              <option value=''>Select JSON</option>
              <option value='square_grid.json'>Square Grid</option>
              <option value='arthur.json'>Arthur</option>
              <option value='darryl.json'>Darryl</option>
              <option value='jess.json'>Jess</option>
              <option value='jon.json'>Jon</option>
              <option value='test.json'>Test</option>
            </select>
          </div>
          <input type='file' style={{flexGrow: 1}} onChange={this.onFileChange}/>
          <button onClick={layoutHandler}>{buttonText} layout</button>
        </div>
        <div style={HomePage.STYLE.viewerContainer}>
          <LayoutViewer rectangles={this.state.rectangles}/>
          <RectanglesInput rectangles={this.state.rectangles}
            onUpdate={this.onUpdateRectangles}/>
        </div>
        <div style={HomePage.STYLE.popupContainer}>
          {this.state.isPopupDisplayed && (
            <LayoutPopup onClosePopup={this.onCloseLayoutPopup}>
              {this.renderLayoutPopup()}
            </LayoutPopup>)}
        </div>
      </div>);
  }

  private onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files as any
    const file = files[0];
    if(file.type === 'application/json') {
      const readFile = new FileReader();
      readFile.onload = this.onLoad;
      readFile.readAsText(file);
    }
  }

  private onSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    if(event.target.value) {
      const jsonContents = require(`../layouts/${event.target.value}`);
      this.loadJSONlayout(jsonContents);
    }
  }

  private onLoad = (event: ProgressEvent<FileReader>) => {
    const contents = event.target?.result as string;
    const jsonContents = JSON.parse(contents);
    this.loadJSONlayout(jsonContents)
  }

  private loadJSONlayout = (object: any) => {
    if(Array.isArray(object?.layout)) {
      const rectangles = object.layout.reduce(
        (rectangles: Rectangle[], object: any) => {
          const rectangle = this.getRectangle(object);
          if(rectangle) {
            rectangles.push(rectangle);
          }
          return rectangles;
        }, []);
      if(rectangles) {
        this.setState({rectangles});
        this.layoutGraph = new LayoutGraph(rectangles);
      }
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

  private onOpenLayoutPopup = () => {
    this.setState({isPopupDisplayed: true});
  }

  private onCloseLayoutPopup = () => {
    this.setState({isPopupDisplayed: false});
  }

  private renderLayoutPopup() {
    return (
      <div style={HomePage.STYLE.layoutPopup}>
        layout pop
      </div>);
  }

  private static readonly STYLE = {
    container: {
      position: 'relative',
      width: 'max(767px, 100%)',
      padding: '0 15px',
      display: 'flex',
      rowGap: 20,
      flexDirection: 'column'
    } as React.CSSProperties,
    toolbar: {
      display: 'flex'
    } as React.CSSProperties,
    viewerContainer: {
      display: 'grid',
      columnGap: 10,
      gridTemplateColumns: 'auto 260px',
      alignItems: 'baseline',
      height: 'calc(100vh - 150px)'
    } as React.CSSProperties,
    popupContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      zIndex: -1
    } as React.CSSProperties,
    layoutPopup: {
      display: 'flex'
    } as React.CSSProperties
  };
  private layoutGraph: LayoutGraph;
}

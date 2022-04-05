import * as React from 'react';
import {BASE_LIMITS, LayoutGraph, Limits} from '../graph';
import {Constraint, Rectangle} from '../rectangle';
import {getConstraint} from '../utilities';
import {Popup} from './popup';
import {FlexLayoutViewer} from './flex_layout_viewer';
import {LayoutViewer} from './layout_viewer';
import {RectanglesInput} from './rectangle_input';

interface Properties {}

interface State {
  rectangles: Rectangle[];
  constraints: string[];
  resizedRectangles: Rectangle[];
  rowConfiguration: Rectangle[][];
  columnConfiguration: Rectangle[][];
  rowLimits: Limits;
  columnLimits: Limits;
  isOriginalLayoutDisplayed: boolean;
  orientation: Orientation;
  isPopupDisplayed: boolean;
}

export enum Orientation {
  ROW,
  COLUMN
}

/** The home page component. */
export class HomePage extends React.Component<Properties, State> {
  constructor(props: Properties) {
    super(props)
    this.state = {
      rectangles: [],
      constraints: [],
      resizedRectangles: [],
      rowConfiguration: [],
      columnConfiguration: [],
      rowLimits: BASE_LIMITS,
      columnLimits: BASE_LIMITS,
      isOriginalLayoutDisplayed: true,
      orientation: Orientation.ROW,
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
    const displayedRectangles = (this.state.isOriginalLayoutDisplayed &&
      this.state.rectangles) || this.state.resizedRectangles;
    const isRow = this.state.orientation === Orientation.ROW;
    const rectangleMatrix =  (isRow && this.state.rowConfiguration) ||
      this.state.columnConfiguration;
    const limits = (isRow && this.state.rowLimits) || this.state.columnLimits;
    const [popupWidth, popupHeight] = (() => {
      const [width, height] = this.layoutGraph.boundaries;
      if(isRow) {
        return [width, height * 1.2];
      } else {
        return [width * 1.2 , height];
      }
    })();
    const layoutToggleText = this.state.isOriginalLayoutDisplayed ? 'resized' : 'original'
    return (
      <div style={HomePage.STYLE.container}>
        <h1>Layout Application</h1>
        <div style={HomePage.STYLE.toolbar}>
          <div style={{marginRight: 10}}>
            <select name='json' onChange={this.onSelectChange}>
              <option value=''>Select JSON</option>
              <option value='square_grid_2x2.json'>Square Grid (2x2)</option>
              <option value='short_grid_2x2.json'>Short Grid (2x2)</option>
              <option value='narrow_grid_2x2.json'>Narrow Grid (2x2)</option>
              <option value='square_grid_3x3.json'>Square Grid (3x3)</option>
              <option value='short_grid_3x3.json'>Short Grid (3x3)</option>
              <option value='narrow_grid_3x3.json'>Narrow Grid (3x3)</option>
              <option value='long_grid_3x3.json'>Long Grid (3x3)</option>
              <option value='wide_grid_3x3.json'>Wide Grid (3x3)</option>
              <option value='unaligned_grid_3x3.json'>Unaligned Grid (3x3)</option>
              <option value='arthur.json'>Arthur</option>
              <option value='darryl.json'>Darryl</option>
              <option value='jess.json'>Jess</option>
              <option value='jon.json'>Jon</option>
              <option value='test.json'>Test</option>
            </select>
          </div>
          <input type='file' style={{flexGrow: 1}} onChange={this.onFileChange}/>
          {this.state.resizedRectangles.length > 0 &&
            <button onClick={this.toggleResizedLayout}
                style={{marginRight: 50}}>
              Show {layoutToggleText} layout
            </button>}
          <button onClick={layoutHandler}>{buttonText} layout</button>
        </div>
        <div style={HomePage.STYLE.viewerContainer}>
          <LayoutViewer rectangles={displayedRectangles}/>
          <div style={HomePage.STYLE.rightPanel}>
            <div style={HomePage.STYLE.limitSpecs}>
              <div>
                <input type='radio' id='row' value={Orientation.ROW}
                  disabled={this.state.rowConfiguration.length === 0}
                  checked={this.state.orientation === Orientation.ROW}
                  onChange={this.onOrientationChange}/>
                <label htmlFor='row'>Row</label>
              </div>
              <div>
                <input type='radio' id='column' value={Orientation.COLUMN}
                  disabled={this.state.columnConfiguration.length === 0}
                  checked={this.state.orientation === Orientation.COLUMN}
                  onChange={this.onOrientationChange}/>
                <label htmlFor='column'>Column</label>
              </div>
              <div>Minimum width:</div>
              <div style={HomePage.STYLE.specValue}>
                {this.layoutGraph.MinimumWidth}
              </div>
              <div>Minimum height:</div>
              <div style={HomePage.STYLE.specValue}>
                {this.layoutGraph.MinimumHeight}
              </div>
              <div>Maximum width:</div>
              <div style={HomePage.STYLE.specValue}>
                {this.layoutGraph.MaximumWidth}
              </div>
              <div>Maximum height:</div>
              <div style={HomePage.STYLE.specValue}>
                {this.layoutGraph.MaximumHeight}
              </div>
            </div>
            <RectanglesInput rectangles={displayedRectangles}
              onUpdate={this.onUpdateRectangles}/>
            {this.state.constraints.length > 0 &&
              <div style={HomePage.STYLE.constraintsContainer}>
                {this.state.constraints.map((constraint, index) => 
                  <div key={index} style={HomePage.STYLE.constraintRow}>
                    <input name="" value={constraint}
                      onChange={this.onChangeConstraint(index)}
                      style={HomePage.STYLE.constraintInput}/>
                    <button onClick={() => this.onRemoveConstraint(index)}>
                      REMOVE
                    </button>
                  </div>)}
                <button onClick={this.onAddConstraint}>ADD CONSTRAINT</button>
              </div>}
            {this.state.rectangles.length > 0 && 
              <button onClick={this.onDownloadJSON}>
                DOWNLOAD JSON
              </button>}
          </div>
        </div>
        <div style={HomePage.STYLE.popupContainer}>
          {this.state.isPopupDisplayed && (
            <Popup
                width={popupWidth}
                height={popupHeight}
                onClosePopup={this.onCloseLayoutPopup}>
              <FlexLayoutViewer 
                rectangleMatrix={rectangleMatrix}
                limits={limits}
                orientation={this.state.orientation}/>
            </Popup>)}
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
        this.layoutGraph = new LayoutGraph(rectangles);
        const constraints = this.validateConstraints(object.constraints);
        const resizedRectangles = (this.layoutGraph.ResizedRows.length &&
          this.layoutGraph.ResizedRows.flat()) || this.layoutGraph.ResizedColumns.flat();
        const rowConfiguration = this.layoutGraph.RowConfiguration;
        const columnConfiguration = this.layoutGraph.ColumnConfiguration;
        const rowLimits = this.layoutGraph.RowLimits;
        const orientation = rowConfiguration.length ? Orientation.ROW : Orientation.COLUMN;
        const columnLimits = this.layoutGraph.ColumnLimits;
        this.setState({
          rectangles,
          constraints,
          resizedRectangles,
          rowConfiguration,
          columnConfiguration,
          rowLimits,
          columnLimits,
          orientation
        });
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

  private validateConstraints(object: any) {
    if(Array.isArray(object)) {
      return object;
    } else {
      return [];
    }
  }

  private onChangeConstraint = (index: number) =>
      (event: React.ChangeEvent<HTMLInputElement>) => {
    const constraints = this.state.constraints.slice();
    constraints[index] = event.target.value;
    this.setState({constraints});
  }

  private onRemoveConstraint = (index: number) => {
    const constraints = this.state.constraints.slice();
    constraints.splice(index, 1);
    this.setState({constraints});
  }

  private onAddConstraint = () => {
    const constraints = this.state.constraints.slice();
    constraints.push('');
    this.setState({constraints});
  }

  private onUpdateRectangles = (rectangles: Rectangle[]) => {
    if(this.state.isOriginalLayoutDisplayed) {
      this.setState({rectangles});
    } else {
      this.setState({resizedRectangles: rectangles});
    }
  }

  private onOrientationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({orientation: +event.target.value});
  }

  private onOpenLayoutPopup = () => {
    this.layoutGraph = new LayoutGraph(this.state.rectangles);
    const resizedRectangles = (this.layoutGraph.ResizedRows.length &&
      this.layoutGraph.ResizedRows.flat()) || this.layoutGraph.ResizedColumns.flat();
    const rowConfiguration = this.layoutGraph.RowConfiguration;
    const columnConfiguration = this.layoutGraph.ColumnConfiguration;
    const rowLimits = this.layoutGraph.RowLimits;
    const columnLimits = this.layoutGraph.ColumnLimits;
    const isPopupDisplayed = ((this.state.orientation === Orientation.ROW) &&
      rowConfiguration.length > 0) || ((this.state.orientation === Orientation.COLUMN)
      && columnConfiguration.length > 0)
    this.setState({
      resizedRectangles,
      rowConfiguration,
      columnConfiguration,
      rowLimits,
      columnLimits,
      isPopupDisplayed
    });
  }

  private onCloseLayoutPopup = () => {
    this.setState({isPopupDisplayed: false});
  }

  private toggleResizedLayout = () => {
    this.setState({isOriginalLayoutDisplayed: !this.state.isOriginalLayoutDisplayed});
  }

  private onDownloadJSON = () => {
    const displayedRectangles = (this.state.isOriginalLayoutDisplayed &&
      this.state.rectangles) || this.state.resizedRectangles;
    const layout = displayedRectangles.map(rectangle =>
      ({
        ...rectangle,
        horizontalPolicy: Constraint[rectangle.horizontalPolicy],
        verticalPolicy: Constraint[rectangle.verticalPolicy]
      }));
    const data = {layout, constraints: this.state.constraints};
    const file = new Blob([JSON.stringify(data)], {type: 'application/json'});
    const anchor = document.createElement('a');
    anchor.href = URL.createObjectURL(file);
    anchor.download = 'layout.json';
    anchor.click();
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
    rightPanel: {
      height: '100%',
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column',
      rowGap: 5
    } as React.CSSProperties,
    limitSpecs: {
      margin: '10px 0',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr'
    } as React.CSSProperties,
    specValue: {
      justifySelf: 'end'
    } as React.CSSProperties,
    constraintsContainer: {
      display: 'flex',
      flexWrap: 'wrap'
    } as React.CSSProperties,
    constraintRow: {
      padding: '5px 0',
      display: 'flex',
      columnGap: 5
    } as React.CSSProperties,
    constraintInput: {
      width: 'calc(100% - 70px)'
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

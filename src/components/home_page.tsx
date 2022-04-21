import * as React from 'react';
import {BASE_LIMITS, LayoutGraph, Limits} from '../graph';
import {EqualityConstraint, EvaluatePostFix, HEIGHT_REGEX, MEASUREMENT_REGEX,
  WIDTH_REGEX} from '../equality_constraint';
import {Constraint, Rectangle} from '../rectangle';
import {BORDER_STYLES, getConstraint} from '../utilities';
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
  constraintStyles: {[key: string]: number | string};
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
      constraintStyles: {},
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
    const layoutToggleText =
      (this.state.isOriginalLayoutDisplayed &&'resized') || 'original';
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
              <option value='unaligned_grid_3x3.json'>
                Unaligned Grid (3x3)
              </option>
              <option value='rectangle_grid_5x3.json'>
                Rectangle Grid (5x3)
              </option>
              <option value='arthur.json'>Arthur</option>
              <option value='darryl.json'>Darryl</option>
              <option value='jess.json'>Jess</option>
              <option value='jon.json'>Jon</option>
              <option value='test.json'>Test</option>
            </select>
          </div>
          <input type='file' style={{flexGrow: 1}}
            onChange={this.onFileChange}/>
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
            </div>
            <button onClick={this.onDownloadJSON}>
              DOWNLOAD JSON
            </button>
          </div>
        </div>
        <div style={HomePage.STYLE.popupContainer}>
          {this.state.isPopupDisplayed && (
            <Popup
                width={popupWidth}
                height={popupHeight + 75}
                onClosePopup={this.onCloseLayoutPopup}>
              <FlexLayoutViewer 
                rectangleMatrix={rectangleMatrix}
                limits={limits}
                orientation={this.state.orientation}
                constraintStyles={this.state.constraintStyles}/>
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
        const constraints = this.validateJSONConstraints(object.constraints);
        const resizedRectangles = (this.layoutGraph.ResizedRows.length &&
          this.layoutGraph.ResizedRows.flat()) ||
          this.layoutGraph.ResizedColumns.flat();
        const rowConfiguration = this.layoutGraph.RowConfiguration;
        const columnConfiguration = this.layoutGraph.ColumnConfiguration;
        const rowLimits = this.layoutGraph.RowLimits;
        const orientation = rowConfiguration.length ? Orientation.ROW :
          Orientation.COLUMN;
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
    const horizontal = getConstraint(object?.horizontal);
    const vertical = getConstraint(object?.vertical);
    if(typeof object?.name === 'string' &&
        typeof object?.width === 'number' &&
        typeof object?.height === 'number' &&
        typeof object?.left === 'number' &&
        typeof object?.top === 'number' &&
        horizontal !== null &&
        vertical !== null) {
      return {
        name: object.name,
        width: object.width,
        height: object.height,
        left: object.left,
        top: object.top,
        horizontal,
        vertical
      } as Rectangle;
    }
  }

  private validateJSONConstraints(object: any) {
    if(Array.isArray(object) && object.every(
        element => typeof element === 'string')) {
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

  private onOrientationChange = (
      event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({orientation: +event.target.value});
  }

  private onOpenLayoutPopup = () => {
    this.layoutGraph = new LayoutGraph(this.state.rectangles);
    const resizedRectangles = (this.layoutGraph.ResizedRows.length &&
      this.layoutGraph.ResizedRows.flat()) ||
      this.layoutGraph.ResizedColumns.flat();
    const rowConfiguration = this.layoutGraph.RowConfiguration;
    const columnConfiguration = this.layoutGraph.ColumnConfiguration;
    const rowLimits = this.layoutGraph.RowLimits;
    const columnLimits = this.layoutGraph.ColumnLimits;
    const displayConfiguration = this.state.orientation === Orientation.ROW &&
      rowConfiguration || columnConfiguration;
    const constraintStyles = this.getConstraintStyles(displayConfiguration);
    const isPopupDisplayed = ((this.state.orientation === Orientation.ROW) &&
      rowConfiguration.length > 0) ||
      ((this.state.orientation === Orientation.COLUMN)
      && columnConfiguration.length > 0);
    this.setState({
      resizedRectangles,
      rowConfiguration,
      columnConfiguration,
      rowLimits,
      constraintStyles,
      columnLimits,
      isPopupDisplayed
    });
  }

  private getConstraintStyles(configuration: Rectangle[][]) {
    const nameMap = {} as {[key: string]: [number, number]};
    configuration.forEach((rectangleList, i) => {
      rectangleList.forEach((rectangle, j) => {
        nameMap[rectangle.name] = [i, j];
      });
    });
    this.updateConfiguration(configuration, this.state.constraints, nameMap);
    return this.generateConstraintStyles(configuration);
  }

  private updateConfiguration(configuration: Rectangle[][],
      constraints: string[], nameMap: {[key: string]: [number, number]}) {
    constraints.forEach(constraint => {
      const equalityConstraint = new EqualityConstraint(constraint);
      const affectedProperties = equalityConstraint.AffectedProperties;
      const affectedRectProperties = affectedProperties.shift() as
        {name: string, attribute: string, index: number};
      const affectedRectIndex = nameMap[affectedRectProperties.name];
      const affectedRect = configuration[affectedRectIndex[0]]
        [affectedRectIndex[1]];
      if(MEASUREMENT_REGEX.test(affectedRectProperties.attribute)) {
        const postfixNotation = equalityConstraint.PostfixNotation;
        let attributeConstraint = Constraint.FIXED;
        affectedProperties.forEach(({name, attribute, index}) => {
          const rectIndex = nameMap[name];
          const rect = configuration[rectIndex[0]][rectIndex[1]] as Rectangle;
          if(WIDTH_REGEX.test(attribute)) {
            postfixNotation[index] = rect.width;
            if(rect.horizontal === Constraint.FILL_SPACE) {
              attributeConstraint = Constraint.FILL_SPACE;
            }
          } else if(HEIGHT_REGEX.test(attribute)) {
            postfixNotation[index] = rect.height;
            if(rect.vertical === Constraint.FILL_SPACE) {
              attributeConstraint = Constraint.FILL_SPACE;
            }
          }
        });
        const updatedValue = EvaluatePostFix(postfixNotation);
        if(WIDTH_REGEX.test(affectedRectProperties.attribute)) {
          affectedRect.width = updatedValue;
          affectedRect.horizontal = attributeConstraint;
        } else if(HEIGHT_REGEX.test(affectedRectProperties.attribute)) {
          affectedRect.height = updatedValue;
          affectedRect.vertical = attributeConstraint;
        }
      }
    });
  }

  private generateConstraintStyles(configuration: Rectangle[][]) {
    const constraintStyles = {} as {[key: string]: string | number};
    configuration.forEach(rectangleList => {
      const [policyDirection, measurement] = (() => {
        if(this.state.orientation === Orientation.ROW) {
          return ['horizontal', 'width'];
        } else {
          return ['vertical', 'height'];
        }
      })() as ['horizontal' | 'vertical', 'width' | 'height'];
      const [totalFix, totalFlex] = rectangleList.reduce((total, rect) => {
          total[0] += rect[policyDirection] === Constraint.FIXED ?
            rect[measurement] : 0
          total[1] += rect[policyDirection] === Constraint.FILL_SPACE ?
            rect[measurement] : 0
          return total;
      }, [0, 0]);
      rectangleList.forEach(rect => {
        const [percent, pixels] = (() => {
          if(rect[policyDirection] === Constraint.FIXED) {
            return [0, rect[measurement]];
          } else {
            const ratio = rect[measurement] / totalFlex;
            return [Math.round(100 * ratio), Math.round(-ratio * totalFix)];
          }
        })();
        if(!percent) {
          constraintStyles[`${rect.name}.${measurement}`] = pixels;
        } else if(!pixels) {
          constraintStyles[`${rect.name}.${measurement}`] = `${percent}%`;
        } else {
          const pixelSign = (pixels < 0 && '-') || '+';
          const pixelValue = Math.abs(pixels);
          constraintStyles[`${rect.name}.${measurement}`] =
            `calc(${percent}% ${pixelSign} ${pixelValue}px)`;
        }
      });
    });
    return constraintStyles;
  }

  private onCloseLayoutPopup = () => {
    this.setState({isPopupDisplayed: false});
  }

  private toggleResizedLayout = () => {
    this.setState({
      isOriginalLayoutDisplayed: !this.state.isOriginalLayoutDisplayed
    });
  }

  private onDownloadJSON = () => {
    const displayedRectangles = (this.state.isOriginalLayoutDisplayed &&
      this.state.rectangles) || this.state.resizedRectangles;
    const layout = displayedRectangles.map(rectangle =>
      ({
        ...rectangle,
        horizontal: Constraint[rectangle.horizontal],
        vertical: Constraint[rectangle.vertical]
      }));
    const data = {layout, constraints: this.state.constraints};
    const file = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
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

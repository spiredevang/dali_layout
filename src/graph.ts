import {Constraint, Rectangle} from './rectangle';

const MAX_SIZE = 2**24;

interface HorizontalEdge {
  nodes: [string, string];
  left: number;
  right: number;
  top: number;
}

interface VerticalEdge {
  nodes: [string, string];
  top: number;
  bottom: number;
  left: number;
}

interface Limits {
  minimumWidth: number;
  minimumHeight: number;
  maximumWidth: number;
  maximumHeight: number;
}

const baseLimits = {
  minimumWidth: 0,
  minimumHeight: 0,
  maximumWidth: MAX_SIZE,
  maximumHeight: MAX_SIZE
}

abstract class Graph {};

abstract class Node {
  public abstract get Rectangle(): Rectangle;
  public abstract addTopEdge(edge: string): void;
  public abstract addRightEdge(edge: string): void;
  public abstract addBottomEdge(edge: string): void;
  public abstract addLeftEdge(edge: string): void;
  public abstract get TopEdges(): string[];
  public abstract get RightEdges(): string[];
  public abstract get BottomEdges(): string[];
  public abstract get LeftEdges(): string[];
}

export class LayoutNode extends Node {

  public constructor(rectangle: Rectangle) {
    super();
    this.rectangle = rectangle;
    this.topEdges = [];
    this.rightEdges = [];
    this.bottomEdges = [];
    this.leftEdges = [];
  }

  public get Rectangle(): Rectangle {
    return this.rectangle;
  }

  public addTopEdge(edge: string) {
    this.topEdges.push(edge);
  }

  public addRightEdge(edge: string) {
    this.rightEdges.push(edge);
  }

  public addBottomEdge(edge: string) {
    this.bottomEdges.push(edge);
  }

  public addLeftEdge(edge: string) {
    this.leftEdges.push(edge);
  }

  public get TopEdges(): string[] {
    return this.topEdges;
  }

  public get RightEdges(): string[] {
    return this.rightEdges;
  }

  public get BottomEdges(): string[] {
    return this.bottomEdges;
  }

  public get LeftEdges(): string[] {
    return this.leftEdges;
  }

  public get minimumWidth(): number {
    if(this.rectangle.horizontalPolicy === Constraint.FILL_SPACE) {
      return 0;
    } else {
      return this.rectangle.width;
    }
  }

  public get minimumHeight(): number {
    if(this.rectangle.verticalPolicy === Constraint.FILL_SPACE) {
      return 0;
    } else {
      return this.rectangle.height;
    }
  }

  public get maximumWidth(): number {
    if(this.rectangle.horizontalPolicy === Constraint.FILL_SPACE) {
      return MAX_SIZE;
    } else {
      return this.rectangle.width;
    }
  }

  public get maximumHeight(): number {
    if(this.rectangle.verticalPolicy === Constraint.FILL_SPACE) {
      return MAX_SIZE;
    } else {
      return this.rectangle.height;
    }
  }

  public get compressableWidth(): number {
    if(this.rectangle.horizontalPolicy === Constraint.FILL_SPACE) {
      return this.rectangle.width;
    } else {
      return 0;
    }
  }

  public get compressableHeight(): number {
    if(this.rectangle.verticalPolicy === Constraint.FILL_SPACE) {
      return this.rectangle.height;
    } else {
      return 0;
    }
  }

  public get expandableWidth(): number {
    if(this.rectangle.horizontalPolicy === Constraint.FILL_SPACE) {
      return MAX_SIZE;
    } else {
      return 0;
    }
  }

  public get expandableHeight(): number {
    if(this.rectangle.verticalPolicy === Constraint.FILL_SPACE) {
      return MAX_SIZE;
    } else {
      return 0;
    }
  }

  private rectangle: Rectangle;
  private topEdges: string[];
  private rightEdges: string[];
  private bottomEdges: string[];
  private leftEdges: string[];
}


export class LayoutGraph extends Graph {
  public constructor(rectangles: Rectangle[]) {
    super();
    this.nodesObject = rectangles.reduce((nodesObject, rectangle) => {
      nodesObject[`${rectangle.left}-${rectangle.top}`] =
        new LayoutNode(rectangle);
      return nodesObject;
    }, {} as {[key: string]: LayoutNode});
    this.horizontalEdges = {};
    this.verticalEdges = {};
    this.boundaryX = 0;
    this.boundaryY = 0;
    this.rowConfiguration = [];
    this.columnConfiguration = [];
    this.resizedRows = [];
    this.resizedColumns = [];
    this.rowLimits = baseLimits;
    this.columnLimits = baseLimits;
    this.minimumWidth = 0;
    this.minimumHeight = 0;
    this.maximumWidth = MAX_SIZE;
    this.maximumHeight = MAX_SIZE;
    this.generateEdges();
    this.rowConfiguration = this.getRowConfiguration();
    this.columnConfiguration = this.getColumnConfiguration();
    this.rowLimits = this.getRowConfigurationLimits(this.rowConfiguration);
    this.columnLimits = this.getColumnConfigurationLimits(this.columnConfiguration);
    this.minimumWidth = Math.min(this.rowLimits.minimumWidth, this.columnLimits.minimumWidth);
    this.minimumHeight = Math.min(this.rowLimits.minimumHeight, this.columnLimits.minimumHeight);
    this.maximumWidth = Math.max(this.rowLimits.maximumWidth, this.columnLimits.maximumWidth);
    this.maximumHeight = Math.max(this.rowLimits.maximumHeight, this.columnLimits.maximumHeight);
    if(!this.rowConfiguration.length) {
      this.fixUnalignedRows();
    }
    if(!this.columnConfiguration.length) {
      this.fixUnalignedColumns();
    }
  }

  private generateEdges() {
    Object.entries(this.nodesObject).forEach(([nodeKey, node]) => {
      this.boundaryX = Math.max(node.Rectangle.left + node.Rectangle.width, this.boundaryX);
      this.boundaryY = Math.max(node.Rectangle.top + node.Rectangle.height, this.boundaryY);
      const nodeLeft = node.Rectangle.left;
      const nodeRight = node.Rectangle.left + node.Rectangle.width;
      const nodeTop = node.Rectangle.top;
      const nodeBottom = node.Rectangle.top + node.Rectangle.height;
      Object.entries(this.nodesObject).forEach(([surrKey, surr]) => {
        if(surrKey !== nodeKey) {
          const surrLeft = surr.Rectangle.left;
          const surrRight = surr.Rectangle.left + surr.Rectangle.width;
          const surrTop = surr.Rectangle.top;
          const surrBottom = surr.Rectangle.top + surr.Rectangle.height;
          if(nodeTop === surrBottom &&
              ((nodeLeft <= surrLeft && surrLeft < nodeRight) ||
              (nodeLeft < surrRight && surrRight <= nodeRight))) {
            const left = Math.max(nodeLeft, surrLeft);
            const edgeKey = `${left}-${nodeTop}`;
            if(!(edgeKey in this.horizontalEdges)) {
              const horizontalEdge = {
                nodes: [surrKey, nodeKey],
                top: nodeTop,
                left,
                right: Math.min(nodeRight, surrRight)
              } as HorizontalEdge;
              this.horizontalEdges[edgeKey] = horizontalEdge;
            }
            node.addTopEdge(edgeKey);
          } else if(nodeBottom === surrTop &&
              ((nodeLeft <= surrLeft && surrLeft < nodeRight) ||
              (nodeLeft < surrRight && surrRight <= nodeRight))) {
            const left = Math.max(nodeLeft, surrLeft);
            const edgeKey = `${left}-${nodeBottom}`;
            if(!(edgeKey in this.horizontalEdges)) {
              const horizontalEdge = {
                nodes: [nodeKey, surrKey],
                top: nodeBottom,
                left,
                right: Math.min(nodeRight, surrRight)
              } as HorizontalEdge;
              this.horizontalEdges[edgeKey] = horizontalEdge;
            }
            node.addBottomEdge(edgeKey);
          } else if(nodeLeft === surrRight &&
              ((nodeTop <= surrTop && surrTop < nodeBottom) ||
              (nodeTop < surrBottom && surrBottom <= nodeBottom))) {
            const top = Math.max(nodeTop, surrTop);
            const edgeKey = `${node.Rectangle.left}-${top}`;
            if(!(edgeKey in this.verticalEdges)) {
              const verticalEdge = {
                nodes: [surrKey, nodeKey],
                top,
                bottom: Math.min(nodeBottom, surrBottom),
                left: node.Rectangle.left
              } as VerticalEdge;
              this.verticalEdges[edgeKey] = verticalEdge;
            }
            node.addLeftEdge(edgeKey);
          } else if(nodeRight === surrLeft &&
              ((nodeTop <= surrTop && surrTop < nodeBottom) ||
              (nodeTop < surrBottom && surrBottom <= nodeBottom))) {
            const top = Math.max(nodeTop, surrTop);
            const edgeKey = `${surrLeft}-${top}`;
            if(!(edgeKey in this.verticalEdges)) {
              const verticalEdge = {
                nodes: [nodeKey, surrKey],
                top,
                bottom: Math.min(nodeBottom, surrBottom),
                left: surrLeft
              } as VerticalEdge;
              this.verticalEdges[edgeKey] = verticalEdge;
            }
            node.addRightEdge(edgeKey);
          }
        }
      });
      node.TopEdges.sort();
      node.RightEdges.sort();
      node.BottomEdges.sort();
      node.LeftEdges.sort();
    });
  }

  public getRowConfiguration(): string[][] {
    const originNode = this.nodesObject['0-0'];
    if(!originNode) {
      return [];
    }
    const configuration = [] as string[][];
    let leftNodes = ['0-0'];
    let currentNode = originNode;
    while(currentNode?.BottomEdges.length) {
      if(currentNode.RightEdges.length > 1) {
        leftNodes = [];
        break;
      } else {
        const [currentNodeKey, bottomNodeKey] = this.horizontalEdges[
          currentNode.BottomEdges[0]].nodes;
        leftNodes.push(currentNodeKey);
        currentNode = this.nodesObject[bottomNodeKey];
      }
    }
    let nodeCount = 0;
    leftNodes.forEach(leftNode => {
      const row = [leftNode];
      currentNode = this.nodesObject[leftNode];
      while(currentNode?.RightEdges.length) {
        const currentNodeKey = this.verticalEdges[currentNode.RightEdges[0]].nodes[1];
        currentNode = this.nodesObject[currentNodeKey];
        row.push(currentNodeKey);
      }
      nodeCount += row.length;
      configuration.push(row);
    });
    return nodeCount !== Object.keys(this.nodesObject).length ? [] : configuration;
  }

  public getColumnConfiguration(): string[][] {
    const originNode = this.nodesObject['0-0'];
    if(!originNode) {
      return [];
    }
    const configuration = [] as string[][];
    let topNodes = ['0-0'];
    let currentNode = originNode;
    while(currentNode?.RightEdges.length) {
      if(currentNode.BottomEdges.length > 1) {
        topNodes = [];
        break;
      } else {
        const [currentNodeKey, rightNodeKey] = this.verticalEdges[
          currentNode.RightEdges[0]].nodes;
        topNodes.push(currentNodeKey);
        currentNode = this.nodesObject[rightNodeKey];
      }
    }
    let nodeCount = 0;
    topNodes.forEach(topNode => {
      const column = [topNode];
      currentNode = this.nodesObject[topNode];
      while(currentNode?.BottomEdges.length) {
        const currentNodeKey = this.horizontalEdges[currentNode.BottomEdges[0]].nodes[1];
        currentNode = this.nodesObject[currentNodeKey];
        column.push(currentNodeKey);
      }
      nodeCount += column.length;
      configuration.push(column);
    });
    return nodeCount !== Object.keys(this.nodesObject).length ? [] : configuration;
  }

  public getRowConfigurationLimits(configuration: string[][]) {
    if(!configuration.length) {
      return {
        minimumWidth: MAX_SIZE,
        minimumHeight: MAX_SIZE,
        maximumWidth: 0,
        maximumHeight: 0
      };
    }
    const minimumRowWidths = [] as number[];
    const minimumRowHeights = [] as number[];
    const maximumRowWidths = [] as number[];
    const maximumRowHeights = [] as number[];
    configuration.forEach(row => {
      let minimumWidth = 0;
      let minimumHeight = 0;
      let maximumWidth = 0;
      let maximumHeight = MAX_SIZE;
      row.forEach(nodeKey => {
        minimumWidth += this.nodesObject[nodeKey].minimumWidth;
        minimumHeight = Math.max(minimumHeight, this.nodesObject[nodeKey].minimumHeight);
        maximumWidth += this.nodesObject[nodeKey].maximumWidth;
        maximumHeight = Math.min(maximumHeight, this.nodesObject[nodeKey].maximumHeight);
      });
      minimumRowWidths.push(minimumWidth);
      minimumRowHeights.push(minimumHeight);
      maximumRowWidths.push(maximumWidth);
      maximumRowHeights.push(maximumHeight);
    });
    const minimumWidth = Math.max(...minimumRowWidths);
    const minimumHeight = minimumRowHeights.reduce((sum, height) => sum + height, 0);
    const maximumWidth = Math.min(...maximumRowWidths, MAX_SIZE);
    const maximumHeight = Math.min(MAX_SIZE,
      maximumRowHeights.reduce((sum, height) => sum + height, 0));
    return {minimumWidth, minimumHeight, maximumWidth, maximumHeight};
  }

  public getColumnConfigurationLimits(configuration: string[][]) {
    if(!configuration.length) {
      return {
        minimumWidth: MAX_SIZE,
        minimumHeight: MAX_SIZE,
        maximumWidth: 0,
        maximumHeight: 0
      };
    }
    const minimumColumnWidths = [] as number[];
    const minimumColumnHeights = [] as number[];
    const maximumColumnWidths = [] as number[];
    const maximumColumnHeights = [] as number[];
    configuration.forEach(column => {
      let minimumHeight = 0;
      let minimumWidth = 0;
      let maximumHeight = 0;
      let maximumWidth = MAX_SIZE;
      column.forEach(node => {
        minimumHeight += this.nodesObject[node].minimumHeight;
        minimumWidth = Math.max(minimumWidth, this.nodesObject[node].minimumWidth);
        maximumHeight += this.nodesObject[node].maximumHeight;
        maximumWidth = Math.min(maximumWidth, this.nodesObject[node].maximumWidth);
      });
      minimumColumnHeights.push(minimumHeight);
      minimumColumnWidths.push(minimumWidth);
      maximumColumnHeights.push(maximumHeight);
      maximumColumnWidths.push(maximumWidth);
    });
    const minimumHeight = Math.max(...minimumColumnHeights);
    const minimumWidth = minimumColumnWidths.reduce((sum, width) => sum + width, 0);
    const maximumHeight = Math.min(...maximumColumnHeights, MAX_SIZE);
    const maximumWidth = Math.min(MAX_SIZE,
      maximumColumnWidths.reduce((sum, width) => sum + width, 0));
    return {minimumHeight, minimumWidth, maximumHeight, maximumWidth};
  }

  public fixUnalignedRows() {
    const unalignedRows = this.getUnalignedRows();
    const alignedRows = this.getResizedRows(unalignedRows);
    this.resizedRows = alignedRows;
  }

  public getUnalignedRows() {
    const originNode = this.nodesObject['0-0'];
    if(!originNode) {
      return [];
    }
    const leftNodes = (() => {
      const nodeKeys = ['0-0'];
      let currentNode = originNode;
      while(currentNode?.BottomEdges.length) {
        const currentNodeKey = this.horizontalEdges[currentNode.BottomEdges[0]].nodes[1];
        currentNode = this.nodesObject[currentNodeKey];
        nodeKeys.push(currentNodeKey);
      }
      return nodeKeys;
    })();
    const rowConfiguration = [] as string[][];
    if(leftNodes.length) {
      const visitedNodes = {} as {[key: string]: boolean};
      leftNodes.forEach(nodeKey => {
        visitedNodes[nodeKey] = true;
        const row = [nodeKey];
        let currentNode = this.nodesObject[nodeKey];
        while(currentNode.RightEdges.length) {
          const rightEdgeNodeKeys = currentNode.RightEdges.map(edgeKey =>
            this.verticalEdges[edgeKey].nodes[1]);
          const rightEdgeNodeKey = rightEdgeNodeKeys.find(nodeKey =>
            !(nodeKey in visitedNodes));
          if(rightEdgeNodeKey) {
            row.push(rightEdgeNodeKey);
            visitedNodes[rightEdgeNodeKey] = true;
            currentNode = this.nodesObject[rightEdgeNodeKey];
          } else {
            break;
          }
        }
        rowConfiguration.push(row);
      });
      if(Object.keys(visitedNodes).length === Object.keys(this.nodesObject).length) {
        return rowConfiguration;
      }
    }
    return [];
  }

  public getResizedRows(rows: string[][]) {
    const updatedRectangles = [] as Rectangle[];
    let top = 0;
    const minimumRowWidths = [];
    const maximumRowWidths = [];
    for(let i = 0; i < rows.length; ++i) {
      const nodeRow = rows[i].map(nodeKey => this.nodesObject[nodeKey]);
      let fixedHeight = 0;
      let areFixedHeightsEqual = true;
      let minimumFlexibleHeight = MAX_SIZE;
      let minimumWidth = 0;
      let maximumWidth = 0;
      let compressableWidth = 0;
      for(let j = 0; j < nodeRow.length; ++j) {
        compressableWidth += nodeRow[j].compressableWidth;
        minimumWidth += nodeRow[j].minimumWidth;
        maximumWidth += nodeRow[j].maximumWidth;
        if(nodeRow[j].Rectangle.verticalPolicy === Constraint.FIXED) {
          if(fixedHeight === 0) {
            fixedHeight = nodeRow[j].Rectangle.height;
          } else if(fixedHeight !== nodeRow[j].Rectangle.height) {
            areFixedHeightsEqual = false;
            break;
          }
        } else if(nodeRow[j].Rectangle.verticalPolicy === Constraint.FILL_SPACE) {
          minimumFlexibleHeight = Math.min(minimumFlexibleHeight, nodeRow[j].Rectangle.height)
        }
      };
      if(!areFixedHeightsEqual || !compressableWidth) {
        break;
      }
      const rectRow = [] as Rectangle[];
      const rowHeight = fixedHeight || minimumFlexibleHeight;
      let left = 0;
      nodeRow.forEach(node => {
        const rect = {...node.Rectangle, top, left, height: rowHeight};
        rectRow.push(rect);
        left += rect.width;
      });
      top += rowHeight;
      if(rectRow.length === rows[i].length) {
        updatedRectangles.push(...rectRow);
        minimumRowWidths.push(minimumWidth);
        maximumRowWidths.push(maximumWidth);
      } else {
        break;
      }
    }
    if(updatedRectangles.length &&
        updatedRectangles.length === Object.keys(this.nodesObject).length) {
      this.minimumWidth = Math.max(...minimumRowWidths);
      this.maximumWidth = Math.min(MAX_SIZE, ...maximumRowWidths);
      return updatedRectangles;
    } else {
      return [];
    }
  }

  public fixUnalignedColumns() {
    const unalignedColumns = this.getUnalignedColumns();
    const alignedColumns = this.getResizedColumns(unalignedColumns);
    this.resizedColumns = alignedColumns;
  }

  public getUnalignedColumns() {
    const originNode = this.nodesObject['0-0'];
    if(!originNode) {
      return [];
    }
    const topNodes = (() => {
      const nodeKeys = ['0-0'];
      let currentNode = originNode;
      while(currentNode?.RightEdges.length) {
        const currentNodeKey = this.verticalEdges[currentNode.RightEdges[0]].nodes[1];
        currentNode = this.nodesObject[currentNodeKey];
        nodeKeys.push(currentNodeKey);
      }
      return nodeKeys;
    })();
    const columnConfiguration = [] as string[][];
    if(topNodes.length) {
      const visitedNodes = {} as {[key: string]: boolean};
      topNodes.forEach(nodeKey => {
        visitedNodes[nodeKey] = true;
        const column = [nodeKey];
        let currentNode = this.nodesObject[nodeKey];
        while(currentNode.BottomEdges.length) {
          const bottomEdgeNodeKeys = currentNode.BottomEdges.map(edgeKey =>
            this.horizontalEdges[edgeKey].nodes[1]);
          const bottomEdgeNodeKey = bottomEdgeNodeKeys.find(nodeKey =>
            !(nodeKey in visitedNodes));
          if(bottomEdgeNodeKey) {
            column.push(bottomEdgeNodeKey);
            visitedNodes[bottomEdgeNodeKey] = true;
            currentNode = this.nodesObject[bottomEdgeNodeKey];
          } else {
            break;
          }
        }
        columnConfiguration.push(column);
      });
      if(Object.keys(visitedNodes).length === Object.keys(this.nodesObject).length) {
        return columnConfiguration;
      }
    }
    return [];
  }

  public getResizedColumns(columns: string[][]) {
    const updatedRectangles = [] as Rectangle[];
    let left = 0;
    const minimumColumnHeights = [];
    const maximumColumnHeights = [];
    for(let i = 0; i < columns.length; ++i) {
      const nodeColumn = columns[i].map(nodeKey => this.nodesObject[nodeKey]);
      let fixedWidth = 0;
      let areFixedWidthsEqual = true;
      let minimumFlexibleWidth = MAX_SIZE;
      let minimumHeight = 0;
      let maximumHeight = 0;
      let compressableHeight = 0;
      for(let j = 0; j < nodeColumn.length; ++j) {
        compressableHeight += nodeColumn[j].compressableHeight;
        minimumHeight += nodeColumn[j].minimumHeight;
        maximumHeight += nodeColumn[j].maximumHeight;
        if(nodeColumn[j].Rectangle.horizontalPolicy === Constraint.FIXED) {
          if(fixedWidth === 0) {
            fixedWidth = nodeColumn[j].Rectangle.width;
          } else if(fixedWidth !== nodeColumn[j].Rectangle.width) {
            areFixedWidthsEqual = false;
            break;
          }
        } else if(nodeColumn[j].Rectangle.horizontalPolicy === Constraint.FILL_SPACE) {
          minimumFlexibleWidth = Math.min(minimumFlexibleWidth, nodeColumn[j].Rectangle.width)
        }
      };
      if(!areFixedWidthsEqual || !compressableHeight) {
        break;
      }
      const rectColumn = [] as Rectangle[];
      const columnWidth = fixedWidth || minimumFlexibleWidth;
      let top = 0;
      nodeColumn.forEach(node => {
        const rect = {...node.Rectangle, left, top, width: columnWidth};
        rectColumn.push(rect);
        top += rect.height;
      });
      left += columnWidth;
      if(rectColumn.length === columns[i].length) {
        updatedRectangles.push(...rectColumn);
        minimumColumnHeights.push(minimumHeight);
        maximumColumnHeights.push(maximumHeight);
      } else {
        break;
      }
    }
    if(updatedRectangles.length &&
        updatedRectangles.length === Object.keys(this.nodesObject).length) {
      this.minimumHeight = Math.max(...minimumColumnHeights);
      this.maximumHeight = Math.min(MAX_SIZE, ...maximumColumnHeights);
      return updatedRectangles;
    } else {
      return [];
    }
  }

  public getNameMatrix(configuration: LayoutNode[][]) {
    return configuration.map(list => list.map(node => node.Rectangle.name));
  }

  public get MinimumWidth(): number {
    return this.minimumWidth;
  }

  public get MinimumHeight(): number {
    return this.minimumHeight;
  }

  public get MaximumWidth(): number {
    return this.maximumWidth;
  }

  public get MaximumHeight(): number {
    return this.maximumHeight;
  }

  public get ResizedRows(): Rectangle[] {
    return this.resizedRows;
  }

  public get ResizedColumns(): Rectangle[] {
    return this.resizedColumns;
  }

  private nodesObject: {[key: string]: LayoutNode};
  private rowConfiguration: string[][];
  private columnConfiguration: string[][];
  private resizedRows: Rectangle[];
  private resizedColumns: Rectangle[];
  private rowLimits: Limits;
  private columnLimits: Limits;
  private minimumWidth: number;
  private minimumHeight: number;
  private maximumWidth: number;
  private maximumHeight: number;
  private boundaryX: number;
  private boundaryY: number;
  private horizontalEdges: {[key: string]: HorizontalEdge};
  private verticalEdges: {[key: string]: VerticalEdge};
}

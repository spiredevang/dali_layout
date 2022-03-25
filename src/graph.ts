import {Constraint, Rectangle} from './rectangle';

const MAX_SIZE = 2**24;

interface HorizontalEdge {
  nodes: [LayoutNode, LayoutNode];
  left: number;
  right: number;
  top: number;
}

interface VerticalEdge {
  nodes: [LayoutNode, LayoutNode];
  top: number;
  bottom: number;
  left: number;
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
    this.nodes = rectangles.map(rectangle => new LayoutNode(rectangle));
    this.horizontalEdges = {};
    this.verticalEdges = {};
    this.boundaryX = 0;
    this.boundaryY = 0;
    this.rowConfiguration = [];
    this.columnConfiguration = [];
    this.minimumWidth = 0;
    this.minimumHeight = 0;
    this.maximumWidth = MAX_SIZE;
    this.maximumHeight = MAX_SIZE;
    this.nodes.forEach((node, nodeIndex) => {
      this.boundaryX = Math.max(node.Rectangle.left + node.Rectangle.width, this.boundaryX);
      this.boundaryY = Math.max(node.Rectangle.top + node.Rectangle.height, this.boundaryY);
      const nodeLeft = node.Rectangle.left;
      const nodeRight = node.Rectangle.left + node.Rectangle.width;
      const nodeTop = node.Rectangle.top;
      const nodeBottom = node.Rectangle.top + node.Rectangle.height;
      this.nodes.forEach((surr, surroundingIndex) => {
        if(surroundingIndex !== nodeIndex) {
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
                nodes: [surr, node],
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
                nodes: [node, surr],
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
                nodes: [surr, node],
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
                nodes: [node, surr],
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
    });
    this.originNodeIndex = this.nodes.findIndex((node: LayoutNode) =>
      (node.Rectangle.left === 0) && (node.Rectangle.top === 0));
    this.rowConfiguration = this.getRowConfiguration();
    this.columnConfiguration = this.getColumnConfiguration();
    const rowLimits = this.getRowConfigurationLimits(this.rowConfiguration);
    const columnLimits = this.getColumnConfigurationLimits(this.columnConfiguration);
    this.minimumWidth = Math.min(rowLimits.minimumWidth, columnLimits.minimumWidth);
    this.minimumHeight = Math.min(rowLimits.minimumHeight, columnLimits.minimumHeight);
    this.maximumWidth = Math.max(rowLimits.maximumWidth, columnLimits.maximumWidth);
    this.maximumHeight = Math.max(rowLimits.maximumHeight, columnLimits.maximumHeight);
  }

  public getRowConfiguration(): LayoutNode[][] {
    const configuration = [] as LayoutNode[][];
    const originNode = this.nodes[this.originNodeIndex];
    let leftNodes = [originNode];
    let currentNode = originNode;
    while(currentNode?.BottomEdges.length) {
      currentNode = (() => {
        if(currentNode.BottomEdges.length === 1) {
          return this.horizontalEdges[currentNode.BottomEdges[0]].nodes[1];
        } else {
          const leftEdgeIndex = currentNode.BottomEdges.reduce(
            (prevEdgeKey, edgeKey) => {
              const prevKeyX = prevEdgeKey.split('-')[0];
              const edgeKeyX = edgeKey.split('-')[0];
              return edgeKeyX < prevKeyX ? edgeKey : prevEdgeKey;
          });
          return this.horizontalEdges[leftEdgeIndex].nodes[1];
        }
      })();
      if(currentNode.RightEdges.length > 1) {
        leftNodes = [];
        break;
      } else {
        leftNodes.push(currentNode);
      }
    }
    let nodeCount = 0;
    leftNodes.forEach(leftNode => {
      const row = [leftNode];
      currentNode = leftNode
      while(currentNode?.RightEdges.length) {
        currentNode = this.verticalEdges[currentNode.RightEdges[0]].nodes[1];
        row.push(currentNode);
      }
      nodeCount += row.length;
      configuration.push(row);
    });
    return nodeCount !== this.nodes.length ? [] : configuration;
  }

  public getColumnConfiguration(): LayoutNode[][] {
    const configuration = [] as LayoutNode[][];
    const originNode = this.nodes[this.originNodeIndex];
    let topNodes = [originNode];
    let currentNode = originNode;
    while(currentNode?.RightEdges.length) {
      currentNode = (() => {
        if(currentNode.RightEdges.length === 1) {
          return this.verticalEdges[currentNode.RightEdges[0]].nodes[1];
        } else {
          const topEdgeIndex = currentNode.RightEdges.reduce(
            (prevEdgeKey, edgeKey) => {
              const prevKeyY = prevEdgeKey.split('-')[1];
              const edgeKeyY = edgeKey.split('-')[1];
              return edgeKeyY < prevKeyY ? edgeKey : prevEdgeKey;
          });
          return this.verticalEdges[topEdgeIndex].nodes[1];
        }
      })();
      if(currentNode.BottomEdges.length > 1) {
        topNodes = [];
        break;
      } else {
        topNodes.push(currentNode);
      }
    }
    let nodeCount = 0;
    topNodes.forEach(topNode => {
      const column = [topNode];
      currentNode = topNode
      while(currentNode?.BottomEdges.length) {
        currentNode = this.horizontalEdges[currentNode.BottomEdges[0]].nodes[1];
        column.push(currentNode);
      }
      nodeCount += column.length;
      configuration.push(column);
    });
    return nodeCount !== this.nodes.length ? [] : configuration;
  }

  public getRowConfigurationLimits(configuration: LayoutNode[][]) {
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
      row.forEach(node => {
        minimumWidth += node.minimumWidth;
        minimumHeight = Math.max(minimumHeight, node.minimumHeight);
        maximumWidth += node.maximumWidth;
        maximumHeight = Math.min(maximumHeight, node.maximumHeight);
      });
      minimumRowWidths.push(minimumWidth);
      minimumRowHeights.push(minimumHeight);
      maximumRowWidths.push(maximumWidth);
      maximumRowHeights.push(maximumHeight);
    });
    const minimumWidth = Math.max(...minimumRowWidths);
    const minimumHeight = minimumRowHeights.reduce((sum, height) => sum + height, 0);
    const maximumWidth = Math.min(...maximumRowWidths);
    const maximumHeight = Math.min(MAX_SIZE,
      maximumRowHeights.reduce((sum, height) => sum + height, 0));
    return {minimumWidth, minimumHeight, maximumWidth, maximumHeight};
  }

  public getColumnConfigurationLimits(configuration: LayoutNode[][]) {
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
        minimumHeight += node.minimumHeight;
        minimumWidth = Math.max(minimumWidth, node.minimumWidth);
        maximumHeight += node.maximumHeight;
        maximumWidth = Math.min(maximumWidth, node.maximumWidth);
      });
      minimumColumnHeights.push(minimumHeight);
      minimumColumnWidths.push(minimumWidth);
      maximumColumnHeights.push(maximumHeight);
      maximumColumnWidths.push(maximumWidth);
    });
    const minimumHeight = Math.max(...minimumColumnHeights);
    const minimumWidth = minimumColumnWidths.reduce((sum, width) => sum + width, 0);
    const maximumHeight = Math.min(...maximumColumnHeights);
    const maximumWidth = Math.min(MAX_SIZE,
      maximumColumnWidths.reduce((sum, width) => sum + width, 0));
    return {minimumHeight, minimumWidth, maximumHeight, maximumWidth};
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

  private nodes: LayoutNode[];
  private originNodeIndex: number;
  private rowConfiguration: LayoutNode[][];
  private columnConfiguration: LayoutNode[][];
  private minimumWidth: number;
  private minimumHeight: number;
  private maximumWidth: number;
  private maximumHeight: number;
  private boundaryX: number;
  private boundaryY: number;
  private horizontalEdges: {[key: string]: HorizontalEdge};
  private verticalEdges: {[key: string]: VerticalEdge};
}

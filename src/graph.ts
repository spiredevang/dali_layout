import {Rectangle} from './rectangle';

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

  public getNameMatrix(configuration: LayoutNode[][]) {
    return configuration.map(list => list.map(node => node.Rectangle.name));
  }

  private nodes: LayoutNode[];
  private originNodeIndex: number;
  private rowConfiguration: LayoutNode[][];
  private columnConfiguration: LayoutNode[][];
  private boundaryX: number;
  private boundaryY: number;
  private horizontalEdges: {[key: string]: HorizontalEdge};
  private verticalEdges: {[key: string]: VerticalEdge};
}

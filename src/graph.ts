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
    this.nodes.forEach((node, nodeIndex) => {
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
            const edgeKey = `${node.Rectangle.left}-${nodeTop}`;
            if(!(edgeKey in this.verticalEdges)) {
              const verticalEdge = {
                nodes: [surr, node],
                top: Math.max(nodeTop, surrTop),
                bottom: Math.min(nodeBottom, surrBottom),
                left: node.Rectangle.left
              } as VerticalEdge;
              this.verticalEdges[edgeKey] = verticalEdge;
            }
            node.addLeftEdge(edgeKey);
          } else if(nodeRight === surrLeft &&
              ((nodeTop <= surrTop && surrTop < nodeBottom) ||
              (nodeTop < surrBottom && surrBottom <= nodeBottom))) {
            const edgeKey = `${surrLeft}-${nodeTop}`;
            if(!(edgeKey in this.verticalEdges)) {
              const verticalEdge = {
                nodes: [node, surr],
                top: Math.max(nodeTop, surrTop),
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
  }

  private nodes: LayoutNode[];
  private originNodeIndex: number;
  private horizontalEdges: {[key: string]: HorizontalEdge};
  private verticalEdges: {[key: string]: VerticalEdge};
}

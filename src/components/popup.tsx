import * as React from 'react';
import ReactDOM from 'react-dom';

interface Properties {
  width?: number;
  height?: number;
  onClosePopup: () => void;
}

interface State {
  container: any;
  popupWindow: Window;
}

/** The popup component. */
export class Popup extends React.Component<Properties, State> {
  public static readonly defaultProps: {
    width: 1000,
    height: 500;
  }

  constructor(props: Properties) {
    super(props);
    this.state = {container: null, popupWindow: window};
  }

  public render(): JSX.Element {
    if(!this.state.container) {
      return <></>;
    } 
    return ReactDOM.createPortal(this.props.children, this.state.container);  
  }

  public componentDidMount(): void {
    const {width, height} = this.props;
    const popupWindow = this.state.popupWindow.open(
      '', '', `width=${width},height=${height}`) as Window;
    const container = document.createElement('div');
    popupWindow.document.body.appendChild(container);
    this.setState({container, popupWindow});
    popupWindow.addEventListener('beforeunload', this.props.onClosePopup);
    copyStyles(document, popupWindow.document);
    container.setAttribute('style', 'height: 100%;');
  }

  public componentWillUnmount(): void {
    this.state.popupWindow.close();
  }
}

function copyStyles(sourceDoc: Document, targetDoc: Document) {
  Array.from(sourceDoc.styleSheets).forEach(styleSheet => {
    if(styleSheet.cssRules) {
      const newStyleEl = targetDoc.createElement('style');
      Array.from(styleSheet.cssRules).forEach(cssRule => {
        newStyleEl.appendChild(targetDoc.createTextNode(cssRule.cssText));
      });
      targetDoc.head.appendChild(newStyleEl);
    } else if(styleSheet.href) {
      const newLinkEl = targetDoc.createElement('link');
      newLinkEl.rel = 'stylesheet';
      newLinkEl.href = styleSheet.href;
      targetDoc.head.appendChild(newLinkEl);
    }
  });
}

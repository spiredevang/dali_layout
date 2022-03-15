import * as React from 'react';

interface Properties {}

interface State {
  jsonContents: any;
}

/** The home page component. */
export class HomePage extends React.Component<Properties, State> {
  constructor(props: Properties) {
    super(props)
    this.state = {jsonContents: {}};
  }

  public render(): JSX.Element {
    console.log('render', this.state.jsonContents);
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

  private onLoad = (e: any) => {
    const contents = e.target.result;
    const jsonContents = JSON.parse(contents);
    this.setState({jsonContents})
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

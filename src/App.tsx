import {HomePage} from './components';

function App() {
  return (
    <div style={STYLE.container}>
      <HomePage/>
    </div>
  );
}

const STYLE = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    paddingTop: 50
  } as React.CSSProperties
}

export default App;

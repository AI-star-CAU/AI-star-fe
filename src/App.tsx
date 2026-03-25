// src/App.tsx

function App() {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh', 
      backgroundColor: '#f0f0f0' 
    }}>
      {/* PM이 요청한 바로 그 정사각형 */}
      <div style={{ 
        width: '200px', 
        height: '200px', 
        backgroundColor: '#393e9a'
      }}></div>
    </div>
  );
}

export default App;
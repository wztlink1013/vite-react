import { useState } from "react";

function App() {
  console.info('[App render]');
  const [count, setCount] = useState(0);
  const addCount = () => {
    setCount(count + 1)
  }
  return (
    <button className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded" onClick={addCount}>count: {count}</button>
  );
}

export default App;

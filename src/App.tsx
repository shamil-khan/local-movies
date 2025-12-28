import { useState } from 'react';
import '@/App.css';

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <h1 className='text-red-600'>Hello Tailwind</h1>
      <div className='card'>
        <button
          onClick={() => setCount((count) => count + 1)}
          className='px-4 py-2 font-bold text-white bg-blue-600 rounded hover:bg-blue-700'>
          count is {count}
        </button>
      </div>
    </>
  );
}

export default App;

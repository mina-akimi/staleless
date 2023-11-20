# staleless
Zero dependency lib to solve stale state in React

Problems this solves:
1. Stale state in React, see this [codepen](https://codepen.io/ryan200888/pen/PoVRYro).
2. Cannot use `async` functions to update state. 

# How to use

```jsx
// Component.js
import { useState, useRef } from 'react';
import { Mutex, getValueFromSetState } from '@mina-akimi/staleless';

// An example async function to get delta
const getDelta = async () => {
  // Return a random number from internet
};

export const Component = () => {
  const [amount, setAmount] = useState(0);
  const [delta, setDelta] = useState(0);
  const mutex = useRef(new Mutex());
  
  // increment never gets stale closure.
  const increment = useCallback(async () => {
    // Must lock to prevent concurrent access and race condition.
    await mutex.current.lock();
    try {
        const currentAmount = await getValueFromSetState(setAmount);
        const currentDelta = await getValueFromSetState(setDelta);
        
        // Can use async function
        const newDelta = await getDelta();
        
        // Only update delta if it's bigger than currentDelta
        if (newDelta > currentDelta) {
          setAmount(currentAmount + newDelta);
        }
    } finally {
      mutex.current.unlock();
    }
  }, []); // No dependencies

  const incrementTen = useCallback(async () => {
    // Can be safely used in a loop.
    for (let i = 0; i < 10; i++) {
      // This never gets stale.
      // But be careful: this can get interleaved with other calls to incrementTen.
      await increment();
    }
  }, [increment]);
  
  return (
    <div>
      <div>amount: {amount}</div>
      <div>delta: {delta}</div>
      <button onClick={increment}>Increment</button>
      <button onClick={incrementTen}>Increment 10</button>
    </div>
  );
};
```


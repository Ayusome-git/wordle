import { useEffect, useRef, useState } from 'react'
import './App.css'
import { CircleQuestionMarkIcon} from 'lucide-react';

function App() {
  const [solution, setSolution] = useState('');
  const [guess, setGuess] = useState(Array(5).fill(null));
  const [currentGuess, setCurrentGuess] = useState('');
  const [currentGuessIndex, setCurrentGuessIndex] = useState(0);
  const [gameEnded, setGameEnded] = useState(false);
  const [instructionOpen, setInstructionOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(()=>{
    fetch('/words.txt')
      .then(res => res.text())
      .then(text => {
        const words = text.split('\n').map(w => w.trim()).filter(Boolean);
        const randomWord = words[Math.floor(Math.random() * words.length)];
        setSolution(randomWord);
      });
  },[]);

  const focusInput = () => {
    inputRef.current?.focus();
  };

  // Handle input changes (for mobile and desktop)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^a-zA-Z]/g, '').toLowerCase();
    if (value.length > 5) value = value.slice(0, 5);
    setCurrentGuess(value);
  };

  // Handle Enter and Backspace for the input
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (gameEnded) return;
    if (e.key === 'Enter' && currentGuess.length === 5) {
      const nextIndex = guess.findIndex(g => g == null);
      if (nextIndex !== -1) {
        const guessClone = [...guess];
        guessClone[nextIndex] = currentGuess;
        setGuess(guessClone);
        setCurrentGuess('');
        setCurrentGuessIndex(nextIndex + 1);
        if (guessClone.includes(solution)) {
          setTimeout(() => {
            alert("congrats");
            setGameEnded(true);
          }, 500);
        }
      }
      e.preventDefault();
    }
    // No need to handle Backspace here, input handles it natively
  };

  useEffect(()=>{
    if(currentGuessIndex === 5 && !guess.includes(solution)){
      setTimeout(() => {
        alert(`Game over! The correct word was: ${solution}`);
      }, 200);
      setGameEnded(true);
    }
  },[guess, currentGuessIndex, solution])

  if(solution === null) return null;

  type GuessLineProps = {
    g: string;
    solution: string;
    isFinal: boolean;
  };

  function GuessLine({ g, solution, isFinal }: GuessLineProps) {
    return (
      <div className="flex gap-5 m-auto">
        {g.split('').map((char, i) => {
          let className = 'w-10 h-10 border-solid outline flex capitalize justify-center text-center items-center text-3xl';
          if (isFinal) {
            if (char === solution[i]) {
              className += ' bg-green-500';
            } else if (solution.includes(char)) {
              className += ' bg-yellow-500';
            }
            else{
              className +=' bg-gray-700'
            }
          }
          return <div key={i} className={className}>{char}</div>;
        })}
      </div>
    );
  }

  return (
    <div className='w-fit h-fit'>
      <div className='flex justify-center items-center'>
        <div className='text-7xl pb-3'>Wordle</div>
        {instructionOpen && <div className="flex justify-end inset-10 z-10 fixed items-center sm:z-50">
          <img
            onClick={()=>setInstructionOpen(false)}
            src="instruction.jpg"
            alt="Instructions"
            className="mx-auto sm:max-w-lg cursor-pointer"
          />
        </div>}
        <div className='pl-4 cursor-pointer' onClick={()=>{setInstructionOpen(true)}}><CircleQuestionMarkIcon/></div>
      </div>
      <div className='flex flex-col gap-4 p-4' onClick={focusInput}>
        {/* Hidden input for mobile keyboard */}
        <input
          ref={inputRef}
          type="text"
          inputMode="text"
          autoFocus
          maxLength={5}
          value={currentGuess}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          style={{
            position: 'absolute',
            opacity: 0,
            pointerEvents: 'none',
            height: 0,
            width: 0,
          }}
          tabIndex={-1}
        />
        {
          guess.map((g, i) => {
            // Show currentGuess in the first empty row only
            const firstEmpty = guess.findIndex(x => x == null);
            const display = (i === firstEmpty) ? currentGuess.padEnd(5) : (g ?? '').padEnd(5);
            return (
              <GuessLine
                key={i}
                g={display}
                solution={solution}
                isFinal={i < currentGuessIndex}
              />
            );
          })
        }
      </div>
      <div className='pt-2'>
        <button onClick={()=>{window.location.reload()}}>{gameEnded?"Play Again":"Refresh"}</button>
      </div>
    </div>
  )
}

export default App

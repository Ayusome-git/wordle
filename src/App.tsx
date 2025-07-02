import { useEffect, useState } from 'react'
import './App.css'
import { CircleQuestionMarkIcon} from 'lucide-react';



function App() {
  const [solution, setSolution] = useState('');
  const [guess, setGuess] = useState(Array(6).fill(null));
  const [currentGuess, setCurrentGuess] = useState('');
  const [currentGuessIndex, setCurrentGuessIndex] = useState(0);
  const [gameEnded, setGameEnded] = useState(false);
  const [instructionOpen, setInstructionOpen] = useState(false);
  useEffect(()=>{
    fetch('/words.txt')
      .then(res => res.text())
      .then(text => {
        const words = text.split('\n').map(w => w.trim()).filter(Boolean);
        const randomWord = words[Math.floor(Math.random() * words.length)];
        setSolution(randomWord);
      });
  },[]);

  useEffect(()=>{
    const onKeyPress = (event: KeyboardEvent) => {
      if (
        event.key === 'Enter' &&
        document.activeElement &&
        (document.activeElement as HTMLElement).tagName !== 'INPUT'
      ) {
        if (currentGuess.length === 5 && !gameEnded) {
          const nextIndex = guess.findIndex(g => g == null);
          if (nextIndex !== -1) {
            const guessClone = [...guess];
            guessClone[nextIndex] = currentGuess;
            setGuess(guessClone);
            setCurrentGuessIndex(nextIndex + 1);
            if (guessClone.includes(solution)) {
              setTimeout(() => {
                alert("congrats");
                setGameEnded(true);
              }, 500);
            }
          }
          setCurrentGuess('');
        }
      }
    };

    window.addEventListener('keydown', onKeyPress);
    return () => window.removeEventListener('keydown', onKeyPress);
  }, [solution, guess, gameEnded, currentGuess])

  useEffect(()=>{
    if (currentGuessIndex === 6 && !guess.includes(solution)) { 
      setTimeout(() => {
        alert(`Game over! The correct word was: ${solution}`);
      }, 200);
      setGameEnded(true);
    }
  }, [guess])
  if(solution===null) return null;

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
    <div className='max-w-screen max-h-screen'>
      <div className='flex justify-center items-center'>
      <div className='text-7xl pb-3'>Wordle</div>
      {instructionOpen && <div className="flex justify-end inset-10 z-10 fixed items-center sm:z-50">
        <img
        onClick={()=>setInstructionOpen(!instructionOpen)}
          src="instruction.jpg"
          alt="Instructions"
          className="mx-auto sm:max-w-lg cursor-pointer"
        />
      </div>}
      <div className='pl-4 cursor-pointer' onClick={()=>{setInstructionOpen(!instructionOpen)}}><CircleQuestionMarkIcon/></div>
      </div>
      <div className='flex flex-col gap-4 p-4'>
        <input
          type="text"
          inputMode="text"
          maxLength={5}
          autoFocus
          value={currentGuess}
          onChange={e => {
            const value = e.target.value.replace(/[^a-zA-Z]/g, '').toLowerCase().slice(0, 5);
            setCurrentGuess(value);
          }}
          onKeyDown={e => {
            if (e.key === 'Enter' && currentGuess.length === 5 && !gameEnded) {
              const nextIndex = guess.findIndex(g => g == null);
              if (nextIndex !== -1) {
                const guessClone = [...guess];
                guessClone[nextIndex] = currentGuess;
                setGuess(guessClone);
                setCurrentGuessIndex(nextIndex + 1);
                if (guessClone.includes(solution)) {
                  setTimeout(() => {
                    alert("congrats");
                    setGameEnded(true);
                  }, 500);
                }
              }
              setCurrentGuess('');
            }
          }}
          className="border rounded p-2 text-2xl mb-4 mx-auto text-center fixed h-80 w-72 cursor-none pr-5 opacity-0"
          placeholder="Type here"
          style={{ letterSpacing: '0.5em' }}
        />
        {
          guess.map((g, i) => {
            return (
              <GuessLine
                key={i}
                g={(i === currentGuessIndex ? currentGuess : g ?? '').padEnd(5)}
                solution={solution}
                isFinal={currentGuessIndex > i || currentGuessIndex === -1}
              />
            );
          })
        }
      </div>
      <div className='flex justify-center items-center'>
      <div className='pt-15 absolute'>
      <button onClick={()=>{window.location.reload()}}>{gameEnded?"Play Again":"Reset"}</button>
      </div>
      </div>
      
      
    </div>
  )
}

export default App

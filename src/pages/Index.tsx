
import { useEffect, useState, useRef } from 'react';
import { Bird } from '@/components/Bird';
import { Pipe } from '@/components/Pipe';

// Faster movement
const GRAVITY = 0.3;
const JUMP_FORCE = -10;    
const FLAP_INCREMENT = -3; 

const PIPE_GAP = 150;


const PIPE_WIDTHS = {
  easy: 40,    
  medium: 64, 
  hard: 80,    
};

const backgrounds = [
  'bg-gradient-to-b from-sky-400 to-sky-200',
  'bg-gradient-to-b from-orange-400 to-yellow-200',
  'bg-gradient-to-b from-purple-400 to-pink-200',
];

const difficulties = {
  easy: { speed: 2, gap: 220 },
  medium: { speed: 3, gap: 150 },
  hard: { speed: 4, gap: 120 },
};

const Index = () => {
  const [menuOpen, setMenuOpen] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [birdPosition, setBirdPosition] = useState(300);
  const [birdVelocity, setBirdVelocity] = useState(0);
  const [birdRotation, setBirdRotation] = useState(0);
  const [pipes, setPipes] = useState<{ x: number; height: number }[]>([]);
  const [backgroundIndex, setBackgroundIndex] = useState(0);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  
  const gameLoopId = useRef<number>();
  const lastPipeTime = useRef(0);

  // Compute pipeWidth for current difficulty
  const pipeWidth = PIPE_WIDTHS[difficulty];

  const resetGameState = () => {
    setGameStarted(false);
    setGameOver(false);
    setBirdPosition(300);
    setBirdVelocity(0);
    setBirdRotation(0);
    setScore(0);
    setPipes([]);
  };

  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setMenuOpen(false);
    setBirdPosition(300);
    setBirdVelocity(0);
    setBirdRotation(0);
    setScore(0);
    setPipes([]);
    lastPipeTime.current = Date.now();
  };

  const backToMenu = () => {
    setMenuOpen(true);
    resetGameState();
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowUp' || e.key === ' ') {
      if (menuOpen) {
        setMenuOpen(false);
        startGame();
      } else if (!gameStarted) {
        startGame();
      } else if (!gameOver) {
        setBirdVelocity(prev => (prev < 0 ? prev + FLAP_INCREMENT : JUMP_FORCE));
        setBirdRotation(-28);
      }
    }
    if ((e.key === 'Escape' || e.key === 'q') && gameStarted && !gameOver) {
      backToMenu();
    }
  };

  // Adjust pipe width in collision detection now
  const checkCollision = (birdY: number, pipes: { x: number; height: number }[]) => {
    const birdRect = {
      left: window.innerWidth / 4,
      right: window.innerWidth / 4 + 32,
      top: birdY,
      bottom: birdY + 32,
    };

    return pipes.some(pipe => {
      const topPipeRect = {
        left: pipe.x,
        right: pipe.x + pipeWidth,
        top: 0,
        bottom: pipe.height,
      };

      const bottomPipeRect = {
        left: pipe.x,
        right: pipe.x + pipeWidth,
        top: pipe.height + difficulties[difficulty].gap,
        bottom: window.innerHeight,
      };

      return (
        birdRect.right > topPipeRect.left &&
        birdRect.left < topPipeRect.right &&
        (birdRect.top < topPipeRect.bottom || birdRect.bottom > bottomPipeRect.top)
      );
    });
  };

  useEffect(() => {
    const handleGameLoop = () => {
      if (!gameStarted || gameOver) return;

      let newPosition = birdPosition + birdVelocity;
      let newVelocity = birdVelocity + GRAVITY;
      let newRotation = birdRotation + (birdVelocity > 0 ? 2.2 : 3.5);
      newRotation = Math.min(90, newRotation);

      const now = Date.now();
      const newPipes = [...pipes];
      
      if (now - lastPipeTime.current > 1500) {
        newPipes.push({
          x: window.innerWidth,
          height: Math.random() * (window.innerHeight - 200 - difficulties[difficulty].gap) + 100,
        });
        lastPipeTime.current = now;
      }

     
      newPipes.forEach(pipe => {
        pipe.x -= difficulties[difficulty].speed;
      });

      
      const filteredPipes = newPipes.filter(pipe => pipe.x > -pipeWidth);

      
      const passedPipe = newPipes.find(
        pipe =>
          pipe.x + pipeWidth < window.innerWidth / 4 &&
          pipe.x + pipeWidth > window.innerWidth / 4 - difficulties[difficulty].speed
      );
      
      if (passedPipe) {
        setScore(s => s + 1);
      }

      if (
        newPosition < 0 ||
        newPosition > window.innerHeight - 32 ||
        checkCollision(newPosition, newPipes)
      ) {
        setGameOver(true);
        return;
      }

      setBirdPosition(newPosition);
      setBirdVelocity(newVelocity);
      setBirdRotation(newRotation);
      setPipes(filteredPipes);
    };

    if (gameStarted && !gameOver) {
      gameLoopId.current = requestAnimationFrame(handleGameLoop);
    }

    return () => {
      if (gameLoopId.current) {
        cancelAnimationFrame(gameLoopId.current);
      }
    };
   
  });

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameStarted, gameOver, menuOpen]);

  return (
    <div className={`relative w-full h-screen overflow-hidden ${backgrounds[backgroundIndex]}`}>
      {!menuOpen && (
        <>
          <button
            className="absolute top-4 right-4 px-4 py-2 rounded-lg font-semibold bg-white/90 text-purple-700 hover:bg-white/100 transition-colors shadow z-20"
            onClick={backToMenu}
            aria-label="Back to Menu"
          >
            Back to Menu
          </button>
          <Bird
            gameStarted={gameStarted}
            position={birdPosition}
            rotation={birdRotation}
            gameOver={gameOver}
          />
          
          {pipes.map((pipe, index) => (
            <div key={index}>
              <Pipe height={pipe.height} isTop position={pipe.x} />
              <Pipe
                height={window.innerHeight - pipe.height - difficulties[difficulty].gap}
                position={pipe.x}
              />
            </div>
          ))}

          <div className="absolute top-4 left-4 text-4xl font-bold text-white drop-shadow-lg z-20">
            {score}
          </div>
        </>
      )}

      {(menuOpen || !gameStarted) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/50 z-30">
          <h1 className="text-4xl font-bold text-white mb-8">Flappy Bird</h1>
          
          <div className="flex gap-4 mb-4">
            {['easy', 'medium', 'hard'].map((level) => (
              <button
                key={level}
                onClick={() => setDifficulty(level as 'easy' | 'medium' | 'hard')}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  difficulty === level
                    ? 'bg-purple-500 text-white'
                    : 'bg-white text-purple-500'
                }`}
                tabIndex={menuOpen ? 0 : -1}
              >
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </button>
            ))}
          </div>

          <div className="flex gap-4 mb-8">
            {backgrounds.map((_, index) => (
              <button
                key={index}
                onClick={() => setBackgroundIndex(index)}
                className={`w-8 h-8 rounded-full border-2 ${
                  backgroundIndex === index ? 'border-white' : 'border-transparent'
                } ${backgrounds[index]}`}
                tabIndex={menuOpen ? 0 : -1}
              />
            ))}
          </div>

          <div className="text-white text-center">
            <p className="mb-4">Press SPACE or UP ARROW to start and jump</p>
            <button
              onClick={startGame}
              className="px-8 py-3 bg-purple-500 rounded-lg font-semibold hover:bg-purple-600 transition-colors"
            >
              Start Game
            </button>
          </div>
        </div>
      )}

      {gameOver && !menuOpen && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 z-40">
          <div className="text-white text-center">
            <h2 className="text-3xl font-bold mb-4">Game Over!</h2>
            <p className="text-xl mb-4">Score: {score}</p>
            <button
              onClick={startGame}
              className="px-8 py-3 bg-purple-500 rounded-lg font-semibold hover:bg-purple-600 transition-colors mb-4"
            >
              Play Again
            </button>
            <button
              onClick={backToMenu}
              className="px-6 py-2 bg-white/90 text-purple-600 rounded-lg font-semibold hover:bg-white/100 transition-colors"
            >
              Back to Menu
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;


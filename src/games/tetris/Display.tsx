import React from 'react';

type Props = {
  gameOver?: boolean;
  text: string;
};

const Display: React.FC<Props> = ({ gameOver, text }) => (
  <div
    className={`box-border flex mb-5 p-5 border-2 border-gray-500 min-h-[20px] w-[120px] rounded-[10px] bg-black font-sans text-xs ${
      gameOver ? 'text-red-500' : 'text-gray-400'
    }`}
  >
    {text}
  </div>
);

export default Display;

import React from 'react';

type Props = {
  callback: () => void;
};

const StartButton: React.FC<Props> = ({ callback }) => (
  <button
    onClick={callback}
    className='box-border mb-5 p-5 min-h-[20px] w-[170px] rounded-[10px] border-none text-white bg-[#111] font-sans text-base outline-none cursor-pointer'
  >
    Start Game
  </button>
);

export default StartButton;

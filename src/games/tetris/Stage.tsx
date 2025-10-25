import React from 'react';
import Cell from './Cell';
import { STAGE_HEIGHT, STAGE_WIDTH, TETROMINOS } from './setup';

export type STAGECELL = [keyof typeof TETROMINOS, string];
export type STAGE = STAGECELL[][];

type Props = {
  stage: STAGE;
};

const Stage: React.FC<Props> = ({ stage }) => (
  <div
    className='grid gap-[1px] border border-gray-500 bg-[#222]'
    style={{
      gridTemplateColumns: `repeat(${STAGE_WIDTH}, 30px)`,
      gridTemplateRows: `repeat(${STAGE_HEIGHT}, 30px)`,
    }}
  >
    {stage.map(row => row.map((cell, x) => <Cell key={x} type={cell[0]} />))}
  </div>
);

export default Stage;

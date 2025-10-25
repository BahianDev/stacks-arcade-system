import React from 'react';
import { TETROMINOS } from './setup';

type Props = {
  type: keyof typeof TETROMINOS;
};

const Cell: React.FC<Props> = ({ type }) => {
  const color = TETROMINOS[type].color;
  return (
    <div
      className='w-auto'
      style={{
        background: `rgba(${color}, 0.8)`,
        border: `${type === 0 ? '0px solid' : '4px solid'}`,
        borderBottomColor: `rgba(${color}, 0.1)`,
        borderRightColor: `rgba(${color}, 1)`,
        borderTopColor: `rgba(${color}, 1)`,
        borderLeftColor: `rgba(${color}, 0.3)`,
      }}
    />
  );
};

export default React.memo(Cell);

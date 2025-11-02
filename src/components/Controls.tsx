import DiffToggle from './Control/DiffToggle';
import MinimizeButton from './Control/MinimizeButton';
import RunButton from './Control/RunButton';
import { cn } from '../lib/utils';
import FormatButton from './Control/FormatButton';

type ControlsProps = {
  loc: 'top-right' | 'left-botton';
};

const Controls = ({ loc }: ControlsProps) => {
  return (
    <div
      className={cn(
        'flex gap-2 items-center flex-wrap mr-2',
        `${loc === 'top-right' ? '' : ''}`,
        `${loc === 'left-botton' ? 'absolute bottom-6 left-10' : ''}`,
      )}
    >
      <FormatButton />
      <DiffToggle />
      <RunButton />
      <MinimizeButton />
    </div>
  );
};

export default Controls;

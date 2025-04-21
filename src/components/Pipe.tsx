
interface PipeProps {
  height: number;
  isTop?: boolean;
  position: number;
}

export const Pipe = ({ height, isTop = false, position }: PipeProps) => {
  return (
    <div
      className="absolute w-16 bg-green-500 border-4 border-green-700"
      style={{
        height: `${height}px`,
        left: `${position}px`,
        top: isTop ? 0 : 'auto',
        bottom: !isTop ? 0 : 'auto',
      }}
    />
  );
};

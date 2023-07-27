type Props = {
  player: "top" | "bottom";
};

export default function Clock({ player }: Props) {
  return <div className={`clock ${player}`}></div>;
}

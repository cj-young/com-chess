import "./styles.scss";

type Props = {
  size: string;
};

export default function Spinner({ size }: Props) {
  return (
    <div
      className="spinner"
      style={{
        width: size,
        height: size,
        borderRadius: "1000vmax",
        border: `calc(${size} / 5) solid var(--clr-neutral-100)`,
        borderTopColor: "transparent",
        borderBottomColor: "transparent"
      }}
    ></div>
  );
}

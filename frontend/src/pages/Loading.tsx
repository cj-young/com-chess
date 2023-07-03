import Spinner from "../components/Spinner";

export default function Loading() {
  return (
    <div
      className="callback"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100%"
      }}
    >
      <Spinner size="2rem" />
    </div>
  );
}

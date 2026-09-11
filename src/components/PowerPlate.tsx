type Props = {
  onOpen: () => void;
};

export function PowerPlate({ onOpen }: Props) {
  return (
    <div className="power-plate">
      <p className="power-kicker">Hall 4 · mainnet</p>
      <h2 className="power-title">Board is dark</h2>
      <p className="power-copy">
        Flaps stay shut until you open the board. Same rule as the other hall experiments:
        nothing moves without a click.
      </p>
      <button type="button" className="power-switch" onClick={onOpen}>
        <span className="power-switch-mark" />
        Open
      </button>
    </div>
  );
}

import type { MetaFunction } from "react-router";
import { DualGrid, GridTile2D, GridTile2DCodec } from "~/grid/dual-grid";
import type { Route } from "./+types/movement";
import {
  createContext,
  memo,
  use,
  useCallback,
  useContext,
  useState,
  type FC,
  type ReactNode,
} from "react";
import { CodecMap } from "~/collections/codec-map";
import Heap from "heap-js";
import { gridDirections, isDiagonalDirection } from "~/grid/grid-direction";
import type { GridBounds2D } from "~/grid/grid-bounds2d";

export const meta: MetaFunction = () => [{ title: "Movement" }];

export interface LoaderData {
  readonly grid: DualGrid;
  readonly initial: GridTile2D;
}

export async function clientLoader(): Promise<LoaderData> {
  const grid = new DualGrid({ q: 19, r: 19 });
  const initial = new GridTile2D(9, 9);
  return { grid, initial };
}

interface GridScaleContextData {
  readonly tile: number;
  readonly wall: number;
  readonly char: number;
}

const GridScaleContext = createContext<GridScaleContextData>({
  tile: 48,
  wall: 8,
  char: 32,
});

interface GridProps {
  readonly grid: DualGrid;
  readonly children: ReactNode;
}

const Grid: FC<GridProps> = ({ grid, children }) => {
  const bounds = grid.bounds.tiles;
  const { tile } = useContext(GridScaleContext);
  return (
    <svg
      viewBox={`0 0 ${bounds.cols * tile} ${bounds.rows * tile}`}
      className="w-full max-w-[100vmin]"
    >
      <defs>
        <pattern
          id="grid-pattern"
          width={tile}
          height={tile}
          patternUnits="userSpaceOnUse"
        >
          <rect
            width={tile}
            height={tile}
            className="fill-white stroke-slate-200 stroke-1"
          />
        </pattern>
      </defs>
      <rect
        width={bounds.cols * tile}
        height={bounds.rows * tile}
        fill="url(#grid-pattern)"
        className="stroke-slate-200 stroke-1"
      />
      {children}
    </svg>
  );
};

interface MoveOptionsProps {
  readonly bounds: GridBounds2D;
  readonly codec: GridTile2DCodec;
  readonly pos: GridTile2D;
  readonly maxMovement: number;
  readonly diagonalCost: number;
  readonly moveTo: (pos: GridTile2D) => void;
}

const MoveOptions: FC<MoveOptionsProps> = memo(
  ({ bounds, codec, pos, maxMovement, diagonalCost, moveTo }) => {
    const { tile, wall } = useContext(GridScaleContext);
    const pad = wall / 2;
    const costs = new CodecMap(codec, [[pos, 0]]);
    const queue = new Heap<GridTile2D>((a, b) => costs.get(a)! - costs.get(b)!);
    queue.push(pos);
    for (const tile of queue) {
      const cost = costs.get(tile)!;
      for (const d of gridDirections()) {
        const delta = isDiagonalDirection(d) ? diagonalCost : 1;
        const neighbor = tile.neighbor(d);
        const next = cost + delta;
        if (Math.floor(next) > maxMovement || !bounds.includes(neighbor)) {
          continue;
        }
        if (next < (costs.get(neighbor) ?? Infinity)) {
          costs.set(neighbor, next);
          queue.push(neighbor);
        }
      }
    }
    costs.delete(pos);
    return (
      <>
        {Array.from(costs.keys()).map((t) => (
          <rect
            key={codec.toId(t)}
            x={tile * t.q + pad}
            y={tile * t.r + pad}
            width={tile - wall}
            height={tile - wall}
            className="fill-sky-500/50"
            rx={pad}
            r={pad}
            onClick={() => moveTo(t)}
          />
        ))}
      </>
    );
  },
);

interface CharProps {
  readonly pos: GridTile2D;
  readonly toggleMoving: () => void;
}

const Char: FC<CharProps> = ({ pos, toggleMoving }) => {
  const { tile, char } = useContext(GridScaleContext);
  return (
    <circle
      cx={tile * (pos.q + 0.5)}
      cy={tile * (pos.r + 0.5)}
      r={char / 2}
      className="fill-sky-500 stroke-sky-600 stroke-2"
      onClick={toggleMoving}
    ></circle>
  );
};

const DiagonalCosts = {
  chebyshev: 1,
  euclidean: Math.SQRT2,
  pathfinder: 1.5,
  manhattan: 2,
} as const;

type DiagonalCostKind = keyof typeof DiagonalCosts;

export default function MovementRoute({
  loaderData: { grid, initial },
}: Route.ComponentProps) {
  const [character, setCharacter] = useState<GridTile2D>(initial);
  const [isMoving, setIsMoving] = useState<boolean>(false);
  const [maxMovement, setMaxMovement] = useState<number>(6);
  const [diagonalCost, setDiagonalCost] =
    useState<DiagonalCostKind>("pathfinder");
  const moveTo = useCallback((pos: GridTile2D) => {
    setCharacter(pos);
    setIsMoving(false)
  }, []);

  return (
    <main className="flex gap-4">
      <aside className="w-64 space-y-4 p-4">
        <h1 className="text-4xl font-extrabold text-slate-900">Settings</h1>
        <label className="block space-y-1">
          <span className="block text-slate-700">Max Movement</span>
          <input
            type="number"
            name="max-movement"
            id="max-movement"
            value={maxMovement}
            min={1}
            max={Math.max(grid.bounds.tiles.cols, grid.bounds.tiles.rows) - 1}
            onChange={(e) =>
              setMaxMovement(parseInt(e.currentTarget.value, 10))
            }
            className="focus:oultine-sky-300 block w-full appearance-none rounded-sm border-2 border-slate-300 px-3 py-2 focus:border-sky-300"
          />
        </label>
        <label className="block space-y-1">
          <span className="block text-slate-700">Diagonal Cost</span>
          <select
            name="diagonal-cost"
            id="diagonal-cost"
            className="focus:oultine-sky-300 block w-full appearance-none rounded-sm border-2 border-slate-300 px-3 py-2 focus:border-sky-300"
            value={diagonalCost}
            onChange={(e) =>
              setDiagonalCost(e.currentTarget.value as DiagonalCostKind)
            }
          >
            {Object.keys(DiagonalCosts).map((key) => (
              <option key={key} value={key}>
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </option>
            ))}
          </select>
        </label>
      </aside>
      <Grid grid={grid}>
        {isMoving && (
          <MoveOptions
            bounds={grid.bounds.tiles}
            codec={grid.codecs.tiles}
            pos={character}
            maxMovement={maxMovement}
            diagonalCost={DiagonalCosts[diagonalCost]}
            moveTo={moveTo}
          />
        )}
        <Char pos={character} toggleMoving={() => setIsMoving(!isMoving)} />
      </Grid>
    </main>
  );
}

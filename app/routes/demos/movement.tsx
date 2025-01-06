import type { MetaFunction } from "react-router";
import {
  DualGrid,
  GridEdge2D,
  GridTile2D,
  GridTile2DCodec,
} from "~/grid/dual-grid";
import type { Route } from "./+types/movement";
import {
  createContext,
  memo,
  useCallback,
  useContext,
  useState,
  type FC,
  type ReactNode,
} from "react";
import { CodecMap } from "~/collections/codec-map";
import Heap from "heap-js";
import {
  CardinalDirection,
  cardinalDirections,
  gridDirections,
  isCardinalDirection,
  isDiagonalDirection,
} from "~/grid/grid-direction";
import type { GridBounds2D } from "~/grid/grid-bounds2d";
import { CodecSet } from "~/collections/codec-set";

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
  readonly onClick: (target: GridEdge2D | GridTile2D) => void;
  readonly children: ReactNode;
}

const Grid: FC<GridProps> = ({ grid, onClick, children }) => {
  const bounds = grid.bounds.tiles;
  const { tile, wall } = useContext(GridScaleContext);
  const pad = wall / 2;
  const handleClick = (event: React.MouseEvent<SVGElement>) => {
    const point = DOMPoint.fromPoint(event.nativeEvent);
    const target = point.matrixTransform(
      (event.currentTarget as SVGGraphicsElement).getScreenCTM()!.inverse(),
    );
    const pos = new GridTile2D(
      Math.floor(target.x / tile),
      Math.floor(target.y / tile),
    );
    const tx = target.x % tile;
    const ty = target.y % tile;
    if (tx > pad && tx < tile - pad && ty > pad && ty < tile - pad) {
      return onClick(pos);
    }
    if (ty < pad) {
      return onClick(pos.border(CardinalDirection.North));
    }
    if (tx > tile - pad) {
      return onClick(pos.border(CardinalDirection.East));
    }
    if (ty > tile - pad) {
      return onClick(pos.border(CardinalDirection.South));
    }
    if (tx < pad) {
      return onClick(pos.border(CardinalDirection.West));
    }
    throw new Error("Invalid click");
  };
  return (
    <svg
      viewBox={`0 0 ${bounds.cols * tile} ${bounds.rows * tile}`}
      className="w-full max-w-[100vmin]"
      onClick={handleClick}
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

interface RectProps {
  readonly pos: GridTile2D;
  readonly className?: string;
  readonly onClick?: () => void;
}

const Rect: FC<RectProps> = ({ pos, className, onClick }) => {
  const { tile, wall } = useContext(GridScaleContext);
  const pad = wall / 2;
  return (
    <rect
      x={tile * pos.q + pad}
      y={tile * pos.r + pad}
      width={tile - wall}
      height={tile - wall}
      className={className}
      rx={pad}
      r={pad}
      onClick={onClick}
    />
  );
};

interface MoveOptionsProps {
  readonly grid: DualGrid;
  readonly pos: GridTile2D;
  readonly maxMovement: number;
  readonly diagonalCost: number;
  readonly difficult: ReadonlySet<GridTile2D>;
  readonly walls: ReadonlySet<GridEdge2D>;
  readonly moveTo: (pos: GridTile2D) => void;
}

const MoveOptions: FC<MoveOptionsProps> = memo(
  ({ grid, pos, maxMovement, diagonalCost, difficult, walls, moveTo }) => {
    const costs = new CodecMap(grid.codecs.tiles, [[pos, 0]]);
    const queue = new Heap<GridTile2D>((a, b) => costs.get(a)! - costs.get(b)!);
    queue.push(pos);
    for (const tile of queue) {
      const cost = costs.get(tile)!;
      for (const d of gridDirections()) {
        const neighbor = tile.neighbor(d);
        if (!grid.bounds.tiles.includes(neighbor)) {
          continue;
        }
        if (isCardinalDirection(d)) {
          if (walls.has(tile.border(d))) {
            continue;
          }
        } else {
          const corner = tile.corner(d);
          const isInvalid = Array.from(cardinalDirections()).some((cd) => {
            const edge = corner.protrude(cd);
            if (!grid.bounds.tiles.includes(edge)) {
              return false;
            }
            return walls.has(edge);
          });
          if (isInvalid) {
            continue;
          }
        }
        const raw = isDiagonalDirection(d) ? diagonalCost : 1;
        const delta = difficult.has(neighbor) ? raw * 2 : raw;
        const next = cost + delta;
        if (Math.floor(next) > maxMovement) {
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
          <Rect
            key={grid.codecs.tiles.toId(t)}
            pos={t}
            className="fill-sky-500/50"
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

const Wall: FC<{ edge: GridEdge2D }> = ({ edge }) => {
  const { tile, wall } = useContext(GridScaleContext);
  const pad = wall / 2;
  const size = tile - wall;
  const isHorizontal = edge.d === CardinalDirection.North;
  const tx = tile * edge.q;
  const ty = tile * edge.r;
  const x = isHorizontal ? tx + pad : tx - pad;
  const y = isHorizontal ? ty - pad : ty + pad;
  const width = isHorizontal ? size : wall;
  const height = isHorizontal ? wall : size;
  return (
    <rect
      x={x}
      y={y}
      width={width}
      height={height}
      className="fill-slate-900"
    />
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
    setIsMoving(false);
  }, []);
  const [difficult, setDifficult] = useState<ReadonlySet<GridTile2D>>(
    new CodecSet(grid.codecs.tiles),
  );
  const [walls, setWalls] = useState<ReadonlySet<GridEdge2D>>(
    new CodecSet(grid.codecs.edges),
  );
  const onClick = (target: GridEdge2D | GridTile2D) => {
    if (isMoving) {
      return;
    }
    if (target instanceof GridEdge2D) {
      const next = new CodecSet(grid.codecs.edges, walls);
      if (next.has(target)) {
        next.delete(target);
      } else {
        next.add(target);
      }
      return setWalls(next);
    }
    if (character.q === target.q && character.r === target.r) {
      return;
    }
    const next = new CodecSet(grid.codecs.tiles, difficult);
    if (next.has(target)) {
      next.delete(target);
    } else {
      next.add(target);
    }
    setDifficult(next);
  };
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
      <Grid grid={grid} onClick={onClick}>
        {Array.from(difficult).map((t) => (
          <Rect
            key={grid.codecs.tiles.toId(t)}
            pos={t}
            className="fill-orange-500/50"
          />
        ))}
        {Array.from(walls).map((edge) => (
          <Wall key={grid.codecs.edges.toId(edge)} edge={edge} />
        ))}
        {isMoving && (
          <MoveOptions
            grid={grid}
            pos={character}
            maxMovement={maxMovement}
            diagonalCost={DiagonalCosts[diagonalCost]}
            difficult={difficult}
            walls={walls}
            moveTo={moveTo}
          />
        )}
        <Char pos={character} toggleMoving={() => setIsMoving(!isMoving)} />
      </Grid>
    </main>
  );
}

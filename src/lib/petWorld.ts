// A shared top-down pixel city block in the made-up town of Neon Bay. Every coin's character lives here and wanders around on its own.
// Pure canvas code with no React and no imports, so it can be tested on its own.

export type PetLook = {
  skin: string;
  hair: string;
  suit: string;
  accent: string;
  hat: 'fedora' | 'flat' | 'slick' | 'bun' | 'helmet' | 'beret' | 'cap' | 'bald';
  hatColor: string;
  shades: boolean;
};

export type WorldPet = { mint: string; petId: string; look: PetLook; name: string; symbol: string };

export const TILE = 16;
export const COLS = 30;
export const ROWS = 17;
export const W = COLS * TILE; // 480
export const H = ROWS * TILE; // 272

type Dir = 'up' | 'right' | 'down' | 'left';
const DIRS: Dir[] = ['up', 'right', 'down', 'left'];
const DV: Record<Dir, [number, number]> = { up: [0, -1], right: [1, 0], down: [0, 1], left: [-1, 0] };

/* ------------------------------ helpers ------------------------------ */

function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function rgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function mix(a: string, b: string, t: number): string {
  const x = rgb(a);
  const y = rgb(b);
  return `#${x.map((v, i) => Math.round(v + (y[i] - v) * t).toString(16).padStart(2, '0')).join('')}`;
}

const mk = (w: number, h: number) => {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
};

/* ------------------------------ top-down sprites ------------------------------ */

const OUT = '#0d0b17';

// Draw the character facing UP, seen from above: hat or hair on top, shoulders, swinging arms and shoes.
// Other directions are this picture turned by 90 degrees.
function paintUp(look: PetLook, frame: 0 | 1 | 2): HTMLCanvasElement {
  const c = mk(16, 16);
  const g = c.getContext('2d')!;
  const px = (x: number, y: number, col: string) => {
    g.fillStyle = col;
    g.fillRect(x, y, 1, 1);
  };
  const rect = (x: number, y: number, w: number, h: number, col: string) => {
    g.fillStyle = col;
    g.fillRect(x, y, w, h);
  };
  const round = (x: number, y: number, w: number, h: number, col: string) => {
    g.fillStyle = col;
    for (let i = 0; i < h; i++) {
      const inset = i === 0 || i === h - 1 ? 1 : 0;
      g.fillRect(x + inset, y + i, w - inset * 2, 1);
    }
  };
  const pants = mix(look.suit, '#000000', 0.35);
  const a = frame === 0 ? -1 : 0;
  const b = frame === 1 ? -1 : 0;

  // shoes and legs
  rect(5, 11 + a, 2, 3, pants);
  rect(9, 11 + b, 2, 3, pants);
  rect(5, 14 + a, 2, 1, '#1b1a22');
  rect(9, 14 + b, 2, 1, '#1b1a22');

  // arms and hands
  rect(3, 7 + b, 2, 3, look.suit);
  rect(11, 7 + a, 2, 3, look.suit);
  px(3, 10 + b, look.skin);
  px(12, 10 + a, look.skin);

  // jacket with a trim along the shoulders
  round(4, 6, 8, 7, look.suit);
  rect(5, 6, 6, 1, look.accent);
  rect(7, 8, 2, 4, mix(look.suit, '#000000', 0.2));

  // head (face points up, so the hat sits on the back of the head)
  round(5, 1, 6, 7, look.skin);
  if (look.shades) rect(5, 2, 6, 1, '#07070b');
  else {
    px(6, 2, '#15151b');
    px(9, 2, '#15151b');
  }

  switch (look.hat) {
    case 'fedora':
      round(3, 3, 10, 6, look.hatColor);
      round(5, 4, 6, 3, mix(look.hatColor, '#ffffff', 0.12));
      rect(5, 6, 6, 1, look.accent);
      break;
    case 'flat':
      round(4, 3, 8, 5, look.hatColor);
      rect(5, 4, 6, 1, mix(look.hatColor, '#ffffff', 0.18));
      break;
    case 'cap':
      round(4, 3, 8, 5, look.hatColor);
      rect(5, 1, 6, 2, look.hatColor); // the bill
      break;
    case 'beret':
      round(3, 2, 9, 6, look.hatColor);
      px(7, 3, mix(look.hatColor, '#000000', 0.4));
      break;
    case 'helmet':
      round(4, 2, 8, 6, look.hatColor);
      rect(7, 2, 2, 6, look.accent);
      break;
    case 'bun':
      round(5, 3, 6, 5, look.hair);
      round(6, 7, 4, 3, look.hair);
      break;
    case 'slick':
      round(5, 3, 6, 5, look.hair);
      break;
    default:
      px(6, 4, mix(look.skin, '#ffffff', 0.3)); // a shiny head
      break;
  }

  // dark outline so the character stands out on any ground
  const out = mk(18, 18);
  const og = out.getContext('2d')!;
  const src = g.getImageData(0, 0, 16, 16).data;
  const solid = (x: number, y: number) => x >= 0 && y >= 0 && x < 16 && y < 16 && src[(y * 16 + x) * 4 + 3] > 0;
  og.fillStyle = OUT;
  for (let y = -1; y <= 16; y++) {
    for (let x = -1; x <= 16; x++) {
      if (!solid(x, y) && (solid(x - 1, y) || solid(x + 1, y) || solid(x, y - 1) || solid(x, y + 1))) og.fillRect(x + 1, y + 1, 1, 1);
    }
  }
  og.drawImage(c, 1, 1);
  return out;
}

function turned(src: HTMLCanvasElement, dir: Dir): HTMLCanvasElement {
  if (dir === 'up') return src;
  const c = mk(18, 18);
  const g = c.getContext('2d')!;
  g.imageSmoothingEnabled = false;
  g.translate(9, 9);
  g.rotate(dir === 'right' ? Math.PI / 2 : dir === 'down' ? Math.PI : -Math.PI / 2);
  g.drawImage(src, -9, -9);
  return c;
}

type SpriteSet = Record<Dir, [HTMLCanvasElement, HTMLCanvasElement, HTMLCanvasElement]>;
const spriteCache = new Map<string, SpriteSet>();
function spritesFor(petId: string, look: PetLook): SpriteSet {
  let s = spriteCache.get(petId);
  if (!s) {
    const base = [paintUp(look, 0), paintUp(look, 1), paintUp(look, 2)] as const;
    s = {} as SpriteSet;
    for (const d of DIRS) s[d] = [turned(base[0], d), turned(base[1], d), turned(base[2], d)];
    spriteCache.set(petId, s);
  }
  return s;
}

/* ------------------------------ the terrain: a neon coast city block ------------------------------ */

type Sign = { x: number; y: number; w: number; color: string };
type Terrain = { img: HTMLCanvasElement; blocked: Uint8Array; lamps: [number, number][]; signs: Sign[]; sea: { y: number } };

function buildTerrain(): Terrain {
  const img = mk(W, H);
  const g = img.getContext('2d')!;
  const rand = rng(hash('neon-bay-block'));
  const blocked = new Uint8Array(COLS * ROWS);
  const block = (tx: number, ty: number, w = 1, h = 1) => {
    for (let y = ty; y < ty + h; y++) for (let x = tx; x < tx + w; x++) if (x >= 0 && y >= 0 && x < COLS && y < ROWS) blocked[y * COLS + x] = 1;
  };
  const rect = (x: number, y: number, w: number, h: number, col: string) => {
    g.fillStyle = col;
    g.fillRect(x, y, w, h);
  };
  const signs: Sign[] = [];

  // asphalt everywhere, then pavement
  for (let ty = 0; ty < ROWS; ty++) {
    for (let tx = 0; tx < COLS; tx++) {
      rect(tx * TILE, ty * TILE, TILE, TILE, (tx + ty) % 2 === 0 ? '#2A2B3C' : '#272838');
      for (let i = 0; i < 3; i++) rect(tx * TILE + Math.floor(rand() * 15), ty * TILE + Math.floor(rand() * 15), 1, 1, '#34364A');
    }
  }
  const pave = (tx: number, ty: number, w: number, h: number) => {
    for (let y = ty; y < ty + h; y++) {
      for (let x = tx; x < tx + w; x++) {
        rect(x * TILE, y * TILE, TILE, TILE, (x + y) % 2 === 0 ? '#5D6079' : '#585B73');
        rect(x * TILE, y * TILE + TILE - 1, TILE, 1, '#494C61');
      }
    }
  };
  pave(0, 0, COLS, 4); // upper pavement under the buildings
  pave(0, 10, COLS, 1); // lower kerb strip
  // main road runs along rows 5-9, with a cross street
  for (let x = 0; x < W; x += 24) rect(x + 4, 7 * TILE + 7, 12, 2, '#E8D36A');
  for (let y = 0; y < H; y += 24) rect(14 * TILE + 15, y + 4, 2, 12, '#E8D36A');
  rect(0, 4 * TILE, W, 2, '#8A8DA6'); // kerb

  // beach and sea along the bottom
  for (let ty = 11; ty < ROWS; ty++) {
    for (let tx = 0; tx < COLS; tx++) {
      const sea = ty >= 15;
      rect(tx * TILE, ty * TILE, TILE, TILE, sea ? ((tx + ty) % 2 === 0 ? '#1B4F8C' : '#1A4A84') : (tx + ty) % 2 === 0 ? '#E8C98B' : '#E2C284');
      if (!sea) for (let i = 0; i < 3; i++) rect(tx * TILE + Math.floor(rand() * 15), ty * TILE + Math.floor(rand() * 15), 1, 1, '#CFAE70');
      else block(tx, ty);
    }
  }
  rect(0, 11 * TILE - 2, W, 4, '#9C7B53'); // boardwalk edge
  for (let x = 0; x < W; x += 8) rect(x, 11 * TILE - 2, 1, 4, '#7F6240');
  const sea = { y: 15 * TILE };

  // buildings along the top: facade with lit windows and a neon sign
  const building = (tx: number, tw: number, wall: string, neon: string) => {
    const x = tx * TILE;
    const w = tw * TILE;
    const h = 3 * TILE + 8;
    rect(x - 1, 2, w + 2, h + 2, 'rgba(0,0,0,0.35)');
    rect(x, 0, w, h, wall);
    rect(x, 0, w, 4, mix(wall, '#ffffff', 0.25)); // roof edge
    rect(x, h - 5, w, 5, mix(wall, '#000000', 0.35)); // shopfront base
    for (let wy = 10; wy < h - 14; wy += 12) {
      for (let wx = 6; wx < w - 8; wx += 11) {
        const lit = rand() < 0.65;
        rect(x + wx, wy, 6, 7, lit ? '#FFD479' : '#2C3350');
        if (lit) rect(x + wx, wy, 6, 1, '#FFEFB0');
      }
    }
    // door
    rect(x + Math.floor(w / 2) - 4, h - 16, 8, 11, '#1B1C28');
    rect(x + Math.floor(w / 2) - 3, h - 15, 6, 4, neon);
    // neon sign over the shopfront
    const sx = x + 6;
    const sw = w - 12;
    rect(sx - 1, h - 24, sw + 2, 7, '#0b0b14');
    rect(sx, h - 23, sw, 5, neon);
    rect(sx + 2, h - 22, sw - 4, 3, mix(neon, '#ffffff', 0.55));
    signs.push({ x: sx, y: h - 24, w: sw, color: neon });
    block(tx, 0, tw, 3);
  };
  building(1, 5, '#3B3F66', '#FF3EA5');
  building(7, 5, '#4B3A66', '#35F0E0');
  building(18, 4, '#334E66', '#FFD23F');
  building(23, 6, '#5C3A5E', '#9B6BFF');
  // the gap at tiles 12-17 is the cross street

  // palm trees on the pavement and beach
  const palm = (tx: number, ty: number) => {
    const cx = tx * TILE + 8;
    const cy = ty * TILE + 8;
    g.fillStyle = 'rgba(0,0,0,0.25)';
    for (let y = -3; y <= 3; y++) for (let x = -9; x <= 9; x++) if ((x / 9) ** 2 + (y / 3) ** 2 < 1) g.fillRect(cx + x + 2, cy + y + 7, 1, 1);
    rect(cx - 1, cy - 2, 3, 10, '#8B5E3C'); // trunk
    for (let y = 0; y < 10; y += 3) rect(cx - 1, cy - 2 + y, 3, 1, '#6B4429');
    const fronds: [number, number][] = [[-9, -4], [9, -4], [-7, 2], [7, 2], [0, -9], [-4, -8], [4, -8]];
    for (const [dx, dy] of fronds) {
      for (let i = 0; i <= 8; i++) {
        const fx = cx + Math.round((dx * i) / 8);
        const fy = cy - 3 + Math.round((dy * i) / 8) + Math.round(i * i * 0.04);
        rect(fx, fy, 2, 2, i % 3 === 0 ? '#2F9E5B' : '#3FBF6E');
      }
    }
    rect(cx - 1, cy - 4, 3, 3, '#2A7A48');
    block(tx, ty);
  };
  for (const [tx, ty] of [[0, 4], [11, 4], [18, 4], [29, 4], [4, 12], [10, 13], [16, 12], [22, 13], [27, 12], [1, 14], [20, 11]]) palm(tx, ty);

  // parked cars on the road edge: a sports car seen from above
  const car = (tx: number, ty: number, col: string) => {
    const x = tx * TILE;
    const y = ty * TILE + 3;
    rect(x + 1, y + 3, 30, 12, 'rgba(0,0,0,0.3)');
    rect(x, y, 30, 12, col);
    rect(x + 1, y + 1, 28, 2, mix(col, '#ffffff', 0.35));
    rect(x + 9, y + 2, 10, 8, '#16182A'); // cabin
    rect(x + 10, y + 3, 8, 3, '#7FD6FF');
    rect(x + 27, y + 1, 3, 3, '#FFF1A8');
    rect(x + 27, y + 8, 3, 3, '#FFF1A8');
    rect(x, y + 1, 2, 3, '#FF3355');
    rect(x, y + 8, 2, 3, '#FF3355');
    block(tx, ty, 2, 1);
  };
  car(2, 5, '#FF4FA3');
  car(20, 5, '#21D4C8');
  car(8, 9, '#FFB020');
  car(25, 9, '#8E6BFF');

  // streetlamps
  const lamps: [number, number][] = [[6, 4], [13, 4], [17, 4], [24, 4], [12, 10], [18, 10], [29, 10]];
  for (const [tx, ty] of lamps) {
    rect(tx * TILE + 7, ty * TILE + 4, 2, 10, '#2D2F42');
    rect(tx * TILE + 5, ty * TILE + 2, 6, 3, '#2D2F42');
    rect(tx * TILE + 6, ty * TILE + 3, 4, 2, '#FFE9A0');
  }

  // a bench on the boardwalk
  rect(21 * TILE + 1, 10 * TILE + 5, 14, 6, '#7A5638');
  rect(21 * TILE + 1, 10 * TILE + 5, 14, 1, '#9A7048');
  block(21, 10);

  return { img, blocked, lamps, signs, sea };
}

/* ------------------------------ the world ------------------------------ */

type PetState = {
  pet: WorldPet;
  tx: number;
  ty: number;
  x: number;
  y: number;
  fromX: number;
  fromY: number;
  toTx: number;
  toTy: number;
  mt: number;
  dir: Dir;
  state: 'move' | 'idle' | 'sleep';
  timer: number;
  phase: number;
  hopY: number;
  hopV: number;
};

export type World = {
  night: boolean;
  setPets(pets: WorldPet[], focusMint?: string): void;
  update(dt: number): void;
  draw(g: CanvasRenderingContext2D): void;
  positions(): { mint: string; x: number; y: number }[];
  hitTest(x: number, y: number): string | null;
  hold(mint: string | null): void;
  hop(mint: string): void;
};

export function createWorld(opts: { hour?: number } = {}): World {
  const hour = opts.hour ?? new Date().getHours();
  const night = hour >= 20 || hour < 6;
  const dusk = (hour >= 17 && hour < 20) || (hour >= 6 && hour < 8);
  const terrain = buildTerrain();
  const rand = rng(Date.now() & 0xffff);

  const pets = new Map<string, PetState>();
  const occ = new Map<number, string>();
  let focus: string | undefined;
  let held: string | null = null;
  let clock = 0;
  const MOVE_T = 0.7;
  const key = (tx: number, ty: number) => ty * COLS + tx;
  const free = (tx: number, ty: number) => tx >= 0 && ty >= 0 && tx < COLS && ty < ROWS && !terrain.blocked[key(tx, ty)] && !occ.has(key(tx, ty));

  function spawnTile(mint: string): [number, number] {
    const start = hash(mint) % (COLS * ROWS);
    for (let i = 0; i < COLS * ROWS; i++) {
      const k = (start + i) % (COLS * ROWS);
      const tx = k % COLS;
      const ty = Math.floor(k / COLS);
      if (free(tx, ty)) return [tx, ty];
    }
    return [0, 0];
  }

  function setPets(list: WorldPet[], focusMint?: string) {
    focus = focusMint;
    const keep = new Set(list.map((p) => p.mint));
    for (const [mint, s] of pets) {
      if (!keep.has(mint)) {
        occ.delete(key(s.tx, s.ty));
        if (s.state === 'move') occ.delete(key(s.toTx, s.toTy));
        pets.delete(mint);
      }
    }
    for (const p of list) {
      const s = pets.get(p.mint);
      if (s) {
        s.pet = p;
        continue;
      }
      const [tx, ty] = spawnTile(p.mint);
      occ.set(key(tx, ty), p.mint);
      pets.set(p.mint, {
        pet: p, tx, ty, x: tx * TILE, y: ty * TILE, fromX: tx * TILE, fromY: ty * TILE, toTx: tx, toTy: ty, mt: 0,
        dir: DIRS[hash(p.mint + 'd') % 4], state: 'idle', timer: rand() * 2, phase: rand() * 2, hopY: 0, hopV: 0,
      });
    }
  }

  function chooseNext(s: PetState) {
    if (rand() < 0.035) {
      s.state = 'sleep';
      s.timer = 4 + rand() * 4;
      return;
    }
    // prefer to keep going the way it was facing
    const order = [...DIRS].sort((a, b) => (b === s.dir ? 1.5 : 0) + rand() - ((a === s.dir ? 1.5 : 0) + rand()));
    for (const d of order) {
      const nx = s.tx + DV[d][0];
      const ny = s.ty + DV[d][1];
      if (free(nx, ny)) {
        s.dir = d;
        s.toTx = nx;
        s.toTy = ny;
        occ.set(key(nx, ny), s.pet.mint);
        s.fromX = s.tx * TILE;
        s.fromY = s.ty * TILE;
        s.mt = 0;
        s.state = 'move';
        return;
      }
    }
    s.state = 'idle';
    s.timer = 0.8 + rand();
  }

  function update(dt: number) {
    clock += dt;
    for (const s of pets.values()) {
      if (s.hopV !== 0 || s.hopY > 0) {
        s.hopV -= 260 * dt;
        s.hopY = Math.max(0, s.hopY + s.hopV * dt);
        if (s.hopY === 0) s.hopV = 0;
      }
      if (held === s.pet.mint) continue;
      if (s.state === 'move') {
        s.mt += dt / MOVE_T;
        if (s.mt >= 1) {
          occ.delete(key(s.tx, s.ty));
          s.tx = s.toTx;
          s.ty = s.toTy;
          s.x = s.tx * TILE;
          s.y = s.ty * TILE;
          s.state = 'idle';
          s.timer = rand() < 0.65 ? 0 : 0.6 + rand() * 3;
        } else {
          s.x = s.fromX + (s.toTx * TILE - s.fromX) * s.mt;
          s.y = s.fromY + (s.toTy * TILE - s.fromY) * s.mt;
        }
      } else {
        s.timer -= dt;
        if (s.timer <= 0) chooseNext(s);
      }
    }
  }

  function hop(mint: string) {
    const s = pets.get(mint);
    if (s && s.hopY === 0) s.hopV = 80;
  }

  function sprite(s: PetState) {
    const set = spritesFor(s.pet.petId, s.pet.look);
    const f = s.state === 'move' ? (Math.floor(s.mt * 2) % 2 === 0 ? 0 : 1) : 2;
    return set[s.dir][f];
  }

  function draw(g: CanvasRenderingContext2D) {
    g.imageSmoothingEnabled = false;
    g.drawImage(terrain.img, 0, 0);

    // sea shimmer
    g.fillStyle = 'rgba(160,220,255,0.5)';
    for (let i = 0; i < 12; i++) {
      const x = ((i * 47 + clock * 6) % W) | 0;
      const y = terrain.sea.y + 3 + ((i * 5) % 12);
      if (Math.sin(clock * 2 + i * 1.3) > 0.1) g.fillRect(x, y, 4, 1);
    }

    // pets, back to front
    const list = [...pets.values()].sort((a, b) => a.y - b.y);
    for (const s of list) {
      const sp = sprite(s);
      const bob = s.state === 'move' && Math.floor(s.mt * 4) % 2 === 1 ? -1 : 0;
      const px = Math.round(s.x) - 1;
      const py = Math.round(s.y) - 1 + bob - Math.round(s.hopY);
      g.fillStyle = 'rgba(0,0,0,0.28)';
      g.fillRect(Math.round(s.x) + 3, Math.round(s.y) + 13, 10, 3);
      g.drawImage(sp, px, py);
      if (s.state === 'sleep') {
        g.fillStyle = '#FFFFFF';
        const t = (clock * 0.8 + s.phase) % 1.6;
        for (let k = 0; k < 2; k++) {
          const tt = (t + k * 0.8) % 1.6;
          const zx = px + 14 + tt * 3;
          const zy = py + 2 - tt * 7;
          g.globalAlpha = Math.max(0, 1 - tt / 1.6);
          g.fillRect(Math.round(zx), Math.round(zy), 3, 1);
          g.fillRect(Math.round(zx) + 2, Math.round(zy) + 1, 1, 1);
          g.fillRect(Math.round(zx) + 1, Math.round(zy) + 2, 1, 1);
          g.fillRect(Math.round(zx), Math.round(zy) + 3, 3, 1);
        }
        g.globalAlpha = 1;
      }
      if (s.hopY > 5) {
        g.fillStyle = '#FFD23F';
        const hx = px + 12;
        const hy = py - 6;
        g.fillRect(hx, hy, 2, 2);
        g.fillRect(hx + 3, hy, 2, 2);
        g.fillRect(hx, hy + 1, 5, 2);
        g.fillRect(hx + 1, hy + 3, 3, 1);
      }
      if (s.pet.mint === focus) {
        // a bobbing arrow shows which pet belongs to this coin
        const ay = py - 7 + Math.round(Math.sin(clock * 5) * 1.5);
        g.fillStyle = OUT;
        g.fillRect(px + 4, ay - 1, 10, 2);
        g.fillRect(px + 5, ay + 1, 8, 2);
        g.fillRect(px + 6, ay + 3, 6, 2);
        g.fillRect(px + 7, ay + 5, 4, 2);
        g.fillStyle = '#FF7B5C';
        g.fillRect(px + 5, ay, 8, 1);
        g.fillRect(px + 6, ay + 1, 6, 1);
        g.fillRect(px + 7, ay + 2, 4, 1);
        g.fillRect(px + 8, ay + 3, 2, 1);
      }
    }

    // evening and night: the neon city never fully goes dark, its signs and lamps glow
    if (night || dusk) {
      g.fillStyle = night ? 'rgba(14,6,48,0.42)' : 'rgba(255,90,160,0.14)';
      g.fillRect(0, 0, W, H);
    }
    g.globalCompositeOperation = 'lighter';
    for (const sg of terrain.signs) {
      const flick = Math.sin(clock * 3 + sg.x) > -0.85 ? 1 : 0.55; // a sign that buzzes now and then
      const grad = g.createLinearGradient(0, sg.y, 0, sg.y + 26);
      grad.addColorStop(0, sg.color + (night ? '66' : '40'));
      grad.addColorStop(1, sg.color + '00');
      g.globalAlpha = flick;
      g.fillStyle = grad;
      g.fillRect(sg.x - 4, sg.y, sg.w + 8, 26);
    }
    g.globalAlpha = 1;
    for (const [tx, ty] of terrain.lamps) {
      const cx = tx * TILE + 8;
      const cy = ty * TILE + 6;
      const grad = g.createRadialGradient(cx, cy, 1, cx, cy, night ? 30 : 22);
      grad.addColorStop(0, night ? 'rgba(255,225,140,0.42)' : 'rgba(255,225,140,0.26)');
      grad.addColorStop(1, 'rgba(255,225,140,0)');
      g.fillStyle = grad;
      g.fillRect(cx - 36, cy - 36, 72, 72);
    }
    g.globalCompositeOperation = 'source-over';
  }

  function positions() {
    return [...pets.values()].map((s) => ({ mint: s.pet.mint, x: s.x, y: s.y - Math.round(s.hopY) }));
  }

  function hitTest(x: number, y: number) {
    const list = [...pets.values()].sort((a, b) => b.y - a.y);
    for (const s of list) if (x >= s.x - 2 && x <= s.x + 18 && y >= s.y - 3 && y <= s.y + 18) return s.pet.mint;
    return null;
  }

  return { night, setPets, update, draw, positions, hitTest, hold: (m) => { held = m; }, hop };
}

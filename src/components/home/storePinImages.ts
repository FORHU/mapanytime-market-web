import type mapboxgl from "mapbox-gl";
import type { NearbyStore } from "@/features/stores/hooks/useNearbyStores";

/**
 * Store map pins, drawn to a canvas and registered as Mapbox style images.
 *
 * Ported from the Flutter app's `mapbox_style_manager.dart` so the two clients
 * read as the same product. The geometry constants below were tuned on-device
 * there; changing one without the other makes the pins visibly diverge.
 *
 * Symbol layers can only reference an image by name, so each pin is registered
 * under a key derived from everything that affects its appearance
 * ([pinIconIdFor]). An unchanged store therefore re-uses its bitmap instead of
 * being re-rasterised on every camera move.
 */

// ---------------------------------------------------------------------------
// Geometry — mapbox_style_manager.dart:145-156
// ---------------------------------------------------------------------------

/** Crown cheek → taper transition. */
const PIN_SHOULDER_ANGLE_DEG = 37;
/** The two peaks of the crown's "M" notch. */
const PIN_PEAK_ANGLE_DEG = 45;
/** How deep the M valley cuts, as a fraction of the crown radius. */
const PIN_NOTCH_DEPTH_FACTOR = 0.35;
/** Crown-centre-to-tip distance, as a multiple of the crown radius. */
const PIN_TIP_DROP_FACTOR = 1.3;
const STATUS_BADGE_RADIUS = 5;
const SHADOW_PADDING = 8;

/** Adaptive card size — mapbox_style_manager.dart:130-143. */
const WIDTH_FRACTION = 0.15;
const MIN_CARD_WIDTH = 48;
const MAX_CARD_WIDTH = 68;

/**
 * Zoom→scale expression for the symbol layer's `icon-size`.
 *
 * Mobile's `iconSizeExpression` verbatim. 17 is also the zoom the map flies to
 * when a store is selected, so the pin lands at exactly full scale.
 */
export const ICON_SIZE_EXPRESSION = [
  "interpolate",
  ["linear"],
  ["zoom"],
  12,
  0.5,
  17,
  1,
] as const;

// ---------------------------------------------------------------------------
// Palette — category_visuals.dart:57-85, theme/tokens
// ---------------------------------------------------------------------------

const CATEGORY_COLORS: Record<string, string> = {
  "Food & Beverage": "#D97C3A",
  "Shopping & Retail": "#D2567F",
  Electronics: "#498AD4",
  "Home & Living": "#30A68E",
  "Health & Wellness": "#3AA64C",
  Automotive: "#D94A3A",
  Pets: "#B87A3D",
  "Sports & Outdoors": "#309BB5",
  Entertainment: "#905EC9",
  "Baby & Kids": "#E08594",
  Services: "#4165C8",
  Agriculture: "#579438",
  "Industrial & Business": "#858FA3",
};

const FALLBACK_PALETTE = [
  "#D97C3A",
  "#498AD4",
  "#3AA64C",
  "#D2567F",
  "#905EC9",
  "#30A68E",
  "#B87A3D",
  "#309BB5",
];

export const INK = "#1B2CC1";
const TEXT_PRIMARY = "#14161C";
const TEXT_SECONDARY = "#6B7280";
const BORDER_HAIRLINE = "#ECEDF0";
const STATUS_OPEN = "#2FA36B";

/**
 * Stable hash for an arbitrary key.
 *
 * Deliberately NOT a port of Dart's `String.hashCode`, which has no JS
 * equivalent — so a store with no category can land on a different palette
 * entry here than it does on mobile. Categorised stores, which is nearly all of
 * them, match exactly because they resolve through [CATEGORY_COLORS].
 */
function hashKey(key: string): number {
  let hash = 2166136261;
  for (let i = 0; i < key.length; i += 1) {
    hash ^= key.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash);
}

/** A merchant's accent colour: its category's when known, else a stable hash of its id. */
export function colorForStore(
  store: Pick<NearbyStore, "id" | "categoryName">,
): string {
  const name = store.categoryName;
  if (name && CATEGORY_COLORS[name]) return CATEGORY_COLORS[name];
  if (name) return FALLBACK_PALETTE[hashKey(name) % FALLBACK_PALETTE.length];
  return FALLBACK_PALETTE[hashKey(store.id) % FALLBACK_PALETTE.length];
}

/** Initials shown when a store has no marker photo — category_visuals.dart:120-128. */
export function monogramFor(storeName: string): string {
  const trimmed = storeName.trim();
  if (trimmed === "") return "?";
  const words = trimmed.split(/\s+/);
  const first = words[0][0];
  if (words.length === 1) return first.toUpperCase();
  return (first + words[1][0]).toUpperCase();
}

/**
 * Cache key for a store's pin bitmap — mobile's `iconIdFor`.
 *
 * Every input that changes how the pin looks is in the key, so a stale bitmap
 * can never outlive the data it was drawn from.
 */
export function pinIconIdFor(store: NearbyStore, isSelected = false): string {
  return [
    store.id,
    store.markerPhotoUrl ?? "",
    String(store.isOpen),
    store.categoryId ?? store.categoryName ?? store.storeName,
    store.markerDisplayMode,
    store.markerPrice?.toString() ?? "",
    store.markerSubtitle ?? "",
    isSelected ? "selected" : "",
  ].join("|");
}

/** Card size from viewport width, clamped — mobile's `sizeFor`. */
export function cardSizeFor(viewportWidth: number): number {
  return Math.min(
    Math.max(viewportWidth * WIDTH_FRACTION, MIN_CARD_WIDTH),
    MAX_CARD_WIDTH,
  );
}

// ---------------------------------------------------------------------------
// Drawing
// ---------------------------------------------------------------------------

const toRad = (deg: number) => (deg * Math.PI) / 180;

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/**
 * The teardrop silhouette with the M-notch crown.
 *
 * The tip is placed at the canvas centre, not the bottom: the bitmap carries
 * symmetric padding, so `icon-anchor: center` lands the point on the store's
 * actual coordinate without any per-marker offset.
 */
function traceTeardrop(
  ctx: CanvasRenderingContext2D,
  centreX: number,
  centreY: number,
  crownDiameter: number,
) {
  const r = crownDiameter / 2;
  const tipDrop = r * PIN_TIP_DROP_FACTOR;
  const tipX = centreX;
  const tipY = centreY;
  const crownX = centreX;
  const crownY = centreY - tipDrop;

  const rightShoulder = toRad(90 - PIN_SHOULDER_ANGLE_DEG);
  const leftShoulder = toRad(90 + PIN_SHOULDER_ANGLE_DEG);
  const rightPeak = toRad(360 - PIN_PEAK_ANGLE_DEG);
  const leftPeak = toRad(180 + PIN_PEAK_ANGLE_DEG);

  const rsX = crownX + r * Math.cos(rightShoulder);
  const rsY = crownY + r * Math.sin(rightShoulder);
  const lsX = crownX + r * Math.cos(leftShoulder);
  const lsY = crownY + r * Math.sin(leftShoulder);
  const lpX = crownX + r * Math.cos(leftPeak);
  const lpY = crownY + r * Math.sin(leftPeak);

  ctx.beginPath();
  ctx.moveTo(tipX, tipY);
  // Right taper: tip up to the right shoulder.
  ctx.bezierCurveTo(
    tipX + r * 0.02,
    tipY - tipDrop * 0.3,
    rsX,
    rsY + tipDrop * 0.4,
    rsX,
    rsY,
  );
  // Right cheek, shoulder to peak.
  ctx.arc(crownX, crownY, r, rightShoulder, rightPeak, true);
  // Down into the valley, then across to the left peak.
  ctx.lineTo(crownX, crownY - r * PIN_NOTCH_DEPTH_FACTOR);
  ctx.lineTo(lpX, lpY);
  // Left cheek, peak to shoulder.
  ctx.arc(crownX, crownY, r, leftPeak, leftShoulder, true);
  // Left taper back down to the tip.
  ctx.bezierCurveTo(
    lsX,
    lsY + tipDrop * 0.4,
    tipX - r * 0.02,
    tipY - tipDrop * 0.3,
    tipX,
    tipY,
  );
  ctx.closePath();
}

function applyShadow(ctx: CanvasRenderingContext2D, strong: boolean) {
  // AppEffects.cardShadow / softShadow, both tinted with the brand ink.
  ctx.shadowColor = strong ? "rgba(27,44,193,0.08)" : "rgba(27,44,193,0.06)";
  ctx.shadowBlur = strong ? 28 : 10;
  ctx.shadowOffsetY = strong ? 12 : 4;
}

function clearShadow(ctx: CanvasRenderingContext2D) {
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
}

function newCanvas(width: number, height: number, dpr: number) {
  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(width * dpr);
  canvas.height = Math.ceil(height * dpr);
  const ctx = canvas.getContext("2d")!;
  ctx.scale(dpr, dpr);
  return { canvas, ctx };
}

function measure(
  ctx: CanvasRenderingContext2D,
  text: string,
  font: string,
): number {
  ctx.font = font;
  return ctx.measureText(text).width;
}

function ellipsise(
  ctx: CanvasRenderingContext2D,
  text: string,
  font: string,
  maxWidth: number,
): string {
  if (measure(ctx, text, font) <= maxWidth) return text;
  let out = text;
  while (out.length > 1 && measure(ctx, `${out}…`, font) > maxWidth) {
    out = out.slice(0, -1);
  }
  return `${out}…`;
}

async function loadImage(url: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

/** PHOTO_CARD — the teardrop, filled with the store's photo or its monogram. */
async function drawPhotoCard(store: NearbyStore, size: number, dpr: number) {
  const crownDiameter = size * 0.9;
  const r = crownDiameter / 2;
  const tipDrop = r * PIN_TIP_DROP_FACTOR;
  const height = crownDiameter + tipDrop * 2 + SHADOW_PADDING;
  const width = crownDiameter + SHADOW_PADDING;
  const { canvas, ctx } = newCanvas(width, height, dpr);

  const cx = width / 2;
  const cy = height / 2;
  const crownY = cy - tipDrop;

  applyShadow(ctx, false);
  traceTeardrop(ctx, cx, cy, crownDiameter);
  ctx.fillStyle = "#FFFFFF";
  ctx.fill();
  clearShadow(ctx);

  const photo = store.markerPhotoUrl
    ? await loadImage(store.markerPhotoUrl)
    : null;

  ctx.save();
  traceTeardrop(ctx, cx, cy, crownDiameter);
  ctx.clip();
  if (photo) {
    // object-fit: cover against the silhouette's bounding box.
    const boxX = cx - r;
    const boxY = crownY - r;
    const boxW = crownDiameter;
    const boxH = crownDiameter + tipDrop;
    const scale = Math.max(boxW / photo.width, boxH / photo.height);
    const drawW = photo.width * scale;
    const drawH = photo.height * scale;
    ctx.drawImage(
      photo,
      boxX + (boxW - drawW) / 2,
      boxY + (boxH - drawH) / 2,
      drawW,
      drawH,
    );
  } else {
    ctx.fillStyle = colorForStore(store);
    ctx.fillRect(0, 0, width, height);
  }
  ctx.restore();

  if (!photo) {
    // Monogram chip, nested in the M's valley and centred on the crown.
    const font = `700 ${r * 0.42}px Inter, system-ui, sans-serif`;
    const label = monogramFor(store.storeName);
    const textW = measure(ctx, label, font);
    const chipH = r * 0.62;
    const chipW = textW + r * 0.36;
    roundedRect(
      ctx,
      cx - chipW / 2,
      crownY - chipH / 2,
      chipW,
      chipH,
      chipH / 2,
    );
    ctx.fillStyle = "#FFFFFF";
    ctx.fill();
    ctx.font = font;
    ctx.fillStyle = colorForStore(store);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, cx, crownY);
  }

  traceTeardrop(ctx, cx, cy, crownDiameter);
  ctx.strokeStyle = "#FFFFFF";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Open/closed dot on the upper-right shoulder.
  const dotX = cx + r * 0.68;
  const dotY = crownY - r * 0.68;
  ctx.beginPath();
  ctx.arc(dotX, dotY, STATUS_BADGE_RADIUS + 1.5, 0, Math.PI * 2);
  ctx.fillStyle = "#FFFFFF";
  ctx.fill();
  ctx.beginPath();
  ctx.arc(dotX, dotY, STATUS_BADGE_RADIUS, 0, Math.PI * 2);
  ctx.fillStyle = store.isOpen ? STATUS_OPEN : TEXT_SECONDARY;
  ctx.fill();

  return canvas;
}

/** PRICE_CARD — a white pill carrying the nightly price. */
function drawPriceCard(store: NearbyStore, size: number, dpr: number) {
  const label =
    store.markerPrice === null
      ? store.storeName
      : `₱${store.markerPrice.toLocaleString("en-PH")}`;
  const font = `700 ${size * 0.24}px Inter, system-ui, sans-serif`;
  const probe = document.createElement("canvas").getContext("2d")!;
  const textW = measure(probe, label, font);

  const paddingH = 12;
  const paddingV = 6;
  const pillW = textW + paddingH * 2;
  const pillH = size * 0.24 * 1.4 + paddingV * 2;
  const { canvas, ctx } = newCanvas(
    pillW + SHADOW_PADDING,
    pillH + SHADOW_PADDING,
    dpr,
  );

  const x = SHADOW_PADDING / 2;
  const y = SHADOW_PADDING / 2;

  applyShadow(ctx, false);
  roundedRect(ctx, x, y, pillW, pillH, pillH / 2);
  ctx.fillStyle = "#FFFFFF";
  ctx.fill();
  clearShadow(ctx);

  ctx.strokeStyle = BORDER_HAIRLINE;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.font = font;
  ctx.fillStyle = TEXT_PRIMARY;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, x + pillW / 2, y + pillH / 2);

  return canvas;
}

/** LABEL_CARD — a white pill with a category badge, title and subtitle. */
function drawLabelCard(store: NearbyStore, size: number, dpr: number) {
  const titleFont = `700 ${size * 0.19}px Inter, system-ui, sans-serif`;
  const subFont = `500 ${size * 0.15}px Inter, system-ui, sans-serif`;
  const probe = document.createElement("canvas").getContext("2d")!;

  const maxTextWidth = size * 1.6;
  const title = ellipsise(probe, store.storeName, titleFont, maxTextWidth);
  const subtitle = store.markerSubtitle
    ? ellipsise(probe, store.markerSubtitle, subFont, maxTextWidth)
    : "";

  const badgeDiameter = size * 0.5;
  const paddingH = 8;
  const gapIconText = 6;
  const textW = Math.max(
    measure(probe, title, titleFont),
    subtitle ? measure(probe, subtitle, subFont) : 0,
  );
  const pillW = paddingH * 2 + badgeDiameter + gapIconText + textW;
  const pillH = badgeDiameter + 8;

  const { canvas, ctx } = newCanvas(
    pillW + SHADOW_PADDING,
    pillH + SHADOW_PADDING,
    dpr,
  );
  const x = SHADOW_PADDING / 2;
  const y = SHADOW_PADDING / 2;

  applyShadow(ctx, false);
  roundedRect(ctx, x, y, pillW, pillH, pillH / 2);
  ctx.fillStyle = "#FFFFFF";
  ctx.fill();
  clearShadow(ctx);

  ctx.strokeStyle = BORDER_HAIRLINE;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  const badgeX = x + paddingH + badgeDiameter / 2;
  const badgeY = y + pillH / 2;
  ctx.beginPath();
  ctx.arc(badgeX, badgeY, badgeDiameter / 2, 0, Math.PI * 2);
  ctx.fillStyle = colorForStore(store);
  ctx.fill();

  ctx.font = `700 ${badgeDiameter * 0.5}px Inter, system-ui, sans-serif`;
  ctx.fillStyle = "#FFFFFF";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(monogramFor(store.storeName)[0], badgeX, badgeY);

  const textX = badgeX + badgeDiameter / 2 + gapIconText;
  ctx.textAlign = "left";
  if (subtitle) {
    ctx.font = titleFont;
    ctx.fillStyle = TEXT_PRIMARY;
    ctx.fillText(title, textX, y + pillH / 2 - size * 0.1);
    ctx.font = subFont;
    ctx.fillStyle = TEXT_SECONDARY;
    ctx.fillText(subtitle, textX, y + pillH / 2 + size * 0.11);
  } else {
    ctx.font = titleFont;
    ctx.fillStyle = TEXT_PRIMARY;
    ctx.fillText(title, textX, y + pillH / 2);
  }

  return canvas;
}

/**
 * Registers [store]'s pin as a style image if it is not already present, and
 * returns the id the symbol layer should reference.
 */
export async function ensurePinImage(
  map: mapboxgl.Map,
  store: NearbyStore,
  viewportWidth: number,
): Promise<string> {
  const iconId = pinIconIdFor(store);
  if (map.hasImage(iconId)) return iconId;

  const size = cardSizeFor(viewportWidth);
  const dpr = typeof window === "undefined" ? 1 : window.devicePixelRatio || 1;

  let canvas: HTMLCanvasElement;
  switch (store.markerDisplayMode) {
    case "PRICE_CARD":
      canvas = drawPriceCard(store, size, dpr);
      break;
    case "LABEL_CARD":
      canvas = drawLabelCard(store, size, dpr);
      break;
    default:
      canvas = await drawPhotoCard(store, size, dpr);
  }

  // The photo card awaits an image load, so another caller may have registered
  // this same id while we were waiting.
  if (map.hasImage(iconId)) return iconId;

  const ctx = canvas.getContext("2d")!;
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
  map.addImage(iconId, data, { pixelRatio: dpr });
  return iconId;
}

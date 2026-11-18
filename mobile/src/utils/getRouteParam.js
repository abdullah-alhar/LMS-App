export default function getRouteParam(value) {
  return Array.isArray(value) ? value[0] : value;
}

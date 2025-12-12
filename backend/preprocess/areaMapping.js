function resolveArea(lat, lng) {
  if (lat == null || lng == null) return "Unknown";

  lat = Number(lat);
  lng = Number(lng);

  if (lat < 22.15 || lat > 22.6 || lng < 113.8 || lng > 114.4) {
    return "Unknown";
  }

  if (lat < 22.28 && lng > 114.1) {
    return "Hong Kong Island";
  }

  if (lat >= 22.26 && lat <= 22.36 && lng >= 114.14 && lng <= 114.23) {
    return "Kowloon";
  }

  return "New Territories";
}

module.exports = resolveArea;

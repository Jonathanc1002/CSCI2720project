/**
 * Area mapping by venue name for TOP 30 busiest venues as of 5.45AM HKT 12/14/2025
 */

function resolveArea(venueName) {
  if (!venueName || typeof venueName !== 'string') return "Others";
  
  const name = venueName.toLowerCase().trim();

  // Exact venue name matching for TOP 30
  if (name.includes("sha tin")) return "Sha Tin";
  if (name.includes("yuen long")) return "Yuen Long";
  if (name.includes("tuen mun")) return "Tuen Mun";
  if (name.includes("north district")) return "North District";
  if (name.includes("tai po")) return "Tai Po";
  if (name.includes("ko shan theatre")) return "Hung Hom";
  if (name.includes("ngau chi wan")) return "Ngau Chi Wan";
  if (name.includes("hong kong cultural centre")) return "Tsim Sha Tsui";
  if (name.includes("hong kong city hall")) return "Central";
  if (name.includes("hong kong film archive")) return "Sai Wan Ho";

  // Fallback
  return "Others";
}

module.exports = resolveArea;
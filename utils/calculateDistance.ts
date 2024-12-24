const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
) => {
  const R = 6371e3;
  const toRad = (value: number) => (value * Math.PI) / 180;
  const phi1 = toRad(lat1);
  const phi2 = toRad(lat2);
  const delPhi = toRad(lat2 - lat1);
  const delLambda = toRad(lon2 - lon1);

  const a =
    Math.sin(delPhi / 2) * Math.sin(delPhi / 2) +
    Math.cos(phi1) *
      Math.cos(phi2) *
      Math.sin(delLambda / 2) *
      Math.sin(delLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

export default calculateDistance;

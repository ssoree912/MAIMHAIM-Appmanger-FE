import calculateDistance from './calculateDistance';

const clusterData = (
  data: Array<{latitude: number; longitude: number}>,
  threshold: number,
) => {
  const clusters: Array<{latitude: number; longitude: number; count: number}> =
    [];

  data.forEach(point => {
    let addedToCluster = false;

    for (let cluster of clusters) {
      const distance = calculateDistance(
        cluster.latitude,
        cluster.longitude,
        point.latitude,
        point.longitude,
      );

      if (distance < threshold) {
        cluster.latitude =
          (cluster.latitude * cluster.count + point.latitude) /
          (cluster.count + 1);
        cluster.longitude =
          (cluster.longitude * cluster.count + point.longitude) /
          (cluster.count + 1);
        cluster.count += 1;
        addedToCluster = true;
        break;
      }
    }

    if (!addedToCluster) {
      clusters.push({
        latitude: point.latitude,
        longitude: point.longitude,
        count: 1,
      });
    }
  });

  return clusters;
};

export default clusterData;

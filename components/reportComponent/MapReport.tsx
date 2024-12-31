import React, {useState, useEffect, useRef} from 'react';
import styled from 'styled-components/native';
import MapView, {Marker, Region} from 'react-native-maps';
import {View, Text, Image, TouchableOpacity} from 'react-native';
import {debounce} from 'lodash';
import calculateDistance from '../../utils/calculateDistance';
import LinearGradient from 'react-native-linear-gradient';
import {ClusterType, DataPointType} from '../../interface/interface';

const clusterApps = (
  data: DataPointType[],
  threshold: number,
): ClusterType[] => {
  const clusters: ClusterType[] = [];

  data.forEach(point => {
    let addedToCluster = false;

    for (let cluster of clusters) {
      const distance = calculateDistance(
        cluster.latitude,
        cluster.longitude,
        point.coordinate.latitude,
        point.coordinate.longitude,
      );

      if (distance < threshold && cluster.app!.appId === point.app.appId) {
        cluster.latitude =
          (cluster.latitude * cluster.count + point.coordinate.latitude) /
          (cluster.count + 1);
        cluster.longitude =
          (cluster.longitude * cluster.count + point.coordinate.longitude) /
          (cluster.count + 1);
        cluster.count += 1;
        addedToCluster = true;
        break;
      }
    }

    if (!addedToCluster) {
      clusters.push({
        latitude: point.coordinate.latitude,
        longitude: point.coordinate.longitude,
        app: point.app,
        count: 1,
      });
    }
  });

  return clusters;
};

const MapReport = ({data}: {data: DataPointType[]}) => {
  const [region, setRegion] = useState<Region>({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  const [clusters, setClusters] = useState<ClusterType[]>([]);
  const zoomButtonPressed = useRef<boolean>(false);

  useEffect(() => {
    const baseThreshold = 100; // meters
    const threshold = baseThreshold * region.latitudeDelta * 100;
    const clusteredData = clusterApps(data, threshold);
    setClusters(clusteredData);
  }, [region, data]);

  const zoomIn = () => {
    zoomButtonPressed.current = true;
    setRegion(prevRegion => ({
      ...prevRegion,
      latitudeDelta: prevRegion.latitudeDelta / 2,
      longitudeDelta: prevRegion.longitudeDelta / 2,
    }));
  };

  const zoomOut = () => {
    zoomButtonPressed.current = true;
    setRegion(prevRegion => ({
      ...prevRegion,
      latitudeDelta: prevRegion.latitudeDelta * 2,
      longitudeDelta: prevRegion.longitudeDelta * 2,
    }));
  };

  const handleRegionChangeComplete = debounce((newRegion: Region) => {
    if (!zoomButtonPressed.current) {
      setRegion(newRegion);
    } else {
      zoomButtonPressed.current = false;
    }
  }, 100);

  return (
    <Container>
      <MapContainer>
        <StyledMap
          region={region}
          onRegionChangeComplete={handleRegionChangeComplete}
          zoomEnabled={true}
          scrollEnabled={true}>
          {clusters.map((cluster, index) => {
            const baseSize = 30;
            const size = baseSize + Math.floor(cluster.count / 4) * 10;
            return (
              <Marker
                key={index}
                coordinate={{
                  latitude: cluster.latitude,
                  longitude: cluster.longitude,
                }}>
                <ClusterBubble
                  size={size}
                  colors={['#ffffff30', '#B4B4B4']}
                  start={{x: 0, y: 0}}
                  end={{x: 0, y: 1}}>
                  <MarkerImage source={{uri: cluster.app!.image}} size={size} />
                </ClusterBubble>
              </Marker>
            );
          })}
        </StyledMap>
      </MapContainer>
      <ZoomControls>
        <ZoomButton onPress={zoomIn}>
          <ZoomText>+</ZoomText>
        </ZoomButton>
        <ZoomButton onPress={zoomOut}>
          <ZoomText>-</ZoomText>
        </ZoomButton>
      </ZoomControls>
    </Container>
  );
};

const Container = styled(View)`
  width: 100%;
  height: 289px;
  justify-content: center;
  align-items: center;
`;

const MapContainer = styled(View)`
  width: 100%;
  height: 100%;
  border-radius: 30px;
  overflow: hidden;
`;

const StyledMap = styled(MapView)`
  flex: 1;
`;

const ClusterBubble = styled(LinearGradient)<{size: number}>`
  width: ${props => props.size}px;
  height: ${props => props.size}px;
  border-radius: ${props => props.size / 2}px;
  justify-content: center;
  align-items: center;
`;

const MarkerImage = styled(Image)<{size: number}>`
  width: ${props => props.size * 0.6}px;
  height: ${props => props.size * 0.6}px;
  border-radius: ${props => (props.size * 0.6) / 6}px;
`;

const ZoomControls = styled(View)`
  position: absolute;
  top: 14px;
  right: 14px;
  flex-direction: column;
  gap: 1px;
`;

const ZoomButton = styled(TouchableOpacity)`
  background-color: rgba(181, 181, 181, 0.726);
  width: 24px;
  height: 24px;
  justify-content: center;
  align-items: center;
`;

const ZoomText = styled(Text)`
  color: white;
  font-size: 12px;
  font-weight: bold;
`;

export default MapReport;

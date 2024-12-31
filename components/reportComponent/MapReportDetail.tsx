import React, {useState, useEffect, useRef} from 'react';
import styled from 'styled-components/native';
import MapView, {Marker, Region} from 'react-native-maps';
import {View, Text, TouchableOpacity, Image} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {styles} from '../../styles/styleGuide';
import clusterData from '../../utils/clusterData';
import {debounce} from 'lodash';
import {ClusterType, CoordinateType} from '../../interface/interface';
import data from '../../mock/testData2.json';

const MapReportDetail = ({appId}: {appId: number}) => {
  // TODO: 나중에 파라미터로 넘어오는 appId를 가지고 mapReportDetail api호출하시면 됩니다.

  // TODO: 지도호출을 위한 기본 좌표 설정은 추후 네이티브 앱이랑 연결하실 때 사용자 위치를 가져올 수 있게 되면 그걸 기준으로 하시면 됩니다.
  const [region, setRegion] = useState<Region>({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  const zoomButtonPressed = useRef(false);
  const iconUrl = data.data.app.image;
  const coordinateData: CoordinateType[] = data.data.coordinates;
  const [clusters, setClusters] = useState<ClusterType[]>([]);

  useEffect(() => {
    const baseThreshold = 100;
    const threshold = baseThreshold * region.latitudeDelta * 100;

    const clusteredData = clusterData(coordinateData, threshold);
    setClusters(clusteredData);
  }, [region]);

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
                }}
                anchor={{x: 0.5, y: 0.5}}>
                <ClusterBubble
                  size={size}
                  colors={['#ffffff30', '#B4B4B4']}
                  start={{x: 0, y: 0}}
                  end={{x: 0, y: 1}}>
                  <ClusterText size={size}>{cluster.count}</ClusterText>
                </ClusterBubble>
              </Marker>
            );
          })}
        </StyledMap>
        <IconImage source={{uri: iconUrl}} />
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
  position: relative;
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

const ClusterText = styled(Text)<{size: number}>`
  color: ${styles.colors.gray[600]};
  font-size: ${props => props.size / 3}px;
  font-weight: bold;
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

const IconImage = styled(Image)`
  width: 44px;
  height: 44px;
  position: absolute;
  z-index: 99;
  top: 27;
  left: 26;
  background-color: white;
  border-radius: 10px;
`;

export default MapReportDetail;

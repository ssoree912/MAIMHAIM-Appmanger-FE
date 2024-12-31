import React, {useState, useRef} from 'react';
import {TouchableOpacity, View} from 'react-native';
import MapView, {Polyline, Region} from 'react-native-maps';
import styled from 'styled-components/native';
import EntypoIcon from 'react-native-vector-icons/Entypo';
import FoundationIcon from 'react-native-vector-icons/Foundation';
import {debounce} from 'lodash';

const MapTimeline = () => {
  const [region, setRegion] = useState<Region>({
    latitude: 37.5686,
    longitude: 126.9796,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  });

  const zoomButtonPressed = useRef(false);

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

  const resetZoom = () => {
    zoomButtonPressed.current = true;
    setRegion({
      latitude: 37.5686,
      longitude: 126.9796,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005,
    });
  };

  const routeList = [
    {latitude: 37.5665, longitude: 126.978},
    {latitude: 37.5665, longitude: 126.9791},
    {latitude: 37.56928, longitude: 126.9793},
    {latitude: 37.56925, longitude: 126.97985},
    {latitude: 37.5691, longitude: 126.9818},
    {latitude: 37.56931, longitude: 126.9817},
    {latitude: 37.56931, longitude: 126.98182},
    {latitude: 37.56941, longitude: 126.98192},
    {latitude: 37.57, longitude: 126.982},
  ];

  const handleRegionChangeComplete = debounce((newRegion: Region) => {
    if (!zoomButtonPressed.current) {
      setRegion(newRegion);
    } else {
      zoomButtonPressed.current = false;
    }
  }, 200);

  return (
    <Container>
      <MapContainer>
        <StyledMap
          region={region}
          onRegionChangeComplete={handleRegionChangeComplete}>
          <Polyline
            coordinates={routeList}
            strokeWidth={3}
            strokeColor="black"
          />
        </StyledMap>
      </MapContainer>
      <ZoomControls>
        <ZoomButton onPress={resetZoom}>
          <FoundationIcon name="target-two" size={20} color="#000000" />
        </ZoomButton>
        <ZoomButton onPress={zoomIn}>
          <EntypoIcon name="plus" size={18} color="#000000" />
        </ZoomButton>
        <ZoomButton onPress={zoomOut}>
          <EntypoIcon name="minus" size={18} color="#000000" />
        </ZoomButton>
      </ZoomControls>
    </Container>
  );
};

const Container = styled(View)`
  width: 100%;
  height: 251px;
  justify-content: center;
  align-items: center;
`;

const MapContainer = styled(View)`
  width: 100%;
  height: 100%;
  border-radius: 17px;
  overflow: hidden;
  border: 2px solid #b4b4b4;
`;

const StyledMap = styled(MapView)`
  flex: 1;
`;

const ZoomControls = styled(View)`
  position: absolute;
  top: 14px;
  right: 14px;
  flex-direction: column;
  gap: 6px;
`;

const ZoomButton = styled(TouchableOpacity)`
  background-color: white;
  width: 24px;
  height: 24px;
  justify-content: center;
  align-items: center;
  border-radius: 12px;
  border: 1.5px solid #b4b4b4;
`;

export default MapTimeline;

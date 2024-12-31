import React, {useState, useEffect, useRef} from 'react';
 import styled from 'styled-components/native';
 import MapView, {Marker, Region} from 'react-native-maps';
 import {View, Text, TouchableOpacity, Image, ActivityIndicator} from 'react-native';
 import LinearGradient from 'react-native-linear-gradient';
 import {styles} from '../../styles/styleGuide';
 import clusterData from '../../utils/clusterData';
 import {debounce} from 'lodash';
 import {ClusterType, CoordinateType} from '../../interface/interface';

 import {getDetailMaps} from '../../services/apiServices';

interface MapReportDetailProps {
  appId: number;
  memberId: number;
  startDate: string;
}

const MapReportDetail: React.FC<MapReportDetailProps> = ({ appId, memberId, startDate }) => {
   // 로딩 상태
   const [loading, setLoading] = useState<boolean>(true);

   // 지도에 표시할 아이콘 URL
   const [iconUrl, setIconUrl] = useState<string>('');
   // 지도에 표시할 좌표 목록
   const [coordinateData, setCoordinateData] = useState<CoordinateType[]>([]);

   // 지도 영역 (초기값: 샌프란시스코 예시)
   const [region, setRegion] = useState<Region>({
         latitude: 36.1372,
         longitude: -115.1519,
         latitudeDelta: 0.02,
         longitudeDelta: 0.02,
       });
   // 클러스터링된 결과
   const [clusters, setClusters] = useState<ClusterType[]>([]);

   // 줌 버튼 클릭 여부
   const zoomButtonPressed = useRef(false);

    // (1) appId, memberId, startDate 바뀔 때마다 API 호출
     useEffect(() => {
       const fetchDetailMaps = async () => {
         try {
           setLoading(true);
           const response = await getDetailMaps(memberId, startDate, appId);
           // 구조: { status, data: { app, coordinates } }
           if (response?.data) {
             const { app, coordinates } = response.data;
             setIconUrl(app.image);
             setCoordinateData(coordinates || []);
           }
         } catch (error) {
           console.error('Error fetching detail maps:', error);
         } finally {
           setLoading(false);
         }
       };

       fetchDetailMaps();
     }, [appId, memberId, startDate]);

     // (2) region 또는 coordinateData 바뀔 때마다 클러스터링
     useEffect(() => {
       if (coordinateData.length > 0) {
         const baseThreshold = 100;
         const threshold = baseThreshold * region.latitudeDelta * 100;
         const clusteredData = clusterData(coordinateData, threshold);
         setClusters(clusteredData);
       } else {
         setClusters([]);
       }
     }, [region, coordinateData]);


   // (3) 줌 인/줌 아웃
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

   // (4) 지도가 움직임 완료 시 region 업데이트
   const handleRegionChangeComplete = debounce((newRegion: Region) => {
     if (!zoomButtonPressed.current) {
       setRegion(newRegion);
     } else {
       zoomButtonPressed.current = false;
     }
   }, 100);

   // (5) 로딩 중이면 인디케이터 표시
   if (loading) {
     return (
       <LoadingContainer>
         <ActivityIndicator size="large" color="#999" />
       </LoadingContainer>
     );
   }

   return (
     <Container>
       <MapContainer>
         <StyledMap
           region={region}
           onRegionChangeComplete={handleRegionChangeComplete}
           zoomEnabled={true}
           scrollEnabled={true}
         >
           {/* 클러스터 마커 */}
           {clusters.map((cluster, index) => {
             const baseSize = 30;
             // count에 따라 크기 증가
             const size = baseSize + Math.floor(cluster.count / 4) * 10;

             return (
               <Marker
                 key={index}
                 coordinate={{
                   latitude: cluster.latitude,
                   longitude: cluster.longitude,
                 }}
                 anchor={{x: 0.5, y: 0.5}} // 중앙 앵커
               >
                 <ClusterBubble
                   size={size}
                   colors={['#ffffff30', '#B4B4B4']}
                   start={{x: 0, y: 0}}
                   end={{x: 0, y: 1}}
                 >
                   <ClusterText size={size}>{cluster.count}</ClusterText>
                 </ClusterBubble>
               </Marker>
             );
           })}

           {/* 굳이 아이콘을 클러스터와 별도로 표시하려면
               coordinates.map(...) 마커를 표시할 수도 있습니다. */}
         </StyledMap>

         {/* (6) 앱 아이콘 - 왼쪽 상단 등에 표시 */}
         {iconUrl ? <IconImage source={{ uri: iconUrl }} /> : null}
       </MapContainer>

       {/* (7) 줌 버튼 */}
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

 export default MapReportDetail;

 /* ---------------- Styled Components ---------------- */

 const LoadingContainer = styled(View)`
   flex: 1;
   align-items: center;
   justify-content: center;
 `;

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
 `;

 const ZoomButton = styled(TouchableOpacity)`
   background-color: rgba(181, 181, 181, 0.726);
   width: 24px;
   height: 24px;
   justify-content: center;
   align-items: center;
   margin-bottom: 4px;
 `;

 const ZoomText = styled(Text)`
   color: white;
   font-size: 12px;
   font-weight: bold;
 `;

 /** 앱 아이콘 - 지도 위 좌상단 예시 */
 const IconImage = styled(Image)`
   width: 44px;
   height: 44px;
   position: absolute;
   z-index: 99;
   top: 27px;
   left: 26px;
   background-color: white;
   border-radius: 10px;
 `;

import React, {useEffect} from 'react';
import {
  NativeRouter,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-native';
import {BackHandler, Alert} from 'react-native';
import {RecoilRoot} from 'recoil';

import HomeScreen from './screens/home/HomeScreen';
import AppManage from './screens/appmanage/AppManage';
import Setting from './screens/setting/Setting';
import AddApp from './screens/addApp/AddApp';
import ManangeDetail from './screens/manageDetail/ManangeDetail';
import Loding from './screens/loding/main';

import TmoneyLoding from './screens/loding/tmoneyLoding';
import ComingSoonPage from './screens/comingSoonPage/ComingSoonPage';
import BottomBanner from './components/BottomBanner';
import ReportScreen from './screens/report/ReportScreen';
import ReportDetail from './screens/report/ReportDetail';
import BottomNavigationBar from './components/commonComponent/BottomNavigationBar';

const App = () => (
  <RecoilRoot>
    <NativeRouter>
      <AppRoutes />
    </NativeRouter>
  </RecoilRoot>
);

const AppRoutes = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleBackPress = () => {
      if (location.pathname === '/') {
        Alert.alert('앱 종료', '앱을 종료하시겠습니까?', [
          {text: '취소', style: 'cancel'},
          {text: '종료', onPress: () => BackHandler.exitApp()},
        ]);
        return true;
      } else {
        navigate(-1);
        return true;
      }
    };

    BackHandler.addEventListener('hardwareBackPress', handleBackPress);

    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBackPress);
    };
  }, [location.pathname, navigate]);

  // return (
  //   <>
  //     <Routes>
  //       <Route path="/" element={<HomeScreen />} />
  //       <Route path="/appmanage" element={<AppManage />} />
  //       <Route path="/appmanage/addapp" element={<AddApp />} />
  //       <Route path="/appmanage/:id" element={<ManangeDetail />} />
  //       <Route path="/loding/main" element={<Loding />} />

  //       <Route path="/loding/TmoneyLoding" element={<TmoneyLoding />} />
  //       <Route path="/report" element={<ComingSoonPage />} />
  //       <Route path="/setting" element={<ComingSoonPage />} />
  //     </Routes>

  //     {location.pathname !== '/loding/main' &&
  //       location.pathname !== '/loding/TmoneyLoding' &&<BottomBanner />}
  //   </>
  // );

  return (
    <>
      <Routes>
        <Route path="/" element={<ReportDetail />} />
        <Route path="/loding/TmoneyLoding" element={<TmoneyLoding />} />
        <Route path="/report" element={<ReportScreen />} />
        <Route path="/setting" element={<ComingSoonPage />} />
        <Route path="/report/:id" element={<ReportDetail />} />
      </Routes>
      {location.pathname !== '/loding/main' &&
        location.pathname !== '/loding/TmoneyLoding' &&
        location.pathname !== '/report/:id' && <BottomNavigationBar />}
    </>
  );
};

export default App;

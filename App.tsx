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
      if (location.pathname !== 'report') {
        if (location.pathname === '/') {
          Alert.alert('Exit App', 'Are you sure you want to exit the app?', [
            {text: 'Cancel', style: 'cancel'},
            {text: 'Exit', onPress: () => BackHandler.exitApp()},
          ]);
        } else {
          navigate(-1);
        }
      }

      return true;
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
        <Route path="/" element={<HomeScreen />} />
        <Route path="/appmanage" element={<AppManage />} />
        <Route path="/appmanage/addapp" element={<AddApp />} />
        <Route path="/appmanage/:id" element={<ManangeDetail />} />
        <Route path="/loding/TmoneyLoding" element={<TmoneyLoding />} />
        <Route path="/report" element={<ReportScreen />} />
        <Route path="/setting" element={<ComingSoonPage />} />
        <Route path="/reportdetail" element={<ReportDetail />} />
      </Routes>
      {location.pathname !== '/loding/main' &&
        location.pathname !== '/loding/TmoneyLoding' &&
        location.pathname !== '/reportdetail' && <BottomNavigationBar />}
    </>
  );
};

export default App;

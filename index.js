/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

const BackgroundTask = async () => {
  await console.log('백그라운드 작업 실행 중');
};

AppRegistry.registerHeadlessTask('BackgroundTask', () => BackgroundTask);
AppRegistry.registerComponent(appName, () => App);

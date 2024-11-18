import {atom} from 'recoil';

import mockupdata from '../mock/mockupdata.json';
import {AddApplicationType} from '../interface/interface';

export const AddApplication = atom<AddApplicationType[] | null>({
  key: 'addapp',
  default: null,
});
export const AddApplicationToggle = atom<boolean[]>({
  key: 'addToggle',
  default: mockupdata.appinformation.map(() => false),
});
export const AllApplicationToggle = atom<boolean>({
  key: 'allToggle',
  default: false,
});
export const ManageApplicationToggle = atom<boolean[]>({
  key: 'manageToggle',
  default: mockupdata.appinformation.map(() => false),
});
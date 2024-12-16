import axios from 'axios';


// const API_BASE_URL = 'http://192.168.219.101:8080/api/v1';
const API_BASE_URL = 'http://54.180.201.68:8080/api/v1';


export const addUser = async (uuid) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/member`, {uuid});
    return response;
  } catch (error) {
    console.error("Error in addUser:", error.message);
    console.error("Error details:", error.response?.data || error);
    throw error; // 상위에서 에러를 처리할 수 있도록 다시 던지기
  }
};

// 앱 조회 API
export const getApps = async (memberId: number, isAdd: boolean) => {
  return await axios.get(`${API_BASE_URL}/apps/${memberId}/category?isAdd=${isAdd}`);
};

// 추가페이지 앱 조회 API
export const getAppsToAdd = async (memberId: number) => {
  return await axios.get(`${API_BASE_URL}/apps/${memberId}`);
};



// 앱 추가 API
export const addApp = async (memberId: number, apps: { appId: number; add: boolean }[]) => {
  // 요청 본문 구성
  const requestBody = {
    memberId: memberId,
    apps: apps,
  };

  return await axios.patch(`${API_BASE_URL}/apps/${memberId}`, requestBody);
};



// 앱 활성화 또는 비활성화 API
export const activateApp = async (memberId: number, appId: number, activate: boolean) => {
    // 요청 본문 구성
    const requestBody = {
        "activate": activate // 활성화 상태 설정 (true 또는 false)
    };

    return await axios.patch(`${API_BASE_URL}/apps/${memberId}/${appId}/status`, requestBody);
};




// 앱 매니저 횟수 API
export const getTriggerCounts = async (memberId: number, isActive: boolean) => {
    return await axios.patch(`${API_BASE_URL}/status`, {
        memberId: memberId,
        active: isActive,
    });
};


// 특정 앱의 트리거 리스트 (필터링 추가)
export const getTriggers = async (appId: number, settingType?: 'LOCATION' | 'TIME' | 'SCHEDULE' | 'MOTION') => {
  const url = settingType
    ? `${API_BASE_URL}/apps/${appId}/triggers?settingType=${settingType}`
    : `${API_BASE_URL}/apps/${appId}/triggers`;

  try {
    const response = await axios.get(url);

    // API 응답에서 트리거 리스트 추출 및 필터링
    const triggers = response.data.data?.triggers || [];
    const filteredTriggers = settingType
      ? triggers.filter(trigger => trigger.type === settingType)
      : triggers;

    return { ...response.data, data: { ...response.data.data, triggers: filteredTriggers } };
  } catch (error) {
    console.error("Error fetching triggers:", error);
    throw error;
  }
};



// 특정 앱의 트리거 상세 정보 조회 (필터링 추가)
export const getAppById = async (appId: number, settingType?: 'LOCATION' | 'TIME' | 'SCHEDULE' | 'MOTION') => {
  const url = settingType
    ? `${API_BASE_URL}/apps/${appId}/triggers?settingType=${settingType}`
    : `${API_BASE_URL}/apps/${appId}/triggers`;
  const response = await axios.get(url);

  // settingType에 따라 트리거 리스트 필터링
  const triggers = response.data.data.triggers;
  const filteredTriggers = settingType
    ? triggers.filter(trigger => trigger.type === settingType)
    : triggers;

  return { ...response.data, data: { ...response.data.data, triggers: filteredTriggers } };
};

export const updateTrigger = async (appId, triggerId, time, week, type, foreGround = true) => {
  const triggerValueString = JSON.stringify({time: time, week: week});
  try {
    const requestBody = {
      triggerValue: triggerValueString,
      foreGround: foreGround,
      type: type, // 매개변수로 받은 트리거 타입 설정
    };

    console.log('Request URL:', `${API_BASE_URL}/apps/${appId}/triggers/${triggerId}/status`);
    console.log('Request Body:', requestBody); // 전송 데이터 확인용 로그

    // API 호출
    const response = await axios.patch(
      `${API_BASE_URL}/apps/${appId}/triggers/${triggerId}`,
      requestBody
    );

    // 성공 시 로그 출력
    console.log('Trigger update successful:', response.data);
    return response.data;
  } catch (error) {
    // 에러 발생 시 로그 출력
    console.error('Error updating trigger:', error);
    throw error; // 에러를 호출한 곳에서 처리할 수 있도록 다시 던짐
  }
};



export const activateTrigger = async (appId, triggerId, activate = true) => {
  try {
    const requestBody = {
      activate: activate, // 활성화 상태 설정 (true 또는 false)
    };

    const response = await axios.patch(
      `${API_BASE_URL}/apps/${appId}/triggers/${triggerId}/status`,
      requestBody
    );

    console.log('Trigger activation status updated successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating trigger activation status:', error);
    throw error; // 에러를 호출한 곳에서 처리할 수 있도록 다시 던짐
  }
};

// 고급 모드 활성화/비활성화 API
export const activateAdvancedApp = async (
  memberId: number,
  appId: number,
  activate: boolean
) => {
  // 요청 본문 구성
  const requestBody = {
    activate, // 활성화 상태 설정 (true 또는 false)
  };

  try {
    console.log('Request URL:', `${API_BASE_URL}/apps/${memberId}/${appId}/advanced-status`);
    console.log('Request Body:', requestBody);

    // API 호출
    const response = await axios.patch(
      `${API_BASE_URL}/apps/${memberId}/${appId}/advanced-status`,
      requestBody
    );

    // 성공 시 응답 로그
    console.log('Advanced mode activation successful:', response.data);
    return response.data;
  } catch (error) {
    // 에러 발생 시 로그 출력
    console.error('Error in advanced mode activation:', error.message);
    console.error('Error details:', error.response?.data || error);
    throw error; // 에러를 상위로 전달
  }

};

// 특정 앱의 상세 정보 가져오기 (고급 모드 상태 포함)
export const getAppDetails = async (appId: number, memberId: number) => {
  if (!appId || !memberId) {
    throw new Error("appId 또는 memberId가 누락되었습니다.");
  }

  const url = `${API_BASE_URL}/apps/${memberId}/${appId}`;
  try {
    console.log(`Fetching app details from URL: ${url}`);
    const response = await axios.get(url);
    const appDetails = response.data.data || {};
    return appDetails; // advanceActivate와 type 포함
  } catch (error) {
    console.error("Error fetching app details:", error.response?.data || error.message);
    throw error;
  }
};



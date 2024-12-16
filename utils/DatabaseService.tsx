import SQLite, { SQLiteDatabase } from 'react-native-sqlite-storage';

SQLite.DEBUG(true);
SQLite.enablePromise(true);

let db: SQLiteDatabase | null = null;

const openDatabase = async (): Promise<SQLiteDatabase> => {
  if (db) {
    return db;
  }
  try {
    db = await SQLite.openDatabase({ name: 'app_database.sqlite', location: 'default' });
    console.log('Database connection established');
    return db;
  } catch (error) {
    console.error('Error opening database:', error);
    throw error;
  }
};

const initializeDatabase = async () => {
  try {
    const database = await openDatabase();
    database.transaction(tx => {
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS App (
          appId INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT,
          apName TEXT,
          packageName TEXT,
          isAdd INTEGER,
          activate INTEGER,
          triggerType TEXT,
          triggerActive INTEGER,
          timeTriggerActive INTEGER,
          motionTriggerActive INTEGER,
          advancedMode INTEGER,
          isForeground INTEGER,
          time TEXT,
          week TEXT,
          count INTEGER
        );`,
        [],
        () =>
          console.log('React Native SQLite: App table created successfully.'),
        (_, error) =>
          console.error(
            'React Native SQLite: Error creating App table:',
            error,
          ),
      );
    });
  } catch (error) {
    console.error('React Native SQLite: Error initializing database:', error);
  }
};

const DatabaseService = {
  // 모든 앱 가져오기 메서드
  getAllApps: async (): Promise<void> => {
    try {
      const database = await openDatabase();
      database.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM App',
          [],
          (_, { rows }) => {
            if (rows.length > 0) {
              for (let i = 0; i < rows.length; i++) {
                console.log('App Record:', rows.item(i));
              }
            } else {
              console.log('No records found in the database');
            }
          },
          (tx, error) => {
            console.error('Error querying all apps:', error);
            throw error;
          }
        );
      });
    } catch (error) {
      console.error('Error during database operation:', error);
    }
  },

  // 모든 필드를 업데이트하는 메서드
  updateAppDetails: async (
    packageName: string,
    updates: {
      isAdd?: boolean;
      activate?: boolean;
      triggerType?: string;
      triggerActive?: boolean;
      advancedMode?: boolean;
      isForeGround?: boolean;
      time?: string | null;
      count?: number;
      timeTriggerActive?: boolean;
      week?: string;
    }
  ): Promise<void> => {
    try {
      const database = await openDatabase();
      database.transaction(tx => {
        const fields = [];
        const values: (string | number | boolean | null)[] = [];

        // 업데이트할 필드와 값을 배열에 추가
        for (const key in updates) {
          if (updates[key] !== undefined) {
            fields.push(`${key} = ?`);
            values.push(updates[key]);
          }
        }

        // 값에 packageName 추가
        values.push(packageName);

        if (fields.length > 0) {
          const query = `UPDATE App SET ${fields.join(', ')} WHERE packageName = ?`;
          tx.executeSql(
            query,
            values,
            (_, result) => {
              console.log('App details updated locally:', result);
            },
            (tx, error) => {
              console.error('Error updating app details:', error.message);
            }
          );
        } else {
          console.log('No fields to update');
        }
      });
    } catch (error) {
      console.error('Error during database operation:', error);
    }
  },

  // isAdd 필드 업데이트 메서드
  updateAppIsAdd: async (packageName: string, isAdd: boolean): Promise<void> => {
    try {
      const database = await openDatabase();
      const table = await initializeDatabase();
      database.transaction(tx => {
        tx.executeSql(
          'UPDATE App SET isAdd = ? WHERE packageName = ?',
          [isAdd ? 1 : 0, packageName],
          (_, result) => {
            console.log('App isAdd updated locally:', result);
          },
          (tx, error) => {
            console.error('Error updating app isAdd field:', error);
          }
        );
      });
    } catch (error) {
      console.error('Error during database operation:', error);
    }
  },

  // count 증가 메서드
  incrementAppCount: async (packageName: string): Promise<void> => {
    try {
      const database = await openDatabase();
      database.transaction(tx => {
        tx.executeSql(
          'UPDATE App SET count = count + 1 WHERE packageName = ?',
          [packageName],
          (_, result) => {
            console.log('App count incremented:', result);
          },
          (tx, error) => {
            console.error('Error incrementing app count:', error);
          }
        );
      });
    } catch (error) {
      console.error('Error during database operation:', error);
    }
  },

  // count 값 합계 가져오기 메서드
  showCounts: async (): Promise<number | void> => {
    try {
      const database = await openDatabase();
      return new Promise((resolve, reject) => {
        database.transaction(tx => {
          tx.executeSql(
            'SELECT SUM(count) as totalCount FROM App',
            [],
            (_, { rows }) => {
              const totalCount = rows.item(0).totalCount;
              console.log('Total count:', totalCount);
              resolve(totalCount);
            },
            (tx, error) => {
              console.error('Error querying total count:', error);
              reject(error);
            }
          );
        });
      });
    } catch (error) {
      console.error('Error during database operation:', error);
    }
  },

    // 시간 트리거 설정 메서드
    setTimeTrigger: async (
      packageName: string,
      week: string,
      time: string
    ): Promise<void> => {
      try {
        const database = await openDatabase();
        database.transaction(tx => {
          tx.executeSql(
            'UPDATE App SET week = ?, time = ?, timeTriggerActive = 1 WHERE packageName = ?',
            [week, time, packageName],
            (_, result) => {
              console.log('Time trigger set for package:', packageName, 'Result:', result);
            },
            (tx, error) => {
              console.error('Error setting time trigger:', error);
            }
          );
        });
      } catch (error) {
        console.error('Error during database operation:', error);
      }
    },

    // 시간 트리거 조회 메서드
    getTimeTrigger: async (packageName: string): Promise<void> => {
      try {
        const database = await openDatabase();
        database.transaction(tx => {
          tx.executeSql(
            'SELECT week, time FROM App WHERE packageName = ?',
            [packageName],
            (_, { rows }) => {
              if (rows.length > 0) {
                console.log('Time trigger for package:', rows.item(0));
              } else {
                console.log('No time trigger found for package:', packageName);
              }
            },
            (tx, error) => {
              console.error('Error querying time trigger:', error);
            }
          );
        });
      } catch (error) {
        console.error('Error during database operation:', error);
      }
    },

  getAppDetails: async (packageName: string): Promise<any> => {
    try {
      const database = await openDatabase();
      return new Promise((resolve, reject) => {
        database.transaction(tx => {
          tx.executeSql(
            'SELECT * FROM App WHERE packageName = ?',
            [packageName],
            (_, { rows }) => {
              if (rows.length > 0) {
                console.log('App details fetched from database:', rows.item(0));
                resolve(rows.item(0));
              } else {
                console.log('No matching app found in the database');
                resolve(null);
              }
            },
            (tx, error) => {
              console.error('Error fetching app details:', error);
              reject(error);
            }
          );
        });
      });
    } catch (error) {
      console.error('Error during database operation:', error);
      throw error;
    }
  }
  };



export default DatabaseService;

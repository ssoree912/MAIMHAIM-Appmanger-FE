import Foundation
import SQLite3

@objcMembers
class DBManager: NSObject {
    static let shared = DBManager()
    let databaseName = "app_database.sqlite"
    var db: OpaquePointer?

    private override init() {
        super.init()
        db = openDatabase()
        createAppTable()
    }

    // MARK: - Open Database
    func openDatabase() -> OpaquePointer? {
        let fileURL = try! FileManager.default
            .url(for: .documentDirectory, in: .userDomainMask, appropriateFor: nil, create: false)
            .appendingPathComponent(databaseName)
        
        var db: OpaquePointer? = nil
        if sqlite3_open(fileURL.path, &db) == SQLITE_OK {
            print("Database successfully opened at \(fileURL.path)")
            return db
        } else {
            print("Unable to open database.")
            return nil
        }
    }

    // MARK: - Create Table
    func createAppTable() {
        let createTableString = """
        CREATE TABLE IF NOT EXISTS App (
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
        );
        """
        executeQuery(createTableString, description: "Create App Table")
    }

    // MARK: - Execute Query
    private func executeQuery(_ query: String, description: String) {
        var statement: OpaquePointer? = nil
        if sqlite3_prepare_v2(db, query, -1, &statement, nil) == SQLITE_OK {
            if sqlite3_step(statement) == SQLITE_DONE {
                print("\(description) executed successfully.")
            } else {
                print("\(description) execution failed.")
            }
        } else {
            print("\(description) preparation failed.")
        }
        sqlite3_finalize(statement)
    }

    // MARK: - Insert App
    func insertApp(app: App) {
        let insertQuery = """
        INSERT INTO App (name, apName, packageName, isAdd, activate, triggerType, triggerActive, timeTriggerActive, motionTriggerActive, advancedMode, isForeground, time, week, count)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        """
        var insertStatement: OpaquePointer? = nil

        if sqlite3_prepare_v2(db, insertQuery, -1, &insertStatement, nil) == SQLITE_OK {
            let SQLITE_TRANSIENT = unsafeBitCast(-1, to: sqlite3_destructor_type.self)
            sqlite3_bind_text(insertStatement, 1, app.name, -1, SQLITE_TRANSIENT)
            sqlite3_bind_text(insertStatement, 2, app.apName, -1, SQLITE_TRANSIENT)
            sqlite3_bind_text(insertStatement, 3, app.packageName, -1, SQLITE_TRANSIENT)
            sqlite3_bind_int(insertStatement, 4, app.isAdd ? 1 : 0)
            sqlite3_bind_int(insertStatement, 5, app.activate ? 1 : 0)
            sqlite3_bind_text(insertStatement, 6, app.triggerType, -1, SQLITE_TRANSIENT)
            sqlite3_bind_int(insertStatement, 7, app.triggerActive ? 1 : 0)
            sqlite3_bind_int(insertStatement, 8, app.timeTriggerActive ? 1 : 0)
            sqlite3_bind_int(insertStatement, 9, app.motionTriggerActive ? 1 : 0)
            sqlite3_bind_int(insertStatement, 10, app.advancedMode ? 1 : 0)
            sqlite3_bind_int(insertStatement, 11, app.isForeground ? 1 : 0)
            sqlite3_bind_text(insertStatement, 12, app.time, -1, SQLITE_TRANSIENT)
            sqlite3_bind_text(insertStatement, 13, app.week, -1, SQLITE_TRANSIENT)
            sqlite3_bind_int(insertStatement, 14, Int32(app.count))

            if sqlite3_step(insertStatement) == SQLITE_DONE {
                print("App inserted successfully.")
            } else {
                print("Failed to insert App.")
            }
        } else {
            print("Failed to prepare insert statement.")
        }
        sqlite3_finalize(insertStatement)
    }

    // MARK: - Fetch App by Package Name
  func fetchAppByPackageName(_ packageName: String) -> App? {
      let query = "SELECT * FROM App WHERE packageName = ?;"
      var statement: OpaquePointer? = nil
      var fetchedApp: App? = nil

      if sqlite3_prepare_v2(db, query, -1, &statement, nil) == SQLITE_OK {
          let SQLITE_TRANSIENT = unsafeBitCast(-1, to: sqlite3_destructor_type.self)
          
          // 바인딩 확인
          if sqlite3_bind_text(statement, 1, (packageName as NSString).utf8String, -1, SQLITE_TRANSIENT) == SQLITE_OK {
              print("Query bound successfully with packageName: \(packageName)")
          } else {
              print("Error binding packageName: \(String(cString: sqlite3_errmsg(db)))")
              sqlite3_finalize(statement)
              return nil
          }
          
          // 결과 확인
          while sqlite3_step(statement) == SQLITE_ROW {
              fetchedApp = fetchAppFromStatement(statement)
              print("Fetched app: \(fetchedApp?.packageName ?? "N/A")")
          }
      } else {
          print("Error preparing SELECT statement: \(String(cString: sqlite3_errmsg(db)))")
      }

      sqlite3_finalize(statement)
      return fetchedApp
  }

    // MARK: - Fetch All Apps
    func fetchAllApps() -> [App] {
        return executeFetchQuery("SELECT * FROM App;")
    }

    // MARK: - Execute Fetch Query
    private func executeFetchQuery(_ query: String, bindHandler: ((OpaquePointer?) -> Void)? = nil) -> [App] {
        var statement: OpaquePointer? = nil
        var apps: [App] = []

        if sqlite3_prepare_v2(db, query, -1, &statement, nil) == SQLITE_OK {
            bindHandler?(statement)
            while sqlite3_step(statement) == SQLITE_ROW {
                if let app = fetchAppFromStatement(statement) {
                    apps.append(app)
                }
            }
        } else {
            print("Failed to prepare fetch query: \(query)")
        }
        sqlite3_finalize(statement)
        return apps
    }

    // MARK: - Fetch App From Statement
  private func fetchAppFromStatement(_ statement: OpaquePointer?) -> App? {
      guard let statement = statement else { return nil }
      
      let appId = Int(sqlite3_column_int(statement, 0))
      let name = (sqlite3_column_text(statement, 1) != nil) ? String(cString: sqlite3_column_text(statement, 1)!) : ""
      let apName = (sqlite3_column_text(statement, 2) != nil) ? String(cString: sqlite3_column_text(statement, 2)!) : ""
      let packageName = (sqlite3_column_text(statement, 3) != nil) ? String(cString: sqlite3_column_text(statement, 3)!) : ""
      let isAdd = sqlite3_column_int(statement, 4) != 0
      let activate = sqlite3_column_int(statement, 5) != 0
      let triggerType = (sqlite3_column_text(statement, 6) != nil) ? String(cString: sqlite3_column_text(statement, 6)!) : ""
      let triggerActive = sqlite3_column_int(statement, 7) != 0
      let timeTriggerActive = sqlite3_column_int(statement, 8) != 0
      let motionTriggerActive = sqlite3_column_int(statement, 9) != 0
      let advancedMode = sqlite3_column_int(statement, 10) != 0
      let isForeground = sqlite3_column_int(statement, 11) != 0
      let time = (sqlite3_column_text(statement, 12) != nil) ? String(cString: sqlite3_column_text(statement, 12)!) : ""
      let week = (sqlite3_column_text(statement, 13) != nil) ? String(cString: sqlite3_column_text(statement, 13)!) : ""
      let count = Int(sqlite3_column_int(statement, 14))

      return App(
          appId: appId,
          name: name,
          apName: apName,
          packageName: packageName,
          isAdd: isAdd,
          activate: activate,
          triggerType: triggerType,
          triggerActive: triggerActive,
          timeTriggerActive: timeTriggerActive,
          motionTriggerActive: motionTriggerActive,
          advancedMode: advancedMode,
          isForeground: isForeground,
          time: time,
          week: week,
          count: count
      )
    }
}

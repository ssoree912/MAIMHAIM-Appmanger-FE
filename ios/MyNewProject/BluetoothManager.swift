import CoreBluetooth
import UIKit

@objc(BluetoothManager)
class BluetoothManager: NSObject, CBCentralManagerDelegate {
    private var centralManager: CBCentralManager?
    private var targetPeripheral: CBPeripheral?
    private let targetDeviceName = "TargetDeviceName" // 감지하려는 BLE 장치 이름

    override init() {
        super.init()
        centralManager = CBCentralManager(delegate: self, queue: nil, options: [CBCentralManagerOptionRestoreIdentifierKey: "BluetoothRestore"])
    }

    @objc func startScanning() {
        guard let centralManager = centralManager else {
            print("Central Manager is not initialized")
            return
        }

        if centralManager.state == .poweredOn {
            centralManager.scanForPeripherals(withServices: nil, options: nil)
            print("Scanning started...")
        } else {
            print("Bluetooth is not powered on.")
        }
    }

    func centralManagerDidUpdateState(_ central: CBCentralManager) {
        if central.state == .poweredOn {
            central.scanForPeripherals(withServices: nil, options: nil)
        } else {
            print("Bluetooth is not available.")
        }
    }

    func centralManager(_ central: CBCentralManager, didDiscover peripheral: CBPeripheral, advertisementData: [String: Any], rssi RSSI: NSNumber) {
        guard let name = peripheral.name, name == targetDeviceName else {
            return
        }

        print("Target device found: \(name)")
        targetPeripheral = peripheral
        central.stopScan()

        triggerApp()
    }

    private func triggerApp() {
        if let url = URL(string: "yourapp://open") { // Replace with your app's URI scheme
            DispatchQueue.main.async {
                UIApplication.shared.open(url, options: [:], completionHandler: nil)
            }
        }
    }
}

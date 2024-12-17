// MARK: - Kalman Filter
class KalmanFilter {
    var q: Double = 0.1 // Process noise covariance
    var r: Double = 0.1 // Measurement noise covariance
    var x: Double = 0.0 // Value
    var p: Double = 1.0 // Estimation error covariance
    var k: Double = 0.0 // Kalman gain

    func update(_ measurement: Double) -> Double {
        // Prediction update
        p = p + q

        // Measurement update
        k = p / (p + r)
        x = x + k * (measurement - x)
        p = (1 - k) * p

        return x
    }
}

import Foundation

class ApiService {
    static let shared = ApiService() // 싱글톤 패턴
  private let baseURL = Constants.baseURL // 서버 기본 URL
    
    private init() {} // 외부에서 초기화 방지

    /// POST 요청을 보내는 함수
    /// - Parameters:
    ///   - packageName: URL 경로에 포함될 패키지 이름
    ///   - memberId: 요청 바디에 포함될 멤버 ID
    ///   - type: 요청 바디에 포함될 타입 (예: LOCATION)
    ///   - completion: 요청 결과를 처리하는 클로저
    func addCount(packageName: String, memberId: Int, type: String, completion: @escaping (Result<String, Error>) -> Void) {
        // URL 생성
        let urlString = "\(baseURL)/api/v2/apps/\(packageName)/count"
        guard let url = URL(string: urlString) else {
            completion(.failure(ApiError.invalidURL))
            return
        }
        
        // 요청 바디 데이터 생성
        let requestBody: [String: Any] = [
            "memberId": memberId,
            "type": type
        ]
        
        guard let jsonData = try? JSONSerialization.data(withJSONObject: requestBody, options: []) else {
            completion(.failure(ApiError.invalidRequestBody))
            return
        }
        
        // URLRequest 생성
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = jsonData
        
        // URLSession 데이터 작업
        let task = URLSession.shared.dataTask(with: request) { data, response, error in
            // 에러 처리
            if let error = error {
                completion(.failure(error))
                return
            }
            
            // HTTP 응답 상태 코드 확인
            if let httpResponse = response as? HTTPURLResponse, !(200...299).contains(httpResponse.statusCode) {
                completion(.failure(ApiError.serverError(statusCode: httpResponse.statusCode)))
                return
            }
            
            // 데이터 처리
            if let data = data, let responseString = String(data: data, encoding: .utf8) {
                completion(.success(responseString))
            } else {
                completion(.failure(ApiError.invalidResponse))
            }
        }
        
        task.resume()
    }
}

// API 에러 정의
enum ApiError: Error {
    case invalidURL
    case invalidRequestBody
    case serverError(statusCode: Int)
    case invalidResponse
}

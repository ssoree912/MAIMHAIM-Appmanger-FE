package com.mynewproject;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

public class ParticleFilter {

    // 파티클 클래스 정의
    public static class Particle {
        double state;  // 입자의 상태 (RSSI 값)
        double weight; // 입자의 가중치

        public Particle(double state, double weight) {
            this.state = state;
            this.weight = weight;
        }
    }

    private List<Particle> particles;
    private int numParticles;  // 파티클의 개수
    private Random random;

    public ParticleFilter(int numParticles) {
        this.numParticles = numParticles;
        this.particles = new ArrayList<>();
        this.random = new Random();
        initializeParticles();
    }

    // 파티클 초기화
    private void initializeParticles() {
        for (int i = 0; i < numParticles; i++) {
            // 초기 상태를 랜덤하게 설정, 초기 가중치는 동일하게 설정
            particles.add(new Particle(random.nextDouble() * 100 - 100, 1.0 / numParticles));  // -100 ~ 0 사이의 임의의 RSSI 값
        }
    }

    // 예측 단계: 각 파티클의 상태를 업데이트
    public void predict(double processNoise) {
        for (Particle particle : particles) {
            // 노이즈를 추가하여 상태를 업데이트
            particle.state += processNoise * (random.nextGaussian());
        }
    }

    // 업데이트 단계: 측정값을 기반으로 파티클의 가중치 업데이트
    public void updateWeights(double measuredRSSI, double measurementNoise) {
        double totalWeight = 0.0;

        for (Particle particle : particles) {
            // 측정 노이즈를 기반으로 가중치 계산 (정규분포)
            double error = measuredRSSI - particle.state;
            particle.weight = Math.exp(-error * error / (2 * measurementNoise * measurementNoise));
            totalWeight += particle.weight;
        }

        // 모든 가중치를 정규화
        for (Particle particle : particles) {
            particle.weight /= totalWeight;
        }
    }

    // 재샘플링 단계: 가중치에 따라 새로운 파티클 세트를 생성
    public void resample() {
        List<Particle> newParticles = new ArrayList<>();
        double[] cumulativeWeights = new double[numParticles];

        cumulativeWeights[0] = particles.get(0).weight;
        for (int i = 1; i < numParticles; i++) {
            cumulativeWeights[i] = cumulativeWeights[i - 1] + particles.get(i).weight;
        }

        for (int i = 0; i < numParticles; i++) {
            double randomValue = random.nextDouble();
            for (int j = 0; j < numParticles; j++) {
                if (randomValue <= cumulativeWeights[j]) {
                    newParticles.add(new Particle(particles.get(j).state, 1.0 / numParticles));
                    break;
                }
            }
        }

        particles = newParticles;
    }

    // 현재 상태 추정값 반환
    public double getEstimatedState() {
        double estimate = 0.0;
        for (Particle particle : particles) {
            estimate += particle.state * particle.weight;
        }
        return estimate;
    }

//     public static void main(String[] args) {
//         // 파티클 필터 초기화 (파티클 100개)
//         ParticleFilter pf = new ParticleFilter(100);

//         // 예시: 측정된 RSSI 값들
//         double[] rssiMeasurements = {-72, -71, -73, -70, -69, -71};
//         double processNoise = 1.0;  // 프로세스 노이즈
//         double measurementNoise = 2.0;  // 측정 노이즈

//         for (double measuredRSSI : rssiMeasurements) {
//             pf.predict(processNoise);  // 상태 예측
//             pf.updateWeights(measuredRSSI, measurementNoise);  // 가중치 업데이트
//             pf.resample();  // 재샘플링
//             double estimatedRSSI = pf.getEstimatedState();  // 상태 추정
//             System.out.println("Filtered RSSI: " + estimatedRSSI);
//         }
//     }
}

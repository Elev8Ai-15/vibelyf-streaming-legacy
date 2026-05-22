/**
 * Prosody Analyzer for VibeCoder Engine
 * Real-time Voice Analysis for Emotion and Intent Detection
 * 
 * Extracts prosodic features (pitch, intensity, tempo, MFCCs) and
 * fuses with text embeddings for robust "vibe" understanding
 * 
 * Based on research from:
 * - OpenSMILE feature extraction standards
 * - Speech emotion recognition literature
 * - Paralinguistic feature datasets
 */

class ProsodyAnalyzer {
    constructor() {
        this.audioContext = null;
        this.analyser = null;
        this.microphone = null;
        this.isRecording = false;
        this.audioBuffer = [];
        this.sampleRate = 16000;
        this.frameSize = 512;
        this.hopSize = 256;
    }

    /**
     * Initialize audio context and request microphone access
     */
    async initialize() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)({
                sampleRate: this.sampleRate
            });

            const stream = await navigator.mediaDevices.getUserMedia({ 
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                } 
            });

            this.microphone = this.audioContext.createMediaStreamSource(stream);
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 2048;
            this.analyser.smoothingTimeConstant = 0.8;

            this.microphone.connect(this.analyser);

            return {
                success: true,
                message: 'Microphone initialized successfully',
                sampleRate: this.audioContext.sampleRate
            };
        } catch (error) {
            console.error('Failed to initialize audio:', error);
            return {
                success: false,
                message: `Failed to access microphone: ${error.message}`,
                error: error
            };
        }
    }

    /**
     * Start recording audio for analysis
     */
    startRecording() {
        if (!this.audioContext || !this.analyser) {
            return { success: false, message: 'Audio not initialized' };
        }

        this.isRecording = true;
        this.audioBuffer = [];
        this.recordingStartTime = Date.now();

        this.captureAudioData();

        return {
            success: true,
            message: 'Recording started',
            timestamp: this.recordingStartTime
        };
    }

    /**
     * Stop recording and return accumulated audio data
     */
    stopRecording() {
        this.isRecording = false;
        const duration = (Date.now() - this.recordingStartTime) / 1000;

        return {
            success: true,
            message: 'Recording stopped',
            duration: duration,
            samples: this.audioBuffer.length,
            audioData: this.audioBuffer
        };
    }

    /**
     * Capture audio data in real-time
     */
    captureAudioData() {
        if (!this.isRecording) return;

        const bufferLength = this.analyser.frequencyBinCount;
        const dataArray = new Float32Array(bufferLength);
        this.analyser.getFloatTimeDomainData(dataArray);

        // Store audio samples
        this.audioBuffer.push(...Array.from(dataArray));

        // Continue capturing
        requestAnimationFrame(() => this.captureAudioData());
    }

    /**
     * Extract comprehensive prosodic features from audio
     */
    extractFeatures(audioData = null) {
        const data = audioData || this.audioBuffer;
        
        if (data.length === 0) {
            return {
                error: 'No audio data available',
                features: null
            };
        }

        const features = {
            pitch: this.extractPitch(data),
            intensity: this.extractIntensity(data),
            speechRate: this.estimateSpeechRate(data),
            energy: this.calculateEnergy(data),
            zeroCrossingRate: this.calculateZeroCrossingRate(data),
            spectralCentroid: this.calculateSpectralCentroid(data),
            mfcc: this.extractMFCC(data, 13), // 13 coefficients standard
            tempo: this.estimateTempo(data),
            pauses: this.detectPauses(data),
            voicedSegments: this.detectVoicedSegments(data),
            timestamp: Date.now()
        };

        return {
            success: true,
            features: features,
            duration: data.length / this.sampleRate
        };
    }

    /**
     * Extract pitch (fundamental frequency) using autocorrelation
     */
    extractPitch(audioData) {
        const minPitch = 80;  // Hz (typical male lower bound)
        const maxPitch = 400; // Hz (typical female upper bound)
        
        // Autocorrelation for pitch detection
        const autocorr = this.autocorrelate(audioData);
        
        // Find the first peak in autocorrelation
        let maxCorr = 0;
        let maxLag = 0;
        const minLag = Math.floor(this.sampleRate / maxPitch);
        const maxLagSearch = Math.floor(this.sampleRate / minPitch);

        for (let lag = minLag; lag < maxLagSearch && lag < autocorr.length; lag++) {
            if (autocorr[lag] > maxCorr) {
                maxCorr = autocorr[lag];
                maxLag = lag;
            }
        }

        const pitch = maxLag > 0 ? this.sampleRate / maxLag : 0;

        // Calculate pitch contour
        const frameLength = 512;
        const hopLength = 256;
        const pitchContour = [];

        for (let i = 0; i < audioData.length - frameLength; i += hopLength) {
            const frame = audioData.slice(i, i + frameLength);
            const frameAutocorr = this.autocorrelate(frame);
            
            let framePitch = 0;
            let maxFrameCorr = 0;
            let maxFrameLag = 0;

            for (let lag = minLag; lag < Math.min(maxLagSearch, frameAutocorr.length); lag++) {
                if (frameAutocorr[lag] > maxFrameCorr) {
                    maxFrameCorr = frameAutocorr[lag];
                    maxFrameLag = lag;
                }
            }

            if (maxFrameLag > 0) {
                framePitch = this.sampleRate / maxFrameLag;
            }

            pitchContour.push(framePitch);
        }

        // Analyze pitch contour
        const contour = this.analyzePitchContour(pitchContour);
        const mean = pitch;
        const std = this.standardDeviation(pitchContour.filter(p => p > 0));

        return {
            mean: mean,
            std: std,
            contour: contour,
            range: {
                min: Math.min(...pitchContour.filter(p => p > 0)),
                max: Math.max(...pitchContour.filter(p => p > 0))
            },
            confidence: maxCorr
        };
    }

    /**
     * Analyze pitch contour pattern
     */
    analyzePitchContour(pitchContour) {
        const validPitches = pitchContour.filter(p => p > 0);
        if (validPitches.length < 3) return 'flat';

        // Calculate trend
        const n = validPitches.length;
        const indices = Array.from({length: n}, (_, i) => i);
        const slope = this.linearRegression(indices, validPitches).slope;

        // Calculate variation
        const variation = this.standardDeviation(validPitches) / this.mean(validPitches);

        // Classify contour
        if (Math.abs(slope) < 0.5 && variation < 0.1) {
            return 'flat';
        } else if (slope > 2) {
            return 'rising';
        } else if (slope < -2) {
            return 'falling';
        } else if (variation > 0.3) {
            return 'wavering';
        } else if (slope > 0) {
            return 'rising_end';
        } else if (slope < 0) {
            return 'falling_end';
        } else {
            return 'playful';
        }
    }

    /**
     * Extract intensity (loudness) features
     */
    extractIntensity(audioData) {
        const rms = Math.sqrt(this.mean(audioData.map(x => x * x)));
        const peakAmplitude = Math.max(...audioData.map(Math.abs));
        
        // Calculate intensity over time
        const frameLength = 512;
        const hopLength = 256;
        const intensityContour = [];

        for (let i = 0; i < audioData.length - frameLength; i += hopLength) {
            const frame = audioData.slice(i, i + frameLength);
            const frameRMS = Math.sqrt(this.mean(frame.map(x => x * x)));
            intensityContour.push(frameRMS);
        }

        const mean = this.mean(intensityContour);
        const std = this.standardDeviation(intensityContour);

        // Classify intensity level
        let level;
        if (mean < 0.01) level = 'very_low';
        else if (mean < 0.05) level = 'low';
        else if (mean < 0.1) level = 'low_moderate';
        else if (mean < 0.2) level = 'moderate';
        else if (mean < 0.4) level = 'moderate_high';
        else if (mean < 0.7) level = 'high';
        else level = 'very_high';

        return {
            rms: rms,
            peak: peakAmplitude,
            mean: mean,
            std: std,
            level: level,
            contour: intensityContour
        };
    }

    /**
     * Estimate speech rate (syllables per second)
     */
    estimateSpeechRate(audioData) {
        const energy = this.calculateEnergy(audioData);
        const frameLength = 512;
        const hopLength = 256;
        
        // Detect syllable nuclei using energy peaks
        const energyContour = [];
        for (let i = 0; i < audioData.length - frameLength; i += hopLength) {
            const frame = audioData.slice(i, i + frameLength);
            const frameEnergy = this.mean(frame.map(x => x * x));
            energyContour.push(frameEnergy);
        }

        // Find peaks (syllable candidates)
        const threshold = this.mean(energyContour) * 1.5;
        let peakCount = 0;
        let inPeak = false;

        for (let i = 1; i < energyContour.length - 1; i++) {
            if (energyContour[i] > threshold && 
                energyContour[i] > energyContour[i-1] && 
                energyContour[i] > energyContour[i+1]) {
                if (!inPeak) {
                    peakCount++;
                    inPeak = true;
                }
            } else if (energyContour[i] < threshold * 0.7) {
                inPeak = false;
            }
        }

        const duration = audioData.length / this.sampleRate;
        const syllablesPerSecond = peakCount / duration;

        // Classify speech rate
        let rate;
        if (syllablesPerSecond < 2) rate = 'very_slow';
        else if (syllablesPerSecond < 3) rate = 'slow';
        else if (syllablesPerSecond < 4) rate = 'normal';
        else if (syllablesPerSecond < 5.5) rate = 'fast';
        else rate = 'very_fast';

        return {
            syllablesPerSecond: syllablesPerSecond,
            rate: rate,
            totalSyllables: peakCount,
            duration: duration
        };
    }

    /**
     * Calculate overall energy
     */
    calculateEnergy(audioData) {
        const sumOfSquares = audioData.reduce((sum, sample) => sum + sample * sample, 0);
        return Math.sqrt(sumOfSquares / audioData.length);
    }

    /**
     * Calculate Zero Crossing Rate (indicator of noisiness)
     */
    calculateZeroCrossingRate(audioData) {
        let crossings = 0;
        for (let i = 1; i < audioData.length; i++) {
            if ((audioData[i] >= 0 && audioData[i-1] < 0) || 
                (audioData[i] < 0 && audioData[i-1] >= 0)) {
                crossings++;
            }
        }
        return crossings / audioData.length;
    }

    /**
     * Calculate Spectral Centroid (brightness of sound)
     */
    calculateSpectralCentroid(audioData) {
        const fft = this.fft(audioData);
        const magnitudes = fft.map(c => Math.sqrt(c.real * c.real + c.imag * c.imag));
        
        let numerator = 0;
        let denominator = 0;

        for (let i = 0; i < magnitudes.length; i++) {
            numerator += i * magnitudes[i];
            denominator += magnitudes[i];
        }

        return denominator > 0 ? (numerator / denominator) * (this.sampleRate / (2 * magnitudes.length)) : 0;
    }

    /**
     * Extract MFCC (Mel-Frequency Cepstral Coefficients)
     * Simplified implementation - production would use more sophisticated algorithms
     */
    extractMFCC(audioData, numCoefficients = 13) {
        // This is a simplified MFCC extraction
        // Production implementation would use proper mel-scale filterbanks
        
        const frameLength = 512;
        const hopLength = 256;
        const mfccFrames = [];

        for (let i = 0; i < audioData.length - frameLength; i += hopLength) {
            const frame = audioData.slice(i, i + frameLength);
            
            // Apply Hamming window
            const windowed = frame.map((sample, idx) => 
                sample * (0.54 - 0.46 * Math.cos(2 * Math.PI * idx / (frameLength - 1)))
            );

            // FFT
            const fft = this.fft(windowed);
            const magnitudes = fft.map(c => Math.sqrt(c.real * c.real + c.imag * c.imag));

            // Simplified mel-scale filtering and DCT
            const mfcc = [];
            for (let coef = 0; coef < numCoefficients; coef++) {
                let sum = 0;
                for (let k = 0; k < magnitudes.length; k++) {
                    sum += Math.log(magnitudes[k] + 1e-10) * 
                           Math.cos(Math.PI * coef * (k + 0.5) / magnitudes.length);
                }
                mfcc.push(sum);
            }

            mfccFrames.push(mfcc);
        }

        // Return mean MFCC across frames
        const meanMFCC = [];
        for (let coef = 0; coef < numCoefficients; coef++) {
            const coefValues = mfccFrames.map(frame => frame[coef]);
            meanMFCC.push(this.mean(coefValues));
        }

        return {
            coefficients: meanMFCC,
            frames: mfccFrames.length
        };
    }

    /**
     * Estimate tempo/rhythm
     */
    estimateTempo(audioData) {
        const energy = this.extractIntensity(audioData);
        const contour = energy.contour;

        // Find periodicity in energy contour using autocorrelation
        const autocorr = this.autocorrelate(contour);
        
        // Find first significant peak (avoiding lag 0)
        let maxCorr = 0;
        let maxLag = 0;
        for (let lag = 10; lag < autocorr.length / 2; lag++) {
            if (autocorr[lag] > maxCorr) {
                maxCorr = autocorr[lag];
                maxLag = lag;
            }
        }

        // Convert lag to BPM
        const hopLength = 256;
        const lagInSeconds = (maxLag * hopLength) / this.sampleRate;
        const bpm = lagInSeconds > 0 ? 60 / lagInSeconds : 0;

        return {
            bpm: bpm,
            confidence: maxCorr,
            periodicity: maxLag > 0
        };
    }

    /**
     * Detect pauses/silence in speech
     */
    detectPauses(audioData) {
        const frameLength = 512;
        const hopLength = 256;
        const energyThreshold = 0.01;
        const pauses = [];
        let pauseStart = null;

        for (let i = 0; i < audioData.length - frameLength; i += hopLength) {
            const frame = audioData.slice(i, i + frameLength);
            const frameEnergy = this.mean(frame.map(x => Math.abs(x)));

            if (frameEnergy < energyThreshold) {
                if (pauseStart === null) {
                    pauseStart = i / this.sampleRate;
                }
            } else {
                if (pauseStart !== null) {
                    const pauseEnd = i / this.sampleRate;
                    const duration = pauseEnd - pauseStart;
                    if (duration > 0.1) { // Minimum 100ms to count as pause
                        pauses.push({
                            start: pauseStart,
                            end: pauseEnd,
                            duration: duration
                        });
                    }
                    pauseStart = null;
                }
            }
        }

        return {
            count: pauses.length,
            pauses: pauses,
            totalDuration: pauses.reduce((sum, p) => sum + p.duration, 0),
            frequency: pauses.length / (audioData.length / this.sampleRate)
        };
    }

    /**
     * Detect voiced segments
     */
    detectVoicedSegments(audioData) {
        const frameLength = 512;
        const hopLength = 256;
        const zcrThreshold = 0.3;
        const energyThreshold = 0.02;
        const voicedSegments = [];
        let segmentStart = null;

        for (let i = 0; i < audioData.length - frameLength; i += hopLength) {
            const frame = audioData.slice(i, i + frameLength);
            const zcr = this.calculateZeroCrossingRate(frame);
            const energy = this.mean(frame.map(x => Math.abs(x)));

            const isVoiced = zcr < zcrThreshold && energy > energyThreshold;

            if (isVoiced) {
                if (segmentStart === null) {
                    segmentStart = i / this.sampleRate;
                }
            } else {
                if (segmentStart !== null) {
                    const segmentEnd = i / this.sampleRate;
                    voicedSegments.push({
                        start: segmentStart,
                        end: segmentEnd,
                        duration: segmentEnd - segmentStart
                    });
                    segmentStart = null;
                }
            }
        }

        return {
            count: voicedSegments.length,
            segments: voicedSegments,
            totalDuration: voicedSegments.reduce((sum, s) => sum + s.duration, 0)
        };
    }

    /**
     * Combine prosody features with text for emotion detection
     */
    inferEmotionAndIntent(prosodyFeatures, text) {
        const emotion = {
            primary: 'neutral',
            secondary: [],
            confidence: 0,
            explanation: '',
            vibeScore: 0
        };

        // Pitch-based emotion indicators
        const pitch = prosodyFeatures.pitch;
        if (pitch.mean > 200 && pitch.contour === 'rising') {
            emotion.primary = 'excitement';
            emotion.confidence = 0.8;
            emotion.vibeScore = 8;
        } else if (pitch.mean > 220 && pitch.std > 30) {
            emotion.secondary.push('surprise');
        } else if (pitch.mean < 150 && pitch.std < 20) {
            emotion.primary = 'calm';
            emotion.confidence = 0.75;
            emotion.vibeScore = 6;
        }

        // Intensity-based emotion indicators
        const intensity = prosodyFeatures.intensity;
        if (intensity.level === 'very_high') {
            emotion.secondary.push('anger');
            emotion.vibeScore = Math.max(emotion.vibeScore, 9);
        } else if (intensity.level === 'high' && prosodyFeatures.speechRate.rate === 'fast') {
            emotion.secondary.push('enthusiasm');
            emotion.vibeScore = Math.max(emotion.vibeScore, 8);
        }

        // Speech rate indicators
        const speechRate = prosodyFeatures.speechRate;
        if (speechRate.rate === 'very_fast') {
            emotion.secondary.push('urgency');
        } else if (speechRate.rate === 'slow') {
            emotion.secondary.push('deliberation');
        }

        // Pause patterns
        const pauses = prosodyFeatures.pauses;
        if (pauses.frequency > 0.3) {
            emotion.secondary.push('uncertainty');
            emotion.confidence *= 0.9;
        }

        // Text-prosody combination
        if (text) {
            const lowerText = text.toLowerCase();
            
            if (lowerText.includes("i'm dead") || lowerText.includes("lmao")) {
                if (intensity.level === 'high' || pitch.contour === 'playful') {
                    emotion.primary = 'humor';
                    emotion.confidence = 0.92;
                    emotion.vibeScore = 9;
                    emotion.explanation = 'Humorous expression confirmed by prosody';
                }
            }

            if (lowerText.includes("bet") && pitch.contour === 'flat') {
                emotion.primary = 'agreement';
                emotion.confidence = 0.85;
                emotion.explanation = 'Calm agreement marker';
            } else if (lowerText.includes("bet") && pitch.contour === 'rising') {
                emotion.primary = 'challenge';
                emotion.confidence = 0.80;
                emotion.explanation = 'Excited challenge/enthusiasm';
            }

            if (lowerText.includes("deadass") || lowerText.includes("on god")) {
                emotion.secondary.push('sincerity');
                emotion.explanation += ' | Emphasis on truthfulness';
            }
        }

        if (emotion.confidence === 0) {
            emotion.confidence = 0.5;
        }

        if (emotion.vibeScore === 0) {
            emotion.vibeScore = 5;
        }

        return emotion;
    }

    /**
     * Helper: Autocorrelation
     */
    autocorrelate(signal) {
        const n = signal.length;
        const result = new Array(n).fill(0);

        for (let lag = 0; lag < n; lag++) {
            let sum = 0;
            for (let i = 0; i < n - lag; i++) {
                sum += signal[i] * signal[i + lag];
            }
            result[lag] = sum / (n - lag);
        }

        return result;
    }

    /**
     * Helper: Simple FFT (for educational purposes - production would use more efficient library)
     */
    fft(signal) {
        const n = signal.length;
        if (n <= 1) return [{real: signal[0] || 0, imag: 0}];

        // Simplified DFT for demonstration
        const result = [];
        for (let k = 0; k < n; k++) {
            let real = 0;
            let imag = 0;
            for (let t = 0; t < n; t++) {
                const angle = 2 * Math.PI * t * k / n;
                real += signal[t] * Math.cos(angle);
                imag -= signal[t] * Math.sin(angle);
            }
            result.push({real, imag});
        }
        return result;
    }

    /**
     * Helper: Mean
     */
    mean(array) {
        return array.reduce((sum, val) => sum + val, 0) / array.length;
    }

    /**
     * Helper: Standard Deviation
     */
    standardDeviation(array) {
        const avg = this.mean(array);
        const squareDiffs = array.map(value => Math.pow(value - avg, 2));
        return Math.sqrt(this.mean(squareDiffs));
    }

    /**
     * Helper: Linear Regression
     */
    linearRegression(x, y) {
        const n = x.length;
        const sumX = x.reduce((a, b) => a + b, 0);
        const sumY = y.reduce((a, b) => a + b, 0);
        const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
        const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);

        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;

        return { slope, intercept };
    }

    /**
     * Clean up resources
     */
    destroy() {
        if (this.microphone) {
            this.microphone.disconnect();
        }
        if (this.analyser) {
            this.analyser.disconnect();
        }
        if (this.audioContext) {
            this.audioContext.close();
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProsodyAnalyzer;
}

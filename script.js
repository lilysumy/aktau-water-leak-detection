// AI Leak Detection Analysis
class LeakDetectionAI {
    // Simulate AI analysis of photos
    analyzePhoto(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                // Simulated AI analysis
                const confidence = Math.random() * 100;
                const severity = confidence > 70 ? 'high' : confidence > 40 ? 'medium' : 'low';
                
                resolve({
                    confidence: Math.round(confidence),
                    severity: severity,
                    estimatedWaterLoss: Math.round(Math.random() * 500) + 50,
                    recommendation: this.getRecommendation(severity)
                });
            };
            reader.readAsDataURL(file);
        });
    }

    // Simulate AI analysis of audio
    analyzeAudio(file) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const frequencies = [
                    { range: '20-50Hz', probability: Math.random() * 100 },
                    { range: '50-100Hz', probability: Math.random() * 100 },
                    { range: '100-200Hz', probability: Math.random() * 100 }
                ];
                
                const maxProb = Math.max(...frequencies.map(f => f.probability));
                const severity = maxProb > 70 ? 'high' : maxProb > 40 ? 'medium' : 'low';
                
                resolve({
                    leakDetected: maxProb > 50,
                    confidence: Math.round(maxProb),
                    frequencyAnalysis: frequencies,
                    severity: severity,
                    recommendation: this.getRecommendation(severity)
                });
            }, 2000);
        });
    }

    getRecommendation(severity) {
        const recommendations = {
            high: 'Немедленно свяжитесь со специалистами. Возможна крупная утечка.',
            medium: 'Необходимо проверить в течение 24-48 часов.',
            low: 'Рекомендуется мониторинг. Может быть ложная тревога.'
        };
        return recommendations[severity] || recommendations.medium;
    }
}

const aiAnalyzer = new LeakDetectionAI();

// Photo Upload Handler
document.getElementById('photo')?.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            const preview = document.getElementById('photo-preview');
            preview.innerHTML = `
                <div class="photo-analysis">
                    <img src="${event.target.result}" alt="Фото утечки">
                    <div class="analysis-loader">
                        <i class="fas fa-spinner fa-spin"></i>
                        <p>Анализирую фото...</p>
                    </div>
                </div>
            `;
            
            aiAnalyzer.analyzePhoto(file).then(result => {
                preview.innerHTML = `
                    <div class="photo-analysis">
                        <img src="${event.target.result}" alt="Фото утечки">
                        <div class="analysis-result">
                            <h4>Результат анализа:</h4>
                            <div class="result-item">
                                <span>Уверенность:</span>
                                <strong>${result.confidence}%</strong>
                            </div>
                            <div class="result-item">
                                <span>Масштаб:</span>
                                <strong class="severity-${result.severity}">${result.severity.toUpperCase()}</strong>
                            </div>
                            <div class="result-item">
                                <span>Примерная потеря воды:</span>
                                <strong>${result.estimatedWaterLoss} л/час</strong>
                            </div>
                            <p class="recommendation">${result.recommendation}</p>
                        </div>
                    </div>
                `;
            });
        };
        reader.readAsDataURL(file);
    }
});

// Audio Recording Handler
let mediaRecorder;
let recordedChunks = [];

async function startRecording() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        recordedChunks = [];

        mediaRecorder.addEventListener('dataavailable', (event) => {
            recordedChunks.push(event.data);
        });

        mediaRecorder.start();
        
        const statusDiv = document.getElementById('recording-status');
        statusDiv.innerHTML = '<span style="color: #ff4444;"><i class="fas fa-dot-circle"></i> Запись идёт...</span>';
        
        // Stop recording after 30 seconds
        setTimeout(() => {
            stopRecording();
        }, 30000);

    } catch (error) {
        document.getElementById('recording-status').innerHTML = 
            '<span style="color: #ff4444;">Ошибка доступа к микрофону</span>';
    }
}

function stopRecording() {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();

        mediaRecorder.addEventListener('stop', () => {
            const audioBlob = new Blob(recordedChunks, { type: 'audio/wav' });
            const audioUrl = URL.createObjectURL(audioBlob);
            const audioFile = new File([audioBlob], 'recording.wav', { type: 'audio/wav' });

            const statusDiv = document.getElementById('recording-status');
            statusDiv.innerHTML = `
                <div class="recording-complete">
                    <i class="fas fa-check-circle" style="color: #00d084;"></i>
                    <span>Запись завершена</span>
                    <audio controls src="${audioUrl}"></audio>
                    <div class="analysis-loader">
                        <i class="fas fa-spinner fa-spin"></i>
                        <p>Анализирую звук...</p>
                    </div>
                </div>
            `;

            aiAnalyzer.analyzeAudio(audioFile).then(result => {
                statusDiv.innerHTML = `
                    <div class="recording-complete">
                        <audio controls src="${audioUrl}"></audio>
                        <div class="analysis-result">
                            <h4>Результат анализа звука:</h4>
                            <div class="result-item">
                                <span>Утечка обнаружена:</span>
                                <strong>${result.leakDetected ? 'Да ✓' : 'Нет'}</strong>
                            </div>
                            <div class="result-item">
                                <span>Уверенность:</span>
                                <strong>${result.confidence}%</strong>
                            </div>
                            <div class="result-item">
                                <span>Масштаб:</span>
                                <strong class="severity-${result.severity}">${result.severity.toUpperCase()}</strong>
                            </div>
                            <p class="recommendation">${result.recommendation}</p>
                        </div>
                    </div>
                `;
            });

            document.getElementById('audio').files = new DataTransfer().items.add(audioFile) ? new DataTransfer().files : [];
        });
    }
}

// Geolocation Handler
function getLocation() {
    if (navigator.geolocation) {
        document.querySelector('button[onclick="getLocation()"]').innerHTML = 
            '<i class="fas fa-spinner fa-spin"></i> Определение...';
        
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                
                document.getElementById('latitude').value = lat;
                document.getElementById('longitude').value = lon;
                
                document.querySelector('button[onclick="getLocation()"]').innerHTML = 
                    '<i class="fas fa-check-circle"></i> Местоположение определено';
                
                // Show map (using simple map representation)
                showMap(lat, lon);
            },
            (error) => {
                alert('Ошибка определения местоположения: ' + error.message);
                document.querySelector('button[onclick="getLocation()"]').innerHTML = 
                    '<i class="fas fa-location-crosshairs"></i> Определить местоположение';
            }
        );
    } else {
        alert('Геолокация не поддерживается в вашем браузере');
    }
}

function showMap(lat, lon) {
    const mapDiv = document.getElementById('map');
    mapDiv.innerHTML = `
        <div style="width: 100%; height: 300px; background: linear-gradient(135deg, #e8f4f8 0%, #c5e9f2 100%); 
                    border-radius: 8px; display: flex; align-items: center; justify-content: center; position: relative;">
            <div style="text-align: center;">
                <i class="fas fa-map-pin" style="font-size: 3rem; color: #ff4444;"></i>
                <p style="margin-top: 10px; color: #333; font-weight: 600;">
                    Местоположение: ${lat.toFixed(4)}, ${lon.toFixed(4)}
                </p>
                <p style="color: #666; font-size: 0.9rem;">Актау, Мангистауская область</p>
            </div>
        </div>
    `;
}

// Form Submission
function handleSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(document.querySelector('.report-form'));
    
    // Validate form
    if (!formData.get('name') || !formData.get('phone') || !formData.get('address')) {
        alert('Пожалуйста, заполните все обязательные поля');
        return;
    }

    // Generate report ID
    const reportId = 'WG-' + Date.now();
    
    // Simulate sending data to server
    console.log('Отправка отчёта:', {
        id: reportId,
        name: formData.get('name'),
        phone: formData.get('phone'),
        address: formData.get('address'),
        severity: formData.get('severity'),
        coordinates: {
            lat: formData.get('latitude'),
            lon: formData.get('longitude')
        }
    });

    // Show success message
    const successMsg = document.getElementById('success-message');
    document.getElementById('report-id').textContent = reportId;
    successMsg.style.display = 'block';
    
    // Hide form and scroll to message
    document.querySelector('.report-form').style.display = 'none';
    successMsg.scrollIntoView({ behavior: 'smooth' });

    // Reset after 3 seconds
    setTimeout(() => {
        location.reload();
    }, 5000);

    // Update statistics
    updateStats();
}

// Update Statistics
function updateStats() {
    const stats = {
        reports: Math.floor(Math.random() * 500) + 100,
        resolved: Math.floor(Math.random() * 350) + 50,
        waterSaved: Math.floor(Math.random() * 50000) + 10000,
        timeSaved: Math.floor(Math.random() * 1000) + 200
    };

    document.getElementById('stat-reports').textContent = stats.reports;
    document.getElementById('stat-resolved').textContent = stats.resolved;
    document.getElementById('stat-water-saved').textContent = stats.waterSaved;
    document.getElementById('stat-time-saved').textContent = stats.timeSaved;
}

// Scroll to report section
function scrollToReport() {
    document.getElementById('report').scrollIntoView({ behavior: 'smooth' });
}

// Initialize statistics on page load
window.addEventListener('load', () => {
    updateStats();
    
    // Add smooth animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    document.querySelectorAll('.feature-card, .step, .stat-box').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'all 0.5s ease';
        observer.observe(el);
    });
});

// Add CSS for additional elements
const style = document.createElement('style');
style.textContent = `
    .photo-analysis {
        position: relative;
        margin-top: 15px;
    }

    .photo-analysis img {
        max-width: 100%;
        border-radius: 8px;
        display: block;
    }

    .analysis-loader,
    .analysis-result {
        background: white;
        padding: 15px;
        border-radius: 8px;
        margin-top: 10px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .analysis-loader {
        text-align: center;
        color: #0099ff;
    }

    .analysis-loader i {
        font-size: 1.5rem;
        margin-bottom: 10px;
    }

    .result-item {
        display: flex;
        justify-content: space-between;
        padding: 8px 0;
        border-bottom: 1px solid #eee;
    }

    .result-item:last-child {
        border-bottom: none;
    }

    .result-item span {
        color: #666;
    }

    .severity-high {
        color: #ff4444;
        font-weight: bold;
    }

    .severity-medium {
        color: #ffa500;
        font-weight: bold;
    }

    .severity-low {
        color: #00d084;
        font-weight: bold;
    }

    .recommendation {
        background: #f9f9f9;
        padding: 10px;
        border-left: 4px solid #0099ff;
        margin-top: 10px;
        border-radius: 4px;
        color: #333;
    }

    .recording-complete {
        margin-top: 15px;
        background: white;
        padding: 15px;
        border-radius: 8px;
    }

    .recording-complete audio {
        width: 100%;
        margin-bottom: 15px;
        margin-top: 10px;
    }
`;
document.head.appendChild(style);

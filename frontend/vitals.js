document.addEventListener("DOMContentLoaded", function () {
    const heartRateElement = document.getElementById("heart-rate");
    const spo2Element = document.getElementById("spo2");
    const bpInput = document.getElementById("bp-input");
    const heightInput = document.getElementById("height");
    const weightInput = document.getElementById("weight");
    const bmiElement = document.getElementById("bmi");
    const heartRateInput = document.getElementById("heart-rate-input");
    const spo2Input = document.getElementById("spo2-input");
    const fetchVitalsButton = document.getElementById("fetch-vitals");
    const fetchHeartRateButton = document.getElementById("fetch-heart-rate");
    const fetchSpO2Button = document.getElementById("fetch-spo2");

    // Connect to WebSocket Server
    const ws = new WebSocket("ws://127.0.0.1:8000/ws");

    ws.onopen = function () {
        console.log("Connected to WebSocket server");
    };

    ws.onmessage = function (event) {
        const data = JSON.parse(event.data);
        console.log("Received:", data);

        const heartRate = parseInt(data.heart_rate, 10);
        const spo2 = parseInt(data.spo2, 10);

        if (!isNaN(heartRate) && heartRate >= 40 && heartRate <= 180) {
            heartRateElement.innerText = `${heartRate} bpm`;
            heartRateInput.value = heartRate;
        }
        if (!isNaN(spo2) && spo2 >= 70 && spo2 <= 100) {
            spo2Element.innerText = `${spo2} %`;
            spo2Input.value = spo2;
        }
    };

    ws.onerror = function (error) {
        console.error("WebSocket Error:", error);
    };

    // ws.onclose = function () {
    //     console.warn("WebSocket Disconnected! Trying to reconnect...");
    //     setTimeout(() => location.reload(), 5000); // Auto-refresh page after 5 sec
    // };

    // Manual Fetch Buttons
    fetchHeartRateButton.addEventListener("click", function () {
        alert("Fetching heart rate from live device...");
    });

    fetchSpO2Button.addEventListener("click", function () {
        alert("Fetching SpO2 from live device...");
    });

    // Function to fetch data from Arduino via Python backend
    async function fetchVitals() {
        try {
            const response = await fetch("http://localhost:5000/getVitals"); // Flask server endpoint
            if (!response.ok) throw new Error("No response from server");

            const data = await response.text();
            console.log("Received Data:", data);

            const values = data.trim().split(",");
            if (values.length === 2) {
                const heartRate = parseInt(values[0], 10);
                const spo2 = parseInt(values[1], 10);

                if (!isNaN(heartRate) && heartRate >= 40 && heartRate <= 180) {
                    heartRateElement.innerText = heartRate + " bpm";
                    heartRateInput.value = heartRate;
                }
                if (!isNaN(spo2) && spo2 >= 70 && spo2 <= 100) {
                    spo2Element.innerText = spo2 + " %";
                    spo2Input.value = spo2;
                }
            }
        } catch (error) {
            console.error("Error fetching vitals:", error);
            alert("Error fetching vitals. Make sure the device is connected and Flask is running.");
        }
    }

    // Manual Entry Event Listeners
    heartRateInput.addEventListener("input", function () {
        heartRateElement.innerText = heartRateInput.value + " bpm";
    });

    spo2Input.addEventListener("input", function () {
        spo2Element.innerText = spo2Input.value + " %";
    });

    bpInput.addEventListener("input", function () {
        bpInput.value = bpInput.value.replace(/[^0-9/]/g, "");
    });

    heightInput.addEventListener("input", calculateBMI);
    weightInput.addEventListener("input", calculateBMI);

    function calculateBMI() {
        const heightCm = parseFloat(heightInput.value);
        const weightKg = parseFloat(weightInput.value);
        if (heightCm > 0 && weightKg > 0) {
            const heightM = heightCm / 100;
            const bmiValue = (weightKg / (heightM * heightM)).toFixed(2);
            bmiElement.innerText = bmiValue;
        }
    }

    document.getElementById("copy-vitals").addEventListener("click", function () {
        const spo2 = spo2Input.value || "--";
        const heartRate = heartRateInput.value || "--";
        const bp = bpInput.value || "--";
        const bmi = bmiElement.innerText || "--";

        const vitalsText = `My Health Vitals are SpO₂: ${spo2}%, Heart Rate: ${heartRate} bpm, BP: ${bp}, BMI: ${bmi}. Provide me -`;

        navigator.clipboard.writeText(vitalsText).then(() => {
            alert("Vitals copied to clipboard!");
        }).catch(err => {
            console.error("Failed to copy text: ", err);
        });
    });

    fetchVitalsButton.addEventListener("click", fetchVitals);
});

// Fetch sensor data every 2 minutes
setInterval(fetchSensorData, 120000);

// Fetch immediately on page load
fetchSensorData();



<template>
  <div class="app-container">
    <h1>Detección de Ciberacoso Peruano</h1>
    <p>
      Ingrese un mensaje manualmente o grabe un audio para analizar si contiene
      ciberacoso:
    </p>

    <div class="input-container">
      <!-- Campo de texto para el mensaje -->
      <input
        v-model="message"
        type="text"
        placeholder="Escriba su mensaje aquí o grabe un audio..."
        class="text-input"
      />

      <!-- Botón para iniciar la grabación de audio -->
      <button
        @click="startRecording"
        :disabled="recording"
        class="action-button"
      >
        <span v-if="recording">🎤 Grabando...</span>
        <span v-else>🎙️ Iniciar Grabación</span>
      </button>

      <!-- Botón para detener la grabación de audio -->
      <button
        @click="stopRecording"
        :disabled="!recording"
        class="action-button stop-button"
      >
        🛑 Detener Grabación
      </button>

      <!-- Animación de ondas sonoras durante la grabación -->
      <div v-if="recording" class="wave-container">
        <div class="wave"></div>
        <div class="wave"></div>
        <div class="wave"></div>
      </div>

      <!-- Selector para elegir el algoritmo -->
      <select v-model="selectedAlgorithm" class="select-input">
        <option disabled value="">Selecciona un algoritmo</option>
        <option value="arbol_decision">Arbol de decisión</option>
        <option value="knn">K vecinos más cercanos</option>
        <option value="maquina_vectores_soporte">
          Máquina de vectores de soporte
        </option>
        <option value="naive_bayes">Naive bayes</option>
        <option value="regresion_logistica">Regresión logística</option>
        <option value="bosque_aleatorio">Bosque aleatorio</option>
        <option value="gradiente_descendente_estocástica">
          Gradiente descendente estocástica
        </option>
        <option value="xgboost">XGBoost</option>
      </select>

      <!-- Selector para elegir la técnica de procesamiento -->
      <select v-model="selectedTechnique" class="select-input">
        <option disabled value="">Selecciona una técnica</option>
        <option value="tallado">Tallado</option>
        <option value="lematizacion">Lematización</option>
      </select>

      <button @click="detectCiberbullying" class="action-button">
        🔍 Detectar
      </button>
    </div>

    <div v-if="loading" class="loading">Analizando...</div>
    <div v-if="result !== null" class="result">
      Resultado: <strong>{{ result }}</strong>
    </div>
  </div>
</template>

<script>
import { ref } from "vue";
import axios from "axios";

export default {
  setup() {
    const message = ref("");
    const selectedAlgorithm = ref("");
    const selectedTechnique = ref("");
    const result = ref(null);
    const loading = ref(false);
    const recording = ref(false);
    let recognition = null;

    // Configuración para la grabación de audio y reconocimiento de voz
    if ("webkitSpeechRecognition" in window) {
      recognition = new window.webkitSpeechRecognition();
      recognition.lang = "es-PE"; // Español de Perú
      recognition.continuous = true;
      recognition.interimResults = false;

      recognition.onstart = () => {
        recording.value = true;
      };

      recognition.onresult = (event) => {
        message.value = event.results[0][0].transcript;
      };

      recognition.onerror = (event) => {
        console.error("Error en el reconocimiento de voz:", event.error);
        recording.value = false;
      };

      recognition.onend = () => {
        recording.value = false;
      };
    } else {
      alert("API de reconocimiento de voz no soportada en este navegador.");
    }

    const startRecording = () => {
      if (recognition) {
        recognition.start();
      }
    };

    const stopRecording = () => {
      if (recognition) {
        recognition.stop();
      }
    };

    const detectCiberbullying = async () => {
      if (message.value.trim() === "") {
        alert("Por favor, ingrese un mensaje o grabe un audio.");
        return;
      }
      if (selectedAlgorithm.value === "") {
        alert("Por favor, seleccione un algoritmo.");
        return;
      }
      if (selectedTechnique.value === "") {
        alert("Por favor, seleccione una técnica de procesamiento.");
        return;
      }

      loading.value = true;
      result.value = null;

      try {
        const response = await axios.post(
          "https://b3e2-34-126-191-125.ngrok-free.app/peruvian-ciberbullying/detection",
          {
            message: message.value,
            technique: selectedTechnique.value,
            algorithm: selectedAlgorithm.value,
          },
          {
            headers: {
              "Content-Type": "application/json",
              accept: "application/json",
              "Access-Control-Allow-Origin": "*",
            },
          }
        );
        result.value = response.data.class;
      } catch (error) {
        console.error("Error al detectar ciberbullying: {}", error);
        alert("Hubo un error en la detección, intente nuevamente.");
      } finally {
        loading.value = false;
      }
    };

    return {
      message,
      selectedAlgorithm,
      selectedTechnique,
      result,
      loading,
      recording,
      startRecording,
      stopRecording,
      detectCiberbullying,
    };
  },
};
</script>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 50px;
  font-family: "Arial", sans-serif;
  color: #333;
}

h1 {
  color: #2c3e50;
  margin-bottom: 20px;
}

p {
  margin-bottom: 10px;
  text-align: center;
}

.input-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  margin-bottom: 30px;
}

.text-input,
.select-input {
  padding: 12px;
  font-size: 16px;
  border-radius: 8px;
  border: 1px solid #ccc;
  width: 350px;
  transition: all 0.3s ease;
}

.text-input:focus,
.select-input:focus {
  outline: none;
  border-color: #3498db;
}

button {
  padding: 12px 20px;
  font-size: 18px;
  color: white;
  background-color: #3498db;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all 0.3s ease;
}

button:hover:not(:disabled) {
  background-color: #2980b9;
}

button:disabled {
  background-color: #95a5a6;
  cursor: not-allowed;
}

.stop-button {
  background-color: #e74c3c;
}

.stop-button:hover {
  background-color: #c0392b;
}

.loading {
  font-size: 18px;
  color: #3498db;
  font-weight: bold;
}

.result {
  font-size: 20px;
  color: #27ae60;
  font-weight: bold;
}

.wave-container {
  display: flex;
  gap: 5px;
}

.wave {
  width: 12px;
  height: 30px;
  background-color: #3498db;
  border-radius: 5px;
  animation: wave 1s ease-in-out infinite;
}

.wave:nth-child(2) {
  animation-delay: 0.2s;
}

.wave:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes wave {
  0% {
    height: 30px;
  }
  50% {
    height: 45px;
  }
  100% {
    height: 30px;
  }
}

@media (max-width: 600px) {
  .app-container {
    padding: 20px;
  }

  .text-input,
  .select-input {
    width: 100%;
  }
}
</style>

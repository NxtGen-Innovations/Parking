import * as tf from '@tensorflow/tfjs';

// Define the shape of our input data
// Features: [OccupancyRate (0-1), IsPeakHour (0/1), RainIntensity (0-100), IsFloodMode (0/1)]
type InputFeatures = [number, number, number, number];

let model: tf.Sequential | null = null;
let isTraining = false;

export const getRainScoreFromCondition = (conditionText: string): number => {
  const lower = conditionText.toLowerCase();
  if (lower.includes("storm") || lower.includes("thunder")) return 90; 
  if (lower.includes("heavy rain")) return 70;
  if (lower.includes("rain")) return 40;
  if (lower.includes("drizzle")) return 15;
  return 0; 
};

/**
 * 1. GENERATE SYNTHETIC TRAINING DATA
 * We create 2000 fake historical records to "teach" the model patterns.
 * e.g., "When rain was high and lot was full, price was 2.5x"
 */

const generateTrainingData = () => {
  const inputs: number[][] = [];
  const labels: number[] = [];

  for (let i = 0; i < 2000; i++) {
    // Randomize conditions
    const occupancy = Math.random(); // 0% to 100%
    const isPeak = Math.random() > 0.7 ? 1 : 0; // 30% chance of peak hour
    const rain = Math.random() > 0.8 ? Math.random() * 50 : 0; // Occasional rain
    const flood = rain > 30 ? 1 : 0; // Flood if heavy rain

    // CALCULATE THE "CORRECT" HISTORICAL PRICE (The Pattern to Learn)
    // The model doesn't know this formula; it has to GUESS it by looking at the data.
    let targetMultiplier = 1.0;
    
    // Base demand impact
    targetMultiplier += occupancy * 0.5; // Up to +0.5 for full lot
    
    // Peak hour impact
    if (isPeak) targetMultiplier += 0.3;
    
    // Rain impact (Comfort premium)
    targetMultiplier += (rain / 100) * 0.5;

    // Flood Safety Premium (The big spike)
    if (flood) targetMultiplier += 2.0; 

    // Add some random noise (real world isn't perfect)
    targetMultiplier += (Math.random() - 0.5) * 0.1;

    inputs.push([occupancy, isPeak, rain, flood]);
    labels.push(targetMultiplier);
  }

  return {
    inputs: tf.tensor2d(inputs, [inputs.length, 4]),
    labels: tf.tensor2d(labels, [labels.length, 1])
  };
};

/**
 * 2. DEFINE AND TRAIN THE MODEL
 * This runs when the dashboard loads.
 */
export const trainModel = async (onProgress?: (log: string) => void) => {
  // If model is already trained, don't retrain
  if (model) return model;
  if (isTraining) return null; // Prevent double training
  
  isTraining = true;

  if (onProgress) onProgress("Generating 2,000 synthetic records...");
  const { inputs, labels } = generateTrainingData();

  // Define a Neural Network (Regression)
  model = tf.sequential();
  
  // Layer 1: Hidden Layer with 8 neurons, ReLU activation (learns non-linear patterns)
  model.add(tf.layers.dense({ inputShape: [4], units: 8, activation: 'relu' }));
  
  // Layer 2: Output Layer (1 neuron = the predicted multiplier)
  model.add(tf.layers.dense({ units: 1 }));

  // Prepare the model for training
  model.compile({
    optimizer: tf.train.adam(0.01), // Adam optimizer adjusts learning rate auto
    loss: 'meanSquaredError'        // Try to minimize the error squared
  });

  if (onProgress) onProgress("Training Neural Network...");

  // TRAIN! (Fit the model to the data)
  await model.fit(inputs, labels, {
    epochs: 50, // Go through data 50 times
    shuffle: true,
    callbacks: {
      onEpochEnd: (epoch, logs) => {
        // Log training progress (loss should go down)
        if (epoch % 10 === 0 && onProgress) {
          onProgress(`Epoch ${epoch}: Loss = ${logs?.loss.toFixed(4)}`);
        }
      }
    }
  });

  // Cleanup tensors to free memory
  inputs.dispose();
  labels.dispose();
  
  isTraining = false;
  if (onProgress) onProgress("Training Complete. AI Ready.");
  return model;
};

/**
 * 3. PREDICT PRICE (Inference)
 * Uses the trained model to guess the price for current conditions.
 * Returns a simple NUMBER (multiplier).
 */
export const predictPrice = (
  occupancy: number, 
  isPeak: boolean, 
  rain: number, 
  flood: boolean
): number => {
  // Fallback if model isn't ready yet
  if (!model) return 1.0;

  // Convert inputs to a Tensor (Matrix)
  const inputTensor = tf.tensor2d([[
    occupancy, 
    isPeak ? 1 : 0, 
    rain, 
    flood ? 1 : 0
  ]], [1, 4]);

  // Run Inference
  const prediction = model.predict(inputTensor) as tf.Tensor;
  const result = prediction.dataSync()[0]; // Get the raw number

  // Cleanup memory
  inputTensor.dispose();
  prediction.dispose();

  // Keep it reasonable (min 1.0x) and format to 2 decimal places
  return Math.max(1.0, parseFloat(result.toFixed(2)));

  
};
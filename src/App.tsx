import { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";

const App: React.FC = () => {
  const [expression, setExpression] = useState<string | null>(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);

  const colorMap: Record<string, string> = {
    happy: "text-green-600",
    angry: "text-red-600",
    sad: "text-blue-600",
    neutral: "text-gray-600",
    surprised: "text-yellow-600",
    fearful: "text-purple-600",
    disgusted: "text-pink-600",
  };

  const detectExpression = async () => {
    if (!imageRef.current || !modelsLoaded) return;

    try {
      const detection = await faceapi
        .detectSingleFace(
          imageRef.current,
          new faceapi.TinyFaceDetectorOptions()
        )
        .withFaceExpressions();

      if (detection?.expressions) {
        const sorted = Object.entries(detection.expressions).sort(
          (a, b) => b[1] - a[1]
        );
        const topExpression = sorted[0][0];
        setExpression(topExpression);
      }
    } catch (error) {
      console.error("Error detecting expression:", error);
    }
  };

  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = "/models";
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
        ]);
        setModelsLoaded(true);
      } catch (error) {
        console.error("Error loading models:", error);
      }
    };

    loadModels();
  }, []);

  // Run detection when models are loaded and image is ready
  useEffect(() => {
    if (modelsLoaded && imageRef.current) {
      detectExpression();
    }
  }, [modelsLoaded]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white text-gray-800 gap-4">
      <img
        ref={imageRef}
        src="https://superbryn.s3.us-east-1.amazonaws.com/Prateek+Bhardwaj+LinkedIn.jpeg"
        alt="Photo"
        className="w-32 h-32 rounded-full shadow-md"
        crossOrigin="anonymous"
        onLoad={() => {
          if (modelsLoaded) {
            detectExpression();
          }
        }}
      />

      <h1 className="text-2xl font-semibold">Prateek Bhardwaj</h1>

      {expression && (
        <p
          className={`text-lg font-medium ${
            colorMap[expression] || "text-black"
          }`}
        >
          Expression: {expression} {colorMap[expression]}
        </p>
      )}
    </div>
  );
};

export default App;

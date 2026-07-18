import React from 'react';
import Webcam from 'react-webcam';
interface WebcamCaptureProps {
  webcamRef: React.RefObject<Webcam>;
  onCameraError: (message: string) => void;
}
const videoConstraints: MediaTrackConstraints = {
  facingMode: 'user',
};
export default function WebcamCapture({
  webcamRef,
  onCameraError,
}: WebcamCaptureProps): React.JSX.Element {
  const handleUserMediaError = (
    error: string | DOMException
  ): void => {
    onCameraError(
      'Camera access is required. Please allow camera permissions and try again.'
    );
  };
  return (
    <Webcam
      ref={webcamRef}
      width={400}
      height={300}
      videoConstraints={videoConstraints}
      screenshotFormat="image/jpeg"
      onUserMediaError={handleUserMediaError}
      className="w-full h-full object-cover rounded-xl"
    />
  );
}

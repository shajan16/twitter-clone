import React, { useState, useRef } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import OTPModal from "../OTPModal/OTPModal";

const AudioUpload = ({ onUploadSuccess }) => {
  const { currentUser } = useSelector((state) => state.user);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [isOTPVerified, setIsOTPVerified] = useState(false);

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const startRecording = async () => {
    if (!isOTPVerified) {
      setShowOTPModal(true);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setError("");
    } catch (err) {
      setError("Failed to access microphone. Please check permissions.");
      console.error("Recording error:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleFileUpload = async (e) => {
    if (!isOTPVerified) {
      setShowOTPModal(true);
      return;
    }

    const file = e.target.files[0];
    if (!file) return;

    // Check file size (100 MB)
    const maxSize = 100 * 1024 * 1024;
    if (file.size > maxSize) {
      setError("Audio file size exceeds 100 MB limit");
      return;
    }

    setAudioBlob(file);
    const url = URL.createObjectURL(file);
    setAudioUrl(url);
    setError("");
  };

  const handleUpload = async () => {
    if (!audioBlob) {
      setError("Please record or upload an audio file");
      return;
    }

    if (!description.trim()) {
      setError("Please enter a description");
      return;
    }

    if (!isOTPVerified) {
      setShowOTPModal(true);
      return;
    }

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("audio", audioBlob);
      formData.append("userId", currentUser._id);
      formData.append("description", description);

      const response = await axios.post("/tweets/audio", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });

      // Clean up
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      setAudioBlob(null);
      setAudioUrl(null);
      setDescription("");

      if (onUploadSuccess) {
        onUploadSuccess();
      }
      window.location.reload(false);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to upload audio tweet. Please try again."
      );
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioBlob(null);
    setAudioUrl(null);
    setDescription("");
    setError("");
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <div className="border-b-2 pb-6">
      <OTPModal
        isOpen={showOTPModal}
        onClose={() => setShowOTPModal(false)}
        onVerified={() => setIsOTPVerified(true)}
      />

      <div className="mb-4">
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What's happening with your audio tweet?"
          maxLength={280}
          className="bg-slate-200 rounded-lg w-full p-2"
        />
        <p className="text-sm text-gray-500 mt-1">
          {description.length}/280 characters
        </p>
      </div>

      <div className="flex items-center space-x-4 mb-4">
        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={uploading}
          className={`py-2 px-4 rounded-full ${
            isRecording
              ? "bg-red-500 text-white"
              : "bg-blue-500 text-white hover:bg-blue-600"
          } disabled:opacity-50`}
        >
          {isRecording ? "⏹ Stop Recording" : "🎤 Record Audio"}
        </button>

        <label
          className={`py-2 px-4 rounded-full bg-green-500 text-white cursor-pointer hover:bg-green-600 ${
            uploading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          📁 Upload Audio
          <input
            type="file"
            accept="audio/*"
            onChange={handleFileUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>

      {audioUrl && (
        <div className="mb-4">
          <audio controls src={audioUrl} className="w-full" />
          <p className="text-sm text-gray-500 mt-2">
            Audio file ready. Maximum 5 minutes duration and 100 MB size.
          </p>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="flex space-x-2">
        <button
          onClick={handleUpload}
          disabled={uploading || !audioBlob || !description.trim()}
          className="bg-blue-500 text-white py-2 px-4 rounded-full disabled:opacity-50"
        >
          {uploading ? "Uploading..." : "Post Audio Tweet"}
        </button>
        {audioBlob && (
          <button
            onClick={handleCancel}
            disabled={uploading}
            className="bg-gray-300 text-gray-700 py-2 px-4 rounded-full"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
};

export default AudioUpload;


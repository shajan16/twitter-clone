import React, { useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";

const OTPModal = ({ isOpen, onClose, onVerified }) => {
  const { currentUser } = useSelector((state) => state.user);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [step, setStep] = useState("send"); // 'send' or 'verify'

  const handleSendOTP = async () => {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const response = await axios.post("/otp/send", {
        userId: currentUser._id,
      });
      setMessage(response.data.message || "OTP sent to your email");
      setStep("verify");
    } catch (err) {
      setError(
         "Your email address is Invalid!!."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");
    try {
      const response = await axios.post("/otp/verify", {
        userId: currentUser._id,
        otp: otp,
      });
      setMessage(response.data.message || "OTP verified successfully");
      setTimeout(() => {
        onVerified();
        onClose();
        setOtp("");
        setStep("send");
      }, 1000);
    } catch (err) {
      setError(
        err.response?.data?.message || "Invalid OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">OTP Verification</h2>
        <p className="text-gray-600 mb-4">
          {step === "send"
            ? "To upload audio tweets, please verify your email address with an OTP."
            : "Enter the 6-digit OTP sent to your email address."}
        </p>

        {step === "send" ? (
          <div>
            <button
              onClick={handleSendOTP}
              disabled={loading}
              className="bg-blue-500 text-white py-2 px-4 rounded-full w-full disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </div>
        ) : (
          <div>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="Enter 6-digit OTP"
              maxLength={6}
              className="border border-gray-300 rounded-lg p-2 w-full mb-4 text-center text-2xl tracking-widest"
            />
            <div className="flex space-x-2">
              <button
                onClick={handleVerifyOTP}
                disabled={loading || otp.length !== 6}
                className="bg-blue-500 text-white py-2 px-4 rounded-full flex-1 disabled:opacity-50"
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>
              <button
                onClick={() => {
                  setStep("send");
                  setOtp("");
                  setError("");
                  setMessage("");
                }}
                className="bg-gray-300 text-gray-700 py-2 px-4 rounded-full"
              >
                Resend
              </button>
            </div>
          </div>
        )}

        {error && (
          <p className="text-red-500 mt-4 text-sm">{error}</p>
        )}
        {message && (
          <p className="text-green-500 mt-4 text-sm">{message}</p>
        )}

        <button
          onClick={() => {
            onClose();
            setOtp("");
            setStep("send");
            setError("");
            setMessage("");
          }}
          className="mt-4 text-gray-600 hover:text-gray-800"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default OTPModal;


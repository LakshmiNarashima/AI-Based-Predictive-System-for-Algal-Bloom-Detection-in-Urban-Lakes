import React from "react";
import { AlertCircle, CheckCircle, AlertTriangle } from "lucide-react";
import "./RiskIndicator.css";

const RiskIndicator = ({ risk_level, probability }) => {
  const getRiskColor = () => {
    if (!risk_level) return "#gray";
    if (risk_level.toLowerCase().includes("high")) return "#EF4444";
    if (risk_level.toLowerCase().includes("medium") || risk_level.toLowerCase().includes("moderate")) return "#F59E0B";
    return "#10B981";
  };

  const getRiskIcon = () => {
    if (!risk_level) return <CheckCircle size={40} />;
    if (risk_level.toLowerCase().includes("high")) return <AlertCircle size={40} />;
    if (risk_level.toLowerCase().includes("medium") || risk_level.toLowerCase().includes("moderate")) return <AlertTriangle size={40} />;
    return <CheckCircle size={40} />;
  };

  const probPercent = (probability * 100).toFixed(1);

  return (
    <div className="risk-indicator" style={{ borderLeftColor: getRiskColor() }}>
      <div className="risk-icon" style={{ color: getRiskColor() }}>
        {getRiskIcon()}
      </div>
      <div className="risk-content">
        <h3 className="risk-title" style={{ color: getRiskColor() }}>
          {risk_level || "No Data"}
        </h3>
        <p className="risk-probability">
          <strong>Bloom Probability:</strong> {probPercent}%
        </p>
        <div className="risk-bar">
          <div className="risk-progress" style={{ width: `${probPercent}%`, backgroundColor: getRiskColor() }}></div>
        </div>
      </div>
    </div>
  );
};

export default RiskIndicator;

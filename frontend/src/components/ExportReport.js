import React from "react";
import jsPDF from "jspdf";
import { Download } from "lucide-react";
import "./ExportReport.css";

const ExportReport = ({ result, prediction_data }) => {
    const generatePDF = () => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        let yPosition = 20;

        // Title
        doc.setFontSize(20);
        doc.setFont(undefined, "bold");
        doc.text("Algal Bloom Prediction Report", pageWidth / 2, yPosition, { align: "center" });
        yPosition += 15;

        // Timestamp
        doc.setFontSize(10);
        doc.setFont(undefined, "normal");
        doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, yPosition, { align: "center" });
        yPosition += 15;

        // Risk Summary
        doc.setFontSize(14);
        doc.setFont(undefined, "bold");
        doc.text("Risk Summary", 20, yPosition);
        yPosition += 10;

        doc.setFontSize(11);
        doc.setFont(undefined, "normal");
        doc.text(`Risk Level: ${result?.risk_level || "N/A"}`, 25, yPosition);
        yPosition += 8;
        doc.text(`Bloom Probability: ${((result?.probability || 0) * 100).toFixed(2)}%`, 25, yPosition);
        yPosition += 8;
        doc.text(`Estimated Days to Bloom: ${result?.estimated_days || "N/A"}`, 25, yPosition);
        yPosition += 15;

        // Water Quality Parameters
        if (prediction_data) {
            doc.setFontSize(14);
            doc.setFont(undefined, "bold");
            doc.text("Water Quality Parameters", 20, yPosition);
            yPosition += 10;

            doc.setFontSize(10);
            doc.setFont(undefined, "normal");
            Object.entries(prediction_data).forEach(([key, value]) => {
                if (yPosition > pageHeight - 20) {
                    doc.addPage();
                    yPosition = 20;
                }
                doc.text(`${key}: ${value}`, 25, yPosition);
                yPosition += 7;
            });
        }

        yPosition += 10;

        // Recommendation
        doc.setFontSize(14);
        doc.setFont(undefined, "bold");
        doc.text("Recommendation", 20, yPosition);
        yPosition += 10;

        doc.setFontSize(11);
        doc.setFont(undefined, "normal");
        const suggestion = result?.suggestion || "Monitor water quality regularly";
        const splitSuggestion = doc.splitTextToSize(suggestion, pageWidth - 40);
        doc.text(splitSuggestion, 25, yPosition);

        // Save
        doc.save(`algal-bloom-report-${new Date().getTime()}.pdf`);
    };

    return ( <
        button className = "export-btn"
        onClick = { generatePDF } >
        <
        Download size = { 18 }
        />
        Download Report(PDF) <
        /button>
    );
};

export default ExportReport;
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    LineElement,
    PointElement,
    Tooltip,
    Legend
} from "chart.js";
import { Doughnut, Line, Bar } from "react-chartjs-2";
import { LineChart, Line as RechartLine, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar as RechartsBar, Legend as RechartsLegend } from "recharts";
import { Download, Moon, Sun, Search, Lightbulb } from "lucide-react";
import RiskIndicator from "./components/RiskIndicator";
import LoadingSpinner from "./components/LoadingSpinner";
import ExportReport from "./components/ExportReport";
import { validateField, validateAllFields } from "./utils/validation";
import "./App.css";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    LineElement,
    PointElement,
    Tooltip,
    Legend
);

const API = "http://127.0.0.1:8000";

function App() {
    // State Management
    const [darkMode, setDarkMode] = useState(false);
    const [loading, setLoading] = useState(false);
    const [file, setFile] = useState(null);
    const [accuracy, setAccuracy] = useState(null);
    const [features, setFeatures] = useState([]);
    const [importance, setImportance] = useState([]);
    const [history, setHistory] = useState([]);
    const [forecast, setForecast] = useState([]);
    const [result, setResult] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [validationErrors, setValidationErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState("");

    const [formData, setFormData] = useState({
        ph: "",
        Hardness: "",
        Solids: "",
        Chloramines: "",
        Sulfate: "",
        Conductivity: "",
        Organic_carbon: "",
        Trihalomethanes: "",
        Turbidity: ""
    });

    // Load data on mount
    useEffect(() => {
        loadHistory();
        loadForecast();
    }, []);

    // Apply dark mode to body
    useEffect(() => {
        if (darkMode) {
            document.body.classList.add("dark-mode");
        } else {
            document.body.classList.remove("dark-mode");
        }
    }, [darkMode]);

    // Load history from API
    const loadHistory = async() => {
        try {
            const res = await axios.get(`${API}/history`);
            setHistory(res.data.data);
        } catch (error) {
            console.error("Error loading history:", error);
        }
    };

    // Load forecast from API
    const loadForecast = async() => {
        try {
            const res = await axios.get(`${API}/forecast`);
            setForecast(res.data.forecast);
        } catch (error) {
            console.error("Error loading forecast:", error);
        }
    };

    // Upload and train model
    const uploadDataset = async() => {
        if (!file) {
            alert("Please select a file");
            return;
        }

        setLoading(true);
        try {
            const formDataUpload = new FormData();
            formDataUpload.append("file", file);
            const res = await axios.post(`${API}/upload`, formDataUpload);
            setAccuracy(res.data.accuracy);
            setFeatures(res.data.features);
            setImportance(res.data.importance);
            setSuccessMessage("✅ Dataset uploaded and model trained successfully!");
            setTimeout(() => setSuccessMessage(""), 3000);
        } catch (error) {
            alert("Error uploading file: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    // Handle form input
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({...formData, [name]: value });

        // Clear error for this field
        if (validationErrors[name]) {
            setValidationErrors({
                ...validationErrors,
                [name]: ""
            });
        }
    };

    // Make manual prediction with validation
    const predictManual = async() => {
        // Validate all fields
        const validation = validateAllFields(formData);
        if (!validation.isValid) {
            setValidationErrors(validation.errors);
            alert("Please fix validation errors");
            return;
        }

        setLoading(true);
        try {
            const res = await axios.post(`${API}/predict`, formData);
            setResult(res.data);
            setValidationErrors({});
            setSuccessMessage("✅ Prediction completed!");
            setTimeout(() => setSuccessMessage(""), 3000);
            loadHistory();
            loadForecast();
        } catch (error) {
            alert("Prediction error: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    // Filter history based on search
    const filteredHistory = history.filter((item) => {
        const searchLower = searchTerm.toLowerCase();
        return (
            (item.timestamp && item.timestamp.toLowerCase().includes(searchLower)) ||
            (item.risk && item.risk.toLowerCase().includes(searchLower)) ||
            (item.probability && item.probability.toString().includes(searchLower))
        );
    });

    // Prepare data for interactive graphs
    const forecastData = forecast.map((value, index) => ({
        day: index + 1,
        probability: (value * 100).toFixed(2)
    }));

    const importanceData = features.map((feature, index) => ({
        feature: feature,
        importance: importance[index]
    }));

    return ( <
        div className = { `dashboard ${darkMode ? "dark" : "light"}` } > { /* Loading Spinner */ } { loading && < LoadingSpinner message = "Analyzing water quality..." / > }

        { /* Header with Dark Mode Toggle */ } <
        div className = "header" >
        <
        h1 > 🌊AI Algal Bloom Monitoring Dashboard < /h1> <
        button className = "theme-toggle"
        onClick = {
            () => setDarkMode(!darkMode)
        }
        title = { darkMode ? "Switch to Light Mode" : "Switch to Dark Mode" } > { darkMode ? < Sun size = { 24 } /> : <Moon size={24} / > } <
        /button> < /
        div >

        { /* Success Message */ } {
            successMessage && < div className = "success-message" > { successMessage } < /div>}

            { /* Upload Section */ } <
            div className = "card" >
                <
                h2 > 📁Dataset Upload & Training < /h2> <
            div className = "input-group" >
                <
                input
            type = "file"
            onChange = {
                (e) => setFile(e.target.files[0])
            }
            accept = ".csv" /
                >
                <
                button onClick = { uploadDataset }
            className = "btn-primary" >
                Upload & Train <
                /button> < /
                div > {
                    accuracy && ( <
                        div className = "accuracy-box" >
                        <
                        p >
                        <
                        strong > Model Accuracy: < /strong> {(accuracy * 100).toFixed(2)}% < /
                        p > <
                        /div>
                    )
                } <
                /div>

            { /* Feature Importance Graph */ } {
                importance.length > 0 && ( <
                    div className = "card" >
                    <
                    h2 > 📊Feature Importance Analysis < /h2> <
                    div className = "chart-container" >
                    <
                    ResponsiveContainer width = "100%"
                    height = { 300 } >
                    <
                    BarChart data = { importanceData } >
                    <
                    CartesianGrid strokeDasharray = "3 3" / >
                    <
                    XAxis dataKey = "feature"
                    angle = {-45 }
                    textAnchor = "end"
                    height = { 80 }
                    /> <
                    YAxis / >
                    <
                    RechartsTooltip / >
                    <
                    RechartsBar dataKey = "importance"
                    fill = "#06b6d4" / >
                    <
                    /BarChart> < /
                    ResponsiveContainer > <
                    /div> < /
                    div >
                )
            }

            { /* Manual Prediction with Validation */ } <
            div className = "card" >
                <
                h2 > 🔮Manual Water Quality Prediction < /h2> <
            div className = "form-grid" > {
                    Object.keys(formData).map((key) => ( <
                        div key = { key }
                        className = "form-group" >
                        <
                        label > { key.replace(/_/g, " ") } < /label> <
                        input type = "number"
                        name = { key }
                        value = { formData[key] }
                        onChange = { handleInputChange }
                        className = { validationErrors[key] ? "input-error" : "" }
                        placeholder = "Enter value"
                        step = "0.01" /
                        >
                        {
                            validationErrors[key] && ( <
                                span className = "error-message" > { validationErrors[key] } < /span>
                            )
                        } <
                        /div>
                    ))
                } <
                /div> <
            button onClick = { predictManual }
            className = "btn-primary btn-large" > 🎯Predict Bloom Risk <
                /button>

            { /* Risk Indicator */ } {
                result && ( <
                    >
                    <
                    RiskIndicator risk_level = { result.risk_level }
                    probability = { result.probability }
                    />

                    { /* Prediction Details */ } <
                    div className = "prediction-details" >
                    <
                    div className = "detail-item" >
                    <
                    span className = "label" > Estimated Days to Bloom: < /span> <
                    span className = "value" > { result.estimated_days }
                    days < /span> < /
                    div > <
                    div className = "detail-item" >
                    <
                    span className = "label" > Recommendation: < /span> <
                    span className = "value" > { result.suggestion } < /span> < /
                    div > <
                    /div>

                    { /* Export Report Button */ } <
                    ExportReport result = { result }
                    prediction_data = { formData }
                    />

                    { /* Process/Analysis */ } {
                        result.process && ( <
                            div className = "analysis-section" >
                            <
                            h3 > 📝Detailed Analysis < /h3> <
                            pre > { result.process } < /pre> < /
                            div >
                        )
                    }

                    { /* Explainable AI */ } <
                    div className = "explainable-ai" >
                    <
                    div className = "explainable-header" >
                    <
                    Lightbulb size = { 24 }
                    /> <
                    h3 > 💡Why This Prediction ? < /h3> < /
                    div > <
                    p >
                    The model analyzes all water quality parameters to predict algal bloom risk.Key factors include :
                    <
                    /p> <
                    ul className = "factors-list" > {
                        importance.slice(0, 5).map((imp, idx) => ( <
                            li key = { idx } >
                            <
                            strong > { features[idx] }: < /strong> {(imp * 100).toFixed(2)}% importance < /
                            li >
                        ))
                    } <
                    /ul> <
                    p className = "explainable-note" >
                    Higher water contamination and nutrient levels increase bloom probability. <
                    /p> < /
                    div > <
                    />
                )
            } <
            /div>

            { /* Forecast Section */ } <
            div className = "card" >
                <
                h2 > 📈30 - Day Bloom Probability Forecast < /h2> <
            div className = "chart-container" > {
                    forecastData.length > 0 ? ( <
                        ResponsiveContainer width = "100%"
                        height = { 300 } >
                        <
                        LineChart data = { forecastData } >
                        <
                        CartesianGrid strokeDasharray = "3 3" / >
                        <
                        XAxis dataKey = "day" / >
                        <
                        YAxis / >
                        <
                        RechartsTooltip / >
                        <
                        RechartLine type = "monotone"
                        dataKey = "probability"
                        stroke = "#f59e0b"
                        strokeWidth = { 2 }
                        dot = {
                            { r: 4 }
                        }
                        activeDot = {
                            { r: 6 }
                        }
                        /> < /
                        LineChart > <
                        /ResponsiveContainer>
                    ) : ( <
                        p > No forecast data available < /p>
                    )
                } <
                /div> < /
                div >

                { /* History with Search */ } <
                div className = "card" >
                <
                div className = "history-header" >
                <
                h2 > 📋Prediction History(Latest 50) < /h2> <
            div className = "search-box" >
                <
                Search size = { 18 }
            /> <
            input
            type = "text"
            placeholder = "Search by date, risk, or probability..."
            value = { searchTerm }
            onChange = {
                (e) => setSearchTerm(e.target.value)
            }
            /> < /
            div > <
                /div>

            <
            div className = "table-container" >
                <
                table >
                <
                thead >
                <
                tr >
                <
                th > Timestamp < /th> <
            th > Risk Level < /th> <
            th > Probability < /th> <
            th > Estimated Days < /th> < /
                tr > <
                /thead> <
            tbody > {
                    filteredHistory.length > 0 ? (
                        filteredHistory.map((item, i) => ( <
                            tr key = { i }
                            className = { `risk-${item.risk?.toLowerCase()}` } >
                            <
                            td > { item.timestamp } < /td> <
                            td >
                            <
                            span className = { `risk-badge risk-${item.risk?.toLowerCase()}` } > { item.risk } <
                            /span> < /
                            td > <
                            td > {
                                (item.probability * 100).toFixed(2)
                            } % < /td> <
                            td > { item.estimated_days || "N/A" } < /td> < /
                            tr >
                        ))
                    ) : ( <
                        tr >
                        <
                        td colSpan = "4"
                        className = "no-data" >
                        No predictions match your search <
                        /td> < /
                        tr >
                    )
                } <
                /tbody> < /
                table > <
                /div> < /
                div >

                { /* Footer */ } <
                footer className = "footer" >
                <
                p > 🌿Protecting Water Bodies Through AI - Powered Monitoring < /p> < /
                footer > <
                /div>
        );
    }

    export default App;
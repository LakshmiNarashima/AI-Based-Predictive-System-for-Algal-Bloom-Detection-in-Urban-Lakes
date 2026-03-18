import React from "react";
import "./LoadingSpinner.css";

const LoadingSpinner = ({ message = "Processing..." }) => {
    return ( <
        div className = "loading-overlay" >
        <
        div className = "loading-container" >
        <
        div className = "spinner" > < /div> <
        p className = "loading-message" > { message } < /p> <
        div className = "loading-dots" >
        <
        span > < /span> <
        span > < /span> <
        span > < /span> <
        /div> <
        /div> <
        /div>
    );
};

export default LoadingSpinner;
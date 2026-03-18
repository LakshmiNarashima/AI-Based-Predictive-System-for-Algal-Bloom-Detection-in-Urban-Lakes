// Validation rules for water quality parameters
export const validationRules = {
    ph: {
        min: 0,
        max: 14,
        label: "pH",
        message: "pH must be between 0 and 14"
    },
    Hardness: {
        min: 0,
        max: 500,
        label: "Hardness",
        message: "Hardness must be between 0 and 500 mg/L"
    },
    Solids: {
        min: 0,
        max: 50000,
        label: "Total Dissolved Solids",
        message: "Solids must be between 0 and 50000 mg/L"
    },
    Chloramines: {
        min: 0,
        max: 4,
        label: "Chloramines",
        message: "Chloramines must be between 0 and 4 mg/L"
    },
    Sulfate: {
        min: 0,
        max: 500,
        label: "Sulfate",
        message: "Sulfate must be between 0 and 500 mg/L"
    },
    Conductivity: {
        min: 0,
        max: 2000,
        label: "Conductivity",
        message: "Conductivity must be between 0 and 2000 µS/cm"
    },
    Organic_carbon: {
        min: 0,
        max: 100,
        label: "Organic Carbon",
        message: "Organic Carbon must be between 0 and 100 mg/L"
    },
    Trihalomethanes: {
        min: 0,
        max: 100,
        label: "Trihalomethanes",
        message: "Trihalomethanes must be between 0 and 100 µg/L"
    },
    Turbidity: {
        min: 0,
        max: 50,
        label: "Turbidity",
        message: "Turbidity must be between 0 and 50 NTU"
    }
};

export const validateField = (fieldName, value) => {
    if (value === "" || value === null || value === undefined) {
        return { isValid: false, message: `${validationRules[fieldName]?.label} is required` };
    }

    const rule = validationRules[fieldName];
    if (!rule) {
        return { isValid: true, message: "" };
    }

    const numValue = parseFloat(value);

    if (isNaN(numValue)) {
        return { isValid: false, message: `${rule.label} must be a number` };
    }

    if (numValue < rule.min || numValue > rule.max) {
        return { isValid: false, message: rule.message };
    }

    return { isValid: true, message: "" };
};

export const validateAllFields = (formData) => {
    const errors = {};
    let isValid = true;

    Object.keys(formData).forEach((key) => {
        const validation = validateField(key, formData[key]);
        if (!validation.isValid) {
            errors[key] = validation.message;
            isValid = false;
        }
    });

    return { isValid, errors };
};

export const getFieldLabel = (fieldName) => {
    return validationRules[fieldName]?.label || fieldName;
};
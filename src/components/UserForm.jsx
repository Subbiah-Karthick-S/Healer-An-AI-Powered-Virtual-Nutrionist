import React, { useState } from 'react';
import './UserForm.css';

const UserForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    // Basic Profile
    name: '',
    age: '',
    gender: '',
    height: '',
    weight: '',
    
    // Health Conditions
    diabetesFasting: '',
    diabetesPostMeal: '',
    allergies: [],
    
    // Blood Pressure
    bpLevel: 'Normal',
    systolic: '',
    diastolic: '',
    bpAdvancedMode: false,
    
    // Cholesterol
    cholesterolLevel: 'Normal',
    totalCholesterol: '',
    ldl: '',
    hdl: '',
    cholesterolAdvancedMode: false,
    
    // Lifestyle
    activityLevel: 'Sedentary',
    availableIngredients: '',
    
    // Health Issues (Optional)
    healthIssues: []
  });

  const healthOptions = [
    'Fever', 'Common Cold', 'Cough (Dry & Wet)', 'Sore Throat', 'Nasal Congestion',
    'Nausea & Vomiting', 'Diarrhea', 'Constipation', 'Acidity & Heartburn', 
    'Indigestion (Dyspepsia)', 'Bloating & Gas', 'Weak Immune System', 
    'Fatigue & Low Energy', 'Headaches & Migraines', 'Dehydration',
    'Mild Food Poisoning', 'Stomach Upset', 'Loss of Appetite', 
    'Joint Pain & Inflammation', 'Skin Issues (Mild Acne, Dry Skin)'
  ];

  const allergyOptions = [
    'Gluten', 'Dairy', 'Nuts', 'Shellfish', 'Eggs', 'Soy', 'Fish', 
    'Sesame', 'Mustard', 'Celery', 'Lupin', 'Molluscs', 'Sulphites'
  ];

  const activityOptions = ['Sedentary', 'Active', 'Athlete'];
  const genderOptions = ['Male', 'Female', 'Other'];
  const bpOptions = ['Low', 'Normal', 'High'];
  const cholesterolOptions = ['Normal', 'High'];

  const calculateBMI = (weight, height) => {
    if (!weight || !height) return null;
    const heightInM = height / 100;
    const bmi = weight / (heightInM * heightInM);
    
    if (bmi < 18.5) return { value: bmi.toFixed(1), category: 'Underweight' };
    if (bmi < 25) return { value: bmi.toFixed(1), category: 'Normal' };
    if (bmi < 30) return { value: bmi.toFixed(1), category: 'Overweight' };
    return { value: bmi.toFixed(1), category: 'Obese' };
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      if (name === 'bpAdvancedMode' || name === 'cholesterolAdvancedMode') {
        setFormData(prev => ({
          ...prev,
          [name]: checked
        }));
      } else {
        // Handle allergy checkboxes
        setFormData(prev => ({
          ...prev,
          allergies: checked
            ? [...prev.allergies, value]
            : prev.allergies.filter(item => item !== value)
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleHealthIssueChange = (issue) => {
    setFormData(prev => ({
      ...prev,
      healthIssues: prev.healthIssues.includes(issue)
        ? prev.healthIssues.filter(item => item !== issue)
        : [...prev.healthIssues, issue]
    }));
  };

  const validateForm = () => {
    // Basic validation
    if (!formData.name || !formData.age || !formData.gender || !formData.height || !formData.weight) {
      alert("Please fill in all basic profile fields");
      return false;
    }
    
    // Blood pressure validation in advanced mode
    if (formData.bpAdvancedMode) {
      if (!formData.systolic || !formData.diastolic) {
        alert("Please enter both systolic and diastolic values");
        return false;
      }
      
      const systolic = parseInt(formData.systolic);
      const diastolic = parseInt(formData.diastolic);
      
      if (systolic > 300 || diastolic > 200 || systolic < 50 || diastolic < 30) {
        alert("Please enter valid BP values (Systolic: 50-300, Diastolic: 30-200)");
        return false;
      }
    }
    
    // Cholesterol validation in advanced mode
    if (formData.cholesterolAdvancedMode) {
      if (!formData.totalCholesterol) {
        alert("Please enter total cholesterol value");
        return false;
      }
      
      const totalCholesterol = parseInt(formData.totalCholesterol);
      
      if (totalCholesterol > 500 || totalCholesterol < 100) {
        alert("Please enter valid cholesterol values (100-500 mg/dL)");
        return false;
      }
    }
    
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const bmiData = calculateBMI(parseFloat(formData.weight), parseFloat(formData.height));
    
    const completeData = {
      ...formData,
      bmi: bmiData,
      submissionDate: new Date().toLocaleDateString()
    };
    
    onSubmit(completeData);
  };

  return (
    <form className="user-form" onSubmit={handleSubmit}>
      <h2>Basic Profile</h2>
      
      <div className="form-row">
        <div className="form-group">
          <label>Name:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Age:</label>
          <input
            type="number"
            name="age"
            value={formData.age}
            onChange={handleInputChange}
            min="1"
            max="120"
            required
          />
        </div>
        
        <div className="form-group">
          <label>Gender:</label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleInputChange}
            required
          >
            <option value="">Select Gender</option>
            {genderOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label>Height (cm):</label>
          <input
            type="number"
            name="height"
            value={formData.height}
            onChange={handleInputChange}
            min="50"
            max="250"
            required
          />
        </div>
        
        <div className="form-group">
          <label>Weight (kg):</label>
          <input
            type="number"
            name="weight"
            value={formData.weight}
            onChange={handleInputChange}
            min="2"
            max="300"
            required
          />
        </div>
        
        <div className="form-group">
          <label>Calculated BMI:</label>
          <div className="bmi-display">
            {formData.height && formData.weight ? (
              <>
                {calculateBMI(parseFloat(formData.weight), parseFloat(formData.height))?.value} - 
                {calculateBMI(parseFloat(formData.weight), parseFloat(formData.height))?.category}
              </>
            ) : 'Enter height and weight'}
          </div>
        </div>
      </div>
      
      <h2>Health Conditions</h2>
      
      <div className="form-row">
        <div className="form-group">
          <label>Diabetes - Fasting Level (mg/dL):</label>
          <input
            type="number"
            name="diabetesFasting"
            value={formData.diabetesFasting}
            onChange={handleInputChange}
            min="50"
            max="300"
            placeholder="70-130 mg/dL normal range"
          />
        </div>
        
        <div className="form-group">
          <label>Diabetes - Post Meal Level (mg/dL):</label>
          <input
            type="number"
            name="diabetesPostMeal"
            value={formData.diabetesPostMeal}
            onChange={handleInputChange}
            min="70"
            max="400"
            placeholder="<180 mg/dL normal range"
          />
        </div>
      </div>
      
      <div className="form-group">
        <label>Allergies:</label>
        <div className="checkbox-group">
          {allergyOptions.map(option => (
            <label key={option} className="checkbox-label">
              <input
                type="checkbox"
                value={option}
                checked={formData.allergies.includes(option)}
                onChange={handleInputChange}
              />
              {option}
            </label>
          ))}
        </div>
      </div>
      
      <h2>Blood Pressure</h2>
      
      <div className="form-row">
        <div className="form-group">
          <label>Blood Pressure Level:</label>
          <select
            name="bpLevel"
            value={formData.bpLevel}
            onChange={handleInputChange}
          >
            {bpOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          <div className="tooltip">ℹ️
            <span className="tooltiptext">
              Low: &lt;90/60 mmHg<br />
              Normal: 90/60-120/80 mmHg<br />
              High: &gt;130/80 mmHg
            </span>
          </div>
        </div>
        
        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="bpAdvancedMode"
              checked={formData.bpAdvancedMode}
              onChange={handleInputChange}
            />
            Enter exact values
          </label>
        </div>
      </div>
      
      {formData.bpAdvancedMode && (
        <div className="form-row">
          <div className="form-group">
            <label>Systolic (mmHg):</label>
            <input
              type="number"
              name="systolic"
              value={formData.systolic}
              onChange={handleInputChange}
              min="50"
              max="300"
            />
          </div>
          
          <div className="form-group">
            <label>Diastolic (mmHg):</label>
            <input
              type="number"
              name="diastolic"
              value={formData.diastolic}
              onChange={handleInputChange}
              min="30"
              max="200"
            />
          </div>
        </div>
      )}
      
      <h2>Cholesterol</h2>
      
      <div className="form-row">
        <div className="form-group">
          <label>Cholesterol Level:</label>
          <select
            name="cholesterolLevel"
            value={formData.cholesterolLevel}
            onChange={handleInputChange}
          >
            {cholesterolOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          <div className="tooltip">ℹ️
            <span className="tooltiptext">
              Normal: &lt;200 mg/dL<br />
              High: ≥240 mg/dL
            </span>
          </div>
        </div>
        
        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="cholesterolAdvancedMode"
              checked={formData.cholesterolAdvancedMode}
              onChange={handleInputChange}
            />
            Enter exact values
          </label>
        </div>
      </div>
      
      {formData.cholesterolAdvancedMode && (
        <div className="form-row">
          <div className="form-group">
            <label>Total Cholesterol (mg/dL):</label>
            <input
              type="number"
              name="totalCholesterol"
              value={formData.totalCholesterol}
              onChange={handleInputChange}
              min="100"
              max="500"
            />
          </div>
          
          <div className="form-group">
            <label>LDL (mg/dL):</label>
            <input
              type="number"
              name="ldl"
              value={formData.ldl}
              onChange={handleInputChange}
              min="0"
              max="300"
            />
          </div>
          
          <div className="form-group">
            <label>HDL (mg/dL):</label>
            <input
              type="number"
              name="hdl"
              value={formData.hdl}
              onChange={handleInputChange}
              min="0"
              max="100"
            />
          </div>
        </div>
      )}
      
      <h2>Lifestyle</h2>
      
      <div className="form-row">
        <div className="form-group">
          <label>Activity Level:</label>
          <select
            name="activityLevel"
            value={formData.activityLevel}
            onChange={handleInputChange}
          >
            {activityOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="form-group">
        <label>Available Ingredients:</label>
        <textarea
          name="availableIngredients"
          value={formData.availableIngredients}
          onChange={handleInputChange}
          placeholder="List ingredients you have available (comma separated)"
          rows="3"
        />
      </div>
      
      <h2>Health Issues (Optional)</h2>
      
      <div className="form-group">
        <label>Select health issues you want to focus on:</label>
        <div className="checkbox-group health-issues">
          {healthOptions.map(option => (
            <label key={option} className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.healthIssues.includes(option)}
                onChange={() => handleHealthIssueChange(option)}
              />
              {option}
            </label>
          ))}
        </div>
      </div>

      <button type="submit" className="submit-btn">Generate Meal Plan</button>
    </form>
  );
};

export default UserForm;
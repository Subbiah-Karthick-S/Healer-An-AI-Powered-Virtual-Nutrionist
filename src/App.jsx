import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import UserForm from './components/UserForm';
import MealResults from './components/MealResults';
import { generateMealPlan } from './utils/geminiAPI';
import './App.css';

function App() {
  const [userDetails, setUserDetails] = useState(null);
  const [mealPlans, setMealPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showWelcome, setShowWelcome] = useState(true);

  // Hide welcome message after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcome(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleFormSubmit = async (formData) => {
    setUserDetails(formData);
    setLoading(true);
    setError(null);
    setMealPlans([]);
    
    try {
      console.log('Generating meal plan for:', formData.name);
      const result = await generateMealPlan(formData);
      console.log('Generated meals:', result.meals);
      
      if (result.meals && result.meals.length > 0) {
        setMealPlans(result.meals);
      } else {
        setError('No meals were generated. Please try again with different inputs.');
      }
    } catch (error) {
      console.error('Error generating meal plan:', error);
      setError('Failed to generate meal plan. Please check your internet connection and try again.');
      setMealPlans([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    if (userDetails) {
      handleFormSubmit(userDetails);
    }
  };

  const resetToForm = () => {
    setUserDetails(null);
    setError(null);
    setMealPlans([]);
  };

  const handleNewPlan = () => {
    setUserDetails(null);
    setError(null);
    setMealPlans([]);
  };

  return (
    <div className="app">
      <Header onNewPlan={handleNewPlan} hasResults={!!userDetails} />
      
      {showWelcome && (
        <div className="welcome-overlay">
          <div className="welcome-message">
            <h2>Welcome to HEALER</h2>
            <p>An AI Powered Virtual Nutrionist</p>
            <div className="loading-spinner"></div>
          </div>
        </div>
      )}

      <div className="container">
        {loading && (
          <div className="loading-overlay">
            <div className="loading-content">
              <div className="loading-spinner-large"></div>
              <p>Analyzing your health profile...</p>
              <p className="loading-subtext">Creating personalized meal recommendations based on your health metrics</p>
            </div>
          </div>
        )}

        {error && (
          <div className="error-message">
            <div className="error-icon">⚠️</div>
            <h3>Oops! Something went wrong</h3>
            <p>{error}</p>
            <div className="error-actions">
              <button className="error-btn retry-btn" onClick={handleRetry}>
                Try Again
              </button>
              <button className="error-btn back-btn" onClick={resetToForm}>
                Back to Form
              </button>
            </div>
          </div>
        )}

        {!userDetails ? (
          <UserForm onSubmit={handleFormSubmit} loading={loading} />
        ) : (
          <MealResults 
            userDetails={userDetails}
            meals={mealPlans}
            loading={loading}
            error={error}
            onBack={resetToForm}
            onRetry={handleRetry}
          />
        )}
      </div>

      {/* Health Metrics Info Modal Trigger */}
      {!userDetails && (
        <div className="info-floating">
          <button 
            className="info-btn"
            onClick={() => alert(
              "HEALER uses advanced AI to create personalized meal plans based on:\n\n" +
              "• Blood pressure levels (Low/Normal/High)\n" +
              "• Cholesterol metrics\n" +
              "• Diabetes indicators\n" +
              "• BMI calculations\n" +
              "• Allergies and dietary restrictions\n" +
              "• Activity level and lifestyle\n" +
              "• Specific health concerns\n\n" +
              "Your data is processed locally and never stored on our servers."
            )}
          >
            ℹ️ How it works
          </button>
        </div>
      )}

      {/* Footer */}
      <footer className="app-footer">
        <p>
          HEALER - An AI Powered Virtual Nutrionist | 
          <span className="disclaimer"> Not a substitute for professional medical advice</span>
        </p>
      </footer>
    </div>
  );
}

export default App;
import React, { useState } from 'react';
import { generatePDF } from '../utils/pdfGenerator';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import './MealResults.css';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend);

const MealResults = ({ userDetails, meals, loading, error, onBack, onRetry }) => {
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [dietaryFilter, setDietaryFilter] = useState('All');
  const [cookingTimeFilter, setCookingTimeFilter] = useState('All');

  const handleDownload = () => {
    if (meals && meals.length > 0) {
      generatePDF(userDetails, meals);
    }
  };

  const handleMealClick = (meal) => {
    setSelectedMeal(selectedMeal?.name === meal.name ? null : meal);
  };

  const handleCloseDetails = () => {
    setSelectedMeal(null);
  };

  const filteredMeals = meals?.filter(meal => {
    // Dietary filter
    if (dietaryFilter !== 'All' && meal.dietaryPreference !== dietaryFilter) {
      return false;
    }
    
    // Cooking time filter
    if (cookingTimeFilter !== 'All') {
      const time = meal.cookingTime || '';
      if (cookingTimeFilter === '<15min' && !time.includes('<15')) return false;
      if (cookingTimeFilter === '15-30min' && !time.includes('15-30')) return false;
      if (cookingTimeFilter === '30-60min' && !time.includes('30-60')) return false;
      if (cookingTimeFilter === '>60min' && !time.includes('>60')) return false;
    }
    
    return true;
  });

  // Prepare data for ingredient calorie pie chart
  const getIngredientCalorieData = (meal) => {
    if (!meal.ingredientCalories) return null;
    
    return {
      labels: Object.keys(meal.ingredientCalories),
      datasets: [
        {
          data: Object.values(meal.ingredientCalories),
          backgroundColor: [
            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
            '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF'
          ],
          borderWidth: 2,
          borderColor: '#fff'
        }
      ]
    };
  };

  // Prepare data for nutrient split pie chart
  const getNutrientData = (meal) => {
    if (!meal.nutrients) return null;
    
    return {
      labels: ['Protein', 'Carbohydrates', 'Fats', 'Fiber', 'Sugar'],
      datasets: [
        {
          data: [
            meal.nutrients.protein || 0,
            meal.nutrients.carbs || 0,
            meal.nutrients.fats || 0,
            meal.nutrients.fiber || 0,
            meal.nutrients.sugar || 0
          ],
          backgroundColor: [
            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'
          ],
          borderWidth: 2,
          borderColor: '#fff'
        }
      ]
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="loading-spinner"></div>
        <p>Generating your healthy meal plan...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-message">
        <p>{error}</p>
        <div className="error-actions">
          <button onClick={onRetry} className="error-btn">Try Again</button>
          <button onClick={onBack} className="error-btn">Back to Form</button>
        </div>
      </div>
    );
  }

  if (!meals || meals.length === 0) {
    return (
      <div className="error-message">
        <p>No meals generated. Please try again.</p>
        <button onClick={onRetry} className="error-btn">Retry</button>
      </div>
    );
  }

  return (
    <div className="meal-results">
      {/* User Summary Section */}
      <div className="user-summary">
        <h2>Your Health Profile</h2>
        <div className="summary-grid">
          <div className="summary-item">
            <span className="label">Name:</span>
            <span className="value">{userDetails.name}</span>
          </div>
          <div className="summary-item">
            <span className="label">Age:</span>
            <span className="value">{userDetails.age}</span>
          </div>
          <div className="summary-item">
            <span className="label">Gender:</span>
            <span className="value">{userDetails.gender}</span>
          </div>
          <div className="summary-item">
            <span className="label">BMI:</span>
            <span className="value">
              {userDetails.bmi?.value ? `${userDetails.bmi.value} (${userDetails.bmi.category})` : 'N/A'}
            </span>
          </div>
          <div className="summary-item">
            <span className="label">Blood Pressure:</span>
            <span className="value">
              {userDetails.bpAdvancedMode && userDetails.systolic && userDetails.diastolic 
                ? `${userDetails.systolic}/${userDetails.diastolic} mmHg` 
                : userDetails.bpLevel}
            </span>
          </div>
          <div className="summary-item">
            <span className="label">Cholesterol:</span>
            <span className="value">
              {userDetails.cholesterolAdvancedMode && userDetails.totalCholesterol 
                ? `${userDetails.totalCholesterol} mg/dL` 
                : userDetails.cholesterolLevel}
            </span>
          </div>
          <div className="summary-item">
            <span className="label">Activity Level:</span>
            <span className="value">{userDetails.activityLevel}</span>
          </div>
          <div className="summary-item">
            <span className="label">Health Issues:</span>
            <span className="value">
              {userDetails.healthIssues?.length > 0 ? userDetails.healthIssues.join(', ') : 'None specified'}
            </span>
          </div>
          <div className="summary-item">
            <span className="label">Allergies:</span>
            <span className="value">
              {userDetails.allergies?.length > 0 ? userDetails.allergies.join(', ') : 'None'}
            </span>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="filters-section">
        <h2>Filter Your Meal Plan</h2>
        <div className="filter-controls">
          <div className="filter-group">
            <label>Dietary Preference:</label>
            <select 
              value={dietaryFilter} 
              onChange={(e) => setDietaryFilter(e.target.value)}
            >
              <option value="All">All Types</option>
              <option value="Vegetarian">Vegetarian</option>
              <option value="Eggetarian">Eggetarian</option>
              <option value="Non-vegetarian">Non-vegetarian</option>
              <option value="Vegan">Vegan</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label>Cooking Time:</label>
            <select 
              value={cookingTimeFilter} 
              onChange={(e) => setCookingTimeFilter(e.target.value)}
            >
              <option value="All">Any Time</option>
              <option value="<15min">Under 15 min</option>
              <option value="15-30min">15-30 min</option>
              <option value="30-60min">30-60 min</option>
              <option value=">60min">Over 60 min</option>
            </select>
          </div>
        </div>
      </div>

      <h2 className="results-title">Your Personalized Meal Plan</h2>
      
      <div className="meals-list">
        {filteredMeals.map((meal, index) => (
          <div key={index} className="meal-card">
            <div className="meal-header">
              <div className="meal-number">Recipe {index + 1}</div>
              <div className="match-score">{meal.matchScore || '85%'} match</div>
            </div>
            
            <h3>{meal.name}</h3>
            
            <div className="meal-meta">
              <span className="dietary-badge">{meal.dietaryPreference}</span>
              <span className="cooking-time">{meal.cookingTime}</span>
              <span className="calories">{meal.totalCalories} calories</span>
            </div>
            
            {meal.keyBenefits && (
              <div className="key-benefits">
                <strong>Benefits: </strong>{meal.keyBenefits}
              </div>
            )}
            
            <div className="meal-preview">
              {meal.imageUrl && (
                <img src={meal.imageUrl} alt={meal.name} className="meal-image" />
              )}
              
              <div className="preview-content">
                <div className="ingredients-preview">
                  <h4>Main Ingredients</h4>
                  <ul>
                    {meal.ingredients.slice(0, 4).map((ingredient, i) => (
                      <li key={i}>{ingredient}</li>
                    ))}
                    {meal.ingredients.length > 4 && <li>...and {meal.ingredients.length - 4} more</li>}
                  </ul>
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => handleMealClick(meal)}
              className="view-details-btn"
            >
              {selectedMeal?.name === meal.name ? 'Hide Details' : 'View Full Recipe'}
            </button>
            
            {/* Expanded Meal Details */}
            {selectedMeal?.name === meal.name && (
              <div className="meal-details">
                <button className="close-details" onClick={handleCloseDetails}>×</button>
                
                <div className="details-content">
                  <div className="ingredients-section">
                    <h4>Ingredients</h4>
                    <ul>
                      {meal.ingredients.map((ingredient, i) => (
                        <li key={i}>{ingredient}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="instructions-section">
                    <h4>Preparation Instructions</h4>
                    <ol>
                      {meal.steps.map((step, i) => (
                        <li key={i}>{step}</li>
                      ))}
                    </ol>
                  </div>
                  
                  {meal.whyThisHelps && (
                    <div className="why-helps-section">
                      <h4>Why This Meal Helps</h4>
                      <p>{meal.whyThisHelps}</p>
                    </div>
                  )}
                  
                  {/* Nutrition Charts */}
                  <div className="nutrition-charts">
                    <h4>Nutrition Information</h4>
                    
                    <div className="charts-container">
                      {getIngredientCalorieData(meal) && (
                        <div className="chart-wrapper">
                          <h5>Calorie Distribution by Ingredient</h5>
                          <div className="chart-container">
                            <Doughnut data={getIngredientCalorieData(meal)} options={chartOptions} />
                          </div>
                        </div>
                      )}
                      
                      {getNutrientData(meal) && (
                        <div className="chart-wrapper">
                          <h5>Nutrient Split</h5>
                          <div className="chart-container">
                            <Doughnut data={getNutrientData(meal)} options={chartOptions} />
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {meal.nutrients && (
                      <div className="nutrient-details">
                        <p><strong>Total Calories:</strong> {meal.totalCalories}</p>
                        <div className="nutrient-grid">
                          <span><strong>Protein:</strong> {meal.nutrients.protein}g</span>
                          <span><strong>Carbs:</strong> {meal.nutrients.carbs}g</span>
                          <span><strong>Fats:</strong> {meal.nutrients.fats}g</span>
                          <span><strong>Fiber:</strong> {meal.nutrients.fiber}g</span>
                          <span><strong>Sugar:</strong> {meal.nutrients.sugar}g</span>
                          {meal.nutrients.sodium && <span><strong>Sodium:</strong> {meal.nutrients.sodium}mg</span>}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="action-buttons">
        <button onClick={onBack} className="back-btn">
          <span className="btn-icon">←</span> Back to Form
        </button>
        <button onClick={handleDownload} className="download-btn">
          <span className="btn-icon">📥</span> Download PDF
        </button>
      </div>
    </div>
  );
};

export default MealResults;
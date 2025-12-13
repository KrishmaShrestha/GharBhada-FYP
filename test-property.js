// Test property creation API
const testPropertyCreation = async () => {
  try {
    const formData = new FormData();
    formData.append('title', 'Test Property');
    formData.append('address', 'Test Address, Kathmandu');
    formData.append('type', 'Apartment');
    formData.append('bhk', '2BHK');
    formData.append('rent', '25000');
    formData.append('deposit', '50000');
    formData.append('furnishing', 'Semi-Furnished');
    formData.append('amenities', 'WiFi, Parking');
    formData.append('rules', 'No pets, No smoking');
    formData.append('ownerId', '2'); // Owner ID from test users
    
    const response = await fetch("http://localhost:5000/api/properties", {
      method: "POST",
      body: formData
    });
    
    const data = await response.json();
    console.log("Property Creation Response:", JSON.stringify(data, null, 2));
    console.log("Status:", response.status);
    
  } catch (error) {
    console.error("Error:", error);
  }
};

testPropertyCreation();
// Test login API
const testLogin = async () => {
  try {
    const response = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        emailOrPhone: "owner@test.com",
        password: "password123"
      })
    });
    
    const data = await response.json();
    console.log("Login Response:", JSON.stringify(data, null, 2));
    
    if (data.user) {
      console.log("User Role:", data.user.role);
      console.log("User Status:", data.user.status);
    }
    
  } catch (error) {
    console.error("Error:", error);
  }
};

testLogin();
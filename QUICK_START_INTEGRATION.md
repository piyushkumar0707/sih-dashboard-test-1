# Quick Start Integration Guide

## 🚀 Immediate Next Steps (This Week)

### Step 1: Enhance Your Backend for Mobile Support

Add these endpoints to your existing `backend/index.js`:

```javascript
// Mobile-specific authentication
app.post('/api/mobile/auth/login', async (req, res) => {
  try {
    const { username, password, deviceId } = req.body;
    // Use existing login logic + store deviceId for push notifications
    const result = await authenticateUser(username, password);
    
    if (result.success) {
      // Store device ID for push notifications
      await User.findByIdAndUpdate(result.user._id, { 
        deviceId, 
        lastActiveDevice: new Date() 
      });
      
      res.json({
        token: result.token,
        user: result.user,
        apiBaseUrl: 'http://your-server:5000/api'
      });
    }
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

// Location update endpoint for mobile
app.post('/api/mobile/location/update', authenticateToken, async (req, res) => {
  try {
    const { lat, lng, accuracy, timestamp } = req.body;
    const userId = req.user.userId;
    
    // Update tourist location in your existing tourists array or database
    const touristIndex = tourists.findIndex(t => t.userId === userId);
    if (touristIndex !== -1) {
      tourists[touristIndex].location = { lat, lng };
      tourists[touristIndex].lastUpdated = new Date(timestamp);
      tourists[touristIndex].accuracy = accuracy;
    }
    
    res.json({ success: true, message: 'Location updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Panic alert endpoint
app.post('/api/mobile/panic/alert', authenticateToken, async (req, res) => {
  try {
    const { lat, lng, message } = req.body;
    const userId = req.user.userId;
    
    // Create emergency incident
    const panicIncident = {
      id: `PANIC-${Date.now()}`,
      type: 'Emergency Alert',
      userId,
      location: { lat, lng },
      severity: 'High',
      status: 'Open',
      description: message || 'Panic button activated',
      createdAt: new Date().toISOString()
    };
    
    incidents.push(panicIncident);
    
    // TODO: Send push notifications to nearby officers
    // TODO: Trigger emergency response workflow
    
    res.json({ 
      success: true, 
      incidentId: panicIncident.id,
      message: 'Emergency alert sent. Help is on the way!' 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### Step 2: Create Android API Service

In the Android project, create `app/src/main/java/com/example/travira/api/`:

```kotlin
// ApiService.kt
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.*

interface TraViraApiService {
    @POST("mobile/auth/login")
    suspend fun login(@Body loginRequest: LoginRequest): AuthResponse
    
    @POST("mobile/location/update")
    suspend fun updateLocation(
        @Header("Authorization") token: String,
        @Body location: LocationUpdate
    ): ApiResponse
    
    @POST("mobile/panic/alert")
    suspend fun sendPanicAlert(
        @Header("Authorization") token: String,
        @Body alert: PanicAlert
    ): ApiResponse
    
    @GET("tourists")
    suspend fun getTourists(@Header("Authorization") token: String): TouristResponse
}

data class LoginRequest(val username: String, val password: String, val deviceId: String)
data class AuthResponse(val token: String, val user: User, val apiBaseUrl: String)
data class LocationUpdate(val lat: Double, val lng: Double, val accuracy: Float, val timestamp: Long)
data class PanicAlert(val lat: Double, val lng: Double, val message: String)
```

### Step 3: Update Android MainActivity with Real Backend

Replace the Android `MainActivity.kt` navigation with real API calls:

```kotlin
// Updated MainActivity.kt with backend integration
class MainActivity : ComponentActivity() {
    private lateinit var apiService: TraViraApiService
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Initialize API service with your backend URL
        val retrofit = Retrofit.Builder()
            .baseUrl("http://YOUR_BACKEND_IP:5000/api/")
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            
        apiService = retrofit.create(TraViraApiService::class.java)
        
        setContent {
            MyApp(apiService = apiService)
        }
    }
}
```

### Step 4: Test Integration

1. **Start your existing backend**:
```bash
cd backend
npm start
```

2. **Get your computer's IP address**:
```bash
ipconfig
```

3. **Update Android API base URL** to use your IP instead of localhost

4. **Test the connection** from Android app to your web backend

## 🔧 Configuration Files to Update

### Backend Environment (.env)
```env
# Add mobile-specific configuration
MOBILE_API_VERSION=v1
PUSH_NOTIFICATION_KEY=your-firebase-key
GEOFENCE_ALERT_RADIUS=100
PANIC_RESPONSE_TIMEOUT=300
```

### Android Configuration
Update `app/build.gradle.kts` to add network security config:

```kotlin
android {
    defaultConfig {
        // Add your backend IP for network security
        buildConfigField("String", "API_BASE_URL", "\"http://192.168.1.100:5000/api/\"")
    }
    
    buildTypes {
        debug {
            isDebuggable = true
            // Allow HTTP traffic for development
            manifestPlaceholders["usesCleartextTraffic"] = true
        }
    }
}
```

## 📱 Priority Android Screens to Implement

1. **LoginScreen** - Connect to your existing authentication
2. **MapScreen** - Show real-time tourist locations from your backend
3. **PanicScreen** - Send emergency alerts to your incident system
4. **UserHomeScreen** - Display safety score and status

## 🎯 Success Criteria for Week 1

- [ ] Android app can authenticate using your existing backend
- [ ] Location updates from Android appear in your web dashboard
- [ ] Panic alerts from Android create incidents in your system
- [ ] Real-time data flows between web and mobile

## 📞 Technical Support

If you encounter issues:

1. **Network Issues**: Ensure both devices are on same network
2. **CORS Errors**: Add mobile app origin to your CORS configuration
3. **Authentication**: Verify JWT token format matches between platforms
4. **Location Permissions**: Make sure Android app has GPS permissions

## 🔄 Next Week Preview

Once basic integration works:
- Add real-time WebSocket updates
- Implement push notifications
- Add offline data storage
- Enhance UI with real data from your backend

This approach leverages your existing, fully-functional backend while quickly adding mobile capabilities!

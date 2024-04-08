import { View, Text, ActivityIndicator} from "react-native";
import styles from "./styles";
import Title from "../../components/Title";
import {
  LocationAccuracy,
  getCurrentPositionAsync,
  requestForegroundPermissionsAsync,
  watchPositionAsync,
} from "expo-location";
import { useEffect, useRef, useState } from "react";
import { AnimatedMapView } from "react-native-maps/lib/MapView";
import { MarkerAnimated } from "react-native-maps";
import axios from "axios";

export default function Location() {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [weatherData, setWeatherData] = useState(null);

  const mapRef = useRef(null);

  async function requestPermission() {
    const { granted, status } = await requestForegroundPermissionsAsync();

    if(status !== "granted"){
      setErrorMsg("Permissão para acessar a localização foi negada!");
      console.log("Permissão para acessar a localização foi negada!");
      return;
    }

    if (granted) {
      const currentPosition = await getCurrentPositionAsync();
      setLocation(currentPosition);
      getWeather(location.coords.latitude, location.coords.longitude);
      console.log("Localização atual", currentPosition);
      return;
    }
  }

  useEffect(() => {
    requestPermission();
  }, []);

  useEffect(() => {
    watchPositionAsync(
      {
        accuracy: LocationAccuracy.Highest,
        timeInterval: 1000,
        distanceInterval: 1,
      },
      (response) => {
        setLocation(response);
        console.log("Nova localização", response);
        mapRef.current?.animateCamera({
          center: response.coords,
          pitch: 50,
        });
      }
    );
  }, []);

  const getWeather = async (latitude, longitude) => {
    try {
      console.log("Latitude: ", latitude, "Longitude: ", longitude);
      const apiKey = "d2b17491b2a840713b385d9b2fb02057";
      const response = await axios.get(
        `https://api.openweathermap.org/data/3.0/onecall?lat=${latitude}&lon=${longitude}&appid=${apiKey}`
      );
      console.log(response.data);
      setWeatherData(response.data);
    } catch (error) {
      setErrorMsg(error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Title title={"Location"} />
      {weatherData ? (
        <Text>
          Temperatura: 
          {weatherData.current.temp / 10}°C
        </Text>
      ) : (
        <ActivityIndicator size="large"/>
      )}

      {errorMsg && <Text>{errorMsg}</Text>}
      {location && (
        <AnimatedMapView
          ref={mapRef}
          style={styles.map}
          initialRegion={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          }}
        >
          <MarkerAnimated
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
            title="Você está aqui"
            description="Sua localização atual"
          />
        </AnimatedMapView>
      )}
    </View>
  );
}

import { useEffect, useRef, useState } from "react";
import { Input } from "./ui/input";
import { MapPin, Loader2 } from "lucide-react";

const PlaceAutocomplete = ({ onPlaceSelect, placeholder = "Search for a location..." }) => {
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Check if Google Maps is loaded
    const checkGoogleMaps = () => {
      if (window.google && window.google.maps && window.google.maps.places) {
        setIsLoaded(true);
        initAutocomplete();
      } else {
        // Retry after a short delay
        setTimeout(checkGoogleMaps, 100);
      }
    };

    checkGoogleMaps();

    return () => {
      // Cleanup
      if (autocompleteRef.current) {
        window.google?.maps?.event?.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, []);

  const initAutocomplete = () => {
    if (!inputRef.current || !window.google) return;

    autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
      types: ["establishment", "geocode"],
      fields: ["name", "formatted_address", "geometry", "place_id", "url"],
    });

    autocompleteRef.current.addListener("place_changed", () => {
      const place = autocompleteRef.current.getPlace();
      
      if (place && place.geometry) {
        const locationData = {
          name: place.name || "",
          address: place.formatted_address || "",
          placeId: place.place_id || "",
          mapsUrl: place.url || `https://www.google.com/maps/place/?q=place_id:${place.place_id}`,
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        };
        
        // Let Google's autocomplete handle the input value naturally
        // Just call the callback with the location data
        onPlaceSelect(locationData);
      }
    });
  };

  return (
    <div className="relative">
      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 z-10" />
      <input
        ref={inputRef}
        type="text"
        placeholder={isLoaded ? placeholder : "Loading..."}
        disabled={!isLoaded}
        className="flex h-12 w-full rounded-lg border border-white/10 bg-white/5 px-3 pl-10 pr-10 text-sm text-white placeholder:text-white/30 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        data-testid="place-autocomplete-input"
      />
      {!isLoaded && (
        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 animate-spin" />
      )}
    </div>
  );
};

export default PlaceAutocomplete;

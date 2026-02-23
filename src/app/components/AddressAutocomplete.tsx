import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
} from "use-places-autocomplete";
import {
  Combobox,
  ComboboxInput,
  ComboboxPopover,
  ComboboxList,
  ComboboxOption,
} from "@reach/combobox";
import "@reach/combobox/styles.css";
import { MapPin } from "lucide-react";
import { useEffect } from "react";

interface AddressAutocompleteProps {
  onSelect: (address: string, lat?: number, lng?: number) => void;
  placeholder?: string;
  defaultValue?: string;
}

export function AddressAutocomplete({ onSelect, placeholder, defaultValue }: AddressAutocompleteProps) {
  const {
    ready,
    value,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: {
      /* Define search scope here if needed, e.g., restriction to Kenya */
      componentRestrictions: { country: "ke" },
    },
    debounce: 300,
    defaultValue,
    initOnMount: typeof window !== "undefined" && !!(window as any).google,
  });

  // Re-initialize if the script loads after the component mounts
  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).google && !ready) {
      // Small delay to ensure library is fully parsed
      const timer = setTimeout(() => {
        setValue(value, false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [ready, setValue, value]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  const handleSelect = async (address: string) => {
    setValue(address, false);
    clearSuggestions();

    try {
      const results = await getGeocode({ address });
      const { lat, lng } = await getLatLng(results[0]);
      onSelect(address, lat, lng);
    } catch (error) {
      console.log("Error: ", error);
      onSelect(address);
    }
  };

  return (
    <div className="relative w-full">
      <Combobox onSelect={handleSelect}>
        <div className="relative">
          <ComboboxInput
            value={value}
            onChange={handleInput}
            disabled={!ready}
            placeholder={placeholder || "Search for your location..."}
            className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-[#6D4C91] outline-none transition-all pr-12"
          />
          <MapPin className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>
        <ComboboxPopover className="z-50 border-none shadow-2xl rounded-2xl overflow-hidden mt-2">
          <ComboboxList className="bg-white p-2">
            {status === "OK" &&
              data.map(({ place_id, description }) => (
                <ComboboxOption
                  key={place_id}
                  value={description}
                  className="px-4 py-3 text-[14px] hover:bg-gray-50 rounded-xl cursor-pointer transition-colors flex items-center space-x-3"
                >
                  <MapPin className="w-4 h-4 text-[#6D4C91] shrink-0" />
                  <span className="truncate">{description}</span>
                </ComboboxOption>
              ))}
          </ComboboxList>
        </ComboboxPopover>
      </Combobox>
    </div>
  );
}

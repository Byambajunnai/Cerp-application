
import { View } from "react-native";

type Props = {
  value: string;
  minimumDate?: string;
  onChange: (date: string) => void;
};

export default function WebDatePicker({
  value,
  minimumDate,
  onChange,
}: Props) {
  return (
    <View style={{ flex: 1 }}>
      <input
        type="date"
        value={value}
        min={minimumDate}
        onChange={(event) =>
          onChange(event.target.value)
        }
        style={{
          width: "100%",
          height: 45,
          border: "1px solid #D6E3F8",
          borderRadius: 10,
          padding: "0 12px",
          fontSize: 13,
          color: "#26364D",
          backgroundColor: "#FFFFFF",
          boxSizing: "border-box",
        }}
      />
    </View>
  );
}
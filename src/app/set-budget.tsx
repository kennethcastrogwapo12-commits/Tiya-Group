import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useState } from "react";

import {
    Alert,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function SetBudgetScreen() {
  const [budget, setBudget] = useState("");
  const [period, setPeriod] = useState("Weekly");

  async function saveBudget() {
    if (!budget) {
      Alert.alert(
        "Missing Budget",
        "Please enter your budget."
      );
      return;
    }

    const budgetNumber = Number(budget);

    if (isNaN(budgetNumber) || budgetNumber <= 0) {
      Alert.alert(
        "Invalid Budget",
        "Please enter a valid amount."
      );
      return;
    }

    try {
      await AsyncStorage.setItem(
        "budget",
        budgetNumber.toString()
      );

      await AsyncStorage.setItem(
        "period",
        period
      );

      Alert.alert(
        "Budget Saved",
        `Your ${period.toLowerCase()} budget is ₱${budgetNumber.toFixed(
          2
        )}.`,
        [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      console.log(error);

      Alert.alert(
        "Error",
        "Unable to save budget."
      );
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Set Budget
      </Text>

      <Text style={styles.subtitle}>
        Set the amount you want to manage.
      </Text>

      <Text style={styles.label}>
        Budget Amount
      </Text>

      <View style={styles.inputBox}>
        <Text style={styles.peso}>
          ₱
        </Text>

        <TextInput
          style={styles.input}
          placeholder="0.00"
          keyboardType="decimal-pad"
          value={budget}
          onChangeText={setBudget}
        />
      </View>

      <Text style={styles.label}>
        Budget Period
      </Text>

      <View style={styles.periodRow}>
        {["Daily", "Weekly", "Monthly"].map(
          (item) => (
            <TouchableOpacity
              key={item}
              style={[
                styles.periodButton,
                period === item &&
                  styles.selectedPeriod,
              ]}
              onPress={() =>
                setPeriod(item)
              }
            >
              <Text
                style={[
                  styles.periodText,
                  period === item &&
                    styles.selectedText,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )
        )}
      </View>

      <TouchableOpacity
        style={styles.saveButton}
        onPress={saveBudget}
      >
        <Text style={styles.saveText}>
          Save Budget
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.cancelButton}
        onPress={() => router.back()}
      >
        <Text style={styles.cancelText}>
          Cancel
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F7F5",
    padding: 20,
    paddingTop: 60,
  },

  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#166534",
  },

  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 5,
    marginBottom: 30,
  },

  label: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#374151",
    marginTop: 20,
    marginBottom: 8,
  },

  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 14,
    paddingHorizontal: 15,
  },

  peso: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#166534",
  },

  input: {
    flex: 1,
    padding: 16,
    fontSize: 20,
    color: "#111827",
  },

  periodRow: {
    flexDirection: "row",
    gap: 8,
  },

  periodButton: {
    flex: 1,
    backgroundColor: "white",
    padding: 13,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },

  selectedPeriod: {
    backgroundColor: "#166534",
    borderColor: "#166534",
  },

  periodText: {
    color: "#374151",
    fontWeight: "600",
  },

  selectedText: {
    color: "white",
  },

  saveButton: {
    backgroundColor: "#22C55E",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 35,
  },

  saveText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },

  cancelButton: {
    padding: 15,
    alignItems: "center",
  },

  cancelText: {
    color: "#6B7280",
  },
});

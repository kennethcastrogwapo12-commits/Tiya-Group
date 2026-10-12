import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useState } from "react";

import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function AddExpenseScreen() {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Food");

  const categories = [
    "Food",
    "Transport",
    "School",
    "Load",
    "Others",
  ];

  async function saveExpense() {
    if (!amount) {
      Alert.alert(
        "Missing Amount",
        "Please enter the expense amount."
      );
      return;
    }

    const expenseAmount = Number(amount);

    if (isNaN(expenseAmount) || expenseAmount <= 0) {
      Alert.alert(
        "Invalid Amount",
        "Please enter a valid amount."
      );
      return;
    }

    try {
      // GET BUDGET
      const savedBudget = await AsyncStorage.getItem(
        "budget"
      );

      const budget = Number(savedBudget || 0);

      if (budget <= 0) {
        Alert.alert(
          "No Budget",
          "Please set your budget first."
        );
        return;
      }

      // GET OLD EXPENSES
      const savedExpenses =
        await AsyncStorage.getItem("expenses");

      const expenses = savedExpenses
        ? JSON.parse(savedExpenses)
        : [];

      // CALCULATE CURRENT SPENT
      const currentSpent = expenses.reduce(
        (total: number, expense: any) =>
          total + Number(expense.amount),
        0
      );

      // CALCULATE REMAINING
      const remaining = budget - currentSpent;

      // DON'T ALLOW EXPENSE ABOVE BUDGET
      if (expenseAmount > remaining) {
        Alert.alert(
          "Not Enough Budget",
          `Your remaining balance is only ₱${remaining.toFixed(
            2
          )}.`
        );
        return;
      }

      // CREATE EXPENSE
      const newExpense = {
        id: Date.now().toString(),
        amount: expenseAmount,
        category: category,
        description:
          description.trim() || category,
        date: new Date().toLocaleDateString(),
      };

      // NEWEST FIRST
      const updatedExpenses = [
        newExpense,
        ...expenses,
      ];

      // SAVE OFFLINE
      await AsyncStorage.setItem(
        "expenses",
        JSON.stringify(updatedExpenses)
      );

      Alert.alert(
        "Expense Added",
        `₱${expenseAmount.toFixed(
          2
        )} was added to your expenses.`,
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
        "Unable to save expense."
      );
    }
  }

  return (
    <ScrollView style={styles.container}>
      {/* HEADER */}

      <Text style={styles.title}>
        Add Expense
      </Text>

      <Text style={styles.subtitle}>
        Record where your money goes.
      </Text>

      {/* AMOUNT */}

      <Text style={styles.label}>
        Expense Amount
      </Text>

      <View style={styles.amountBox}>
        <Text style={styles.peso}>
          ₱
        </Text>

        <TextInput
          style={styles.amountInput}
          placeholder="0.00"
          keyboardType="decimal-pad"
          value={amount}
          onChangeText={setAmount}
        />
      </View>

      {/* CATEGORY */}

      <Text style={styles.label}>
        Category
      </Text>

      <View style={styles.categories}>
        {categories.map((item) => (
          <TouchableOpacity
            key={item}
            style={[
              styles.categoryButton,
              category === item &&
                styles.selectedCategory,
            ]}
            onPress={() =>
              setCategory(item)
            }
          >
            <Text
              style={[
                styles.categoryText,
                category === item &&
                  styles.selectedCategoryText,
              ]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* DESCRIPTION */}

      <Text style={styles.label}>
        Description
      </Text>

      <TextInput
        style={styles.descriptionInput}
        placeholder="Example: Lunch at school"
        value={description}
        onChangeText={setDescription}
      />

      {/* SAVE */}

      <TouchableOpacity
        style={styles.saveButton}
        onPress={saveExpense}
      >
        <Text style={styles.saveText}>
          Add Expense
        </Text>
      </TouchableOpacity>

      {/* CANCEL */}

      <TouchableOpacity
        style={styles.cancelButton}
        onPress={() => router.back()}
      >
        <Text style={styles.cancelText}>
          Cancel
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F7F5",
    paddingHorizontal: 20,
  },

  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#166534",
    marginTop: 60,
  },

  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 5,
    marginBottom: 15,
  },

  label: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#374151",
    marginTop: 20,
    marginBottom: 8,
  },

  amountBox: {
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

  amountInput: {
    flex: 1,
    padding: 16,
    fontSize: 20,
    color: "#111827",
  },

  categories: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  categoryButton: {
    backgroundColor: "white",
    paddingHorizontal: 15,
    paddingVertical: 11,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },

  selectedCategory: {
    backgroundColor: "#166534",
    borderColor: "#166534",
  },

  categoryText: {
    color: "#374151",
    fontWeight: "600",
  },

  selectedCategoryText: {
    color: "white",
  },

  descriptionInput: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 14,
    padding: 16,
    fontSize: 15,
    color: "#111827",
  },

  saveButton: {
    backgroundColor: "#22C55E",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 30,
  },

  saveText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },

  cancelButton: {
    padding: 15,
    alignItems: "center",
    marginBottom: 40,
  },

  cancelText: {
    color: "#6B7280",
  },
});

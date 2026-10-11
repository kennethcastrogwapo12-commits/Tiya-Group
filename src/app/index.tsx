import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";

import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Expense = {
  id: string;
  amount: number;
  description: string;
  category: string;
  date: string;
};

export default function HomeScreen() {
  const [budget, setBudget] = useState(0);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  async function loadData() {
    try {
      const savedBudget = await AsyncStorage.getItem("budget");
      const savedExpenses = await AsyncStorage.getItem("expenses");

      setBudget(savedBudget ? Number(savedBudget) : 0);
      setExpenses(savedExpenses ? JSON.parse(savedExpenses) : []);
    } catch (error) {
      console.log("Error loading data:", error);
    }
  }

  const spent = expenses.reduce(
    (total, expense) => total + Number(expense.amount),
    0
  );

  const remaining = budget - spent;

  function finishBudget() {
    if (budget <= 0) {
      Alert.alert(
        "No Budget",
        "You do not have an active budget to finish."
      );
      return;
    }

    Alert.alert(
      "Finish Budget?",
      "Your current budget and expenses will be saved to History before starting a new budget.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Finish",
          onPress: saveAndResetBudget,
        },
      ]
    );
  }

  async function saveAndResetBudget() {
    try {
      const savedPeriod = await AsyncStorage.getItem("period");
      const oldHistory = await AsyncStorage.getItem("budgetHistory");

      const history = oldHistory
        ? JSON.parse(oldHistory)
        : [];

      const result = {
        id: Date.now().toString(),
        budget: budget,
        spent: spent,
        saved: remaining,
        period: savedPeriod || "Budget",
        date: new Date().toLocaleDateString(),
        expenses: expenses,
      };

      const updatedHistory = [
        result,
        ...history,
      ];

      // SAVE TO HISTORY
      await AsyncStorage.setItem(
        "budgetHistory",
        JSON.stringify(updatedHistory)
      );

      // RESET CURRENT DATA
      await AsyncStorage.removeItem("budget");
      await AsyncStorage.removeItem("period");
      await AsyncStorage.removeItem("expenses");

      setBudget(0);
      setExpenses([]);

      Alert.alert(
        "Budget Completed!",
        `Budget: ₱${budget.toFixed(2)}\nSpent: ₱${spent.toFixed(
          2
        )}\nSaved: ₱${remaining.toFixed(
          2
        )}\n\nYour result was saved to History.`,
        [
          {
            text: "View History",
            onPress: () => router.push("/history"),
          },
          {
            text: "OK",
          },
        ]
      );
    } catch (error) {
      console.log("Finish budget error:", error);

      Alert.alert(
        "Error",
        "Unable to finish the budget."
      );
    }
  }

  return (
    <ScrollView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>
            SpendWise
          </Text>

          <Text style={styles.subtitle}>
            Student Expense Tracker
          </Text>
        </View>

        <TouchableOpacity
          style={styles.historyTopButton}
          onPress={() => router.push("/history")}
        >
          <Text style={styles.historyTopIcon}>
            📊
          </Text>

          <Text style={styles.historyTopText}>
            History
          </Text>
        </TouchableOpacity>
      </View>

      {/* BALANCE CARD */}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>
          Remaining Balance
        </Text>

        <Text style={styles.balance}>
          ₱{remaining.toFixed(2)}
        </Text>

        <View style={styles.balanceRow}>
          <View>
            <Text style={styles.smallLabel}>
              Budget
            </Text>

            <Text style={styles.smallAmount}>
              ₱{budget.toFixed(2)}
            </Text>
          </View>

          <View style={styles.spentBox}>
            <Text style={styles.smallLabel}>
              Spent
            </Text>

            <Text style={styles.smallAmount}>
              ₱{spent.toFixed(2)}
            </Text>
          </View>
        </View>
      </View>

      {/* QUICK ACTIONS */}
      <Text style={styles.sectionTitle}>
        Quick Actions
      </Text>

      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push("/set-budget")}
        >
          <Text style={styles.actionIcon}>
            💰
          </Text>

          <Text style={styles.actionText}>
            Set Budget
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push("/add-expense")}
        >
          <Text style={styles.actionIcon}>
            ＋
          </Text>

          <Text style={styles.actionText}>
            Add Expense
          </Text>
        </TouchableOpacity>
      </View>

      {/* RECENT EXPENSES */}
      <Text style={styles.sectionTitle}>
        Recent Expenses
      </Text>

      {expenses.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>
            🧾
          </Text>

          <Text style={styles.emptyTitle}>
            No expenses yet
          </Text>

          <Text style={styles.emptyText}>
            Add your first expense to start tracking your spending.
          </Text>
        </View>
      ) : (
        expenses.slice(0, 5).map((expense) => (
          <View
            style={styles.expenseCard}
            key={expense.id}
          >
            <View style={styles.expenseInfo}>
              <Text style={styles.expenseCategory}>
                {expense.category}
              </Text>

              <Text style={styles.expenseDescription}>
                {expense.description}
              </Text>

              <Text style={styles.expenseDate}>
                {expense.date}
              </Text>
            </View>

            <Text style={styles.expenseAmount}>
              -₱{Number(expense.amount).toFixed(2)}
            </Text>
          </View>
        ))
      )}

      {/* FINISH BUDGET */}
      {budget > 0 && (
        <TouchableOpacity
          style={styles.finishButton}
          onPress={finishBudget}
        >
          <Text style={styles.finishButtonText}>
            ✓ Finish Budget
          </Text>
        </TouchableOpacity>
      )}

      {/* TIP */}
      <View style={styles.tipCard}>
        <Text style={styles.tipTitle}>
          💡 SpendWise Tip
        </Text>

        <Text style={styles.tipText}>
          Track every expense, even small purchases.
          Small expenses can quickly add up.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F7F5",
    paddingHorizontal: 20,
  },

  header: {
    marginTop: 60,
    marginBottom: 25,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#166534",
  },

  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 3,
  },

  historyTopButton: {
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
    alignItems: "center",
  },

  historyTopIcon: {
    fontSize: 18,
  },

  historyTopText: {
    color: "#166534",
    fontSize: 11,
    fontWeight: "bold",
    marginTop: 2,
  },

  balanceCard: {
    backgroundColor: "#166534",
    padding: 22,
    borderRadius: 20,
  },

  balanceLabel: {
    color: "#DCFCE7",
    fontSize: 14,
  },

  balance: {
    color: "white",
    fontSize: 34,
    fontWeight: "bold",
    marginTop: 5,
  },

  balanceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 25,
  },

  spentBox: {
    alignItems: "flex-end",
  },

  smallLabel: {
    color: "#BBF7D0",
    fontSize: 12,
  },

  smallAmount: {
    color: "white",
    fontSize: 17,
    fontWeight: "bold",
    marginTop: 3,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    marginTop: 25,
    marginBottom: 12,
  },

  actionRow: {
    flexDirection: "row",
    gap: 12,
  },

  actionButton: {
    flex: 1,
    backgroundColor: "white",
    paddingVertical: 20,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  actionIcon: {
    fontSize: 25,
    marginBottom: 8,
  },

  actionText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#166534",
  },

  emptyCard: {
    backgroundColor: "white",
    padding: 30,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  emptyIcon: {
    fontSize: 35,
  },

  emptyTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#374151",
    marginTop: 10,
  },

  emptyText: {
    fontSize: 13,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 5,
    lineHeight: 19,
  },

  expenseCard: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 14,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  expenseInfo: {
    flex: 1,
  },

  expenseCategory: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1F2937",
  },

  expenseDescription: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 3,
  },

  expenseDate: {
    fontSize: 11,
    color: "#9CA3AF",
    marginTop: 4,
  },

  expenseAmount: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#DC2626",
    marginLeft: 10,
  },

  finishButton: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 15,
    borderWidth: 1,
    borderColor: "#166534",
  },

  finishButtonText: {
    color: "#166534",
    fontSize: 15,
    fontWeight: "bold",
  },

  tipCard: {
    backgroundColor: "#DCFCE7",
    padding: 18,
    borderRadius: 16,
    marginTop: 20,
    marginBottom: 40,
  },

  tipTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#166534",
  },

  tipText: {
    fontSize: 14,
    color: "#4B5563",
    marginTop: 6,
    lineHeight: 20,
  },
});
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

type BudgetHistory = {
  id: string;
  budget: number;
  spent: number;
  saved: number;
  period: string;
  date: string;
  expenses: Expense[];
};

export default function HistoryScreen() {
  const [history, setHistory] = useState<BudgetHistory[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [])
  );

  async function loadHistory() {
    try {
      const savedHistory = await AsyncStorage.getItem(
        "budgetHistory"
      );

      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      } else {
        setHistory([]);
      }
    } catch (error) {
      console.log("History error:", error);
    }
  }

  function clearHistory() {
    if (history.length === 0) {
      Alert.alert(
        "No History",
        "There is no budget history to clear."
      );
      return;
    }

    Alert.alert(
      "Clear History?",
      "All your finished budget records will be permanently deleted.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete All",
          style: "destructive",
          onPress: deleteHistory,
        },
      ]
    );
  }

  async function deleteHistory() {
    try {
      await AsyncStorage.removeItem("budgetHistory");

      setHistory([]);

      Alert.alert(
        "History Cleared",
        "All budget history has been deleted."
      );
    } catch (error) {
      console.log("Delete history error:", error);
    }
  }

  return (
    <ScrollView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backText}>
            ‹
          </Text>
        </TouchableOpacity>

        <View>
          <Text style={styles.title}>
            Budget History
          </Text>

          <Text style={styles.subtitle}>
            Your previous budget results
          </Text>
        </View>
      </View>

      {/* EMPTY HISTORY */}
      {history.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>
            📊
          </Text>

          <Text style={styles.emptyTitle}>
            No history yet
          </Text>

          <Text style={styles.emptyText}>
            Finish a budget and your result will appear here.
          </Text>
        </View>
      ) : (
        <>
          {/* HISTORY CARDS */}
          {history.map((item, index) => (
            <View
              key={item.id}
              style={styles.historyCard}
            >
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.period}>
                    {item.period} Budget
                  </Text>

                  <Text style={styles.date}>
                    Completed: {item.date}
                  </Text>
                </View>

                <View style={styles.numberBadge}>
                  <Text style={styles.numberText}>
                    #{history.length - index}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.resultRow}>
                <View style={styles.resultItem}>
                  <Text style={styles.resultLabel}>
                    Budget
                  </Text>

                  <Text style={styles.resultValue}>
                    ₱{Number(item.budget).toFixed(2)}
                  </Text>
                </View>

                <View style={styles.resultItem}>
                  <Text style={styles.resultLabel}>
                    Spent
                  </Text>

                  <Text style={styles.spentValue}>
                    ₱{Number(item.spent).toFixed(2)}
                  </Text>
                </View>

                <View style={styles.resultItem}>
                  <Text style={styles.resultLabel}>
                    Saved
                  </Text>

                  <Text style={styles.savedValue}>
                    ₱{Number(item.saved).toFixed(2)}
                  </Text>
                </View>
              </View>

              <View style={styles.summaryBox}>
                <Text style={styles.summaryText}>
                  {item.saved > 0
                    ? `🎉 You stayed within your budget and saved ₱${Number(
                        item.saved
                      ).toFixed(2)}.`
                    : item.saved === 0
                    ? "👍 You used exactly your planned budget."
                    : `You exceeded your budget by ₱${Math.abs(
                        Number(item.saved)
                      ).toFixed(2)}.`}
                </Text>
              </View>

              <Text style={styles.expenseCount}>
                {item.expenses?.length || 0} expense
                {(item.expenses?.length || 0) !== 1
                  ? "s"
                  : ""}{" "}
                recorded
              </Text>
            </View>
          ))}

          {/* CLEAR HISTORY */}
          <TouchableOpacity
            style={styles.clearButton}
            onPress={clearHistory}
          >
            <Text style={styles.clearText}>
              Clear History
            </Text>
          </TouchableOpacity>
        </>
      )}

      <View style={styles.bottomSpace} />
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
    marginBottom: 30,
    flexDirection: "row",
    alignItems: "center",
  },

  backButton: {
    width: 42,
    height: 42,
    backgroundColor: "white",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  backText: {
    fontSize: 32,
    color: "#166534",
    lineHeight: 34,
  },

  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#166534",
  },

  subtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },

  emptyCard: {
    backgroundColor: "white",
    padding: 40,
    borderRadius: 18,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  emptyIcon: {
    fontSize: 45,
  },

  emptyTitle: {
    fontSize: 19,
    fontWeight: "bold",
    color: "#374151",
    marginTop: 12,
  },

  emptyText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 6,
    lineHeight: 20,
  },

  historyCard: {
    backgroundColor: "white",
    padding: 18,
    borderRadius: 18,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  period: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
  },

  date: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 4,
  },

  numberBadge: {
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },

  numberText: {
    color: "#166534",
    fontSize: 12,
    fontWeight: "bold",
  },

  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 16,
  },

  resultRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  resultItem: {
    flex: 1,
  },

  resultLabel: {
    fontSize: 11,
    color: "#6B7280",
    marginBottom: 4,
  },

  resultValue: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#1F2937",
  },

  spentValue: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#DC2626",
  },

  savedValue: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#166534",
  },

  summaryBox: {
    backgroundColor: "#F0FDF4",
    padding: 12,
    borderRadius: 12,
    marginTop: 16,
  },

  summaryText: {
    color: "#166534",
    fontSize: 13,
    lineHeight: 19,
  },

  expenseCount: {
    color: "#9CA3AF",
    fontSize: 11,
    marginTop: 12,
  },

  clearButton: {
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    padding: 15,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 5,
  },

  clearText: {
    color: "#DC2626",
    fontSize: 14,
    fontWeight: "bold",
  },

  bottomSpace: {
    height: 40,
  },
});
